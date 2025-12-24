import { createModule } from '../createModule';

// Mock component
const MockScreen = () => null;

describe('createModule', () => {
  describe('basic module creation', () => {
    it('should create module with id and name', () => {
      const module = createModule('test', 'Test Module')
        .screen({ name: 'Home', component: MockScreen })
        .build();

      expect(module.id).toBe('test');
      expect(module.name).toBe('Test Module');
      expect(module.requires).toEqual([]);
      expect(module.screens).toHaveLength(1);
      expect(module.useCases).toEqual([]);
    });

    it('should throw error if id is empty', () => {
      expect(() => {
        createModule('', 'Test Module').build();
      }).toThrow('Module must have an id');
    });
  });

  describe('requires', () => {
    it('should add required capabilities', () => {
      const module = createModule('test', 'Test Module')
        .requires('http', 'storage')
        .screen({ name: 'Home', component: MockScreen })
        .build();

      expect(module.requires).toContain('http');
      expect(module.requires).toContain('storage');
    });

    it('should allow chaining requires', () => {
      const module = createModule('test', 'Test Module')
        .requires('http')
        .requires('storage', 'navigation')
        .screen({ name: 'Home', component: MockScreen })
        .build();

      expect(module.requires).toContain('http');
      expect(module.requires).toContain('storage');
      expect(module.requires).toContain('navigation');
    });
  });

  describe('screen', () => {
    it('should add screen to module', () => {
      const module = createModule('test', 'Test Module')
        .screen({ name: 'Home', component: MockScreen })
        .build();

      expect(module.screens).toHaveLength(1);
      expect(module.screens[0].name).toBe('Home');
      expect(module.screens[0].component).toBe(MockScreen);
    });

    it('should set first screen as initialRoute automatically', () => {
      const module = createModule('test', 'Test Module')
        .screen({ name: 'Home', component: MockScreen })
        .build();

      expect(module.initialRoute).toBe('Home');
    });

    it('should allow multiple screens', () => {
      const module = createModule('test', 'Test Module')
        .screen({ name: 'Home', component: MockScreen })
        .screen({ name: 'Profile', component: MockScreen })
        .build();

      expect(module.screens).toHaveLength(2);
    });
  });

  describe('useCase', () => {
    it('should add useCase to module', () => {
      const useCaseFactory = jest.fn(() => ({}));
      const module = createModule('test', 'Test Module')
        .requires('http')
        .useCase('getData', useCaseFactory)
        .build();

      expect(module.useCases).toHaveLength(1);
      expect(module.useCases[0].key).toBe('getData');
      expect(module.useCases[0].factory).toBe(useCaseFactory);
    });

    it('should allow multiple useCases', () => {
      const module = createModule('test', 'Test Module')
        .requires('http')
        .useCase('getData', jest.fn())
        .useCase('saveData', jest.fn())
        .build();

      expect(module.useCases).toHaveLength(2);
    });
  });

  describe('initialRoute', () => {
    it('should set initialRoute explicitly', () => {
      const module = createModule('test', 'Test Module')
        .screen({ name: 'Home', component: MockScreen })
        .screen({ name: 'Profile', component: MockScreen })
        .initialRoute('Profile')
        .build();

      expect(module.initialRoute).toBe('Profile');
    });

    it('should override auto-set initialRoute', () => {
      const module = createModule('test', 'Test Module')
        .screen({ name: 'Home', component: MockScreen })
        .screen({ name: 'Profile', component: MockScreen })
        .initialRoute('Profile')
        .build();

      expect(module.initialRoute).toBe('Profile');
    });
  });

  describe('onInit', () => {
    it('should set onInit function', () => {
      const onInitFn = jest.fn();
      const module = createModule('test', 'Test Module')
        .requires('http')
        .screen({ name: 'Home', component: MockScreen })
        .onInit(onInitFn)
        .build();

      expect(module.onInit).toBe(onInitFn);
    });
  });

  describe('onDestroy', () => {
    it('should set onDestroy function', () => {
      const onDestroyFn = jest.fn();
      const module = createModule('test', 'Test Module')
        .screen({ name: 'Home', component: MockScreen })
        .onDestroy(onDestroyFn)
        .build();

      expect(module.onDestroy).toBe(onDestroyFn);
    });
  });

  describe('build validation', () => {
    it('should throw error if module has no screens and no useCases', () => {
      expect(() => {
        createModule('test', 'Test Module').build();
      }).toThrow('Module "test" must have at least one screen or one UseCase');
    });

    it('should allow module with only useCases (shared module)', () => {
      const module = createModule('test', 'Test Module')
        .requires('http')
        .useCase('getData', jest.fn())
        .build();

      expect(module.screens).toHaveLength(0);
      expect(module.useCases).toHaveLength(1);
      expect(module.initialRoute).toBeUndefined();
    });

    it('should throw error if initialRoute does not match any screen', () => {
      expect(() => {
        createModule('test', 'Test Module')
          .screen({ name: 'Home', component: MockScreen })
          .initialRoute('NonExistent')
          .build();
      }).toThrow('Module "test": initialRoute "NonExistent" does not match any screen');
    });

    it('should set first screen as initialRoute if not specified', () => {
      const module = createModule('test', 'Test Module')
        .screen({ name: 'Home', component: MockScreen })
        .screen({ name: 'Profile', component: MockScreen })
        .build();

      expect(module.initialRoute).toBe('Home');
    });
  });

  describe('builder chaining', () => {
    it('should allow fluent API', () => {
      const module = createModule('test', 'Test Module')
        .requires('http', 'storage')
        .screen({ name: 'Home', component: MockScreen })
        .useCase('getData', jest.fn())
        .initialRoute('Home')
        .onInit(jest.fn())
        .onDestroy(jest.fn())
        .build();

      expect(module.id).toBe('test');
      expect(module.requires).toHaveLength(2);
      expect(module.screens).toHaveLength(1);
      expect(module.useCases).toHaveLength(1);
      expect(module.initialRoute).toBe('Home');
      expect(module.onInit).toBeDefined();
      expect(module.onDestroy).toBeDefined();
    });
  });
});
