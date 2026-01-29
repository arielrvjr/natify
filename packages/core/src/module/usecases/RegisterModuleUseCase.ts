import { ModuleDefinition, RegisteredModule } from '../types';
import { AdapterMap } from '../../types/adapters';
import { DIContainer } from '../../di/Container';
import { NatifyError, NatifyErrorCode } from '../../errors';
import { Port } from '../../ports/Port';

/**
 * UseCase para registrar un módulo
 *
 * Contiene toda la lógica de negocio:
 * - Validación de capacidades requeridas
 * - Validación de estructura del módulo
 * - Registro de UseCases en DI
 * - Ejecución de inicialización
 */
export class RegisterModuleUseCase {
  constructor(private readonly diContainer: DIContainer) {}

  async execute(module: ModuleDefinition): Promise<RegisteredModule> {
    // Validar que el módulo no esté ya registrado
    const existingModule = this.diContainer.tryResolve<RegisteredModule>(`module:${module.id}`);
    if (existingModule) {
      throw new NatifyError(
        NatifyErrorCode.VALIDATION_ERROR,
        `Module "${module.id}" is already registered`,
        undefined,
        { moduleId: module.id },
      );
    }

    // Obtener adapters disponibles del DIContainer
    const availableAdapters = this.getAvailableAdapters();

    // Validar que las capacidades requeridas estén disponibles
    const requiredCapabilities = module.requires as string[];
    const missingCapabilities = this.validateCapabilities(requiredCapabilities, availableAdapters);
    if (missingCapabilities.length > 0) {
      throw new NatifyError(
        NatifyErrorCode.VALIDATION_ERROR,
        `Module "${module.id}" requires missing capabilities: ${missingCapabilities.join(', ')}`,
        undefined,
        { moduleId: module.id, missing: missingCapabilities },
      );
    }

    // Validar que el módulo tenga al menos una pantalla o un UseCase
    if (module.screens.length === 0 && module.useCases.length === 0) {
      throw new NatifyError(
        NatifyErrorCode.VALIDATION_ERROR,
        `Module "${module.id}" must have at least one screen or one UseCase`,
        undefined,
        { moduleId: module.id },
      );
    }

    // Obtener solo los adapters que el módulo necesita
    const moduleAdapters = this.getAdaptersForModule(requiredCapabilities, availableAdapters);

    // Registrar UseCases en el DI Container
    for (const useCase of module.useCases) {
      const useCaseKey = `${module.id}:${useCase.key}`;
      this.diContainer.singleton(useCaseKey, () => useCase.factory(moduleAdapters));
    }

    // Crear módulo registrado
    const registeredModule: RegisteredModule = {
      ...module,
      adapters: moduleAdapters,
      isLoaded: false,
    };

    // Almacenar en el DIContainer
    this.diContainer.instance(`module:${module.id}`, registeredModule);

    // Ejecutar inicialización si existe
    if (module.onInit) {
      await module.onInit(moduleAdapters);
    }

    registeredModule.isLoaded = true;

    return registeredModule;
  }

  /**
   * Obtiene los adapters disponibles del DIContainer
   */
  private getAvailableAdapters(): AdapterMap {
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

  /**
   * Valida que las capacidades requeridas estén disponibles
   */
  private validateCapabilities(required: string[], availableAdapters: AdapterMap): string[] {
    const missing: string[] = [];
    for (const capability of required) {
      if (!availableAdapters[capability]) {
        missing.push(capability);
      }
    }
    return missing;
  }

  /**
   * Obtiene los adapters necesarios para un módulo
   */
  private getAdaptersForModule(required: string[], availableAdapters: AdapterMap): AdapterMap {
    const adapters: AdapterMap = {};
    for (const capability of required) {
      if (availableAdapters[capability]) {
        adapters[capability] = availableAdapters[capability];
      }
    }
    return adapters;
  }
}
