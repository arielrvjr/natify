import { Port } from '../../ports/Port';
import { AdapterMap } from '../../types/adapters';
import { DIContainer } from '../Container';
import { NativefyError, NativefyErrorCode } from '../../errors';

/**
 * UseCase para obtener un adapter
 *
 * Lógica simple de lectura, pero encapsulada como UseCase
 * para mantener consistencia arquitectónica.
 */
export class GetAdapterUseCase {
  constructor(private readonly diContainer: DIContainer) {}

  execute<T extends Port>(lookupKey: string): T {
    // Intentar primero por nombre (adapter:http, adapter:storage)
    const byName = this.diContainer.tryResolve<T>(`adapter:${lookupKey}`);
    if (byName) {
      return byName;
    }

    // Si no encontramos por nombre, buscar por capability
    const adapterKeys = this.diContainer.getKeys().filter(key => key.startsWith('adapter:'));

    for (const key of adapterKeys) {
      const adapter = this.diContainer.tryResolve<Port>(key);
      if (adapter && adapter.capability === lookupKey) {
        return adapter as T;
      }
    }

    throw new NativefyError(
      NativefyErrorCode.VALIDATION_ERROR,
      `No adapter found for "${lookupKey}"`,
      undefined,
      { lookupKey },
    );
  }

  /**
   * Obtiene todos los adapters disponibles
   */
  executeAll(): AdapterMap {
    const adapters: AdapterMap = {};
    const adapterKeys = this.diContainer.getKeys().filter(key => key.startsWith('adapter:'));

    for (const key of adapterKeys) {
      const adapter = this.diContainer.tryResolve<Port>(key);
      if (adapter) {
        // Usar el capability como key principal
        adapters[adapter.capability] = adapter;
        // También mantener por nombre si es diferente
        const name = key.replace('adapter:', '');
        if (name !== adapter.capability) {
          adapters[name] = adapter;
        }
      }
    }

    return adapters;
  }
}
