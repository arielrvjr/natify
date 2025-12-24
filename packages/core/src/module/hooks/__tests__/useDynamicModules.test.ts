import { useDynamicModules } from '../useDynamicModules';
import { useModules } from '../../ModuleProvider';
import { RegisteredModule } from '../../types';

// Mock useModules
const mockRegisterModule = jest.fn();
const mockUnregisterModule = jest.fn();
const mockModules: RegisteredModule[] = [];
let mockIsLoading = false;

jest.mock('../../ModuleProvider', () => ({
  useModules: jest.fn(),
}));

// Mock React hooks
let useStateValue: Set<string> = new Set();
const setStateFunction = jest.fn(updater => {
  if (typeof updater === 'function') {
    useStateValue = updater(useStateValue);
  } else {
    useStateValue = updater;
  }
  return useStateValue;
});

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useState: jest.fn(_initial => [useStateValue, setStateFunction]),
    useCallback: jest.fn(fn => fn),
  };
});

describe('useDynamicModules', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockModules.length = 0;
    mockIsLoading = false;
    useStateValue = new Set();
    setStateFunction.mockClear();
    (useModules as jest.Mock).mockReturnValue({
      registerModule: mockRegisterModule,
      unregisterModule: mockUnregisterModule,
      modules: mockModules,
      isLoading: mockIsLoading,
    });
  });

  it('should return all required functions and properties', () => {
    const result = useDynamicModules();

    expect(result).toHaveProperty('loadModule');
    expect(result).toHaveProperty('unloadModule');
    expect(result).toHaveProperty('reloadModule');
    expect(result).toHaveProperty('isModuleLoaded');
    expect(result).toHaveProperty('isModuleLoading');
    expect(result).toHaveProperty('loadedModules');
    expect(result).toHaveProperty('isLoading');
  });

  describe('loadModule', () => {
    it('should load a new module successfully', async () => {
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
      mockRegisterModule.mockResolvedValue(mockModule);

      const { loadModule } = useDynamicModules();
      const result = await loadModule({
        id: 'test',
        name: 'Test Module',
        requires: [],
        screens: [],
        useCases: [],
      });

      expect(result).toBe(mockModule);
      expect(mockRegisterModule).toHaveBeenCalledWith({
        id: 'test',
        name: 'Test Module',
        requires: [],
        screens: [],
        useCases: [],
      });
    });

    it('should warn and return existing module if already loaded', async () => {
      const existingModule: RegisteredModule = {
        id: 'test',
        name: 'Test Module',
        isLoaded: true,
        screens: [],
        useCases: [],
        initialRoute: 'test/Home',
        adapters: {},
        requires: [],
      };
      mockModules.push(existingModule);
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();

      const { loadModule } = useDynamicModules();
      const result = await loadModule({
        id: 'test',
        name: 'Test Module',
        requires: [],
        screens: [],
        useCases: [],
      });

      expect(result).toBe(existingModule);
      expect(consoleWarn).toHaveBeenCalledWith(
        expect.stringContaining("Module 'test' is already loaded"),
      );
      expect(mockRegisterModule).not.toHaveBeenCalled();
      consoleWarn.mockRestore();
    });

    it('should update loading state during module load', async () => {
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
      mockRegisterModule.mockResolvedValue(mockModule);

      const { loadModule } = useDynamicModules();

      // Iniciar carga
      const loadPromise = loadModule({
        id: 'test',
        name: 'Test Module',
        requires: [],
        screens: [],
        useCases: [],
      });

      // Verificar que setState fue llamado para agregar al Set
      expect(setStateFunction).toHaveBeenCalled();

      await loadPromise;

      // Verificar que setState fue llamado para remover del Set
      expect(setStateFunction).toHaveBeenCalled();
    });
  });

  describe('unloadModule', () => {
    it('should unload a module successfully', async () => {
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
      mockModules.push(mockModule);
      mockUnregisterModule.mockResolvedValue(undefined);

      const { unloadModule } = useDynamicModules();
      await unloadModule('test');

      expect(mockUnregisterModule).toHaveBeenCalledWith('test');
    });

    it('should warn if module is not loaded when unloading', async () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();

      const { unloadModule } = useDynamicModules();
      await unloadModule('nonexistent');

      expect(consoleWarn).toHaveBeenCalledWith(
        expect.stringContaining("Module 'nonexistent' is not loaded"),
      );
      expect(mockUnregisterModule).not.toHaveBeenCalled();
      consoleWarn.mockRestore();
    });
  });

  describe('isModuleLoaded', () => {
    it('should return true if module is loaded', () => {
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
      mockModules.push(mockModule);

      const { isModuleLoaded } = useDynamicModules();
      expect(isModuleLoaded('test')).toBe(true);
    });

    it('should return false if module is not loaded', () => {
      const { isModuleLoaded } = useDynamicModules();
      expect(isModuleLoaded('nonexistent')).toBe(false);
    });

    it('should return false if module exists but is not loaded', () => {
      const mockModule: RegisteredModule = {
        id: 'test',
        name: 'Test Module',
        isLoaded: false,
        screens: [],
        useCases: [],
        initialRoute: 'test/Home',
        adapters: {},
        requires: [],
      };
      mockModules.push(mockModule);

      const { isModuleLoaded } = useDynamicModules();
      expect(isModuleLoaded('test')).toBe(false);
    });
  });

  describe('isModuleLoading', () => {
    it('should return false initially', () => {
      const { isModuleLoading } = useDynamicModules();
      expect(isModuleLoading('test')).toBe(false);
    });

    it('should return true when module is in loading set', () => {
      useStateValue = new Set(['test']);
      const { isModuleLoading } = useDynamicModules();
      expect(isModuleLoading('test')).toBe(true);
    });
  });

  describe('reloadModule', () => {
    it('should reload a module by unloading and loading again', async () => {
      const existingModule: RegisteredModule = {
        id: 'test',
        name: 'Test Module',
        isLoaded: true,
        screens: [],
        useCases: [],
        initialRoute: 'test/Home',
        adapters: {},
        requires: [],
      };
      mockModules.push(existingModule);

      const newModule: RegisteredModule = {
        id: 'test',
        name: 'Test Module Updated',
        isLoaded: true,
        screens: [],
        useCases: [],
        initialRoute: 'test/Home',
        adapters: {},
        requires: [],
      };
      mockUnregisterModule.mockImplementation(async () => {
        // Simular que el módulo se remueve después de unregister
        const index = mockModules.findIndex(m => m.id === 'test');
        if (index >= 0) {
          mockModules.splice(index, 1);
        }
      });
      mockRegisterModule.mockResolvedValue(newModule);

      const { reloadModule } = useDynamicModules();
      const result = await reloadModule({
        id: 'test',
        name: 'Test Module Updated',
        requires: [],
        screens: [],
        useCases: [],
      });

      expect(result).toEqual(newModule);
      expect(mockUnregisterModule).toHaveBeenCalledWith('test');
      expect(mockRegisterModule).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test',
          name: 'Test Module Updated',
        }),
      );
    });

    it('should load module if not already loaded', async () => {
      const newModule: RegisteredModule = {
        id: 'test',
        name: 'Test Module',
        isLoaded: true,
        screens: [],
        useCases: [],
        initialRoute: 'test/Home',
        adapters: {},
        requires: [],
      };
      mockRegisterModule.mockResolvedValue(newModule);

      const { reloadModule } = useDynamicModules();
      const result = await reloadModule({
        id: 'test',
        name: 'Test Module',
        requires: [],
        screens: [],
        useCases: [],
      });

      expect(result).toBe(newModule);
      expect(mockUnregisterModule).not.toHaveBeenCalled();
      expect(mockRegisterModule).toHaveBeenCalled();
    });
  });

  describe('loadedModules and isLoading', () => {
    it('should return modules from useModules', () => {
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
      mockModules.push(mockModule);

      const { loadedModules } = useDynamicModules();
      expect(loadedModules).toEqual([mockModule]);
    });

    it('should return isLoading from useModules', () => {
      mockIsLoading = true;
      (useModules as jest.Mock).mockReturnValue({
        registerModule: mockRegisterModule,
        unregisterModule: mockUnregisterModule,
        modules: mockModules,
        isLoading: mockIsLoading,
      });

      const { isLoading } = useDynamicModules();
      expect(isLoading).toBe(true);
    });
  });
});
