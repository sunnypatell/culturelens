// request validation utilities using Zod

import { z, ZodSchema } from "zod";
import { ValidationError } from "./errors";

/**
 * validates request body against a Zod schema
 * @throws ValidationError if validation fails
 */
export async function validateRequest<T extends ZodSchema>(
  request: Request,
  schema: T
): Promise<z.infer<T>> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      );
      throw new ValidationError("request validation failed", errors.join(", "));
    }
    throw new ValidationError("invalid request body");
  }
}

/**
 * validates request params against a Zod schema
 * @throws ValidationError if validation fails
 */
export function validateParams<T extends ZodSchema>(
  params: unknown,
  schema: T
): z.infer<T> {
  try {
    return schema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      );
      throw new ValidationError(
        "parameter validation failed",
        errors.join(", ")
      );
    }
    throw new ValidationError("invalid parameters");
  }
}

/**
 * validates query parameters against a Zod schema
 * @throws ValidationError if validation fails
 */
export function validateQuery<T extends ZodSchema>(
  searchParams: URLSearchParams,
  schema: T
): z.infer<T> {
  try {
    const query = Object.fromEntries(searchParams.entries());
    return schema.parse(query);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      );
      throw new ValidationError(
        "query parameter validation failed",
        errors.join(", ")
      );
    }
    throw new ValidationError("invalid query parameters");
  }
}
