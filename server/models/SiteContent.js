const mongoose = require('mongoose');

// One document holding the editable text and images of the pages
// (hero, about, footer, navbar, socials). Missing parts fall back to the site's built-in defaults.
const siteContentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'main' },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, collection: 'site_content', minimize: false }
);

module.exports = mongoose.model('SiteContent', siteContentSchema);
