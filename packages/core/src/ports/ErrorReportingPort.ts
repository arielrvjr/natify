import { Port } from './Port';

/**
 * Nivel de severidad para mensajes y errores
 */
export enum SeverityLevel {
  FATAL = 'fatal',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * Contexto del usuario para crash reporting
 */
export interface UserContext {
  /** ID único del usuario */
  id: string;
  /** Email del usuario */
  email?: string;
  /** Nombre del usuario */
  username?: string;
  /** Cualquier otro dato del usuario */
  [key: string]: unknown;
}

/**
 * Breadcrumb para tracking de eventos antes de un crash
 */
export interface Breadcrumb {
  /** Mensaje del breadcrumb */
  message: string;
  /** Categoría del breadcrumb */
  category?: string;
  /** Nivel de severidad */
  level?: SeverityLevel;
  /** Datos adicionales */
  data?: Record<string, unknown>;
  /** Timestamp del evento */
  timestamp?: Date;
}

/**
 * Tags para filtrar errores en el dashboard
 */
export interface ErrorReportingTags {
  [key: string]: string | number | boolean;
}

/**
 * Contexto adicional para errores
 */
export interface ErrorReportingContext {
  [key: string]: unknown;
}

/**
 * Puerto para error reporting y monitoreo de errores.
 * Permite capturar excepciones, mensajes, contexto de usuario y breadcrumbs.
 */
export interface ErrorReportingPort extends Port {
  readonly capability: 'error-reporting';

  /**
   * Inicializa el servicio de crash reporting.
   * @param dsn Data Source Name del proyecto (opcional, puede venir en config)
   * @param options Opciones de configuración adicionales
   */
  init(dsn?: string, options?: Record<string, unknown>): Promise<void>;

  /**
   * Captura una excepción/error.
   * @param error Error a capturar
   * @param context Contexto adicional del error
   * @param level Nivel de severidad (default: ERROR)
   */
  captureException(
    error: Error,
    context?: ErrorReportingContext,
    level?: SeverityLevel,
  ): void;

  /**
   * Captura un mensaje.
   * @param message Mensaje a capturar
   * @param level Nivel de severidad (default: INFO)
   * @param context Contexto adicional
   */
  captureMessage(
    message: string,
    level?: SeverityLevel,
    context?: ErrorReportingContext,
  ): void;

  /**
   * Establece el contexto del usuario actual.
   * @param user Contexto del usuario
   */
  setUser(user: UserContext | null): void;

  /**
   * Obtiene el contexto del usuario actual.
   * @returns Contexto del usuario o null
   */
  getUser(): UserContext | null;

  /**
   * Agrega un breadcrumb (evento de tracking).
   * Los breadcrumbs ayudan a entender qué pasó antes de un crash.
   * @param breadcrumb Breadcrumb a agregar
   */
  addBreadcrumb(breadcrumb: Breadcrumb): void;

  /**
   * Establece tags para filtrar errores en el dashboard.
   * @param tags Tags a establecer
   */
  setTags(tags: ErrorReportingTags): void;

  /**
   * Establece un tag individual.
   * @param key Clave del tag
   * @param value Valor del tag
   */
  setTag(key: string, value: string | number | boolean): void;

  /**
   * Establece contexto adicional para todos los eventos.
   * @param key Clave del contexto
   * @param context Datos del contexto
   */
  setContext(key: string, context: ErrorReportingContext): void;

  /**
   * Limpia el contexto del usuario (logout).
   */
  clearUser(): void;

  /**
   * Limpia todos los breadcrumbs.
   */
  clearBreadcrumbs(): void;
}

