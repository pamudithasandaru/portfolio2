const express = require('express');
const CertificationCategory = require('../models/CertificationCategory');

const router = express.Router();

const toSlug = (value = '') =>
  value
    .toLowerCase()
    .trim()
    .replaceAll(/[^a-z0-9\s-]/g, '')
    .replaceAll(/\s+/g, '-')
    .replaceAll(/-+/g, '-');

router.get('/', async (req, res) => {
  try {
    const categories = await CertificationCategory.find()
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch certification categories',
      error: error.message,
    });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await CertificationCategory.findOne({ slug }).lean();

    if (!category) {
      return res.status(404).json({ message: 'Certification category not found' });
    }

    return res.status(200).json(category);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch certification category',
      error: error.message,
    });
  }
});

router.post('/upsert', async (req, res) => {
  try {
    const payload = req.body || {};

    if (!payload.name) {
      return res.status(400).json({ message: 'name is required' });
    }

    const slug = payload.slug ? toSlug(payload.slug) : toSlug(payload.name);
    if (!slug) {
      return res.status(400).json({ message: 'valid slug or name is required' });
    }

    const certificates = Array.isArray(payload.certificates)
      ? payload.certificates.map((certificate) => ({
          ...certificate,
          category: certificate?.category || payload.name,
        }))
      : [];

    const category = await CertificationCategory.findOneAndUpdate(
      { slug },
      {
        name: payload.name,
        slug,
        description: payload.description || '',
        displayOrder: payload.displayOrder || 0,
        certificates,
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      message: 'Certification category saved successfully',
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to save certification category',
      error: error.message,
    });
  }
});

router.post('/bulk-upsert', async (req, res) => {
  try {
    const categories = req.body;

    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ message: 'Request body must be a non-empty array' });
    }

    const operations = categories
      .filter((item) => item?.name)
      .map((item) => {
        const slug = item.slug ? toSlug(item.slug) : toSlug(item.name);
        const certificates = Array.isArray(item.certificates)
          ? item.certificates.map((certificate) => ({
              ...certificate,
              category: certificate?.category || item.name,
            }))
          : [];

        return {
          updateOne: {
            filter: { slug },
            update: {
              $set: {
                name: item.name,
                slug,
                description: item.description || '',
                displayOrder: item.displayOrder || 0,
                certificates,
              },
            },
            upsert: true,
          },
        };
      });

    if (operations.length === 0) {
      return res.status(400).json({ message: 'No valid categories to upsert' });
    }

    await CertificationCategory.bulkWrite(operations);

    const savedCategories = await CertificationCategory.find()
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();

    return res.status(200).json({
      message: `${operations.length} certification categories upserted successfully`,
      data: savedCategories,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to bulk upsert certification categories',
      error: error.message,
    });
  }
});

module.exports = router;
