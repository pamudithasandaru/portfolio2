const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    items: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const sectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    categories: {
      type: [categorySchema],
      default: [],
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const languageToolSectionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    heading: {
      type: String,
      default: 'Languages and Tools',
      trim: true,
    },
    sections: {
      type: [sectionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: 'language_tool_sections',
  }
);

module.exports = mongoose.model('LanguageToolSection', languageToolSectionSchema);
