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

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
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

// Let Vercel's CDN cache public GET responses; serve stale while revalidating
app.use('/api', (req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
  }
  next();
});

app.use('/api/volunteering-experiences', volunteeringExperienceRoutes);
app.use('/api/language-tool-sections', languageToolSectionRoutes);
app.use('/api/project-categories', projectCategoryRoutes);
app.use('/api/certification-categories', certificationCategoryRoutes);
app.use('/api/contact', contactRoutes);

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
