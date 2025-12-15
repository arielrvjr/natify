/**
 * Acción base que puede ser despachada entre módulos
 */
export interface Action<T extends string = string, P = unknown> {
  type: T;
  payload?: P;
}

/**
 * Handler de una acción
 */
export type ActionHandler<A extends Action = Action, R = void> = (action: A) => R | Promise<R>;

/**
 * Registro de handlers de acciones
 */
export type ActionHandlerRegistry = Map<string, ActionHandler<any, any>[]>;

/**
 * Resultado de despachar una acción
 */
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: Error;
}

/**
 * Acciones comunes del framework
 */
export interface LogoutAction extends Action<'auth:logout'> {}

export interface NavigateAction extends Action<
  'navigation:navigate',
  { route: string; params?: Record<string, unknown> }
> {}

export interface ShowToastAction extends Action<
  'ui:toast',
  { message: string; type?: 'success' | 'error' | 'info' }
> {}
