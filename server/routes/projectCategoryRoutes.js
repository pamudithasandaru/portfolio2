const express = require('express');
const ProjectCategory = require('../models/ProjectCategory');

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
    const categories = await ProjectCategory.find()
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch project categories',
      error: error.message,
    });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await ProjectCategory.findOne({ slug }).lean();

    if (!category) {
      return res.status(404).json({ message: 'Project category not found' });
    }

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch project category',
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

    const category = await ProjectCategory.findOneAndUpdate(
      { slug },
      {
        name: payload.name,
        slug,
        description: payload.description || '',
        keywords: Array.isArray(payload.keywords) ? payload.keywords : [],
        displayOrder: payload.displayOrder || 0,
        projects: Array.isArray(payload.projects) ? payload.projects : [],
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      message: 'Project category saved successfully',
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to save project category',
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
        return {
          updateOne: {
            filter: { slug },
            update: {
              $set: {
                name: item.name,
                slug,
                description: item.description || '',
                keywords: Array.isArray(item.keywords) ? item.keywords : [],
                displayOrder: item.displayOrder || 0,
                projects: Array.isArray(item.projects) ? item.projects : [],
              },
            },
            upsert: true,
          },
        };
      });

    if (operations.length === 0) {
      return res.status(400).json({ message: 'No valid categories to upsert' });
    }

    await ProjectCategory.bulkWrite(operations);

    const savedCategories = await ProjectCategory.find().sort({ displayOrder: 1, createdAt: 1 }).lean();

    res.status(200).json({
      message: `${operations.length} project categories upserted successfully`,
      data: savedCategories,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to bulk upsert project categories',
      error: error.message,
    });
  }
});

module.exports = router;
