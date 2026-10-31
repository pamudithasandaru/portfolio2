const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const TOKEN_LIFETIME = '12h';

const safeEqual = (a, b) => {
  const left = crypto.createHash('sha256').update(String(a)).digest();
  const right = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(left, right);
};

// Admin sign-in is switched on by setting ADMIN_USERNAME, JWT_SECRET and one of
// ADMIN_PASSWORD_HASH (bcrypt, preferred) or ADMIN_PASSWORD.
const isConfigured = () =>
  Boolean(
    process.env.JWT_SECRET &&
      process.env.ADMIN_USERNAME &&
      (process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD)
  );

const checkCredentials = async (username, password) => {
  const userOk = safeEqual(username, process.env.ADMIN_USERNAME);
  let passwordOk = false;

  if (process.env.ADMIN_PASSWORD_HASH) {
    passwordOk = await bcrypt.compare(String(password), process.env.ADMIN_PASSWORD_HASH);
  } else {
    passwordOk = safeEqual(password, process.env.ADMIN_PASSWORD);
  }

  return userOk && passwordOk;
};

const signToken = (username) =>
  jwt.sign({ role: 'admin', sub: username }, process.env.JWT_SECRET, { expiresIn: TOKEN_LIFETIME });

const readToken = (req) => {
  const header = req.get('Authorization') || '';
  const match = header.match(/^Bearer (.+)$/i);

  if (!match || !process.env.JWT_SECRET) {
    return null;
  }

  try {
    const payload = jwt.verify(match[1], process.env.JWT_SECRET);
    return payload.role === 'admin' ? payload : null;
  } catch {
    return null;
  }
};

const isAdmin = (req) => Boolean(readToken(req));

const requireAdmin = (req, res, next) => {
  if (!isAdmin(req)) {
    return res.status(401).json({ message: 'Please sign in again.' });
  }
  return next();
};

// Public GETs stay open; every write on the router needs an admin token.
const guardWrites = (req, res, next) =>
  ['GET', 'HEAD', 'OPTIONS'].includes(req.method) ? next() : requireAdmin(req, res, next);

module.exports = { isConfigured, checkCredentials, signToken, readToken, isAdmin, requireAdmin, guardWrites };
