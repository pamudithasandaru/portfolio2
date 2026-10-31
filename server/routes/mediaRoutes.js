const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const Media = require('../models/Media');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

const ALLOWED = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_BYTES = 4 * 1024 * 1024; // stays under the 4.5 MB serverless request limit

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP or GIF images are allowed.'));
    }
  },
});

const publicUrl = (req, id) => `${req.protocol}://${req.get('host')}/api/media/${id}`;

// Admin: list uploads (without their bytes)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const files = await Media.find().sort({ createdAt: -1 }).limit(300).lean();
    res.set('Cache-Control', 'no-store');
    res.status(200).json(
      files.map((file) => ({
        id: file._id,
        name: file.name,
        size: file.size,
        contentType: file.contentType,
        createdAt: file.createdAt,
        url: publicUrl(req, file._id),
      }))
    );
  } catch (error) {
    res.status(500).json({ message: 'Failed to load media', error: error.message });
  }
});

// Public: serve one image. An id never changes its content, so browsers can keep it forever.
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).end();
    }

    const file = await Media.findById(req.params.id).select('+data contentType');
    if (!file) {
      return res.status(404).end();
    }

    res.set({
      'Content-Type': file.contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    });
    return res.status(200).send(file.data);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load image', error: error.message });
  }
});

router.post('/', requireAdmin, (req, res) => {
  upload.single('file')(req, res, async (uploadError) => {
    if (uploadError) {
      const message = uploadError.code === 'LIMIT_FILE_SIZE' ? 'Image is larger than 4 MB.' : uploadError.message;
      return res.status(400).json({ message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    try {
      const saved = await Media.create({
        name: req.file.originalname.slice(0, 120),
        contentType: req.file.mimetype,
        size: req.file.size,
        data: req.file.buffer,
      });

      return res.status(201).json({
        id: saved._id,
        name: saved.name,
        size: saved.size,
        contentType: saved.contentType,
        url: publicUrl(req, saved._id),
      });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to save image', error: error.message });
    }
  });
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id.' });
    }
    const removed = await Media.findByIdAndDelete(req.params.id);
    if (!removed) {
      return res.status(404).json({ message: 'Image not found.' });
    }
    return res.status(200).json({ message: 'Image deleted.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete image', error: error.message });
  }
});

module.exports = router;
