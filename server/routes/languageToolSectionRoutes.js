const express = require('express');
const LanguageToolSection = require('../models/LanguageToolSection');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let section = await LanguageToolSection.findOne({ key: 'about-languages-tools' }).lean();

    // Fallback: return the latest document if key-specific document is unavailable.
    if (!section) {
      section = await LanguageToolSection.findOne().sort({ updatedAt: -1, createdAt: -1 }).lean();
    }

    if (!section) {
      return res.status(404).json({
        message: 'Languages and tools section not found',
      });
    }

    res.status(200).json(section);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch languages and tools section',
      error: error.message,
    });
  }
});

router.post('/upsert', async (req, res) => {
  try {
    const { heading, sections } = req.body;

    if (!Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({
        message: 'sections must be a non-empty array',
      });
    }

    const payload = {
      key: 'about-languages-tools',
      heading: heading || 'Languages and Tools',
      sections,
    };

    const saved = await LanguageToolSection.findOneAndUpdate(
      { key: 'about-languages-tools' },
      payload,
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Languages and tools section saved successfully',
      data: saved,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to save languages and tools section',
      error: error.message,
    });
  }
});

module.exports = router;
