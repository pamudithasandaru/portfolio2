const mongoose = require('mongoose');

// Uploaded images live in MongoDB so they work on hosts without a writable disk.
const mediaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true, select: false },
  },
  { timestamps: true, collection: 'media' }
);

module.exports = mongoose.model('Media', mediaSchema);
