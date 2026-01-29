import { DIContainer } from '../di/Container';

/**
 * Interfaz opcional que los adapters pueden implementar
 * para recibir el contenedor DI automáticamente al registrarse
 *
 * @example
 * ```typescript
 * export class MyAdapter implements MyPort, ContainerAware {
 *   private container?: DIContainer;
 *
 *   setContainer(container: DIContainer): void {
 *     this.container = container;
 *   }
 *
 *   async doSomething(): Promise<void> {
 *     // Usar this.container para obtener otros adapters
 *     const logger = this.container?.tryResolve<LoggerPort>('adapter:logger');
 *   }
 * }
 * ```
 */
export interface ContainerAware {
  /**
   * Método llamado automáticamente cuando el adapter se registra en el DI Container
   * @param container El contenedor DI donde se registró el adapter
   */
  setContainer(container: DIContainer): void;
}
