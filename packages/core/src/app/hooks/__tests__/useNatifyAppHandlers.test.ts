import { renderHook, act } from '@testing-library/react-native';
import { useNatifyAppHandlers } from '../useNatifyAppHandlers';
import { AdapterMap } from '../../../types/adapters';
import { RegisteredModule } from '../../../module/types';

// Mock React hooks
jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useState: actual.useState,
    useCallback: actual.useCallback,
  };
});

describe('useNatifyAppHandlers', () => {
  const mockModules: RegisteredModule[] = [
    {
      id: 'test',
      name: 'Test Module',
      isLoaded: true,
      screens: [],
      useCases: [],
      initialRoute: 'test/Home',
      adapters: {},
      requires: [],
    },
  ];

  const mockAdapters: AdapterMap = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useNatifyAppHandlers());

    expect(result.current[0].isReady).toBe(false);
    expect(result.current[0].error).toBe(null);
  });

  it('should provide handlers', () => {
    const { result } = renderHook(() => useNatifyAppHandlers());

    expect(typeof result.current[1].handleModulesLoaded).toBe('function');
    expect(typeof result.current[1].handleError).toBe('function');
    expect(typeof result.current[1].handleRetry).toBe('function');
  });

  it('should call onReady when modules are loaded', () => {
    const onReady = jest.fn();
    const { result } = renderHook(() => useNatifyAppHandlers(onReady, undefined, mockAdapters));

    act(() => {
      result.current[1].handleModulesLoaded(mockModules);
    });

    expect(result.current[0].isReady).toBe(true);
    expect(onReady).toHaveBeenCalledWith(mockModules, mockAdapters);
  });

  it('should call onError when error occurs', () => {
    const onError = jest.fn();
    const error = new Error('Test error');
    const { result } = renderHook(() => useNatifyAppHandlers(undefined, onError));

    act(() => {
      result.current[1].handleError(error);
    });

    expect(result.current[0].error).toBe(error);
    expect(onError).toHaveBeenCalledWith(error);
  });

  it('should reset error and ready state on retry', () => {
    const { result } = renderHook(() => useNatifyAppHandlers());

    // Set error and ready state
    act(() => {
      result.current[1].handleError(new Error('Test error'));
      result.current[1].handleModulesLoaded(mockModules);
    });

    expect(result.current[0].error).not.toBe(null);
    expect(result.current[0].isReady).toBe(true);

    // Retry
    act(() => {
      result.current[1].handleRetry();
    });

    expect(result.current[0].error).toBe(null);
    expect(result.current[0].isReady).toBe(false);
  });
});
