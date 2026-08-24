import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError, ZodTypeAny } from 'zod';
import { ValidationError } from '../errors/app-error.js';

export type ValidationSchema =
  | {
      body?: ZodTypeAny;
      query?: ZodTypeAny;
      params?: ZodTypeAny;
    }
  | AnyZodObject;

export function validate(schema: ValidationSchema) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if ('parseAsync' in schema) {
        const parsed = await schema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        });
        if (parsed && typeof parsed === 'object') {
          if ('body' in parsed && parsed.body !== undefined) req.body = parsed.body;
          if ('query' in parsed && parsed.query !== undefined) req.query = parsed.query as Request['query'];
          if ('params' in parsed && parsed.params !== undefined) req.params = parsed.params as Request['params'];
        }
      } else {
        if (schema.body) {
          req.body = await schema.body.parseAsync(req.body);
        }
        if (schema.query) {
          req.query = (await schema.query.parseAsync(req.query)) as Request['query'];
        }
        if (schema.params) {
          req.params = (await schema.params.parseAsync(req.params)) as Request['params'];
        }
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        next(new ValidationError('Invalid request data', formattedErrors));
      } else {
        next(error);
      }
    }
  };
}
