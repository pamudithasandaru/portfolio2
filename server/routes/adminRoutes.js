const express = require('express');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const { isConfigured, checkCredentials, signToken, requireAdmin, readToken } = require('../middleware/auth');
const PageView = require('../models/PageView');
const Blog = require('../models/Blog');
const BlogRating = require('../models/BlogRating');
const BlogComment = require('../models/BlogComment');
const ContactMessage = require('../models/ContactMessage');
const ProjectCategory = require('../models/ProjectCategory');
const CertificationCategory = require('../models/CertificationCategory');
const VolunteeringExperience = require('../models/VolunteeringExperience');
const Media = require('../models/Media');

const router = express.Router();

router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many failed sign-in attempts. Try again in 15 minutes.' },
});

router.post('/login', loginLimiter, async (req, res) => {
  try {
    if (!isConfigured()) {
      return res.status(503).json({
        message:
          'Admin sign-in is not configured. Set ADMIN_USERNAME, ADMIN_PASSWORD_HASH and JWT_SECRET in the server .env.',
      });
    }

    const { username, password } = req.body || {};
    const valid = await checkCredentials(String(username || ''), String(password || ''));

    if (!valid) {
      return res.status(401).json({ message: 'Wrong username or password.' });
    }

    return res.status(200).json({
      token: signToken(process.env.ADMIN_USERNAME),
      username: process.env.ADMIN_USERNAME,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Sign-in failed', error: error.message });
  }
});

router.get('/me', requireAdmin, (req, res) => {
  const payload = readToken(req);
  res.status(200).json({ username: payload.sub });
});

// Everything below is for the signed-in admin only
router.use(requireAdmin);

const DAY = 24 * 60 * 60 * 1000;
const dayKey = (date) => date.toISOString().slice(0, 10);

const periodTotals = (match) => [
  { $match: match },
  { $group: { _id: null, views: { $sum: 1 }, visitors: { $addToSet: '$visitorId' } } },
  { $project: { views: 1, visitors: { $size: '$visitors' } } },
];

router.get('/stats', async (req, res) => {
  try {
    const days = [7, 30, 90].includes(Number(req.query.days)) ? Number(req.query.days) : 30;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const since = new Date(today.getTime() - (days - 1) * DAY);
    const previousSince = new Date(since.getTime() - days * DAY);
    const inRange = { createdAt: { $gte: since } };
    const blogPath = /^\/blogs\/[a-z0-9-]+$/;

    const [
      current,
      previous,
      daily,
      topPages,
      referrers,
      blogViews,
      ratings,
      comments,
      blogs,
      projectCounts,
      certificateCounts,
      volunteering,
      mediaTotals,
      messageCounts,
      totalComments,
      recentComments,
    ] = await Promise.all([
      PageView.aggregate(periodTotals(inRange)),
      PageView.aggregate(periodTotals({ createdAt: { $gte: previousSince, $lt: since } })),
      PageView.aggregate([
        { $match: inRange },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            views: { $sum: 1 },
            visitors: { $addToSet: '$visitorId' },
          },
        },
        { $project: { views: 1, visitors: { $size: '$visitors' } } },
      ]),
      PageView.aggregate([
        { $match: inRange },
        { $group: { _id: '$path', views: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: 8 },
      ]),
      PageView.aggregate([
        { $match: { ...inRange, referrer: { $ne: '' } } },
        { $group: { _id: '$referrer', views: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: 6 },
      ]),
      PageView.aggregate([
        { $match: { ...inRange, path: { $regex: blogPath } } },
        { $group: { _id: '$path', views: { $sum: 1 } } },
      ]),
      BlogRating.aggregate([{ $group: { _id: '$slug', total: { $sum: '$value' }, count: { $sum: 1 } } }]),
      BlogComment.aggregate([{ $group: { _id: '$slug', count: { $sum: 1 } } }]),
      Blog.find().select('slug title date draft').sort({ date: -1 }).lean(),
      ProjectCategory.aggregate([
        { $group: { _id: null, categories: { $sum: 1 }, projects: { $sum: { $size: '$projects' } } } },
      ]),
      CertificationCategory.aggregate([
        { $group: { _id: null, categories: { $sum: 1 }, certificates: { $sum: { $size: '$certificates' } } } },
      ]),
      VolunteeringExperience.countDocuments(),
      Media.aggregate([{ $group: { _id: null, count: { $sum: 1 }, bytes: { $sum: '$size' } } }]),
      ContactMessage.aggregate([{ $group: { _id: '$read', count: { $sum: 1 } } }]),
      BlogComment.countDocuments(),
      BlogComment.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const byDay = new Map(daily.map((row) => [row._id, row]));
    const series = Array.from({ length: days }, (_, index) => {
      const key = dayKey(new Date(since.getTime() + index * DAY));
      const row = byDay.get(key);
      return { date: key, views: row?.views || 0, visitors: row?.visitors || 0 };
    });

    const viewsBySlug = new Map(blogViews.map((row) => [row._id.replace('/blogs/', ''), row.views]));
    const ratingBySlug = new Map(ratings.map((row) => [row._id, row]));
    const commentsBySlug = new Map(comments.map((row) => [row._id, row.count]));

    const blogRows = blogs.map((blog) => {
      const rating = ratingBySlug.get(blog.slug);
      return {
        slug: blog.slug,
        title: blog.title,
        draft: blog.draft,
        views: viewsBySlug.get(blog.slug) || 0,
        ratingCount: rating?.count || 0,
        average: rating ? Math.round((rating.total / rating.count) * 10) / 10 : 0,
        commentCount: commentsBySlug.get(blog.slug) || 0,
      };
    });

    const unread = messageCounts.find((row) => row._id === false)?.count || 0;
    const readCount = messageCounts.find((row) => row._id === true)?.count || 0;

    res.status(200).json({
      days,
      views: current[0]?.views || 0,
      visitors: current[0]?.visitors || 0,
      previousViews: previous[0]?.views || 0,
      previousVisitors: previous[0]?.visitors || 0,
      series,
      topPages: topPages.map((row) => ({ path: row._id, views: row.views })),
      referrers: referrers.map((row) => ({ source: row._id, views: row.views })),
      blogs: blogRows,
      content: {
        projectCategories: projectCounts[0]?.categories || 0,
        projects: projectCounts[0]?.projects || 0,
        certificationCategories: certificateCounts[0]?.categories || 0,
        certificates: certificateCounts[0]?.certificates || 0,
        volunteering,
        blogs: blogs.length,
        drafts: blogs.filter((blog) => blog.draft).length,
        mediaFiles: mediaTotals[0]?.count || 0,
        mediaBytes: mediaTotals[0]?.bytes || 0,
      },
      engagement: {
        comments: totalComments,
        ratings: ratings.reduce((sum, row) => sum + row.count, 0),
        messages: unread + readCount,
        unreadMessages: unread,
      },
      recentComments,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load stats', error: error.message });
  }
});

// ---- Blog comments ----

router.get('/comments', async (req, res) => {
  try {
    const filter = req.query.slug ? { slug: String(req.query.slug) } : {};
    const comments = await BlogComment.find(filter).sort({ createdAt: -1 }).limit(200).lean();
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load comments', error: error.message });
  }
});

router.delete('/comments/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id.' });
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

// ---- Contact messages ----

router.get('/messages', async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 }).limit(200).lean();
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load messages', error: error.message });
  }
});

router.patch('/messages/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id.' });
    }
    const updated = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { read: Boolean(req.body?.read) },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Message not found.' });
    }
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update message', error: error.message });
  }
});

router.delete('/messages/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id.' });
    }
    const removed = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!removed) {
      return res.status(404).json({ message: 'Message not found.' });
    }
    return res.status(200).json({ message: 'Message removed.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to remove message', error: error.message });
  }
});

module.exports = router;
