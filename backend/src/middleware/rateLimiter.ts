import rateLimit from 'express-rate-limit';

// Global rate limiting
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3000, // Limit each IP to 3000 requests per `window` to prevent blocking legitimate SPAs
  message: { error: { message: 'Too many requests, please try again later.' } },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// Authentication endpoints rate limiting (stricter)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per `window`
  message: { error: { message: 'Too many login attempts, please try again after 15 minutes' } },
  standardHeaders: true, 
  legacyHeaders: false, 
});
