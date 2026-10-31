const express = require('express');
const rateLimit = require('express-rate-limit');
const BlogRating = require('../models/BlogRating');
const BlogComment = require('../models/BlogComment');
const { isAdmin } = require('../middleware/auth');

const router = express.Router();

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,99}$/;
const VISITOR_PATTERN = /^[A-Za-z0-9-]{8,64}$/;
const COMMENT_LIMIT = 100;

// Feedback changes constantly, so never let browsers or CDNs cache it
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

const limiter = (max, message) =>
  rateLimit({
    windowMs: 10 * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message },
  });

const commentLimiter = limiter(5, 'Too many comments. Please try again in a few minutes.');
const ratingLimiter = limiter(30, 'Too many rating changes. Please try again in a few minutes.');

const validSlug = (req, res, next) => {
  if (!SLUG_PATTERN.test(req.params.slug)) {
    return res.status(400).json({ message: 'Invalid blog slug.' });
  }
  return next();
};

const summarise = (rows) => {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  return {
    average: rows.length ? Math.round((total / rows.length) * 10) / 10 : 0,
    count: rows.length,
  };
};

// Rating average/count and comment count for every post (used on the blog list)
router.get('/summary', async (req, res) => {
  try {
    const [ratings, comments] = await Promise.all([
      BlogRating.aggregate([
        { $group: { _id: '$slug', total: { $sum: '$value' }, count: { $sum: 1 } } },
      ]),
      BlogComment.aggregate([{ $group: { _id: '$slug', count: { $sum: 1 } } }]),
    ]);

    const summary = {};
    for (const row of ratings) {
      summary[row._id] = {
        average: Math.round((row.total / row.count) * 10) / 10,
        ratingCount: row.count,
        commentCount: 0,
      };
    }
    for (const row of comments) {
      summary[row._id] = {
        average: 0,
        ratingCount: 0,
        ...summary[row._id],
        commentCount: row.count,
      };
    }

    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load blog summary', error: error.message });
  }
});

// Ratings and comments for one post. ?visitorId=... also returns that visitor's own rating.
router.get('/:slug', validSlug, async (req, res) => {
  try {
    const { slug } = req.params;
    const visitorId = String(req.query.visitorId || '');

    const [ratings, comments] = await Promise.all([
      BlogRating.find({ slug }).select('value visitorId').lean(),
      BlogComment.find({ slug }).sort({ createdAt: -1 }).limit(COMMENT_LIMIT).select('name message createdAt').lean(),
    ]);

    const mine = VISITOR_PATTERN.test(visitorId)
      ? ratings.find((row) => row.visitorId === visitorId)
      : null;

    res.status(200).json({
      rating: { ...summarise(ratings), mine: mine ? mine.value : 0 },
      comments,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load feedback', error: error.message });
  }
});

// Create or change a visitor's rating
router.post('/:slug/rating', validSlug, ratingLimiter, async (req, res) => {
  try {
    const { slug } = req.params;
    const { visitorId, value } = req.body || {};
    const stars = Number(value);

    if (!VISITOR_PATTERN.test(String(visitorId || ''))) {
      return res.status(400).json({ message: 'A valid visitor id is required.' });
    }

    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
      return res.status(400).json({ message: 'Rating must be a whole number from 1 to 5.' });
    }

    await BlogRating.findOneAndUpdate(
      { slug, visitorId },
      { slug, visitorId, value: stars },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    const ratings = await BlogRating.find({ slug }).select('value').lean();
    res.status(200).json({ rating: { ...summarise(ratings), mine: stars } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save rating', error: error.message });
  }
});

// Add a comment
router.post('/:slug/comments', validSlug, commentLimiter, async (req, res) => {
  try {
    const { slug } = req.params;
    const { name, message, website } = req.body || {};

    // Hidden "website" field: real visitors never fill it, bots usually do
    if (website) {
      return res.status(201).json({ message: 'Comment received.' });
    }

    const cleanName = String(name || '').trim();
    const cleanMessage = String(message || '').trim();

    if (!cleanName || cleanName.length > 60) {
      return res.status(400).json({ message: 'Please enter a name (up to 60 characters).' });
    }

    if (!cleanMessage || cleanMessage.length > 1500) {
      return res.status(400).json({ message: 'Please enter a comment (up to 1500 characters).' });
    }

    const comment = await BlogComment.create({ slug, name: cleanName, message: cleanMessage });

    res.status(201).json({
      comment: {
        _id: comment._id,
        name: comment.name,
        message: comment.message,
        createdAt: comment.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save comment', error: error.message });
  }
});

// Remove a comment (owner only): an admin sign-in token, or the BLOG_ADMIN_TOKEN value in x-admin-token.
router.delete('/comments/:id', async (req, res) => {
  try {
    const token = process.env.BLOG_ADMIN_TOKEN;

    if (!isAdmin(req) && (!token || req.get('x-admin-token') !== token)) {
      return res.status(401).json({ message: 'Not authorised.' });
    }

    const removed = await BlogComment.findByIdAndDelete(req.params.id);

    if (!removed) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    return res.status(200).json({ message: 'Comment removed.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to remove comment', error: error.message });
  }
});

module.exports = router;
