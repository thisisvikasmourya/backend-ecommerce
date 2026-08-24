import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error.js';
import { logger } from '../../config/logger.js';
import { ApiErrorResponse } from '../types/api-response.js';
import { env } from '../../config/env.js';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const requestId = req.requestId;

  if (err instanceof AppError) {
    logger.warn(
      {
        requestId,
        path: req.path,
        method: req.method,
        statusCode: err.statusCode,
        code: err.code,
        message: err.message,
        details: err.details,
      },
      `AppError: ${err.message}`,
    );

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
      requestId,
    };

    res.status(err.statusCode).json(errorResponse);
    return;
  }

  logger.error(
    {
      requestId,
      path: req.path,
      method: req.method,
      err,
    },
    `Unhandled Exception: ${err.message}`,
  );

  const isProduction = env.NODE_ENV === 'production';
  const errorResponse: ApiErrorResponse = {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: isProduction ? 'An unexpected internal error occurred' : err.message,
      ...(!isProduction && err.stack ? { details: err.stack } : {}),
    },
    requestId,
  };

  res.status(500).json(errorResponse);
}
