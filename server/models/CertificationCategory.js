const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true,
    },
    certificateTitle: {
      type: String,
      required: true,
      trim: true,
    },
    issuingOrganization: {
      type: String,
      required: true,
      trim: true,
    },
    issueDate: {
      type: Date,
      required: true,
    },
    expireDate: {
      type: Date,
      default: null,
    },
    credentialId: {
      type: String,
      default: '',
      trim: true,
    },
    credentialUrl: {
      type: String,
      default: '',
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    mediaFileUrl: {
      type: String,
      required: true,
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

const certificationCategorySchema = new mongoose.Schema(
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
    displayOrder: {
      type: Number,
      default: 0,
    },
    certificates: {
      type: [certificateSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: 'certification_categories',
  }
);

module.exports = mongoose.model('CertificationCategory', certificationCategorySchema);
