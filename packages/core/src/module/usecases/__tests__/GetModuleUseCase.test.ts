import { GetModuleUseCase } from '../GetModuleUseCase';
import { RegisterModuleUseCase } from '../RegisterModuleUseCase';
import { DIContainer } from '../../../di/Container';
import { createModule } from '../../createModule';
import { Port } from '../../../ports/Port';

// Mock adapters
const createMockAdapter = (capability: string): Port => ({
  capability,
});

describe('GetModuleUseCase', () => {
  let useCase: GetModuleUseCase;
  let registerUseCase: RegisterModuleUseCase;
  let diContainer: DIContainer;

  beforeEach(() => {
    diContainer = new DIContainer();
    useCase = new GetModuleUseCase(diContainer);
    registerUseCase = new RegisterModuleUseCase(diContainer);
  });

  describe('execute', () => {
    it('should return registered module', async () => {
      const httpAdapter = createMockAdapter('http');
      diContainer.instance('adapter:http', httpAdapter);
      diContainer.instance('adapter:httpclient', httpAdapter);

      const module = createModule('test', 'Test Module')
        .requires('http')
        .screen({ name: 'Home', component: () => null })
        .build();

      await registerUseCase.execute(module);
      const retrieved = useCase.execute('test');

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe('test');
    });

    it('should return undefined if module not registered', () => {
      const retrieved = useCase.execute('non-existent');

      expect(retrieved).toBeUndefined();
    });
  });

  describe('executeAll', () => {
    it('should return all registered modules', async () => {
      const httpAdapter = createMockAdapter('http');
      diContainer.instance('adapter:http', httpAdapter);
      diContainer.instance('adapter:httpclient', httpAdapter);

      const module1 = createModule('test1', 'Test Module 1')
        .requires('http')
        .screen({ name: 'Home', component: () => null })
        .build();

      const module2 = createModule('test2', 'Test Module 2')
        .requires('http')
        .screen({ name: 'Home', component: () => null })
        .build();

      await registerUseCase.execute(module1);
      await registerUseCase.execute(module2);

      const allModules = useCase.executeAll();

      expect(allModules).toHaveLength(2);
      expect(allModules.map(m => m.id)).toContain('test1');
      expect(allModules.map(m => m.id)).toContain('test2');
    });

    it('should return empty array if no modules registered', () => {
      const allModules = useCase.executeAll();

      expect(allModules).toEqual([]);
    });
  });
});
