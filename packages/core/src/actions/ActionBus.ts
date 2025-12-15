import { Action, ActionHandler, ActionHandlerRegistry, ActionResult } from './types';

/**
 * Bus de acciones para comunicación inter-módulo.
 * Permite que los módulos se comuniquen de manera desacoplada.
 *
 * @example
 * ```typescript
 * // En el módulo Auth
 * actionBus.register('auth:logout', async () => {
 *   await logoutUseCase.execute();
 * });
 *
 * // En el módulo Profile
 * const handleLogout = async () => {
 *   await actionBus.dispatch({ type: 'auth:logout' });
 * };
 * ```
 */
class ActionBusClass {
  private handlers: ActionHandlerRegistry = new Map();
  private middlewares: Array<(action: Action, next: () => Promise<void>) => Promise<void>> = [];

  /**
   * Registra un handler para un tipo de acción.
   * Pueden existir múltiples handlers para el mismo tipo.
   *
   * @returns Función para desregistrar el handler
   */
  register<A extends Action, R = void>(
    actionType: A['type'],
    handler: ActionHandler<A, R>,
  ): () => void {
    if (!this.handlers.has(actionType)) {
      this.handlers.set(actionType, []);
    }

    this.handlers.get(actionType)!.push(handler);

    // Retornar función de cleanup
    return () => {
      const handlers = this.handlers.get(actionType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  /**
   * Despacha una acción a todos los handlers registrados.
   * Ejecuta todos los handlers en paralelo.
   */
  async dispatch<A extends Action, R = void>(action: A): Promise<ActionResult<R>> {
    const handlers = this.handlers.get(action.type);

    if (!handlers || handlers.length === 0) {
      console.warn(`[ActionBus] No handlers registered for action: ${action.type}`);
      return { success: true };
    }

    try {
      // Ejecutar middlewares primero
      for (const middleware of this.middlewares) {
        await middleware(action, async () => {});
      }

      // Ejecutar todos los handlers
      const results = await Promise.all(handlers.map(handler => handler(action)));

      // Retornar el primer resultado (o el último si hay múltiples)
      return {
        success: true,
        data: results[results.length - 1] as R,
      };
    } catch (error) {
      console.error(`[ActionBus] Error dispatching action ${action.type}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Despacha una acción y espera la respuesta del primer handler.
   * Útil para queries que esperan un resultado específico.
   */
  async query<A extends Action, R>(action: A): Promise<R | undefined> {
    const result = await this.dispatch<A, R>(action);
    return result.data;
  }

  /**
   * Agrega un middleware que se ejecuta antes de cada acción.
   * Útil para logging, analytics, etc.
   */
  use(middleware: (action: Action, next: () => Promise<void>) => Promise<void>): void {
    this.middlewares.push(middleware);
  }

  /**
   * Verifica si hay handlers registrados para un tipo de acción
   */
  hasHandlers(actionType: string): boolean {
    const handlers = this.handlers.get(actionType);
    return !!handlers && handlers.length > 0;
  }

  /**
   * Limpia todos los handlers (útil para testing)
   */
  clear(): void {
    this.handlers.clear();
    this.middlewares = [];
  }
}

// Singleton
export const actionBus = new ActionBusClass();

/**
 * Crea un tipo de acción tipado para uso consistente
 */
export function createAction<T extends string, P = void>(
  type: T,
): P extends void ? () => Action<T, undefined> : (payload: P) => Action<T, P> {
  return ((payload?: P) => ({
    type,
    payload,
  })) as any;
}
