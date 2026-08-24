import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.schema.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';

const router = Router();

router.post('/register', validate(registerSchema), (req, res, next) =>
  authController.register(req, res).catch(next),
);

router.post('/login', validate(loginSchema), (req, res, next) =>
  authController.login(req, res).catch(next),
);

router.post('/refresh', validate(refreshTokenSchema), (req, res, next) =>
  authController.refresh(req, res).catch(next),
);

router.post('/logout', (req, res, next) =>
  authController.logout(req, res).catch(next),
);

router.get('/me', authenticate, (req, res, next) =>
  authController.getMe(req, res).catch(next),
);

export const authRoutes = router;
