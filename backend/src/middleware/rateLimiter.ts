import rateLimit from 'express-rate-limit';

// Allow 60 requests per minute per IP — comfortable for scanning
// multiple products in a grocery store trip
export const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
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

// Stricter limit for image uploads (heavier processing)
export const imageRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many image uploads. Please wait before uploading another photo.',
    },
  },
});
