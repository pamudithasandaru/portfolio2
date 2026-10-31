const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('node:path');
require('dotenv').config();
const volunteeringExperienceRoutes = require('./routes/volunteeringExperienceRoutes');
const languageToolSectionRoutes = require('./routes/languageToolSectionRoutes');
const projectCategoryRoutes = require('./routes/projectCategoryRoutes');
const certificationCategoryRoutes = require('./routes/certificationCategoryRoutes');
const contactRoutes = require('./routes/contactRoutes');
const blogFeedbackRoutes = require('./routes/blogFeedbackRoutes');
const adminRoutes = require('./routes/adminRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const blogRoutes = require('./routes/blogRoutes');
const siteContentRoutes = require('./routes/siteContentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const { guardWrites } = require('./middleware/auth');

const app = express();

// Behind a hosting proxy, use the real client IP (needed for per-IP rate limits)
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from client public folder
app.use(express.static(path.join(__dirname, '../client/public')));

// Cache the connection on `global` so warm serverless invocations reuse it
const cached = global.mongooseCache || (global.mongooseCache = { conn: null, promise: null });

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  cached.promise ||= mongoose
    .connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 })
    .then((m) => {
      console.log('MongoDB connected');
      return m;
    })
    .catch((error) => {
      cached.promise = null;
      throw error;
    });

  cached.conn = await cached.promise;
  return cached.conn;
};

// Kick off the connection at boot so it overlaps with request parsing
connectDB().catch((error) => {
  console.error('MongoDB connection error:', error.message);
});

// Basic route
app.get('/api', (req, res) => {
  res.json({ message: 'Portfolio API is running' });
});

// Lightweight endpoint for uptime pingers (keeps a free-tier host awake)
app.get('/health', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.status(200).json({ status: 'ok' });
});

// Browser cache for GET responses (max-age); CDN cache if one is in front (s-maxage)
app.use('/api', (req, res, next) => {
  if (req.method === 'GET') {
    // The admin panel always needs fresh data
    res.set(
      'Cache-Control',
      req.get('Authorization')
        ? 'no-store'
        : 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400'
    );
  }
  next();
});

// Public reads stay open; any write (POST/PUT/PATCH/DELETE) needs an admin token
app.use('/api/volunteering-experiences', guardWrites, volunteeringExperienceRoutes);
app.use('/api/language-tool-sections', guardWrites, languageToolSectionRoutes);
app.use('/api/project-categories', guardWrites, projectCategoryRoutes);
app.use('/api/certification-categories', guardWrites, certificationCategoryRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/site-content', siteContentRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/blog-feedback', blogFeedbackRoutes);

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
