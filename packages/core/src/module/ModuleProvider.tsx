import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  ReactNode,
} from 'react';
import { ModuleDefinition, RegisteredModule } from './types';
import { useAdapter, useUseCase } from '../di/DIProvider';
import { RegisterModuleUseCase, UnregisterModuleUseCase, GetModuleUseCase } from './usecases';
import { LoggerPort } from '../ports/LoggerPort';

interface ModuleContextValue {
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
  const [modules, setModules] = useState<RegisteredModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const logger = useAdapter<LoggerPort>('logger');
  // Obtener UseCases a través de useUseCase (ViewModels)
  const registerModule = useUseCase<RegisterModuleUseCase>('usecase:RegisterModuleUseCase');
  const unregisterModule = useUseCase<UnregisterModuleUseCase>('usecase:UnregisterModuleUseCase');
  const getModule = useUseCase<GetModuleUseCase>('usecase:GetModuleUseCase');

  useEffect(() => {
    async function loadModules() {
      setIsLoading(true);
      setError(null);

      try {
        // Registrar todos los módulos iniciales usando UseCases
        const loadedModules: RegisteredModule[] = [];

        for (const moduleDef of initialModules) {
          try {
            const registered = await registerModule.execute(moduleDef);
            loadedModules.push(registered);
          } catch (err) {
            logger.error(
              `[Nativefy] Failed to load module "${moduleDef.id}":`,
              err as unknown as Error,
            );
            throw err;
          }
        }

        // Actualizar estado con todos los módulos
        setModules(getModule.executeAll());
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

  const registerModuleCallback = useCallback(
    async (module: ModuleDefinition): Promise<RegisteredModule> => {
      const registered = await registerModule.execute(module);
      setModules(getModule.executeAll());
      return registered;
    },
    [registerModule, getModule],
  );

  const unregisterModuleCallback = useCallback(
    async (moduleId: string) => {
      await unregisterModule.execute(moduleId);
      setModules(getModule.executeAll());
    },
    [unregisterModule, getModule],
  );

  const getModuleCallback = useCallback(
    (moduleId: string) => {
      return getModule.execute(moduleId);
    },
    [getModule],
  );

  const contextValue = useMemo<ModuleContextValue>(
    () => ({
      modules,
      isLoading,
      error,
      registerModule: registerModuleCallback,
      unregisterModule: unregisterModuleCallback,
      getModule: getModuleCallback,
    }),
    [
      modules,
      isLoading,
      error,
      registerModuleCallback,
      unregisterModuleCallback,
      getModuleCallback,
    ],
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
