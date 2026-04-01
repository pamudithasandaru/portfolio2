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

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.warn('Server will continue without database connectivity.');
  }
};

connectDB();

// Basic route
app.get('/api', (req, res) => {
  res.json({ message: 'Portfolio API is running' });
});

app.use('/api/volunteering-experiences', volunteeringExperienceRoutes);
app.use('/api/language-tool-sections', languageToolSectionRoutes);
app.use('/api/project-categories', projectCategoryRoutes);
app.use('/api/certification-categories', certificationCategoryRoutes);
app.use('/api/contact', contactRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
