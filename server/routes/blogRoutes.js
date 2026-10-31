const express = require('express');
const Blog = require('../models/Blog');
const BlogComment = require('../models/BlogComment');
const BlogRating = require('../models/BlogRating');
const { isAdmin, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,99}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const readingMinutes = (body) => Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 200));

const text = (value, max) => String(value ?? '').trim().slice(0, max);

const cleanFields = (input = {}) => {
  const body = String(input.body ?? '').slice(0, 300000);
  const tags = Array.isArray(input.tags) ? input.tags : [];

  return {
    title: text(input.title, 200),
    date: DATE_PATTERN.test(String(input.date)) ? input.date : new Date().toISOString().slice(0, 10),
    summary: text(input.summary, 500),
    tags: [...new Set(tags.map((tag) => text(tag, 30)).filter(Boolean))].slice(0, 10),
    cover: text(input.cover, 500),
    video: text(input.video, 300),
    draft: input.draft === true,
    body,
    minutes: readingMinutes(body),
  };
};

// List without bodies. Drafts are only included for the signed-in admin with ?all=1.
router.get('/', async (req, res) => {
  try {
    const filter = isAdmin(req) && req.query.all === '1' ? {} : { draft: false };
    const posts = await Blog.find(filter).select('-body').sort({ date: -1, createdAt: -1 }).lean();
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load blogs', error: error.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const post = await Blog.findOne({ slug: req.params.slug }).lean();

    if (!post || (post.draft && !isAdmin(req))) {
      return res.status(404).json({ message: 'Post not found' });
    }

    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load blog', error: error.message });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const slug = text(req.body?.slug, 100).toLowerCase();

    if (!SLUG_PATTERN.test(slug)) {
      return res.status(400).json({ message: 'Use only lowercase letters, numbers and hyphens in the address.' });
    }

    const fields = cleanFields(req.body);
    if (!fields.title) {
      return res.status(400).json({ message: 'A title is required.' });
    }

    const post = await Blog.create({ slug, ...fields });
    return res.status(201).json(post);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A post with that address already exists.' });
    }
    return res.status(500).json({ message: 'Failed to create blog', error: error.message });
  }
});

router.put('/:slug', requireAdmin, async (req, res) => {
  try {
    const fields = cleanFields(req.body);
    if (!fields.title) {
      return res.status(400).json({ message: 'A title is required.' });
    }

    const post = await Blog.findOneAndUpdate({ slug: req.params.slug }, fields, { new: true });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update blog', error: error.message });
  }
});

// Publish or hide a post without touching the rest of it
router.patch('/:slug/status', requireAdmin, async (req, res) => {
  try {
    const post = await Blog.findOneAndUpdate(
      { slug: req.params.slug },
      { draft: req.body?.draft === true },
      { new: true }
    ).select('-body');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update status', error: error.message });
  }
});

router.delete('/:slug', requireAdmin, async (req, res) => {
  try {
    const removed = await Blog.findOneAndDelete({ slug: req.params.slug });
    if (!removed) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await Promise.all([
      BlogComment.deleteMany({ slug: req.params.slug }),
      BlogRating.deleteMany({ slug: req.params.slug }),
    ]);

    return res.status(200).json({ message: 'Post deleted.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete blog', error: error.message });
  }
});

module.exports = router;
