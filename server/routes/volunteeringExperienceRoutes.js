const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const VolunteeringExperience = require('../models/VolunteeringExperience');

const router = express.Router();

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

router.get('/', async (req, res) => {
  try {
    const experiences = await VolunteeringExperience.find()
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    res.status(200).json(experiences);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch volunteering experiences',
      error: error.message,
    });
  }
});

// Create a new volunteering experience
router.post('/', async (req, res) => {
  try {
    const {
      organization,
      logo,
      position,
      duration,
      durationMonths,
      startDate,
      endDate,
      isCurrent,
      keyTags,
      description,
      achievements,
      photos,
      displayOrder,
    } = req.body;

    if (!organization || !position || !description) {
      return res.status(400).json({
        message: 'organization, position, and description are required',
      });
    }

    const newExperience = new VolunteeringExperience({
      organization,
      logo: logo || '',
      position,
      duration: duration || '',
      durationMonths: durationMonths || 0,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      isCurrent: isCurrent || false,
      keyTags: Array.isArray(keyTags) ? keyTags : [],
      description,
      achievements: Array.isArray(achievements) ? achievements : [],
      photos: Array.isArray(photos) ? photos : [],
      displayOrder: displayOrder || 0,
    });

    const savedExperience = await newExperience.save();
    res.status(201).json(savedExperience);
  } catch (error) {
    res.status(500).json({
      message: 'Error creating volunteering experience',
      error: error.message,
    });
  }
});

// Bulk create volunteering experiences
router.post('/bulk/create', async (req, res) => {
  try {
    const experiences = req.body;

    if (!Array.isArray(experiences)) {
      return res
        .status(400)
        .json({ message: 'Request body must be an array of experiences' });
    }

    const formattedExperiences = experiences.map((exp) => ({
      organization: exp.organization,
      logo: exp.logo || '',
      position: exp.position,
      duration: exp.duration || '',
      durationMonths: exp.duration_months || exp.durationMonths || 0,
      startDate: exp.start_date ? new Date(exp.start_date) : null,
      endDate: exp.end_date ? new Date(exp.end_date) : null,
      isCurrent: exp.is_current || exp.isCurrent || false,
      keyTags: Array.isArray(exp.tags) ? exp.tags : exp.keyTags || [],
      description: exp.description,
      achievements: Array.isArray(exp.achievements) ? exp.achievements : [],
      photos: Array.isArray(exp.photos) ? exp.photos : [],
      displayOrder: exp.displayOrder || 0,
    }));

    const createdExperiences = await VolunteeringExperience.insertMany(
      formattedExperiences
    );

    res.status(201).json({
      message: `${createdExperiences.length} volunteering experiences created successfully`,
      experiences: createdExperiences,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating volunteering experiences',
      error: error.message,
    });
  }
});

// Get a specific volunteering experience
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const experience = await VolunteeringExperience.findById(id);

    if (!experience) {
      return res.status(404).json({ message: 'Volunteering experience not found' });
    }

    res.status(200).json(experience);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching volunteering experience',
      error: error.message,
    });
  }
});

// Update a volunteering experience
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert date strings to Date objects if provided
    if (updateData.startDate && typeof updateData.startDate === 'string') {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate && typeof updateData.endDate === 'string') {
      updateData.endDate = new Date(updateData.endDate);
    }

    const experience = await VolunteeringExperience.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!experience) {
      return res.status(404).json({ message: 'Volunteering experience not found' });
    }

    res.status(200).json({
      message: 'Volunteering experience updated successfully',
      experience,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating volunteering experience',
      error: error.message,
    });
  }
});

// Delete a volunteering experience
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const experience = await VolunteeringExperience.findByIdAndDelete(id);

    if (!experience) {
      return res.status(404).json({ message: 'Volunteering experience not found' });
    }

    res.status(200).json({
      message: 'Volunteering experience deleted successfully',
      experience,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting volunteering experience',
      error: error.message,
    });
  }
});

// Upload images for a specific volunteering experience
router.post('/:id/images', upload.array('images', 10), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Convert files to base64 and prepare image data
    const imageData = req.files.map((file) => ({
      data: file.buffer.toString('base64'),
      contentType: file.mimetype,
    }));

    const experience = await VolunteeringExperience.findByIdAndUpdate(
      id,
      { $push: { images: { $each: imageData } } },
      { new: true }
    );

    if (!experience) {
      return res.status(404).json({ message: 'Volunteering experience not found' });
    }

    res.status(200).json({
      message: 'Images uploaded successfully',
      experience,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error uploading images',
      error: error.message,
    });
  }
});

// Get images for a specific volunteering experience
router.get('/:id/images', async (req, res) => {
  try {
    const { id } = req.params;
    const experience = await VolunteeringExperience.findById(id);

    if (!experience || !experience.images || experience.images.length === 0) {
      return res.status(404).json({ message: 'No images found for this experience' });
    }

    // Convert base64 back to image data
    const images = experience.images.map((img) => ({
      data: `data:${img.contentType};base64,${img.data}`,
      contentType: img.contentType,
    }));

    res.status(200).json(images);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching images',
      error: error.message,
    });
  }
});

// Delete a specific image from a volunteering experience
router.delete('/:id/images/:imageIndex', async (req, res) => {
  try {
    const { id, imageIndex } = req.params;
    const experience = await VolunteeringExperience.findById(id);

    if (!experience) {
      return res.status(404).json({ message: 'Volunteering experience not found' });
    }

    if (imageIndex < 0 || imageIndex >= experience.images.length) {
      return res.status(400).json({ message: 'Invalid image index' });
    }

    experience.images.splice(imageIndex, 1);
    await experience.save();

    res.status(200).json({
      message: 'Image deleted successfully',
      experience,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting image',
      error: error.message,
    });
  }
});

module.exports = router;
