import { Router } from 'express';
import {
  login,
  logout,
  logoutAll,
  refresh,
  signup,
} from '../controller/auth.controller';
import { authenticate, checkDuplicatedEmail } from '../middleware/auth.middleware';
import { authRateLimiter, refreshRateLimiter } from '../middleware/rateLimit.middleware';
import { validate } from '../middleware/validate.middleware';
import { authCredentialsSchema, refreshTokenSchema } from '../schemas/auth.schema';

const router: Router = Router();

router.post(
  '/signup',
  authRateLimiter,
  validate(authCredentialsSchema),
  checkDuplicatedEmail,
  signup
);

router.post(
  '/login',
  authRateLimiter,
  validate(authCredentialsSchema),
  login
);

router.post(
  '/refresh',
  refreshRateLimiter,
  validate(refreshTokenSchema),
  refresh
);

router.post(
  '/logout',
  validate(refreshTokenSchema),
  logout
);

router.post('/logout-all', authenticate, logoutAll);

export default router;
