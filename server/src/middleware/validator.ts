/**
 * @module middleware/validator
 * Request validation middleware using Zod schemas.
 */

import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema, ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';
import { ERROR_CODES } from '@milkboy/shared';

type RequestPart = 'body' | 'query' | 'params';

/**
 * Validate request data against a Zod schema.
 * @param schema - Zod schema to validate against
 * @param source - Which part of the request to validate (body, query, params)
 */
export function validate(schema: ZodSchema, source: RequestPart = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const data = req[source];
      const result = schema.safeParse(data);

      if (!result.success) {
        const details = formatZodErrors(result.error);
        throw AppError.badRequest(
          ERROR_CODES.VAL_INVALID_INPUT,
          'Validation failed. Please check your input.',
          details,
        );
      }

      // Replace with parsed (and potentially transformed) data
      (req as Record<string, unknown>)[source] = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Convert Zod errors to a field-keyed object.
 */
function formatZodErrors(error: ZodError): Record<string, string[]> {
  const details: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.') || '_root';
    if (!details[path]) {
      details[path] = [];
    }
    details[path].push(issue.message);
  }

  return details;
}
