import Mixpanel from 'mixpanel-react-native';
import {
  AnalyticsPort,
  NativefyError,
  NativefyErrorCode,
} from '@nativefy/core';

/**
 * Configuración para el adapter de Mixpanel
 */
export interface MixpanelAdapterConfig {
  /** Token del proyecto Mixpanel */
  token: string;
  /** Si inicializar automáticamente al crear el adapter (default: true) */
  autoInit?: boolean;
  /** Si usar opt-out tracking (default: false) */
  optOutTrackingByDefault?: boolean;
  /** Si trackear automáticamente eventos de pantalla (default: false) */
  trackAutomaticEvents?: boolean;
  /** Si usar super properties (default: true) */
  useSuperProperties?: boolean;
}

/**
 * Adapter de Analytics para Nativefy Framework usando Mixpanel.
 *
 * Soporta:
 * - Tracking de eventos
 * - Identificación de usuarios
 * - Tracking de pantallas
 * - Super properties
 * - Reset de sesión
 *
 * @example
 * ```typescript
 * import { MixpanelAnalyticsAdapter } from '@nativefy-adapter/analytics-mixpanel';
 *
 * const analyticsAdapter = new MixpanelAnalyticsAdapter({
 *   token: 'YOUR_MIXPANEL_TOKEN',
 * });
 *
 * // En NativefyProvider
 * const config = {
 *   analytics: analyticsAdapter,
 *   // ... otros adapters
 * };
 * ```
 */
export class MixpanelAnalyticsAdapter implements AnalyticsPort {
  readonly capability = 'analytics';

  private mixpanel: any;
  private config: MixpanelAdapterConfig;
  private isInitialized: boolean = false;

  constructor(config: MixpanelAdapterConfig) {
    this.config = {
      autoInit: true,
      optOutTrackingByDefault: false,
      trackAutomaticEvents: false,
      useSuperProperties: true,
      ...config,
    };

    this.mixpanel = Mixpanel;

    if (this.config.autoInit) {
      this.init().catch((error) => {
        console.error('[MixpanelAdapter] Error during auto-init:', error);
      });
    }
  }

  /**
   * Inicializa Mixpanel
   */
  async init(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      await this.mixpanel.init(
        this.config.token,
        {
          optOutTrackingByDefault: this.config.optOutTrackingByDefault,
          trackAutomaticEvents: this.config.trackAutomaticEvents,
        },
      );

      this.isInitialized = true;
    } catch (error) {
      throw new NativefyError(
        NativefyErrorCode.UNKNOWN,
        'Failed to initialize Mixpanel',
        error,
        { token: this.config.token },
      );
    }
  }

  /**
   * Identifica al usuario actual
   */
  identify(userId: string, traits?: Record<string, unknown>): void {
    if (!this.isInitialized) {
      console.warn('[MixpanelAdapter] Not initialized. Call init() first.');
      return;
    }

    try {
      // Identificar usuario
      this.mixpanel.identify(userId);

      // Establecer propiedades del usuario (super properties)
      if (traits && Object.keys(traits).length > 0) {
        if (this.config.useSuperProperties) {
          // Usar set como super properties (persisten en todos los eventos)
          this.mixpanel.getPeople().set(traits);
        } else {
          // O usar setUserProperties para propiedades del usuario
          this.mixpanel.setUserProperties(traits);
        }
      }
    } catch (error) {
      console.error('[MixpanelAdapter] Error identifying user:', error);
    }
  }

  /**
   * Registra un evento
   */
  track(event: string, properties?: Record<string, unknown>): void {
    if (!this.isInitialized) {
      console.warn('[MixpanelAdapter] Not initialized. Call init() first.');
      return;
    }

    try {
      this.mixpanel.track(event, properties);
    } catch (error) {
      console.error('[MixpanelAdapter] Error tracking event:', error);
    }
  }

  /**
   * Registra una vista de pantalla
   */
  screen(name: string, properties?: Record<string, unknown>): void {
    if (!this.isInitialized) {
      console.warn('[MixpanelAdapter] Not initialized. Call init() first.');
      return;
    }

    try {
      // Mixpanel no tiene un método específico para screens,
      // así que trackeamos como evento con prefijo "Screen Viewed"
      this.mixpanel.track('Screen Viewed', {
        screen_name: name,
        ...properties,
      });
    } catch (error) {
      console.error('[MixpanelAdapter] Error tracking screen:', error);
    }
  }

  /**
   * Limpia la sesión (logout)
   */
  reset(): void {
    if (!this.isInitialized) {
      return;
    }

    try {
      // Resetear identidad del usuario
      this.mixpanel.reset();
    } catch (error) {
      console.error('[MixpanelAdapter] Error resetting session:', error);
    }
  }

  /**
   * Establece super properties que se incluirán en todos los eventos
   */
  registerSuperProperties(properties: Record<string, unknown>): void {
    if (!this.isInitialized) {
      console.warn('[MixpanelAdapter] Not initialized. Call init() first.');
      return;
    }

    try {
      this.mixpanel.registerSuperProperties(properties);
    } catch (error) {
      console.error('[MixpanelAdapter] Error registering super properties:', error);
    }
  }

  /**
   * Establece una super property individual
   */
  registerSuperProperty(key: string, value: unknown): void {
    if (!this.isInitialized) {
      console.warn('[MixpanelAdapter] Not initialized. Call init() first.');
      return;
    }

    try {
      this.mixpanel.registerSuperProperties({ [key]: value });
    } catch (error) {
      console.error('[MixpanelAdapter] Error registering super property:', error);
    }
  }

  /**
   * Incrementa una propiedad numérica del usuario
   */
  incrementUserProperty(property: string, value: number = 1): void {
    if (!this.isInitialized) {
      console.warn('[MixpanelAdapter] Not initialized. Call init() first.');
      return;
    }

    try {
      this.mixpanel.getPeople().increment(property, value);
    } catch (error) {
      console.error('[MixpanelAdapter] Error incrementing user property:', error);
    }
  }

  /**
   * Establece propiedades del usuario (People)
   */
  setUserProperties(properties: Record<string, unknown>): void {
    if (!this.isInitialized) {
      console.warn('[MixpanelAdapter] Not initialized. Call init() first.');
      return;
    }

    try {
      this.mixpanel.getPeople().set(properties);
    } catch (error) {
      console.error('[MixpanelAdapter] Error setting user properties:', error);
    }
  }

  /**
   * Obtiene el cliente Mixpanel subyacente (para casos avanzados)
   */
  getMixpanelClient(): typeof Mixpanel {
    return this.mixpanel;
  }
}

