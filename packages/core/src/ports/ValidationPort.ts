import { Port } from './Port';

/**
 * Resultado de una validación
 */
export interface ValidationResult {
  /**
   * Indica si la validación fue exitosa
   */
  isValid: boolean;

  /**
   * Errores de validación por campo
   */
  errors: Record<string, string>;

  /**
   * Mensaje de error general (si aplica)
   */
  message?: string;
}

/**
 * Esquema de validación genérico
 * Puede ser un esquema de Yup, Zod, o cualquier otra librería
 */
export type ValidationSchema = unknown;

/**
 * Puerto para validación de datos
 *
 * Permite validar datos usando diferentes librerías (Yup, Zod, etc.)
 * sin acoplar el código a una implementación específica.
 *
 * @example
 * ```typescript
 * const validator = useAdapter<ValidationPort>("validation");
 *
 * const schema = validator.createSchema({
 *   email: validator.string().email().required(),
 *   password: validator.string().min(6).required(),
 * });
 *
 * const result = await validator.validate(schema, { email, password });
 * if (!result.isValid) {
 *   // Manejar errores
 * }
 * ```
 */
export interface ValidationPort extends Port {
  readonly capability: 'validation';

  /**
   * Valida un objeto completo contra un esquema
   *
   * @param schema - Esquema de validación
   * @param data - Datos a validar
   * @returns Resultado de la validación con errores por campo
   */
  validate<T = Record<string, unknown>>(
    schema: ValidationSchema,
    data: T,
  ): Promise<ValidationResult> | ValidationResult;

  /**
   * Valida un campo específico contra un esquema
   *
   * @param schema - Esquema de validación del campo
   * @param fieldName - Nombre del campo
   * @param value - Valor a validar
   * @returns Mensaje de error si es inválido, undefined si es válido
   */
  validateField(
    schema: ValidationSchema,
    fieldName: string,
    value: unknown,
  ): Promise<string | undefined> | string | undefined;

  /**
   * Crea un esquema de validación
   * La implementación específica depende del adapter (Yup, Zod, etc.)
   *
   * @param definition - Definición del esquema
   * @returns Esquema de validación
   */
  createSchema(definition: Record<string, unknown>): ValidationSchema;

  /**
   * Builder para crear validaciones de tipo string
   */
  string(): StringValidator;

  /**
   * Builder para crear validaciones de tipo number
   */
  number(): NumberValidator;

  /**
   * Builder para crear validaciones de tipo boolean
   */
  boolean(): BooleanValidator;

  /**
   * Builder para crear validaciones de tipo array
   */
  array(): ArrayValidator;

  /**
   * Builder para crear validaciones de tipo object
   */
  object(): ObjectValidator;
}

/**
 * Builder para validaciones de string
 */
export interface StringValidator {
  required(message?: string): StringValidator;
  email(message?: string): StringValidator;
  min(length: number, message?: string): StringValidator;
  max(length: number, message?: string): StringValidator;
  matches(regex: RegExp, message?: string): StringValidator;
  url(message?: string): StringValidator;
  build(): ValidationSchema;
}

/**
 * Builder para validaciones de number
 */
export interface NumberValidator {
  required(message?: string): NumberValidator;
  min(value: number, message?: string): NumberValidator;
  max(value: number, message?: string): NumberValidator;
  positive(message?: string): NumberValidator;
  integer(message?: string): NumberValidator;
  build(): ValidationSchema;
}

/**
 * Builder para validaciones de boolean
 */
export interface BooleanValidator {
  required(message?: string): BooleanValidator;
  isTrue(message?: string): BooleanValidator;
  build(): ValidationSchema;
}

/**
 * Builder para validaciones de array
 */
export interface ArrayValidator {
  required(message?: string): ArrayValidator;
  min(length: number, message?: string): ArrayValidator;
  max(length: number, message?: string): ArrayValidator;
  of(schema: ValidationSchema): ArrayValidator;
  build(): ValidationSchema;
}

/**
 * Builder para validaciones de object
 */
export interface ObjectValidator {
  required(message?: string): ObjectValidator;
  shape(definition: Record<string, ValidationSchema>): ObjectValidator;
  build(): ValidationSchema;
}
