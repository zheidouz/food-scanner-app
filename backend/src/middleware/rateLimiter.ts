import rateLimit from 'express-rate-limit';

// Open Food Facts free tier: ~20 req/min
// We apply a conservative 15 req/min per IP to stay safe
export const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests. Please slow down.',
    },
  },
});
