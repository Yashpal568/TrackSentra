import rateLimit from 'express-rate-limit';

// Global rate limiting
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
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
