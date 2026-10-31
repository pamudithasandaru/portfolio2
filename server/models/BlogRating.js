const mongoose = require('mongoose');

const blogRatingSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    // Random id generated in the visitor's browser; lets a visitor change their rating
    visitorId: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

blogRatingSchema.index({ slug: 1, visitorId: 1 }, { unique: true });

module.exports = mongoose.model('BlogRating', blogRatingSchema);
