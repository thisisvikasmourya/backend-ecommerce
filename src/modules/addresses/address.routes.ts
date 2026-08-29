import { Router } from 'express';
import { addressController } from './address.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { createAddressSchema, updateAddressSchema } from './address.schema.js';
import { idParamSchema } from '../../common/validators/common.validators.js';
import { z } from 'zod';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => addressController.getAddresses(req, res).catch(next));

router.post('/', validate(createAddressSchema), (req, res, next) =>
  addressController.createAddress(req, res).catch(next),
);

router.get('/:id', validate({ params: idParamSchema }), (req, res, next) =>
  addressController.getAddressById(req, res).catch(next),
);

router.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateAddressSchema.shape.body }),
  (req, res, next) => addressController.updateAddress(req, res).catch(next),
);

router.delete('/:id', validate({ params: idParamSchema }), (req, res, next) =>
  addressController.deleteAddress(req, res).catch(next),
);

export const addressRoutes = router;
