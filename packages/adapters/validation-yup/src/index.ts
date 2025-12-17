import * as yup from 'yup';
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

export class YupValidationAdapter implements ValidationPort {
  readonly capability = 'validation';

  validate<T = Record<string, unknown>>(
    schema: ValidationSchema,
    data: T,
  ): Promise<ValidationResult> | ValidationResult {
    try {
      (schema as yup.Schema).validateSync(data, { abortEarly: false });
      return { isValid: true, errors: {} };
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const errors: Record<string, string> = {};
        error.inner.forEach(err => {
          if (err.path) {
            errors[err.path] = err.message;
          }
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

  validateField(
    schema: ValidationSchema,
    fieldName: string,
    value: unknown,
  ): Promise<string | undefined> | string | undefined {
    try {
      (schema as yup.Schema).validateSync(value);
      return undefined;
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        return error.message;
      }
      return (error as Error).message;
    }
  }

  createSchema(definition: Record<string, unknown>): ValidationSchema {
    const shape: Record<string, yup.Schema> = {};
    for (const [key, value] of Object.entries(definition)) {
      shape[key] = value as yup.Schema;
    }
    return yup.object().shape(shape);
  }

  string(): StringValidator {
    let schema = yup.string();
    const builder: StringValidator = {
      required: (message?: string) => {
        schema = schema.required(message);
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
        schema = schema.matches(regex, message);
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
    let schema = yup.number();
    const builder: NumberValidator = {
      required: (message?: string) => {
        schema = schema.required(message);
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
        schema = schema.integer(message);
        return builder;
      },
      build: () => schema as ValidationSchema,
    };
    return builder;
  }

  boolean(): BooleanValidator {
    let schema: yup.BooleanSchema = yup.boolean();
    const builder: BooleanValidator = {
      required: (message?: string) => {
        schema = schema.required(message);
        return builder;
      },
      isTrue: (message?: string) => {
        schema = schema.isTrue(message) as unknown as yup.BooleanSchema;
        return builder;
      },
      build: () => schema as ValidationSchema,
    };
    return builder;
  }

  array(): ArrayValidator {
    let schema: any = yup.array(); // Yup's array types are complex and don't match our interface exactly
    const builder: ArrayValidator = {
      required: (message?: string) => {
        schema = schema.required(message);
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
      of: (itemSchema: ValidationSchema) => {
        schema = schema.of(itemSchema as yup.Schema<any>);
        return builder;
      },
      build: () => schema as ValidationSchema,
    };
    return builder;
  }

  object(): ObjectValidator {
    let schema = yup.object();
    const builder: ObjectValidator = {
      required: (message?: string) => {
        schema = schema.required(message);
        return builder;
      },
      shape: (definition: Record<string, ValidationSchema>) => {
        const shape: Record<string, yup.Schema> = {};
        for (const [key, value] of Object.entries(definition)) {
          shape[key] = value as yup.Schema;
        }
        schema = schema.shape(shape);
        return builder;
      },
      build: () => schema as ValidationSchema,
    };
    return builder;
  }
}
