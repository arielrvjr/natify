import * as Sentry from '@sentry/react-native';
import {
  ErrorReportingPort,
  SeverityLevel,
  UserContext,
  Breadcrumb,
  ErrorReportingTags,
  ErrorReportingContext,
  NativefyError,
  NativefyErrorCode,
} from '@nativefy/core';

/**
 * Configuración para el adapter de Sentry
 */
export interface SentryAdapterConfig {
  /** DSN del proyecto Sentry */
  dsn: string;
  /** Entorno de la aplicación (development, staging, production) */
  environment?: string;
  /** Versión de la aplicación */
  release?: string;
  /** Si habilitar debug mode (default: false) */
  debug?: boolean;
  /** Si habilitar tracing automático (default: false) */
  enableTracing?: boolean;
  /** Traces sample rate (0.0 a 1.0) */
  tracesSampleRate?: number;
  /** Si capturar screenshots automáticamente (default: false) */
  attachScreenshot?: boolean;
  /** Si capturar view hierarchy (default: false) */
  attachViewHierarchy?: boolean;
  /** Configuración adicional de Sentry */
  sentryOptions?: Sentry.ReactNativeOptions;
}

/**
 * Adapter de Error Reporting para Nativefy Framework usando Sentry.
 *
 * Soporta:
 * - Captura de excepciones y mensajes
 * - Contexto de usuario
 * - Breadcrumbs para tracking
 * - Tags y contexto adicional
 * - Performance monitoring (opcional)
 *
 * @example
 * ```typescript
 * import { SentryErrorReportingAdapter } from '@nativefy/error-reporting-sentry';
 *
 * const errorReporting = new SentryErrorReportingAdapter({
 *   dsn: 'YOUR_SENTRY_DSN',
 *   environment: 'production',
 * });
 *
 * // En NativefyProvider
 * const config = {
 *   errorReporting: errorReporting,
 *   // ... otros adapters
 * };
 * ```
 */
export class SentryErrorReportingAdapter implements ErrorReportingPort {
  readonly capability = 'error-reporting';

  private config: SentryAdapterConfig;
  private isInitialized: boolean = false;
  private currentUser: UserContext | null = null;

  constructor(config: SentryAdapterConfig) {
    this.config = {
      debug: false,
      enableTracing: false,
      tracesSampleRate: 0.0,
      attachScreenshot: false,
      attachViewHierarchy: false,
      ...config,
    };
  }

  /**
   * Inicializa Sentry
   */
  async init(dsn?: string, options?: Record<string, unknown>): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      const finalDsn = dsn || this.config.dsn;

      const sentryOptions: Sentry.ReactNativeOptions = {
        dsn: finalDsn,
        environment: this.config.environment,
        release: this.config.release,
        debug: this.config.debug,
        enableTracing: this.config.enableTracing,
        tracesSampleRate: this.config.tracesSampleRate,
        attachScreenshot: this.config.attachScreenshot,
        attachViewHierarchy: this.config.attachViewHierarchy,
        ...this.config.sentryOptions,
        ...options,
      };

      Sentry.init(sentryOptions);

      this.isInitialized = true;
    } catch (error) {
      throw new NativefyError(
        NativefyErrorCode.UNKNOWN,
        'Failed to initialize Sentry',
        error,
        { dsn: dsn || this.config.dsn },
      );
    }
  }

  /**
   * Captura una excepción
   */
  captureException(
    error: Error,
    context?: ErrorReportingContext,
    level: SeverityLevel = SeverityLevel.ERROR,
  ): void {
    if (!this.isInitialized) {
      console.warn('[SentryAdapter] Not initialized. Call init() first.');
      return;
    }

    try {
      const sentryLevel = this.mapSeverityToSentry(level);

      Sentry.withScope((scope) => {
        scope.setLevel(sentryLevel);

        if (context) {
          scope.setContext('custom', context);
        }

        Sentry.captureException(error);
      });
    } catch (err) {
      console.error('[SentryAdapter] Error capturing exception:', err);
    }
  }

  /**
   * Captura un mensaje
   */
  captureMessage(
    message: string,
    level: SeverityLevel = SeverityLevel.INFO,
    context?: ErrorReportingContext,
  ): void {
    if (!this.isInitialized) {
      console.warn('[SentryAdapter] Not initialized. Call init() first.');
      return;
    }

    try {
      const sentryLevel = this.mapSeverityToSentry(level);

      Sentry.withScope((scope) => {
        scope.setLevel(sentryLevel);

        if (context) {
          scope.setContext('custom', context);
        }

        Sentry.captureMessage(message);
      });
    } catch (error) {
      console.error('[SentryAdapter] Error capturing message:', error);
    }
  }

  /**
   * Establece el contexto del usuario
   */
  setUser(user: UserContext | null): void {
    if (!this.isInitialized) {
      console.warn('[SentryAdapter] Not initialized. Call init() first.');
      return;
    }

    try {
      this.currentUser = user;

      if (user) {
        Sentry.setUser({
          id: user.id,
          email: user.email,
          username: user.username,
          ...Object.fromEntries(
            Object.entries(user).filter(([key]) => !['id', 'email', 'username'].includes(key)),
          ),
        });
      } else {
        Sentry.setUser(null);
      }
    } catch (error) {
      console.error('[SentryAdapter] Error setting user:', error);
    }
  }

  /**
   * Obtiene el contexto del usuario actual
   */
  getUser(): UserContext | null {
    return this.currentUser;
  }

  /**
   * Agrega un breadcrumb
   */
  addBreadcrumb(breadcrumb: Breadcrumb): void {
    if (!this.isInitialized) {
      console.warn('[SentryAdapter] Not initialized. Call init() first.');
      return;
    }

    try {
      Sentry.addBreadcrumb({
        message: breadcrumb.message,
        category: breadcrumb.category,
        level: breadcrumb.level ? this.mapSeverityToSentry(breadcrumb.level) : undefined,
        data: breadcrumb.data,
        timestamp: breadcrumb.timestamp?.getTime() || Date.now() / 1000,
      });
    } catch (error) {
      console.error('[SentryAdapter] Error adding breadcrumb:', error);
    }
  }

  /**
   * Establece tags
   */
  setTags(tags: ErrorReportingTags): void {
    if (!this.isInitialized) {
      console.warn('[SentryAdapter] Not initialized. Call init() first.');
      return;
    }

    try {
      Sentry.setTags(tags);
    } catch (error) {
      console.error('[SentryAdapter] Error setting tags:', error);
    }
  }

  /**
   * Establece un tag individual
   */
  setTag(key: string, value: string | number | boolean): void {
    if (!this.isInitialized) {
      console.warn('[SentryAdapter] Not initialized. Call init() first.');
      return;
    }

    try {
      Sentry.setTag(key, value);
    } catch (error) {
      console.error('[SentryAdapter] Error setting tag:', error);
    }
  }

  /**
   * Establece contexto adicional
   */
  setContext(key: string, context: ErrorReportingContext): void {
    if (!this.isInitialized) {
      console.warn('[SentryAdapter] Not initialized. Call init() first.');
      return;
    }

    try {
      Sentry.setContext(key, context);
    } catch (error) {
      console.error('[SentryAdapter] Error setting context:', error);
    }
  }

  /**
   * Limpia el contexto del usuario
   */
  clearUser(): void {
    this.setUser(null);
  }

  /**
   * Limpia todos los breadcrumbs
   */
  clearBreadcrumbs(): void {
    if (!this.isInitialized) {
      return;
    }

    try {
      // Sentry no tiene un método directo para limpiar breadcrumbs,
      // pero podemos crear un nuevo scope sin breadcrumbs
      Sentry.withScope((scope) => {
        scope.clearBreadcrumbs();
      });
    } catch (error) {
      console.error('[SentryAdapter] Error clearing breadcrumbs:', error);
    }
  }

  /**
   * Mapea SeverityLevel del framework a Sentry.SeverityLevel
   */
  private mapSeverityToSentry(level: SeverityLevel): 'fatal' | 'error' | 'warning' | 'info' | 'debug' {
    switch (level) {
      case SeverityLevel.FATAL:
        return 'fatal';
      case SeverityLevel.ERROR:
        return 'error';
      case SeverityLevel.WARNING:
        return 'warning';
      case SeverityLevel.INFO:
        return 'info';
      case SeverityLevel.DEBUG:
        return 'debug';
      default:
        return 'error';
    }
  }

  /**
   * Obtiene el cliente Sentry subyacente (para casos avanzados)
   */
  getSentryClient(): typeof Sentry {
    return Sentry;
  }
}

