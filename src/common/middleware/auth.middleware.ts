import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../errors/app-error.js';
import { ErrorCodes } from '../errors/error-codes.js';
import { env } from '../../config/env.js';
import { AuthenticatedUser } from '../types/auth.types.js';

interface JwtPayload {
  userId: string;
  email: string;
  role: AuthenticatedUser['role'];
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or malformed Authorization header', ErrorCodes.UNAUTHORIZED);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Access token has expired', ErrorCodes.TOKEN_EXPIRED);
    }
    throw new UnauthorizedError('Invalid access token', ErrorCodes.TOKEN_INVALID);
  }
}
