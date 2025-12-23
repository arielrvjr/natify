import { useEffect, useState } from 'react';
import { useModules } from '../ModuleProvider';
import { RegisteredModule } from '../types';

/**
 * Hook para ejecutar código cuando un módulo se carga/descarga
 *
 * @example
 * ```typescript
 * function PremiumFeature() {
 *   useModuleLifecycle('premium', {
 *     onLoad: () => console.log('Premium loaded!'),
 *     onUnload: () => console.log('Premium unloaded!'),
 *   });
 * }
 * ```
 */
export function useModuleLifecycle(
  moduleId: string,
  callbacks: {
    onLoad?: (module: RegisteredModule) => void;
    onUnload?: () => void;
  },
) {
  const { modules } = useModules();
  const [wasLoaded, setWasLoaded] = useState(false);

  useEffect(() => {
    const module = modules.find(m => m.id === moduleId);
    const isLoaded = !!module && module.isLoaded;

    if (isLoaded && !wasLoaded) {
      // El módulo acaba de cargarse
      setWasLoaded(true);
      callbacks.onLoad?.(module!);
    } else if (!isLoaded && wasLoaded) {
      // El módulo acaba de descargarse
      setWasLoaded(false);
      callbacks.onUnload?.();
    }
  }, [modules, moduleId, wasLoaded, callbacks]);
}
