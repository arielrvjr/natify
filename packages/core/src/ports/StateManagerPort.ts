import { Port } from './Port';

export type SetState<T> = (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
export type GetState<T> = () => T;

// Esta es la interfaz que devolverá nuestro adaptador
export interface StoreApi<T> {
  /** Hook para usar dentro de componentes React */
  useStore: <U>(selector?: (state: T) => U) => U;

  /** Métodos para usar fuera de componentes (en servicios, lógica, etc) */
  setState: SetState<T>;
  getState: GetState<T>;
  subscribe: (listener: (state: T, prevState: T) => void) => () => void;
}

// El Puerto es una fábrica de stores
export interface StateManagerPort extends Port {
  readonly capability: 'state-management';
  createStore<T>(setup: (set: SetState<T>, get: GetState<T>) => T): StoreApi<T>;
}
