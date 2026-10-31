const express = require('express');
const rateLimit = require('express-rate-limit');
const PageView = require('../models/PageView');

const router = express.Router();

const VISITOR_PATTERN = /^[A-Za-z0-9-]{8,64}$/;
const BOT_PATTERN = /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|curl|wget/i;

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests.' },
});

// Records one page view. Always answers 204 so tracking never shows an error to visitors.
router.post('/view', limiter, async (req, res) => {
  try {
    const { path, visitorId, referrer } = req.body || {};
    const cleanPath = String(path || '')
      .split(/[?#]/)[0]
      .replace(/(.)\/+$/, '$1');

    const valid =
      cleanPath.startsWith('/') &&
      cleanPath.length <= 200 &&
      !cleanPath.startsWith('/admin') &&
      VISITOR_PATTERN.test(String(visitorId || '')) &&
      !BOT_PATTERN.test(req.get('user-agent') || '');

    if (valid) {
      await PageView.create({
        path: cleanPath,
        visitorId,
        referrer: String(referrer || '').slice(0, 100),
      });
    }
  } catch (error) {
    console.error('Page view not recorded:', error.message);
  }

  res.status(204).end();
});

module.exports = router;
