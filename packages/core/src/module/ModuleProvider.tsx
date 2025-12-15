import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  ReactNode,
} from 'react';
import { ModuleRegistry } from './ModuleRegistry';
import { ModuleDefinition, RegisteredModule } from './types';
import { useNativefy } from '../context';
import { useDIContainer } from '../di';

interface ModuleContextValue {
  registry: ModuleRegistry;
  modules: RegisteredModule[];
  isLoading: boolean;
  error: Error | null;
  registerModule: (module: ModuleDefinition) => Promise<RegisteredModule>;
  unregisterModule: (moduleId: string) => Promise<void>;
  getModule: (moduleId: string) => RegisteredModule | undefined;
}

const ModuleContext = createContext<ModuleContextValue | null>(null);

interface ModuleProviderProps {
  /**
   * Módulos a cargar inicialmente
   */
  modules: ModuleDefinition[];

  /**
   * Callback cuando los módulos están cargados
   */
  onModulesLoaded?: (modules: RegisteredModule[]) => void;

  /**
   * Callback en caso de error
   */
  onError?: (error: Error) => void;

  children: ReactNode;
}

/**
 * Provider para el sistema de módulos
 */
export const ModuleProvider: React.FC<ModuleProviderProps> = ({
  modules: initialModules,
  onModulesLoaded,
  onError,
  children,
}) => {
  const nativefy = useNativefy();
  const container = useDIContainer();
  const [registry] = useState(() => new ModuleRegistry(container));
  const [modules, setModules] = useState<RegisteredModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadModules() {
      setIsLoading(true);
      setError(null);

      try {
        // Configurar adapters disponibles
        registry.setAdapters(nativefy);

        // Registrar todos los módulos iniciales
        const loadedModules: RegisteredModule[] = [];

        for (const moduleDef of initialModules) {
          try {
            const registered = await registry.register(moduleDef);
            loadedModules.push(registered);
          } catch (err) {
            console.error(`[Nativefy] Failed to load module "${moduleDef.id}":`, err);
            throw err;
          }
        }

        setModules(loadedModules);
        setIsLoading(false);
        onModulesLoaded?.(loadedModules);
      } catch (err) {
        const moduleError = err instanceof Error ? err : new Error(String(err));
        setError(moduleError);
        setIsLoading(false);
        onError?.(moduleError);
      }
    }

    loadModules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const registerModule = useCallback(
    async (module: ModuleDefinition): Promise<RegisteredModule> => {
      const registered = await registry.register(module);
      setModules(registry.getAllModules());
      return registered;
    },
    [registry],
  );

  const unregisterModule = useCallback(
    async (moduleId: string) => {
      await registry.unregister(moduleId);
      setModules(registry.getAllModules());
    },
    [registry],
  );

  const getModule = useCallback(
    (moduleId: string) => {
      return registry.getModule(moduleId);
    },
    [registry],
  );

  const contextValue = useMemo<ModuleContextValue>(
    () => ({
      registry,
      modules,
      isLoading,
      error,
      registerModule,
      unregisterModule,
      getModule,
    }),
    [registry, modules, isLoading, error, registerModule, unregisterModule, getModule],
  );

  return <ModuleContext.Provider value={contextValue}>{children}</ModuleContext.Provider>;
};

/**
 * Hook para acceder al contexto de módulos
 */
export function useModules(): ModuleContextValue {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error('useModules must be used within ModuleProvider');
  }
  return context;
}

/**
 * Hook para acceder a un módulo específico
 */
export function useModule(moduleId: string): RegisteredModule | undefined {
  const { getModule } = useModules();
  return useMemo(() => getModule(moduleId), [getModule, moduleId]);
}
