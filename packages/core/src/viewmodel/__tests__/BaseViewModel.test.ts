import { useBaseViewModel } from '../BaseViewModel';
import { NatifyError, NatifyErrorCode } from '../../errors';

// Mock React hooks
let mockState: [boolean, (value: boolean) => void] = [false, jest.fn()];
let mockErrorState: [NatifyError | null, (value: NatifyError | null) => void] = [
  null,
  jest.fn(),
];
let mockRef = { current: true };
let mockUseEffectCallback: (() => void | (() => void)) | null = null;

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useState: jest.fn(initial => {
      if (typeof initial === 'boolean') {
        return mockState;
      }
      return mockErrorState;
    }),
    useRef: jest.fn(_initial => mockRef),
    useCallback: jest.fn(fn => fn),
    useEffect: jest.fn(fn => {
      mockUseEffectCallback = fn;
      const cleanup = fn();
      if (cleanup) {
        // Store cleanup for later
      }
    }),
  };
});

describe('useBaseViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockState = [false, jest.fn()];
    mockErrorState = [null, jest.fn()];
    mockRef = { current: true };
    mockUseEffectCallback = null;
  });

  it('should be a function', () => {
    expect(typeof useBaseViewModel).toBe('function');
  });

  it('should return state and actions', () => {
    const result = useBaseViewModel();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);

    const [state, actions] = result;

    expect(state).toHaveProperty('isLoading');
    expect(state).toHaveProperty('error');
    expect(actions).toHaveProperty('setLoading');
    expect(actions).toHaveProperty('setError');
    expect(actions).toHaveProperty('clearError');
    expect(actions).toHaveProperty('execute');
    expect(actions).toHaveProperty('executeOrThrow');
  });

  it('should have initial state', () => {
    const [state] = useBaseViewModel();

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(null);
  });

  it('should provide setLoading function', () => {
    const [, actions] = useBaseViewModel();

    expect(typeof actions.setLoading).toBe('function');
    expect(() => actions.setLoading(true)).not.toThrow();
  });

  it('should provide setError function', () => {
    const [, actions] = useBaseViewModel();

    expect(typeof actions.setError).toBe('function');
    const error = new NatifyError(NatifyErrorCode.UNKNOWN, 'Test error');
    expect(() => actions.setError(error)).not.toThrow();
  });

  it('should provide clearError function', () => {
    const [, actions] = useBaseViewModel();

    expect(typeof actions.clearError).toBe('function');
    expect(() => actions.clearError()).not.toThrow();
  });

  it('should provide execute function', () => {
    const [, actions] = useBaseViewModel();

    expect(typeof actions.execute).toBe('function');
  });

  it('should provide executeOrThrow function', () => {
    const [, actions] = useBaseViewModel();

    expect(typeof actions.executeOrThrow).toBe('function');
  });

  it('should handle execute with success', async () => {
    const [, actions] = useBaseViewModel();

    const result = await actions.execute(async () => {
      return 'success';
    });

    expect(result).toBe('success');
  });

  it('should handle execute with error', async () => {
    const [, actions] = useBaseViewModel();

    const result = await actions.execute(async () => {
      throw new Error('Test error');
    });

    expect(result).toBeUndefined();
  });

  it('should handle executeOrThrow with success', async () => {
    const [, actions] = useBaseViewModel();

    const result = await actions.executeOrThrow(async () => {
      return 'success';
    });

    expect(result).toBe('success');
  });

  it('should handle executeOrThrow with error', async () => {
    const [, actions] = useBaseViewModel();

    await expect(
      actions.executeOrThrow(async () => {
        throw new Error('Test error');
      }),
    ).rejects.toThrow('Test error');
  });

  it('should handle cleanup on unmount', () => {
    // Simular el cleanup del useEffect
    if (mockUseEffectCallback) {
      const cleanup = mockUseEffectCallback();
      if (cleanup && typeof cleanup === 'function') {
        expect(() => cleanup()).not.toThrow();
      }
    }
  });
});
