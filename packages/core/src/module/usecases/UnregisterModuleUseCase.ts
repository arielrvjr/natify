import { RegisteredModule } from '../types';
import { DIContainer } from '../../di/Container';

/**
 * UseCase para desregistrar un módulo
 *
 * Contiene la lógica de negocio:
 * - Ejecución de cleanup
 * - Eliminación de UseCases del DI
 * - Eliminación del módulo del DIContainer
 */
export class UnregisterModuleUseCase {
  constructor(private readonly diContainer: DIContainer) {}

  async execute(moduleId: string): Promise<void> {
    const module = this.diContainer.tryResolve<RegisteredModule>(`module:${moduleId}`);
    if (!module) {
      return; // Ya está desregistrado, no hacer nada
    }

    // Ejecutar cleanup si existe
    if (module.onDestroy) {
      await module.onDestroy();
    }

    // Remover UseCases del DI Container
    for (const useCase of module.useCases) {
      const useCaseKey = `${moduleId}:${useCase.key}`;
      this.diContainer.remove(useCaseKey);
    }

    // Eliminar del DIContainer
    this.diContainer.remove(`module:${moduleId}`);
  }
}
