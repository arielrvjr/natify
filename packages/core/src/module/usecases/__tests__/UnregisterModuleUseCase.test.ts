import { UnregisterModuleUseCase } from '../UnregisterModuleUseCase';
import { RegisterModuleUseCase } from '../RegisterModuleUseCase';
import { DIContainer } from '../../../di/Container';
import { createModule } from '../../createModule';
import { Port } from '../../../ports/Port';

// Mock adapters
const createMockAdapter = (capability: string): Port => ({
  capability,
});

describe('UnregisterModuleUseCase', () => {
  let useCase: UnregisterModuleUseCase;
  let registerUseCase: RegisterModuleUseCase;
  let diContainer: DIContainer;

  beforeEach(() => {
    diContainer = new DIContainer();
    useCase = new UnregisterModuleUseCase(diContainer);
    registerUseCase = new RegisterModuleUseCase(diContainer);
  });

  describe('execute', () => {
    it('should unregister a module', async () => {
      const httpAdapter = createMockAdapter('http');
      diContainer.instance('adapter:http', httpAdapter);
      diContainer.instance('adapter:httpclient', httpAdapter);

      const module = createModule('test', 'Test Module')
        .requires('http')
        .screen({ name: 'Home', component: () => null })
        .useCase('getData', jest.fn())
        .build();

      await registerUseCase.execute(module);
      expect(diContainer.has('module:test')).toBe(true);

      await useCase.execute('test');

      expect(diContainer.has('module:test')).toBe(false);
    });

    it('should execute onDestroy when unregistering', async () => {
      const httpAdapter = createMockAdapter('http');
      diContainer.instance('adapter:http', httpAdapter);
      diContainer.instance('adapter:httpclient', httpAdapter);

      const onDestroy = jest.fn();
      const module = createModule('test', 'Test Module')
        .requires('http')
        .screen({ name: 'Home', component: () => null })
        .onDestroy(onDestroy)
        .build();

      await registerUseCase.execute(module);
      await useCase.execute('test');

      expect(onDestroy).toHaveBeenCalled();
    });

    it('should remove useCases from DI container when unregistering', async () => {
      const httpAdapter = createMockAdapter('http');
      diContainer.instance('adapter:http', httpAdapter);
      diContainer.instance('adapter:httpclient', httpAdapter);

      const module = createModule('test', 'Test Module')
        .requires('http')
        .screen({ name: 'Home', component: () => null })
        .useCase('getData', jest.fn())
        .build();

      await registerUseCase.execute(module);
      expect(diContainer.has(`${module.id}:getData`)).toBe(true);

      await useCase.execute('test');

      expect(diContainer.has(`${module.id}:getData`)).toBe(false);
    });

    it('should not throw error if module does not exist', async () => {
      await expect(useCase.execute('non-existent')).resolves.not.toThrow();
    });
  });
});
