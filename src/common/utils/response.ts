import { Response } from 'express';
import { ApiResponse, PaginatedResponse, PaginationMeta } from '../types/api-response.js';
import { HttpStatus } from '../constants/http-status.js';

export function sendSuccess<T>(
  res: Response,
  data: T,
  meta?: Record<string, unknown>,
  statusCode: number = HttpStatus.OK,
): void {
  const responseBody: ApiResponse<T> = {
    success: true,
    data,
    ...(meta ? { meta } : {}),
  };
  res.status(statusCode).json(responseBody);
}

export function sendCreated<T>(res: Response, data: T, meta?: Record<string, unknown>): void {
  sendSuccess(res, data, meta, HttpStatus.CREATED);
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: { page: number; limit: number; total: number },
  statusCode: number = HttpStatus.OK,
): void {
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const meta: PaginationMeta = {
    page: pagination.page,
    limit: pagination.limit,
    total: pagination.total,
    totalPages,
    hasNextPage: pagination.page < totalPages,
    hasPrevPage: pagination.page > 1,
  };

  const responseBody: PaginatedResponse<T> = {
    success: true,
    data,
    meta,
  };

  res.status(statusCode).json(responseBody);
}
