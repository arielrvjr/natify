import { ModuleRegistry } from '../src/module/ModuleRegistry';
import { DIContainer } from '../src/di/Container';
import { createModule } from '../src/module/createModule';
import { NativefyError, NativefyErrorCode } from '../src/errors';
import { Port } from '../src/ports/Port';

// Mock adapters
const createMockAdapter = (capability: string): Port => ({
  capability,
});

describe('ModuleRegistry', () => {
  let registry: ModuleRegistry;
  let diContainer: DIContainer;

  beforeEach(() => {
    diContainer = new DIContainer();
    registry = new ModuleRegistry(diContainer);
  });

  describe('register', () => {
    it('should register a module successfully', async () => {
      const httpAdapter = createMockAdapter('http');
      diContainer.instance('adapter:http', httpAdapter);

      const module = createModule('test', 'Test Module')
        .requires('http')
        .screen({ name: 'Home', component: () => null })
        .build();

      const registered = await registry.register(module);

      expect(registered.id).toBe('test');
      expect(registered.isLoaded).toBe(true);
      expect(registry.hasModule('test')).toBe(true);
    });

    it('should throw error if required capability is missing', async () => {
      const module = createModule('test', 'Test Module')
        .requires('http', 'storage')
        .screen({ name: 'Home', component: () => null })
        .build();

      await expect(registry.register(module)).rejects.toThrow(NativefyError);
      await expect(registry.register(module)).rejects.toThrow('requires missing capabilities');
    });

    it('should register useCases in DI container', async () => {
      const httpAdapter = createMockAdapter('http');
      diContainer.instance('adapter:http', httpAdapter);

      const useCaseFactory = jest.fn(() => ({ execute: jest.fn() }));
      const module = createModule('test', 'Test Module')
        .requires('http')
        .screen({ name: 'Home', component: () => null })
        .useCase('getData', useCaseFactory)
        .build();

      await registry.register(module);

      const useCase = diContainer.resolve(`${module.id}:getData`);
      expect(useCase).toBeDefined();
    });

    it('should execute onInit when registering', async () => {
      const httpAdapter = createMockAdapter('http');
      diContainer.instance('adapter:http', httpAdapter);

      const onInit = jest.fn();
      const module = createModule('test', 'Test Module')
        .requires('http')
        .screen({ name: 'Home', component: () => null })
        .onInit(onInit)
        .build();

      await registry.register(module);

      expect(onInit).toHaveBeenCalled();
      expect(onInit).toHaveBeenCalledWith(expect.objectContaining({ http: httpAdapter }));
    });

    it('should throw error if module has no screens and no useCases', async () => {
      const httpAdapter = createMockAdapter('http');
      diContainer.instance('adapter:http', httpAdapter);

      // Crear un módulo sin screens ni useCases manualmente para testear la validación
      const module = {
        id: 'test',
        name: 'Test Module',
        requires: ['http'] as any,
        screens: [],
        useCases: [],
      };

      await expect(registry.register(module as any)).rejects.toThrow(
        'Module "test" must have at least one screen or one UseCase',
      );
    });

    it('should allow module with only useCases (shared module)', async () => {
      const httpAdapter = createMockAdapter('http');
      diContainer.instance('adapter:http', httpAdapter);

      const module = createModule('test', 'Test Module')
        .requires('http')
        .useCase('getData', jest.fn())
        .build();

      const registered = await registry.register(module);

      expect(registered.screens).toHaveLength(0);
      expect(registered.useCases).toHaveLength(1);
    });
  });

  describe('unregister', () => {
    it('should unregister a module', async () => {
      const httpAdapter = createMockAdapter('http');
      diContainer.instance('adapter:http', httpAdapter);

      const module = createModule('test', 'Test Module')
        .requires('http')
        .screen({ name: 'Home', component: () => null })
        .useCase('getData', jest.fn())
        .build();

      await registry.register(module);
      expect(registry.hasModule('test')).toBe(true);

      await registry.unregister('test');

      expect(registry.hasModule('test')).toBe(false);
    });

    it('should execute onDestroy when unregistering', async () => {
      const httpAdapter = createMockAdapter('http');
      diContainer.instance('adapter:http', httpAdapter);

      const onDestroy = jest.fn();
      const module = createModule('test', 'Test Module')
        .requires('http')
        .screen({ name: 'Home', component: () => null })
        .onDestroy(onDestroy)
        .build();

      await registry.register(module);
      await registry.unregister('test');

      expect(onDestroy).toHaveBeenCalled();
    });

    it('should remove useCases from DI container when unregistering', async () => {
      const httpAdapter = createMockAdapter('http');
      diContainer.instance('adapter:http', httpAdapter);

      const module = createModule('test', 'Test Module')
        .requires('http')
        .screen({ name: 'Home', component: () => null })
        .useCase('getData', jest.fn())
        .build();

      await registry.register(module);
      expect(diContainer.has(`${module.id}:getData`)).toBe(true);

      await registry.unregister('test');

      expect(diContainer.has(`${module.id}:getData`)).toBe(false);
    });

    it('should not throw error if module does not exist', async () => {
      await expect(registry.unregister('non-existent')).resolves.not.toThrow();
    });
  });

  describe('getModule', () => {
    it('should return registered module', async () => {
      const httpAdapter = createMockAdapter('http');
      diContainer.instance('adapter:http', httpAdapter);

      const module = createModule('test', 'Test Module')
        .requires('http')
        .screen({ name: 'Home', component: () => null })
        .build();

      await registry.register(module);
      const retrieved = registry.getModule('test');

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe('test');
    });

    it('should return undefined if module not registered', () => {
      const retrieved = registry.getModule('non-existent');

      expect(retrieved).toBeUndefined();
    });
  });

  describe('getAllModules', () => {
    it('should return all registered modules', async () => {
      const httpAdapter = createMockAdapter('http');
      diContainer.instance('adapter:http', httpAdapter);

      const module1 = createModule('test1', 'Test Module 1')
        .requires('http')
        .screen({ name: 'Home', component: () => null })
        .build();

      const module2 = createModule('test2', 'Test Module 2')
        .requires('http')
        .screen({ name: 'Home', component: () => null })
        .build();

      await registry.register(module1);
      await registry.register(module2);

      const allModules = registry.getAllModules();

      expect(allModules).toHaveLength(2);
      expect(allModules.map(m => m.id)).toContain('test1');
      expect(allModules.map(m => m.id)).toContain('test2');
    });

    it('should return empty array if no modules registered', () => {
      const allModules = registry.getAllModules();

      expect(allModules).toEqual([]);
    });
  });

  describe('getAllScreens', () => {
    it('should return all screens from all modules', async () => {
      const httpAdapter = createMockAdapter('http');
      diContainer.instance('adapter:http', httpAdapter);

      const module1 = createModule('test1', 'Test Module 1')
        .requires('http')
        .screen({ name: 'Home', component: () => null })
        .build();

      const module2 = createModule('test2', 'Test Module 2')
        .requires('http')
        .screen({ name: 'Profile', component: () => null })
        .screen({ name: 'Settings', component: () => null })
        .build();

      await registry.register(module1);
      await registry.register(module2);

      const screens = registry.getAllScreens();

      expect(screens).toHaveLength(3);
      expect(screens.find(s => s.moduleId === 'test1' && s.screen.name === 'Home')).toBeDefined();
      expect(screens.find(s => s.moduleId === 'test2' && s.screen.name === 'Profile')).toBeDefined();
      expect(screens.find(s => s.moduleId === 'test2' && s.screen.name === 'Settings')).toBeDefined();
    });
  });

  describe('hasModule', () => {
    it('should return true if module is registered', async () => {
      const httpAdapter = createMockAdapter('http');
      diContainer.instance('adapter:http', httpAdapter);

      const module = createModule('test', 'Test Module')
        .requires('http')
        .screen({ name: 'Home', component: () => null })
        .build();

      await registry.register(module);

      expect(registry.hasModule('test')).toBe(true);
    });

    it('should return false if module is not registered', () => {
      expect(registry.hasModule('non-existent')).toBe(false);
    });
  });
});

