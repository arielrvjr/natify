import { useCallback, useState } from 'react';
import { useModules } from '../ModuleProvider';
import { ModuleDefinition, RegisteredModule } from '../types';

/**
 * Hook para cargar módulos dinámicamente (Hot Reload)
 *
 * Permite cargar y descargar módulos en runtime, útil para:
 * - Feature flags
 * - Carga diferida de funcionalidades
 * - A/B testing
 *
 * @example
 * ```typescript
 * function App() {
 *   const { loadModule, unloadModule, isModuleLoaded } = useDynamicModules();
 *
 *   const handleEnablePremium = async () => {
 *     await loadModule(PremiumModule);
 *   };
 *
 *   const handleDisablePremium = async () => {
 *     await unloadModule('premium');
 *   };
 * }
 * ```
 */
export function useDynamicModules() {
  const { registerModule, unregisterModule, modules, isLoading } = useModules();
  const [loadingModules, setLoadingModules] = useState<Set<string>>(new Set());

  /**
   * Carga un módulo dinámicamente
   */
  const loadModule = useCallback(
    async (module: ModuleDefinition): Promise<RegisteredModule | undefined> => {
      if (modules.some(m => m.id === module.id)) {
        console.warn(`[useDynamicModules] Module '${module.id}' is already loaded`);
        return modules.find(m => m.id === module.id);
      }

      setLoadingModules(prev => new Set(prev).add(module.id));

      try {
        const registered = await registerModule(module);
        return registered;
      } finally {
        setLoadingModules(prev => {
          const next = new Set(prev);
          next.delete(module.id);
          return next;
        });
      }
    },
    [modules, registerModule],
  );

  /**
   * Descarga un módulo
   */
  const unloadModule = useCallback(
    async (moduleId: string): Promise<void> => {
      if (!modules.some(m => m.id === moduleId)) {
        console.warn(`[useDynamicModules] Module '${moduleId}' is not loaded`);
        return;
      }

      setLoadingModules(prev => new Set(prev).add(moduleId));

      try {
        await unregisterModule(moduleId);
      } finally {
        setLoadingModules(prev => {
          const next = new Set(prev);
          next.delete(moduleId);
          return next;
        });
      }
    },
    [modules, unregisterModule],
  );

  /**
   * Verifica si un módulo está cargado
   */
  const isModuleLoaded = useCallback(
    (moduleId: string): boolean => {
      return modules.some(m => m.id === moduleId && m.isLoaded);
    },
    [modules],
  );

  /**
   * Verifica si un módulo está cargando
   */
  const isModuleLoading = useCallback(
    (moduleId: string): boolean => {
      return loadingModules.has(moduleId);
    },
    [loadingModules],
  );

  /**
   * Recarga un módulo (útil para desarrollo)
   */
  const reloadModule = useCallback(
    async (module: ModuleDefinition): Promise<RegisteredModule | undefined> => {
      if (modules.some(m => m.id === module.id)) {
        await unloadModule(module.id);
      }
      return loadModule(module);
    },
    [modules, loadModule, unloadModule],
  );

  return {
    loadModule,
    unloadModule,
    reloadModule,
    isModuleLoaded,
    isModuleLoading,
    loadedModules: modules,
    isLoading,
  };
}
