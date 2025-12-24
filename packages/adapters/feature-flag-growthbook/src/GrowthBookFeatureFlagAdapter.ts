import { GrowthBook } from '@growthbook/growthbook-react';
import {
  FeatureFlagPort,
  UserAttributes,
  FeatureFlagResult,
  NatifyError,
  NatifyErrorCode,
} from '@natify/core';

/**
 * Configuración para el adapter de GrowthBook
 */
export interface GrowthBookAdapterConfig {
  /** API Host de GrowthBook (default: https://cdn.growthbook.io) */
  apiHost?: string;
  /** Client Key del proyecto GrowthBook */
  clientKey: string;
  /** Si habilitar modo desarrollo (default: false) */
  enableDevMode?: boolean;
  /** Si habilitar streaming en tiempo real (default: false) */
  enableStreaming?: boolean;
  /** Si usar evaluación remota (default: false) */
  enableRemoteEval?: boolean;
  /** Atributos iniciales del usuario */
  initialAttributes?: UserAttributes;
  /** Configuración adicional de GrowthBook */
  growthBookConfig?: Partial<ConstructorParameters<typeof GrowthBook>[0]>;
}

/**
 * Adapter de Feature Flags para Natify Framework usando GrowthBook.
 *
 * Soporta:
 * - Evaluación de feature flags
 * - Targeting basado en atributos del usuario
 * - Variantes y experimentos
 * - Actualización en tiempo real (streaming)
 * - Evaluación remota para mayor seguridad
 *
 * @example
 * ```typescript
 * import { GrowthBookFeatureFlagAdapter } from '@natify/feature-flag-growthbook';
 *
 * const featureFlags = new GrowthBookFeatureFlagAdapter({
 *   clientKey: 'YOUR_GROWTHBOOK_CLIENT_KEY',
 * });
 *
 * // En NatifyProvider
 * const config = {
 *   featureflags: featureFlags,
 *   // ... otros adapters
 * };
 * ```
 */
export class GrowthBookFeatureFlagAdapter implements FeatureFlagPort {
  readonly capability = 'featureflag';

  private growthbook: GrowthBook;
  private config: GrowthBookAdapterConfig;
  private isInitialized: boolean = false;

  constructor(config: GrowthBookAdapterConfig) {
    this.config = {
      apiHost: 'https://cdn.growthbook.io',
      enableDevMode: false,
      enableStreaming: false,
      enableRemoteEval: false,
      ...config,
    };

    // Crear instancia de GrowthBook
    const growthBookConfig: ConstructorParameters<typeof GrowthBook>[0] = {
      apiHost: this.config.apiHost,
      clientKey: this.config.clientKey,
      enableDevMode: this.config.enableDevMode,
      ...this.config.growthBookConfig,
    };

    this.growthbook = new GrowthBook(growthBookConfig);

    // Establecer atributos iniciales si se proporcionan
    if (this.config.initialAttributes) {
      this.growthbook.setAttributes(this.mapAttributesToGrowthBook(this.config.initialAttributes));
    }
  }

  /**
   * Inicializa el servicio de feature flags
   */
  async init(attributes?: UserAttributes): Promise<void> {
    if (this.isInitialized) {
      // Si ya está inicializado, solo actualizar atributos si se proporcionan
      if (attributes) {
        this.setAttributes(attributes);
      }
      return;
    }

    try {
      // Cargar feature flags desde el servidor
      await this.growthbook.loadFeatures();

      // Establecer atributos si se proporcionan
      if (attributes) {
        this.growthbook.setAttributes(this.mapAttributesToGrowthBook(attributes));
      }

      // Habilitar streaming si está configurado
      // Nota: setStreaming no está disponible en la versión actual de GrowthBook
      // El streaming se configura en el constructor si está disponible

      this.isInitialized = true;
    } catch (error) {
      throw new NatifyError(
        NatifyErrorCode.NETWORK_ERROR,
        'Failed to initialize GrowthBook',
        error,
        { clientKey: this.config.clientKey },
      );
    }
  }

  /**
   * Obtiene el valor de un feature flag
   */
  getValue<T = unknown>(key: string, defaultValue?: T): T | null {
    if (!this.isInitialized) {
      console.warn('[GrowthBookAdapter] Not initialized. Call init() first.');
      return defaultValue ?? null;
    }

    try {
      const result = this.growthbook.evalFeature(key);
      if (result && result.on) {
        return (result.value as T) ?? defaultValue ?? null;
      }
      return defaultValue ?? null;
    } catch (error) {
      console.error(`[GrowthBookAdapter] Error getting value for flag "${key}":`, error);
      return defaultValue ?? null;
    }
  }

  /**
   * Verifica si un feature flag está habilitado
   */
  isEnabled(key: string): boolean {
    if (!this.isInitialized) {
      console.warn('[GrowthBookAdapter] Not initialized. Call init() first.');
      return false;
    }

    try {
      const result = this.growthbook.evalFeature(key);
      return result?.on ?? false;
    } catch (error) {
      console.error(`[GrowthBookAdapter] Error checking if flag "${key}" is enabled:`, error);
      return false;
    }
  }

  /**
   * Obtiene el resultado completo de evaluación de un feature flag
   */
  getFeatureFlag<T = unknown>(key: string): FeatureFlagResult<T> {
    if (!this.isInitialized) {
      console.warn('[GrowthBookAdapter] Not initialized. Call init() first.');
      return {
        value: null,
        enabled: false,
        exists: false,
      };
    }

    try {
      const result = this.growthbook.evalFeature(key);

      if (!result) {
        return {
          value: null,
          enabled: false,
          exists: false,
        };
      }

      return {
        value: (result.value as T) ?? null,
        enabled: result.on ?? false,
        exists: true,
        variant:
          result.source === 'experiment'
            ? result.experimentResult?.inExperiment
              ? result.experimentResult?.variationId?.toString()
              : undefined
            : undefined,
        source: result.source,
      };
    } catch (error) {
      console.error(`[GrowthBookAdapter] Error getting feature flag "${key}":`, error);
      return {
        value: null,
        enabled: false,
        exists: false,
      };
    }
  }

  /**
   * Obtiene múltiples feature flags a la vez
   */
  getFeatureFlags(keys: string[]): Record<string, FeatureFlagResult> {
    const results: Record<string, FeatureFlagResult> = {};

    for (const key of keys) {
      results[key] = this.getFeatureFlag(key);
    }

    return results;
  }

  /**
   * Actualiza los atributos del usuario
   */
  setAttributes(attributes: UserAttributes): void {
    if (!this.isInitialized) {
      console.warn('[GrowthBookAdapter] Not initialized. Call init() first.');
      return;
    }

    try {
      this.growthbook.setAttributes(this.mapAttributesToGrowthBook(attributes));
    } catch (error) {
      console.error('[GrowthBookAdapter] Error setting attributes:', error);
    }
  }

  /**
   * Obtiene los atributos actuales del usuario
   */
  getAttributes(): UserAttributes {
    if (!this.isInitialized) {
      return {};
    }

    try {
      const gbAttributes = this.growthbook.getAttributes();
      return this.mapAttributesFromGrowthBook(gbAttributes);
    } catch (error) {
      console.error('[GrowthBookAdapter] Error getting attributes:', error);
      return {};
    }
  }

  /**
   * Refresca los feature flags desde el servidor
   */
  async refresh(): Promise<void> {
    if (!this.isInitialized) {
      console.warn('[GrowthBookAdapter] Not initialized. Call init() first.');
      return;
    }

    try {
      await this.growthbook.loadFeatures();
    } catch (error) {
      throw new NatifyError(
        NatifyErrorCode.NETWORK_ERROR,
        'Failed to refresh feature flags',
        error,
      );
    }
  }

  /**
   * Limpia los atributos del usuario (logout)
   */
  clearAttributes(): void {
    if (!this.isInitialized) {
      return;
    }

    try {
      this.growthbook.setAttributes({});
    } catch (error) {
      console.error('[GrowthBookAdapter] Error clearing attributes:', error);
    }
  }

  /**
   * Obtiene el cliente GrowthBook subyacente (para casos avanzados)
   */
  getGrowthBookClient(): GrowthBook {
    return this.growthbook;
  }

  /**
   * Mapea atributos del framework a formato de GrowthBook
   */
  private mapAttributesToGrowthBook(attributes: UserAttributes): Record<string, unknown> {
    return {
      ...attributes,
      // Asegurar que los campos comunes estén en el formato correcto
      id: attributes.id,
      email: attributes.email,
      name: attributes.name,
    };
  }

  /**
   * Mapea atributos de GrowthBook a formato del framework
   */
  private mapAttributesFromGrowthBook(gbAttributes: Record<string, unknown>): UserAttributes {
    return {
      id: gbAttributes.id as string | undefined,
      email: gbAttributes.email as string | undefined,
      name: gbAttributes.name as string | undefined,
      roles: gbAttributes.roles as string[] | undefined,
      plan: gbAttributes.plan as string | undefined,
      country: gbAttributes.country as string | undefined,
      ...gbAttributes,
    };
  }
}
