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

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new ZustandStoreAdapter();

    mockSetState = jest.fn();
    mockGetState = jest.fn();
    mockSubscribe = jest.fn();

    mockUseStore = jest.fn();
    mockUseStore.setState = mockSetState;
    mockUseStore.getState = mockGetState;
    mockUseStore.subscribe = mockSubscribe;

    (create as jest.Mock).mockReturnValue(mockUseStore);
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
    });
  });
});

