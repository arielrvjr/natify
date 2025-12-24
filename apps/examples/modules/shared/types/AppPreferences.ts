/**
 * Preferencias de la aplicación
 */
export interface AppPreferences {
  /**
   * Modo oscuro activado
   */
  darkMode: boolean;

  /**
   * Notificaciones activadas
   */
  notifications: boolean;

  /**
   * Idioma de la aplicación
   */
  language: string;

  /**
   * Biometría habilitada
   */
  biometricsEnabled: boolean;
}

/**
 * Valores por defecto de las preferencias
 */
export const DEFAULT_PREFERENCES: AppPreferences = {
  darkMode: false,
  notifications: true,
  language: 'es',
  biometricsEnabled: false,
};

