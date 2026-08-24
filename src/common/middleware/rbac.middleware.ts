import { Request, Response, NextFunction } from 'express';
import { Role } from '../constants/roles.js';
import { ForbiddenError, UnauthorizedError } from '../errors/app-error.js';

export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('User is not authenticated');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError('You do not have permission to perform this action');
    }

    next();
  };
}
