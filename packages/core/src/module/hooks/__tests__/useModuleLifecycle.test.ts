import { useModuleLifecycle } from '../useModuleLifecycle';
import { useModules } from '../../ModuleProvider';
import { RegisteredModule } from '../../types';

// Mock useModules
const mockModules: RegisteredModule[] = [];

jest.mock('../../ModuleProvider', () => ({
  useModules: jest.fn(),
}));

// Mock React hooks
let wasLoadedState = false;
const setWasLoadedFunction = jest.fn(value => {
  wasLoadedState = typeof value === 'function' ? value(wasLoadedState) : value;
  return wasLoadedState;
});

let useEffectCallback: (() => void) | null = null;

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useState: jest.fn(_initial => [wasLoadedState, setWasLoadedFunction]),
    useEffect: jest.fn(fn => {
      useEffectCallback = fn;
      fn();
    }),
  };
});

describe('useModuleLifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockModules.length = 0;
    wasLoadedState = false;
    setWasLoadedFunction.mockClear();
    useEffectCallback = null;
    (useModules as jest.Mock).mockReturnValue({
      modules: mockModules,
    });
  });

  it('should be a function', () => {
    expect(typeof useModuleLifecycle).toBe('function');
  });

  it('should accept moduleId and callbacks without throwing', () => {
    const callbacks = {
      onLoad: jest.fn(),
      onUnload: jest.fn(),
    };

    expect(() => {
      useModuleLifecycle('test-module', callbacks);
    }).not.toThrow();
  });

  it('should call onLoad when module loads', () => {
    const mockModule: RegisteredModule = {
      id: 'test',
      name: 'Test Module',
      isLoaded: true,
      screens: [],
      useCases: [],
      initialRoute: 'test/Home',
      adapters: {},
      requires: [],
    };

    const callbacks = {
      onLoad: jest.fn(),
      onUnload: jest.fn(),
    };

    // Sin módulo inicialmente
    useModuleLifecycle('test', callbacks);
    expect(callbacks.onLoad).not.toHaveBeenCalled();

    // Agregar módulo cargado
    mockModules.push(mockModule);
    (useModules as jest.Mock).mockReturnValue({
      modules: mockModules,
    });

    // Ejecutar el efecto de nuevo
    if (useEffectCallback) {
      useEffectCallback();
    }

    expect(callbacks.onLoad).toHaveBeenCalledWith(mockModule);
    expect(callbacks.onUnload).not.toHaveBeenCalled();
  });

  it('should call onUnload when module unloads', () => {
    const mockModule: RegisteredModule = {
      id: 'test',
      name: 'Test Module',
      isLoaded: true,
      screens: [],
      useCases: [],
      initialRoute: 'test/Home',
      adapters: {},
      requires: [],
    };

    const callbacks = {
      onLoad: jest.fn(),
      onUnload: jest.fn(),
    };

    // Simular que el módulo estaba cargado previamente
    wasLoadedState = true;
    mockModules.push(mockModule);
    (useModules as jest.Mock).mockReturnValue({
      modules: mockModules,
    });

    useModuleLifecycle('test', callbacks);

    // Limpiar llamadas iniciales
    callbacks.onLoad.mockClear();
    callbacks.onUnload.mockClear();

    // Remover módulo (simular descarga)
    mockModules.length = 0;
    (useModules as jest.Mock).mockReturnValue({
      modules: mockModules,
    });

    // Ejecutar el efecto de nuevo
    if (useEffectCallback) {
      useEffectCallback();
    }

    expect(callbacks.onUnload).toHaveBeenCalled();
  });

  it('should not call onLoad if module is not loaded', () => {
    const mockModule: RegisteredModule = {
      id: 'test',
      name: 'Test Module',
      isLoaded: false, // No está cargado
      screens: [],
      useCases: [],
      initialRoute: 'test/Home',
      adapters: {},
      requires: [],
    };

    const callbacks = {
      onLoad: jest.fn(),
      onUnload: jest.fn(),
    };

    mockModules.push(mockModule);
    (useModules as jest.Mock).mockReturnValue({
      modules: mockModules,
    });

    useModuleLifecycle('test', callbacks);

    if (useEffectCallback) {
      useEffectCallback();
    }

    expect(callbacks.onLoad).not.toHaveBeenCalled();
    expect(callbacks.onUnload).not.toHaveBeenCalled();
  });

  it('should not call callbacks if module does not exist', () => {
    const callbacks = {
      onLoad: jest.fn(),
      onUnload: jest.fn(),
    };

    useModuleLifecycle('nonexistent', callbacks);

    if (useEffectCallback) {
      useEffectCallback();
    }

    expect(callbacks.onLoad).not.toHaveBeenCalled();
    expect(callbacks.onUnload).not.toHaveBeenCalled();
  });

  it('should handle missing callbacks gracefully', () => {
    const mockModule: RegisteredModule = {
      id: 'test',
      name: 'Test Module',
      isLoaded: true,
      screens: [],
      useCases: [],
      initialRoute: 'test/Home',
      adapters: {},
      requires: [],
    };

    // Solo onLoad
    const callbacks1 = {
      onLoad: jest.fn(),
    };

    mockModules.push(mockModule);
    (useModules as jest.Mock).mockReturnValue({
      modules: mockModules,
    });

    expect(() => {
      useModuleLifecycle('test', callbacks1);
      if (useEffectCallback) {
        useEffectCallback();
      }
    }).not.toThrow();

    expect(callbacks1.onLoad).toHaveBeenCalled();
  });

  it('should not call onLoad multiple times for the same module load', () => {
    const mockModule: RegisteredModule = {
      id: 'test',
      name: 'Test Module',
      isLoaded: true,
      screens: [],
      useCases: [],
      initialRoute: 'test/Home',
      adapters: {},
      requires: [],
    };

    const callbacks = {
      onLoad: jest.fn(),
      onUnload: jest.fn(),
    };

    // Simular que el módulo ya estaba cargado previamente
    wasLoadedState = true;
    mockModules.push(mockModule);
    (useModules as jest.Mock).mockReturnValue({
      modules: mockModules,
    });

    useModuleLifecycle('test', callbacks);

    // Limpiar llamadas iniciales (el efecto se ejecuta al montar)
    callbacks.onLoad.mockClear();
    callbacks.onUnload.mockClear();

    // Ejecutar de nuevo sin cambios (wasLoadedState ya es true, módulo sigue cargado)
    if (useEffectCallback) {
      useEffectCallback();
    }

    // No debería llamarse de nuevo porque wasLoaded ya es true y módulo sigue cargado
    expect(callbacks.onLoad).not.toHaveBeenCalled();
  });
});
