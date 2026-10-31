const mongoose = require('mongoose');

const blogCommentSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1500,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BlogComment', blogCommentSchema);
