const express = require('express');
const SiteContent = require('../models/SiteContent');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

const SECTIONS = ['navbar', 'hero', 'about', 'footer', 'socials'];

// Only what the admin has changed is stored; the client fills the rest from its defaults
router.get('/', async (req, res) => {
  try {
    const doc = await SiteContent.findOne({ key: 'main' }).lean();
    res.status(200).json(doc?.data || {});
  } catch (error) {
    res.status(500).json({ message: 'Failed to load site content', error: error.message });
  }
});

router.put('/', requireAdmin, async (req, res) => {
  try {
    const body = req.body;

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return res.status(400).json({ message: 'Send an object of sections.' });
    }

    const data = {};
    for (const section of SECTIONS) {
      if (body[section] !== undefined) {
        data[section] = body[section];
      }
    }

    const saved = await SiteContent.findOneAndUpdate(
      { key: 'main' },
      { key: 'main', data },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json(saved.data);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to save site content', error: error.message });
  }
});

module.exports = router;
