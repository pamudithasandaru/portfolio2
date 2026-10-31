const mongoose = require('mongoose');

const pageViewSchema = new mongoose.Schema(
  {
    path: { type: String, required: true, maxlength: 200 },
    visitorId: { type: String, required: true },
    referrer: { type: String, default: '', maxlength: 100 },
    createdAt: { type: Date, default: Date.now, index: true, expires: 60 * 60 * 24 * 400 },
  },
  { collection: 'page_views', versionKey: false }
);

pageViewSchema.index({ path: 1, createdAt: -1 });

module.exports = mongoose.model('PageView', pageViewSchema);
