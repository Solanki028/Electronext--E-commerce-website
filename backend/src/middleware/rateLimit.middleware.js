import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV !== 'production';

const createRateLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    // In development, multiply limits by 50 so local browsing never hits the wall
    max: isDev ? max * 50 : max,
    message: {
      success: false,
      statusCode: 429,
      message,
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV === 'test',
  });

// Global limiter: 100 req / 15 min in prod  →  5000 req / 15 min in dev
export const globalRateLimiter = createRateLimiter(
  15 * 60 * 1000,
  100,
  'Too many requests from this IP. Please try again after 15 minutes.'
);

// Auth limiter: 10 req / 15 min in prod  →  500 req / 15 min in dev
export const authRateLimiter = createRateLimiter(
  15 * 60 * 1000,
  10,
  'Too many authentication attempts. Please try again after 15 minutes.'
);

// Upload limiter: 20 req / hour in prod  →  1000 req / hour in dev
export const uploadRateLimiter = createRateLimiter(
  60 * 60 * 1000,
  20,
  'Too many upload requests. Please try again after an hour.'
);
