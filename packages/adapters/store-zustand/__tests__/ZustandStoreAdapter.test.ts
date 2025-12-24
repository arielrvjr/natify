import { ZustandStoreAdapter } from '../src';
import { create } from 'zustand';

jest.mock('zustand', () => ({
  create: jest.fn(),
}));

describe('ZustandStoreAdapter', () => {
  let adapter: ZustandStoreAdapter;
  let mockUseStore: any;
  let mockSetState: jest.Mock;
  let mockGetState: jest.Mock;
  let mockSubscribe: jest.Mock;
  let mockZustandSet: jest.Mock;
  let mockZustandGet: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new ZustandStoreAdapter();

    mockSetState = jest.fn();
    mockGetState = jest.fn().mockReturnValue({ count: 0 });
    mockSubscribe = jest.fn();
    mockZustandSet = jest.fn();
    mockZustandGet = jest.fn().mockReturnValue({ count: 0 });

    mockUseStore = jest.fn();
    mockUseStore.setState = mockSetState;
    mockUseStore.getState = mockGetState;
    mockUseStore.subscribe = mockSubscribe;

    (create as jest.Mock).mockImplementation((fn: any) => {
      // Simular que create llama a la función setup con set y get de zustand
      if (fn) {
        fn(mockZustandSet, mockZustandGet);
      }
      return mockUseStore;
    });
  });

  describe('capability', () => {
    it('should have correct capability', () => {
      expect(adapter.capability).toBe('state-management');
    });
  });

  describe('createStore', () => {
    it('should create a store with useStore hook', () => {
      interface TestState {
        count: number;
        increment: () => void;
      }

      const setup = (set: any, get: any): TestState => ({
        count: 0,
        increment: () => set({ count: get().count + 1 }),
      });

      const store = adapter.createStore<TestState>(setup);

      expect(create).toHaveBeenCalled();
      expect(store.useStore).toBeDefined();
      expect(typeof store.useStore).toBe('function');
    });

    it('should call setup function with adapted set and get functions', () => {
      interface TestState {
        count: number;
      }

      const setup = jest.fn((set: any, get: any): TestState => {
        // Verificar que set y get son funciones
        expect(typeof set).toBe('function');
        expect(typeof get).toBe('function');
        return { count: 0 };
      });

      adapter.createStore<TestState>(setup);

      expect(setup).toHaveBeenCalled();
      expect(setup).toHaveBeenCalledWith(expect.any(Function), mockZustandGet);
    });

    it('should adapt set function to call zustand set with args', () => {
      interface TestState {
        count: number;
      }

      const setup = jest.fn((set: any, get: any): TestState => {
        // Llamar set con un objeto parcial
        set({ count: 5 });
        return { count: 0 };
      });

      adapter.createStore<TestState>(setup);

      expect(setup).toHaveBeenCalled();
      expect(mockZustandSet).toHaveBeenCalledWith({ count: 5 });
      expect(mockZustandSet).toHaveBeenCalledTimes(1);
    });

    it('should adapt set function to call zustand set with function updater', () => {
      interface TestState {
        count: number;
      }

      const updaterFn = (state: TestState) => ({ count: state.count + 1 });
      const setup = jest.fn((set: any, get: any): TestState => {
        // Llamar set con una función updater
        set(updaterFn);
        return { count: 0 };
      });

      adapter.createStore<TestState>(setup);

      expect(setup).toHaveBeenCalled();
      expect(mockZustandSet).toHaveBeenCalledWith(updaterFn);
      expect(mockZustandSet).toHaveBeenCalledTimes(1);
    });

    it('should create a store with setState method', () => {
      interface TestState {
        count: number;
      }

      const setup = (): TestState => ({
        count: 0,
      });

      const store = adapter.createStore<TestState>(setup);

      expect(store.setState).toBe(mockSetState);
    });

    it('should create a store with getState method', () => {
      interface TestState {
        count: number;
      }

      const setup = (): TestState => ({
        count: 0,
      });

      const store = adapter.createStore<TestState>(setup);

      expect(store.getState).toBe(mockGetState);
    });

    it('should create a store with subscribe method', () => {
      interface TestState {
        count: number;
      }

      const setup = (): TestState => ({
        count: 0,
      });

      const store = adapter.createStore<TestState>(setup);

      expect(store.subscribe).toBe(mockSubscribe);
    });

    it('should allow subscribing to state changes', () => {
      interface TestState {
        count: number;
      }

      const setup = (): TestState => ({
        count: 0,
      });

      const unsubscribe = jest.fn();
      mockSubscribe.mockReturnValue(unsubscribe);

      const store = adapter.createStore<TestState>(setup);
      const listener = jest.fn();
      const unsubscribeFn = store.subscribe(listener);

      expect(mockSubscribe).toHaveBeenCalled();
      expect(unsubscribeFn).toBe(unsubscribe);
    });

    it('should call useStore with selector when provided', () => {
      interface TestState {
        count: number;
        name: string;
      }

      const setup = (): TestState => ({
        count: 0,
        name: 'test',
      });

      const store = adapter.createStore<TestState>(setup);
      const selector = (state: TestState) => state.count;

      store.useStore(selector);

      expect(mockUseStore).toHaveBeenCalledWith(selector);
    });

    it('should call useStore without selector when not provided', () => {
      interface TestState {
        count: number;
      }

      const setup = (): TestState => ({
        count: 0,
      });

      const store = adapter.createStore<TestState>(setup);

      store.useStore();

      expect(mockUseStore).toHaveBeenCalled();
      // Verificar que se llama con una función que mapea el estado completo
      expect(mockUseStore).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should return correct value when useStore is called without selector', () => {
      interface TestState {
        count: number;
        name: string;
      }

      const setup = (): TestState => ({
        count: 5,
        name: 'test',
      });

      const mockState = { count: 5, name: 'test' };
      mockUseStore.mockReturnValue(mockState);

      const store = adapter.createStore<TestState>(setup);
      const result = store.useStore();

      expect(result).toBe(mockState);
    });

    it('should return correct value when useStore is called with selector', () => {
      interface TestState {
        count: number;
        name: string;
      }

      const setup = (): TestState => ({
        count: 5,
        name: 'test',
      });

      const selector = (state: TestState) => state.count;
      mockUseStore.mockReturnValue(5);

      const store = adapter.createStore<TestState>(setup);
      const result = store.useStore(selector);

      expect(result).toBe(5);
      expect(mockUseStore).toHaveBeenCalledWith(selector);
    });

    it('should allow using setState method directly', () => {
      interface TestState {
        count: number;
      }

      const setup = (): TestState => ({
        count: 0,
      });

      const store = adapter.createStore<TestState>(setup);
      store.setState({ count: 10 });

      expect(mockSetState).toHaveBeenCalledWith({ count: 10 });
    });

    it('should allow using setState with function updater', () => {
      interface TestState {
        count: number;
      }

      const setup = (): TestState => ({
        count: 0,
      });

      const store = adapter.createStore<TestState>(setup);
      const updater = (state: TestState) => ({ count: state.count + 1 });
      store.setState(updater);

      expect(mockSetState).toHaveBeenCalledWith(updater);
    });

    it('should allow using getState method directly', () => {
      interface TestState {
        count: number;
      }

      const setup = (): TestState => ({
        count: 0,
      });

      const mockState = { count: 5 };
      mockGetState.mockReturnValue(mockState);

      const store = adapter.createStore<TestState>(setup);
      const result = store.getState();

      expect(mockGetState).toHaveBeenCalled();
      expect(result).toBe(mockState);
    });
  });
});

