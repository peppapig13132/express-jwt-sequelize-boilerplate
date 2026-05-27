import rateLimit from 'express-rate-limit';
import { NextFunction, Request, Response, RequestHandler } from 'express';

const noopLimiter: RequestHandler = (_req: Request, _res: Response, next: NextFunction) => {
  next();
};

function createRateLimiter(options: Parameters<typeof rateLimit>[0]): RequestHandler {
  if (process.env.NODE_ENV === 'test') {
    return noopLimiter;
  }

  return rateLimit(options);
}

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    msg: 'Too many authentication attempts, please try again later',
  },
});

export const refreshRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    msg: 'Too many token refresh attempts, please try again later',
  },
});
