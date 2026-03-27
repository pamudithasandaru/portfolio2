const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      default: '',
      trim: true,
    },
    videoThumbnailUrl: {
      type: String,
      default: '',
      trim: true,
    },
    demoVideoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    technologies: {
      type: [String],
      default: [],
    },
    githubUrl: {
      type: String,
      default: '',
      trim: true,
    },
    liveUrl: {
      type: String,
      default: '',
      trim: true,
    },
    coverImageUrl: {
      type: String,
      default: '',
      trim: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
  }
);

const projectCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    keywords: {
      type: [String],
      default: [],
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    projects: {
      type: [projectSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: 'project_categories',
  }
);

module.exports = mongoose.model('ProjectCategory', projectCategorySchema);
