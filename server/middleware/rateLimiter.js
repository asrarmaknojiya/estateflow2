// middleware/rateLimiter.js
const rateLimit = require("express-rate-limit");

// 🔹 Global rate limiter – sab routes ke liye
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                 // 15 min me 100 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  globalLimiter,
};
