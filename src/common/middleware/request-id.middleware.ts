import { Request, Response, NextFunction } from 'express';
import { nanoid } from 'nanoid';

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const existingId = req.headers['x-request-id'] as string | undefined;
  const requestId = existingId || `req_${nanoid(12)}`;

  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
}
