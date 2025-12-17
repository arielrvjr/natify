import { ModuleDefinition, RegisteredModule, AdapterMap, ScreenDefinition } from './types';
import { DIContainer } from '../di/Container';
import { NativefyError, NativefyErrorCode } from '../errors';
import { Port } from '../ports/Port';

/**
 * Registry central de módulos
 *
 * Maneja el registro, validación y resolución de módulos
 * junto con sus dependencias.
 * Ahora obtiene los adapters directamente del contenedor DI.
 */
export class ModuleRegistry {
  private modules = new Map<string, RegisteredModule>();

  constructor(private diContainer: DIContainer) {}

  /**
   * Obtiene los adapters disponibles del contenedor DI
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
   * Registra un módulo
   */
  async register(module: ModuleDefinition): Promise<RegisteredModule> {
    // Obtener adapters disponibles del contenedor DI
    const availableAdapters = this.getAvailableAdapters();

    // Validar que las capacidades requeridas estén disponibles
    // Convertir a string[] ya que todas las keys de CapabilityPortMap son strings
    const requiredCapabilities = module.requires as string[];
    const missingCapabilities = this.validateCapabilities(requiredCapabilities, availableAdapters);
    if (missingCapabilities.length > 0) {
      throw new NativefyError(
        NativefyErrorCode.VALIDATION_ERROR,
        `Module "${module.id}" requires missing capabilities: ${missingCapabilities.join(', ')}`,
        undefined,
        { moduleId: module.id, missing: missingCapabilities },
      );
    }

    // Validar que el módulo tenga al menos una pantalla o un UseCase (módulos compartidos)
    if (module.screens.length === 0 && module.useCases.length === 0) {
      throw new NativefyError(
        NativefyErrorCode.VALIDATION_ERROR,
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

    this.modules.set(module.id, registeredModule);

    // Ejecutar inicialización si existe
    if (module.onInit) {
      await module.onInit(moduleAdapters);
    }

    registeredModule.isLoaded = true;

    return registeredModule;
  }

  /**
   * Desregistra un módulo
   */
  async unregister(moduleId: string): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) return;

    // Ejecutar cleanup
    if (module.onDestroy) {
      await module.onDestroy();
    }

    // Remover UseCases del DI Container
    for (const useCase of module.useCases) {
      const useCaseKey = `${moduleId}:${useCase.key}`;
      this.diContainer.remove(useCaseKey);
    }

    this.modules.delete(moduleId);
  }

  /**
   * Obtiene un módulo registrado
   */
  getModule(moduleId: string): RegisteredModule | undefined {
    return this.modules.get(moduleId);
  }

  /**
   * Obtiene todos los módulos registrados
   */
  getAllModules(): RegisteredModule[] {
    return Array.from(this.modules.values());
  }

  /**
   * Obtiene todas las pantallas de todos los módulos
   */
  getAllScreens(): Array<{ moduleId: string; screen: ScreenDefinition }> {
    const screens: Array<{ moduleId: string; screen: ScreenDefinition }> = [];

    for (const [moduleId, module] of this.modules) {
      for (const screen of module.screens) {
        screens.push({ moduleId, screen });
      }
    }

    return screens;
  }

  /**
   * Verifica si un módulo está registrado
   */
  hasModule(moduleId: string): boolean {
    return this.modules.has(moduleId);
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
