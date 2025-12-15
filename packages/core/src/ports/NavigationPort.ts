import { Port } from './Port';

/**
 * Tipos de parámetros de navegación.
 * Cada pantalla define sus propios parámetros.
 */
export type NavigationParams = Record<string, unknown> | undefined;

/**
 * Opciones para la navegación.
 */
export interface NavigationOptions {
  /** Si es true, reemplaza la pantalla actual en lugar de apilar */
  replace?: boolean;
  /** Animación de transición */
  animation?: 'default' | 'fade' | 'slide_from_right' | 'slide_from_bottom' | 'none';
}

/**
 * Opciones para configurar el header de una pantalla.
 */
export interface ScreenOptions {
  title?: string;
  headerShown?: boolean;
  headerBackTitle?: string;
  gestureEnabled?: boolean;
}

/**
 * Listener para eventos de navegación.
 */
export type NavigationListener = (event: {
  type: 'focus' | 'blur' | 'beforeRemove' | 'state';
  data?: unknown;
}) => void;

/**
 * Puerto de navegación.
 * Abstrae la navegación entre pantallas de la aplicación.
 */
export interface NavigationPort extends Port {
  readonly capability: 'navigation';

  /**
   * Navega a una pantalla.
   * @param routeName Nombre de la ruta/pantalla
   * @param params Parámetros opcionales para la pantalla
   * @param options Opciones de navegación
   */
  navigate<T extends NavigationParams = NavigationParams>(
    routeName: string,
    params?: T,
    options?: NavigationOptions,
  ): void;

  /**
   * Regresa a la pantalla anterior.
   * @returns true si pudo regresar, false si no había pantalla anterior
   */
  goBack(): boolean;

  /**
   * Regresa al inicio del stack de navegación.
   */
  popToTop(): void;

  /**
   * Reemplaza la pantalla actual (no agrega al historial).
   */
  replace<T extends NavigationParams = NavigationParams>(routeName: string, params?: T): void;

  /**
   * Reinicia el stack de navegación con nuevas rutas.
   * Útil para flujos de auth (login -> home).
   */
  reset(routes: Array<{ name: string; params?: NavigationParams }>): void;

  /**
   * Obtiene el nombre de la ruta actual.
   */
  getCurrentRoute(): string | undefined;

  /**
   * Obtiene los parámetros de la ruta actual.
   */
  getCurrentParams<T extends NavigationParams = NavigationParams>(): T | undefined;

  /**
   * Verifica si se puede regresar.
   */
  canGoBack(): boolean;

  /**
   * Configura opciones de la pantalla actual.
   */
  setOptions(options: ScreenOptions): void;

  /**
   * Agrega un listener de eventos de navegación.
   * @returns Función para remover el listener
   */
  addListener(
    event: 'focus' | 'blur' | 'beforeRemove' | 'state',
    callback: NavigationListener,
  ): () => void;
}
