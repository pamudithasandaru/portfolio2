const mongoose = require('mongoose');

const volunteeringExperienceSchema = new mongoose.Schema(
  {
    organization: {
      type: String,
      required: true,
      trim: true,
    },
    logo: {
      type: String,
      default: '',
      trim: true,
    },
    position: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      required: true,
      trim: true,
    },
    durationMonths: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
    keyTags: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    achievement: {
      type: String,
      default: '',
      trim: true,
    },
    achievements: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      default: '',
      trim: true,
    },
    photos: [
      {
        type: String,
        trim: true,
      },
    ],
    displayOrder: {
      type: Number,
      default: 0,
    },
    images: [
      {
        data: String, // base64 or image binary data
        contentType: String, // e.g., 'image/png', 'image/jpeg'
      },
    ],
  },
  {
    timestamps: true,
    collection: 'volunteering_experiences',
  }
);

module.exports = mongoose.model('VolunteeringExperience', volunteeringExperienceSchema);
