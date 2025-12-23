import { Port } from './Port';

/**
 * Atributos del usuario para evaluación de feature flags
 */
export interface UserAttributes {
  /** ID único del usuario */
  id?: string;
  /** Email del usuario */
  email?: string;
  /** Nombre del usuario */
  name?: string;
  /** Roles del usuario */
  roles?: string[];
  /** Plan del usuario */
  plan?: string;
  /** País del usuario */
  country?: string;
  /** Cualquier otro atributo personalizado */
  [key: string]: unknown;
}

/**
 * Resultado de evaluación de un feature flag
 */
export interface FeatureFlagResult<T = unknown> {
  /** Valor del flag (puede ser boolean, string, number, object, etc.) */
  value: T | null;
  /** Si el flag está habilitado (para flags booleanos) */
  enabled: boolean;
  /** Si el flag existe en la configuración */
  exists: boolean;
  /** Variante asignada (si aplica) */
  variant?: string;
  /** Fuente de la evaluación (remote, local, etc.) */
  source?: string;
}

/**
 * Puerto para operaciones con feature flags.
 * Permite evaluar flags, obtener variantes y gestionar atributos del usuario.
 */
export interface FeatureFlagPort extends Port {
  readonly capability: 'featureflag';

  /**
   * Inicializa el servicio de feature flags.
   * @param attributes Atributos iniciales del usuario (opcional)
   */
  init(attributes?: UserAttributes): Promise<void>;

  /**
   * Obtiene el valor de un feature flag.
   * @param key Clave del feature flag
   * @param defaultValue Valor por defecto si el flag no existe
   * @returns Valor del flag o defaultValue
   */
  getValue<T = unknown>(key: string, defaultValue?: T): T | null;

  /**
   * Verifica si un feature flag está habilitado.
   * @param key Clave del feature flag
   * @returns true si está habilitado, false si no
   */
  isEnabled(key: string): boolean;

  /**
   * Obtiene el resultado completo de evaluación de un feature flag.
   * @param key Clave del feature flag
   * @returns Resultado con valor, enabled, exists, variant, etc.
   */
  getFeatureFlag<T = unknown>(key: string): FeatureFlagResult<T>;

  /**
   * Obtiene múltiples feature flags a la vez.
   * @param keys Array de claves de feature flags
   * @returns Mapa de resultados por clave
   */
  getFeatureFlags(keys: string[]): Record<string, FeatureFlagResult>;

  /**
   * Actualiza los atributos del usuario.
   * Los atributos se usan para evaluar reglas de targeting.
   * @param attributes Nuevos atributos del usuario
   */
  setAttributes(attributes: UserAttributes): void;

  /**
   * Obtiene los atributos actuales del usuario.
   * @returns Atributos actuales
   */
  getAttributes(): UserAttributes;

  /**
   * Refresca los feature flags desde el servidor.
   * Útil para obtener actualizaciones en tiempo real.
   */
  refresh(): Promise<void>;

  /**
   * Limpia los atributos del usuario (logout).
   */
  clearAttributes(): void;
}

