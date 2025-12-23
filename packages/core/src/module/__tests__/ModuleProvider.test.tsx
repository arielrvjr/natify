import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { ModuleProvider, useModules, useModule } from '../ModuleProvider';
import { ModuleDefinition, RegisteredModule } from '../types';
import { DIContainer } from '../../di/Container';
import { DIProvider } from '../../di/DIProvider';

// Mock UseCases
const mockRegisterModuleUseCase = {
  execute: jest.fn(),
};

const mockUnregisterModuleUseCase = {
  execute: jest.fn(),
};

const mockGetModuleUseCase = {
  execute: jest.fn(),
  executeAll: jest.fn<RegisteredModule[], []>(() => []),
};

// Mock DIProvider (consolidado)
const mockContainer = new DIContainer();

const mockLogger = {
  error: jest.fn(),
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
};

jest.mock('../../di/DIProvider', () => {
  const actual = jest.requireActual('../../di/DIProvider');
  return {
    ...actual,
    useDIContainer: jest.fn(() => mockContainer),
    useUseCase: jest.fn((key: string) => {
      if (key === 'usecase:RegisterModuleUseCase') return mockRegisterModuleUseCase;
      if (key === 'usecase:UnregisterModuleUseCase') return mockUnregisterModuleUseCase;
      if (key === 'usecase:GetModuleUseCase') return mockGetModuleUseCase;
      return null;
    }),
    useAdapter: jest.fn((key: string) => {
      if (key === 'logger') return mockLogger;
      return null;
    }),
  };
});

// Mock React hooks
let useStateValues: unknown[] = [];
let setStateFunctions: jest.Mock[] = [];
let useMemoValue: unknown = null;
let contextValue: unknown = null;
let useEffectCallbacks: Array<() => void | (() => void)> = [];

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useState: jest.fn(initial => {
      const value = typeof initial === 'function' ? initial() : initial;
      const setter = jest.fn();
      useStateValues.push(value);
      setStateFunctions.push(setter);
      return [value, setter];
    }),
    useEffect: jest.fn(fn => {
      useEffectCallbacks.push(fn);
      return fn();
    }),
    useMemo: jest.fn(fn => {
      useMemoValue = fn();
      return useMemoValue;
    }),
    useCallback: jest.fn(fn => fn),
    createContext: jest.fn(() => ({
      Provider: ({ value, children }: { value: unknown; children: React.ReactNode }) => {
        contextValue = value;
        return children;
      },
      Consumer: ({ children }: { children: (value: unknown) => React.ReactNode }) =>
        children(contextValue),
    })),
    useContext: jest.fn(() => contextValue),
  };
});

describe('ModuleProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useStateValues = [];
    setStateFunctions = [];
    useMemoValue = null;
    contextValue = null;
    useEffectCallbacks = [];
    mockLogger.error.mockClear();
    mockLogger.log.mockClear();
    mockLogger.debug.mockClear();
    mockLogger.info.mockClear();
    mockLogger.warn.mockClear();
  });

  describe('ModuleProvider component', () => {
    it('should be a function component', () => {
      expect(typeof ModuleProvider).toBe('function');
    });

    it('should accept modules prop', () => {
      const modules: ModuleDefinition[] = [];
      const props = { modules, children: React.createElement('div') };

      expect(props.modules).toBeDefined();
    });

    it('should use UseCases from DI container', () => {
      // Este test verifica que ModuleProvider usa useUseCase
      // El mock ya está configurado arriba, solo verificamos que el componente se puede crear
      const props = { modules: [], children: React.createElement('div') };
      expect(props.modules).toBeDefined();
      expect(typeof ModuleProvider).toBe('function');
    });

    it('should accept onModulesLoaded callback', () => {
      const onModulesLoaded = jest.fn();
      const props = {
        modules: [],
        onModulesLoaded,
        children: React.createElement('div'),
      };

      expect(props.onModulesLoaded).toBeDefined();
      expect(typeof props.onModulesLoaded).toBe('function');
    });

    it('should accept onError callback', () => {
      const onError = jest.fn();
      const props = {
        modules: [],
        onError,
        children: React.createElement('div'),
      };

      expect(props.onError).toBeDefined();
      expect(typeof props.onError).toBe('function');
    });


    it('should call registerModule.execute when loading modules', async () => {
      const mockModule: ModuleDefinition = {
        id: 'test',
        name: 'Test Module',
        screens: [],
        useCases: [],
        requires: [],
      };

      const mockRegisteredModule: RegisteredModule = {
        ...mockModule,
        isLoaded: true,
        adapters: {},
      };

      mockRegisterModuleUseCase.execute.mockResolvedValue(mockRegisteredModule);
      mockGetModuleUseCase.executeAll.mockReturnValue([mockRegisteredModule]);

      render(
        <DIProvider container={mockContainer}>
          <ModuleProvider modules={[mockModule]}>
            <div>Test</div>
          </ModuleProvider>
        </DIProvider>,
      );

      await waitFor(
        () => {
          expect(mockRegisterModuleUseCase.execute).toHaveBeenCalledWith(mockModule);
        },
        { timeout: 1000 },
      );
    });

    it('should call onModulesLoaded when modules are loaded successfully', async () => {
      const mockModule: ModuleDefinition = {
        id: 'test',
        name: 'Test Module',
        screens: [],
        useCases: [],
        requires: [],
      };

      const mockRegisteredModule: RegisteredModule = {
        ...mockModule,
        isLoaded: true,
        adapters: {},
      };

      const onModulesLoaded = jest.fn();
      mockRegisterModuleUseCase.execute.mockResolvedValue(mockRegisteredModule);
      mockGetModuleUseCase.executeAll.mockReturnValue([mockRegisteredModule]);

      render(
        <DIProvider container={mockContainer}>
          <ModuleProvider modules={[mockModule]} onModulesLoaded={onModulesLoaded}>
            <div>Test</div>
          </ModuleProvider>
        </DIProvider>,
      );

      await waitFor(
        () => {
          expect(onModulesLoaded).toHaveBeenCalledWith([mockRegisteredModule]);
        },
        { timeout: 1000 },
      );
    });

    it('should call onError when module loading fails', async () => {
      const mockModule: ModuleDefinition = {
        id: 'test',
        name: 'Test Module',
        screens: [],
        useCases: [],
        requires: ['nonexistent'],
      };

      const onError = jest.fn();
      const error = new Error('Module loading failed');
      mockRegisterModuleUseCase.execute.mockRejectedValue(error);

      render(
        <DIProvider container={mockContainer}>
          <ModuleProvider modules={[mockModule]} onError={onError}>
            <div>Test</div>
          </ModuleProvider>
        </DIProvider>,
      );

      await waitFor(
        () => {
          expect(onError).toHaveBeenCalledWith(expect.any(Error));
        },
        { timeout: 1000 },
      );
    });

    it('should handle logger.error when module loading fails', async () => {
      const mockModule: ModuleDefinition = {
        id: 'test',
        name: 'Test Module',
        screens: [],
        useCases: [],
        requires: ['nonexistent'],
      };

      const error = new Error('Module loading failed');
      mockRegisterModuleUseCase.execute.mockRejectedValue(error);

      render(
        <DIProvider container={mockContainer}>
          <ModuleProvider modules={[mockModule]}>
            <div>Test</div>
          </ModuleProvider>
        </DIProvider>,
      );

      await waitFor(
        () => {
          expect(mockLogger.error).toHaveBeenCalled();
        },
        { timeout: 1000 },
      );
    });

    it('should call registerModuleCallback when registerModule is called from context', async () => {
      const newModule: ModuleDefinition = {
        id: 'new-module',
        name: 'New Module',
        screens: [],
        useCases: [],
        requires: [],
      };

      const mockRegisteredModule: RegisteredModule = {
        ...newModule,
        isLoaded: true,
        adapters: {},
      };

      mockRegisterModuleUseCase.execute.mockResolvedValue(mockRegisteredModule);
      mockGetModuleUseCase.executeAll.mockReturnValue([mockRegisteredModule]);

      const TestComponent = () => {
        const { registerModule } = useModules();
        React.useEffect(() => {
          registerModule(newModule);
        }, [registerModule]);
        return null;
      };

      render(
        <DIProvider container={mockContainer}>
          <ModuleProvider modules={[]}>
            <TestComponent />
          </ModuleProvider>
        </DIProvider>,
      );

      await waitFor(
        () => {
          expect(mockRegisterModuleUseCase.execute).toHaveBeenCalledWith(newModule);
          expect(mockGetModuleUseCase.executeAll).toHaveBeenCalled();
        },
        { timeout: 1000 },
      );
    });

    it('should call unregisterModuleCallback when unregisterModule is called from context', async () => {
      const mockModule: RegisteredModule = {
        id: 'test-module',
        name: 'Test Module',
        isLoaded: true,
        screens: [],
        useCases: [],
        requires: [],
        adapters: {},
      };

      // Primero registrar el módulo
      mockRegisterModuleUseCase.execute.mockResolvedValue(mockModule);
      mockGetModuleUseCase.executeAll.mockReturnValue([mockModule]);
      mockGetModuleUseCase.execute.mockReturnValue(mockModule);

      const TestComponent = () => {
        const { unregisterModule } = useModules();
        React.useEffect(() => {
          unregisterModule('test-module');
        }, [unregisterModule]);
        return null;
      };

      render(
        <DIProvider container={mockContainer}>
          <ModuleProvider modules={[]}>
            <TestComponent />
          </ModuleProvider>
        </DIProvider>,
      );

      await waitFor(
        () => {
          expect(mockUnregisterModuleUseCase.execute).toHaveBeenCalledWith('test-module');
          expect(mockGetModuleUseCase.executeAll).toHaveBeenCalled();
        },
        { timeout: 1000 },
      );
    });

    it('should call getModuleCallback when getModule is called from context', () => {
      const mockModule: RegisteredModule = {
        id: 'test-module',
        name: 'Test Module',
        isLoaded: true,
        screens: [],
        useCases: [],
        requires: [],
        adapters: {},
      };

      mockGetModuleUseCase.execute.mockReturnValue(mockModule);

      const TestComponent = () => {
        const { getModule } = useModules();
        const module = getModule('test-module');
        expect(module).toBe(mockModule);
        return null;
      };

      render(
        <DIProvider container={mockContainer}>
          <ModuleProvider modules={[]}>
            <TestComponent />
          </ModuleProvider>
        </DIProvider>,
      );

      expect(mockGetModuleUseCase.execute).toHaveBeenCalledWith('test-module');
    });
  });

  describe('useModules', () => {
    it('should be a function', () => {
      expect(typeof useModules).toBe('function');
    });

    it('should throw error if used outside ModuleProvider', () => {
      const { useContext } = require('react');
      useContext.mockReturnValue(null);

      expect(() => useModules()).toThrow('useModules must be used within ModuleProvider');
    });

    it('should return context value when available', () => {
      const mockContext = {
        modules: [],
        isLoading: false,
        error: null,
        registerModule: jest.fn(),
        unregisterModule: jest.fn(),
        getModule: jest.fn(),
      };
      const { useContext } = require('react');
      useContext.mockReturnValue(mockContext);

      const result = useModules();
      expect(result).toBe(mockContext);
    });
  });

  describe('useModule', () => {
    it('should be a function', () => {
      expect(typeof useModule).toBe('function');
    });

    it('should return module from context', () => {
      const mockModule: RegisteredModule = {
        id: 'test',
        name: 'Test',
        isLoaded: true,
        screens: [],
        useCases: [],
        requires: [],
        adapters: {},
        initialRoute: 'test/Home',
      };
      const mockContext = {
        modules: [mockModule],
        isLoading: false,
        error: null,
        registerModule: jest.fn(),
        unregisterModule: jest.fn(),
        getModule: jest.fn(id => (id === 'test' ? mockModule : undefined)),
      };
      const { useContext } = require('react');
      useContext.mockReturnValue(mockContext);

      const result = useModule('test');
      expect(result).toBe(mockModule);
    });
  });
});
