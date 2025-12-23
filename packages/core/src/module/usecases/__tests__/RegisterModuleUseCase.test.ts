import { RegisterModuleUseCase } from '../RegisterModuleUseCase';
import { DIContainer } from '../../../di/Container';
import { createModule } from '../../createModule';
import { NativefyError } from '../../../errors';
import { Port } from '../../../ports/Port';

// Mock adapters
const createMockAdapter = (capability: string): Port => ({
  capability,
});

describe('RegisterModuleUseCase', () => {
  let useCase: RegisterModuleUseCase;
  let diContainer: DIContainer;

  beforeEach(() => {
    diContainer = new DIContainer();
    useCase = new RegisterModuleUseCase(diContainer);
  });

  describe('execute', () => {
    it('should register a module successfully', async () => {
      const httpAdapter = createMockAdapter('http');
      diContainer.instance('adapter:http', httpAdapter);
      diContainer.instance('adapter:httpclient', httpAdapter);

      const module = createModule('test', 'Test Module')
        .requires('http')
        .screen({ name: 'Home', component: () => null })
        .build();

      const registered = await useCase.execute(module);

      expect(registered.id).toBe('test');
      expect(registered.isLoaded).toBe(true);
      expect(diContainer.has('module:test')).toBe(true);
    });

    it('should throw error if required capability is missing', async () => {
      const module = createModule('test', 'Test Module')
        .requires('http', 'storage')
        .screen({ name: 'Home', component: () => null })
        .build();

      await expect(useCase.execute(module)).rejects.toThrow(NativefyError);
      await expect(useCase.execute(module)).rejects.toThrow('requires missing capabilities');
    });

    it('should register useCases in DI container', async () => {
      const httpAdapter = createMockAdapter('http');
      diContainer.instance('adapter:http', httpAdapter);
      diContainer.instance('adapter:httpclient', httpAdapter);

      const useCaseFactory = jest.fn(() => ({ execute: jest.fn() }));
      const module = createModule('test', 'Test Module')
        .requires('http')
        .screen({ name: 'Home', component: () => null })
        .useCase('getData', useCaseFactory)
        .build();

      await useCase.execute(module);

      const registeredUseCase = diContainer.resolve(`${module.id}:getData`);
      expect(registeredUseCase).toBeDefined();
    });

    it('should execute onInit when registering', async () => {
      const httpAdapter = createMockAdapter('http');
      diContainer.instance('adapter:http', httpAdapter);
      diContainer.instance('adapter:httpclient', httpAdapter);

      const onInit = jest.fn();
      const module = createModule('test', 'Test Module')
        .requires('http')
        .screen({ name: 'Home', component: () => null })
        .onInit(onInit)
        .build();

      await useCase.execute(module);

      expect(onInit).toHaveBeenCalled();
      expect(onInit).toHaveBeenCalledWith(expect.objectContaining({ http: httpAdapter }));
    });

    it('should throw error if module has no screens and no useCases', async () => {
      const httpAdapter = createMockAdapter('http');
      diContainer.instance('adapter:http', httpAdapter);
      diContainer.instance('adapter:httpclient', httpAdapter);

      // Crear un módulo sin screens ni useCases manualmente para testear la validación
      const module = {
        id: 'test',
        name: 'Test Module',
        requires: ['http'] as any,
        screens: [],
        useCases: [],
      };

      await expect(useCase.execute(module as any)).rejects.toThrow(
        'Module "test" must have at least one screen or one UseCase',
      );
    });

    it('should allow module with only useCases (shared module)', async () => {
      const httpAdapter = createMockAdapter('http');
      diContainer.instance('adapter:http', httpAdapter);
      diContainer.instance('adapter:httpclient', httpAdapter);

      const module = createModule('test', 'Test Module')
        .requires('http')
        .useCase('getData', jest.fn())
        .build();

      const registered = await useCase.execute(module);

      expect(registered.screens).toHaveLength(0);
      expect(registered.useCases).toHaveLength(1);
    });

    it('should throw error if module is already registered', async () => {
      const httpAdapter = createMockAdapter('http');
      diContainer.instance('adapter:http', httpAdapter);
      diContainer.instance('adapter:httpclient', httpAdapter);

      const module = createModule('test', 'Test Module')
        .requires('http')
        .screen({ name: 'Home', component: () => null })
        .build();

      await useCase.execute(module);

      await expect(useCase.execute(module)).rejects.toThrow('is already registered');
    });
  });
});
