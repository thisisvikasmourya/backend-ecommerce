import { Router } from 'express';
import { userController } from './user.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { updateProfileSchema } from './user.schema.js';

const router = Router();

router.use(authenticate);

router.get('/me', (req, res, next) => userController.getProfile(req, res).catch(next));

router.patch('/me', validate(updateProfileSchema), (req, res, next) =>
  userController.updateProfile(req, res).catch(next),
);

router.delete('/me', (req, res, next) => userController.deactivateAccount(req, res).catch(next));

export const userRoutes = router;
