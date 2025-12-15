import { Port } from './Port';

export interface AnalyticsPort extends Port {
  readonly capability: 'analytics';
  /**
   * Inicializa el servicio (si es necesario).
   */
  init(): Promise<void>;

  /**
   * Identifica al usuario actual.
   * @param userId ID único del usuario en tu DB
   * @param traits Propiedades del usuario (email, plan, role, etc)
   */
  identify(userId: string, traits?: Record<string, unknown>): void;

  /**
   * Registra un evento de negocio.
   * @param event Nombre del evento (ej: 'checkout_completed')
   * @param properties Metadata del evento (ej: { total: 100, currency: 'USD' })
   */
  track(event: string, properties?: Record<string, unknown>): void;

  /**
   * Registra una vista de pantalla.
   * Vital para apps móviles donde la navegación es compleja.
   */
  screen(name: string, properties?: Record<string, unknown>): void;

  /**
   * Limpia la sesión (Logout).
   */
  reset(): void;
}
