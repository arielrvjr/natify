import { RegisteredModule } from '../types';
import { DIContainer } from '../../di/Container';

/**
 * UseCase para obtener un módulo
 *
 * Lógica simple de lectura, pero encapsulada como UseCase
 * para mantener consistencia arquitectónica.
 */
export class GetModuleUseCase {
  constructor(private readonly diContainer: DIContainer) {}

  execute(moduleId: string): RegisteredModule | undefined {
    return this.diContainer.tryResolve<RegisteredModule>(`module:${moduleId}`);
  }

  /**
   * Obtiene todos los módulos
   */
  executeAll(): RegisteredModule[] {
    const moduleKeys = this.diContainer.getKeys().filter(key => key.startsWith('module:'));
    const modules: RegisteredModule[] = [];

    for (const key of moduleKeys) {
      const module = this.diContainer.tryResolve<RegisteredModule>(key);
      if (module) {
        modules.push(module);
      }
    }

    return modules;
  }
}
