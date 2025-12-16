import { z } from 'zod';
import {
  ValidationPort,
  ValidationResult,
  ValidationSchema,
  StringValidator,
  NumberValidator,
  BooleanValidator,
  ArrayValidator,
  ObjectValidator,
} from '@nativefy/core';

export class ZodValidationAdapter implements ValidationPort {
  readonly capability = 'validation';

  validate<T = Record<string, unknown>>(
    schema: ValidationSchema,
    data: T,
  ): Promise<ValidationResult> | ValidationResult {
    try {
      (schema as z.ZodSchema).parse(data);
      return { isValid: true, errors: {} };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach(err => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });
        return {
          isValid: false,
          errors,
          message: error.message,
        };
      }
      return {
        isValid: false,
        errors: {},
        message: (error as Error).message,
      };
    }
  }

  validateField(schema: ValidationSchema, fieldName: string, value: unknown): string | undefined {
    try {
      (schema as z.ZodSchema).parse(value);
      return undefined;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message;
      }
      return (error as Error).message;
    }
  }

  createSchema(definition: Record<string, unknown>): ValidationSchema {
    const shape: Record<string, z.ZodTypeAny> = {};
    for (const [key, value] of Object.entries(definition)) {
      shape[key] = value as z.ZodTypeAny;
    }
    return z.object(shape);
  }

  string(): StringValidator {
    let schema = z.string();
    const builder: StringValidator = {
      required: (message?: string) => {
        if (message) {
          schema = schema.min(1, message);
        } else {
          schema = schema.min(1);
        }
        return builder;
      },
      email: (message?: string) => {
        schema = schema.email(message);
        return builder;
      },
      min: (length: number, message?: string) => {
        schema = schema.min(length, message);
        return builder;
      },
      max: (length: number, message?: string) => {
        schema = schema.max(length, message);
        return builder;
      },
      matches: (regex: RegExp, message?: string) => {
        schema = schema.regex(regex, message);
        return builder;
      },
      url: (message?: string) => {
        schema = schema.url(message);
        return builder;
      },
      build: () => schema as ValidationSchema,
    };
    return builder;
  }

  number(): NumberValidator {
    let schema = z.number();
    const builder: NumberValidator = {
      required: () => {
        // Zod numbers son required por defecto
        return builder;
      },
      min: (value: number, message?: string) => {
        schema = schema.min(value, message);
        return builder;
      },
      max: (value: number, message?: string) => {
        schema = schema.max(value, message);
        return builder;
      },
      positive: (message?: string) => {
        schema = schema.positive(message);
        return builder;
      },
      integer: (message?: string) => {
        schema = schema.int(message);
        return builder;
      },
      build: () => schema as ValidationSchema,
    };
    return builder;
  }

  boolean(): BooleanValidator {
    let schema: z.ZodBoolean = z.boolean();
    const builder: BooleanValidator = {
      required: () => {
        // Zod booleans son required por defecto
        return builder;
      },
      isTrue: (message?: string) => {
        // Usar refine para validar que sea true, manteniendo el tipo ZodBoolean
        schema = schema.refine(val => val === true, {
          message: message || 'Must be true',
        }) as unknown as z.ZodBoolean;
        return builder;
      },
      build: () => schema as ValidationSchema,
    };
    return builder;
  }

  array(): ArrayValidator {
    let schema: z.ZodArray<z.ZodTypeAny> = z.array(z.unknown());
    const builder: ArrayValidator = {
      required: () => {
        // Zod arrays son required por defecto
        return builder;
      },
      min: (length: number, message?: string) => {
        schema = schema.min(length, message) as z.ZodArray<z.ZodTypeAny>;
        return builder;
      },
      max: (length: number, message?: string) => {
        schema = schema.max(length, message) as z.ZodArray<z.ZodTypeAny>;
        return builder;
      },
      of: (itemSchema: ValidationSchema) => {
        schema = z.array(itemSchema as z.ZodTypeAny) as z.ZodArray<z.ZodTypeAny>;
        return builder;
      },
      build: () => schema as ValidationSchema,
    };
    return builder;
  }

  object(): ObjectValidator {
    let schema = z.object({});
    const builder: ObjectValidator = {
      required: () => {
        // Zod objects son required por defecto
        return builder;
      },
      shape: (definition: Record<string, ValidationSchema>) => {
        const shape: Record<string, z.ZodTypeAny> = {};
        for (const [key, value] of Object.entries(definition)) {
          shape[key] = value as z.ZodTypeAny;
        }
        schema = z.object(shape);
        return builder;
      },
      build: () => schema as ValidationSchema,
    };
    return builder;
  }
}
