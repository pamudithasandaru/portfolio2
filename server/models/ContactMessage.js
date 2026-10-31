const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema(
  {
    fromEmail: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'contact_messages' }
);

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
