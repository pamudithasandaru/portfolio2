// Copies the Markdown posts in client/src/content/blogs into the database.
// Safe to re-run: posts already in the database (same slug) are skipped unless you pass --overwrite.
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Blog = require('../models/Blog');

const dir = path.join(__dirname, '../../client/src/content/blogs');

const run = async () => {
  const { parseFrontmatter, readingMinutes } = await import(
    pathToFileURL(path.join(__dirname, '../../client/src/utils/frontmatter.mjs')).href
  );
  const overwrite = process.argv.includes('--overwrite');

  await mongoose.connect(process.env.MONGODB_URI);

  for (const file of fs.readdirSync(dir).filter((name) => name.endsWith('.md'))) {
    const slug = file.replace(/\.md$/, '');
    const { data, body } = parseFrontmatter(fs.readFileSync(path.join(dir, file), 'utf8'));

    const exists = await Blog.exists({ slug });
    if (exists && !overwrite) {
      console.log(`skip   ${slug} (already in the database)`);
      continue;
    }

    await Blog.findOneAndUpdate(
      { slug },
      {
        slug,
        title: data.title || slug,
        date: data.date ? String(data.date) : new Date().toISOString().slice(0, 10),
        summary: data.summary || '',
        tags: Array.isArray(data.tags) ? data.tags : [],
        cover: data.cover || '',
        video: data.video || '',
        draft: data.draft === true,
        body,
        minutes: readingMinutes(body),
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
    console.log(`saved  ${slug}`);
  }

  await mongoose.disconnect();
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
