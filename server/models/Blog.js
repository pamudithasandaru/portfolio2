const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    date: { type: String, required: true },
    summary: { type: String, default: '', trim: true, maxlength: 500 },
    tags: { type: [String], default: [] },
    cover: { type: String, default: '', trim: true },
    video: { type: String, default: '', trim: true },
    draft: { type: Boolean, default: false },
    body: { type: String, default: '' },
    minutes: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Blog', blogSchema);
