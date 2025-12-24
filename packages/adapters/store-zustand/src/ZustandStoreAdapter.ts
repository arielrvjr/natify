import { create } from 'zustand';
import { StateManagerPort, StoreApi, SetState, GetState } from '@natify/core';

export class ZustandStoreAdapter implements StateManagerPort {
  readonly capability = 'state-management';
  createStore<T>(setup: (set: SetState<T>, get: GetState<T>) => T): StoreApi<T> {
    // 1. Creamos la store nativa de Zustand
    // Zustand devuelve un hook que también tiene métodos adjuntos (getState, setState)
    const useZustandStore = create<T>((set, get) =>
      setup(
        // Adaptamos el 'set' de zustand para que coincida con nuestra firma estricta si es necesario
        args => set(args as any),
        get,
      ),
    );

    // 2. Retornamos nuestra interfaz limpia (StoreApi)
    // Esto desacopla a los componentes de saber que es "zustand"
    return {
      // El hook selector: permite useStore(state => state.user)

      useStore: <U>(selector?: (state: T) => U) => {
        // Siempre llamamos el hook, pero con diferentes selectores
        // El linter no puede detectar que siempre llamamos el hook
        if (selector) {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          return useZustandStore(selector);
        }
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useZustandStore(s => s as unknown as U);
      },

      // Métodos imperativos directos
      setState: useZustandStore.setState,
      getState: useZustandStore.getState,
      subscribe: useZustandStore.subscribe,
    };
  }
}

