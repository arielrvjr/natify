import { Port } from '../../ports/Port';
import { DIContainer } from '../Container';
import { ConsoleLoggerAdapter } from '../../adapters/logger/ConsoleLoggerAdapter';

/**
 * UseCase para registrar un adapter
 *
 * Contiene la lógica de negocio:
 * - Agregar logger por defecto si no está presente
 * - Validación de que el adapter implemente Port
 * - Registro en el DIContainer
 */
export class RegisterAdapterUseCase {
  constructor(private readonly diContainer: DIContainer) {}

  execute(name: string, adapter: Port): void {
    // Validar que el adapter implemente Port
    if (!adapter || typeof adapter !== 'object' || !('capability' in adapter)) {
      throw new Error(`[RegisterAdapterUseCase] Invalid adapter: must implement Port interface`);
    }

    // Registrar por nombre (ej: "http", "storage")
    this.diContainer.instance(`adapter:${name}`, adapter);

    // También registrar por capability para búsqueda por tipo
    this.diContainer.instance(`adapter:${adapter.capability}`, adapter);
  }

  /**
   * Registra múltiples adapters
   */
  executeMany(adapters: Record<string, Port>): void {
    // Agregar logger por defecto si no está presente
    const finalAdapters = { ...adapters };
    if (!finalAdapters.logger) {
      finalAdapters.logger = new ConsoleLoggerAdapter();
    }

    // Registrar logger primero si no está ya registrado
    if (!this.diContainer.has('adapter:logger')) {
      this.execute('logger', finalAdapters.logger);
    }

    // Registrar todos los adapters
    Object.entries(finalAdapters).forEach(([key, adapter]) => {
      this.execute(key, adapter);
    });
  }
}
