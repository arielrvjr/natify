import { useActionDispatch, useActionHandler, useActionQuery } from '../index';
import { actionBus } from '../../ActionBus';
import { Action } from '../../types';

// Mock ActionBus
jest.mock('../../ActionBus', () => ({
  actionBus: {
    dispatch: jest.fn(),
    register: jest.fn(),
    query: jest.fn(),
  },
}));

// Mock React hooks (definidos pero no usados directamente, se usan en el mock de react)

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useCallback: (fn: () => unknown) => fn,
    useEffect: (fn: () => void | (() => void)) => fn(),
    useRef: <T>(initial: T) => ({ current: initial }),
  };
});

describe('actions/hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useActionDispatch', () => {
    it('should return a dispatch function', () => {
      const dispatch = useActionDispatch();
      expect(typeof dispatch).toBe('function');
    });

    it('should dispatch action to ActionBus', async () => {
      const mockAction: Action = { type: 'test:action' };
      const dispatch = useActionDispatch();

      await dispatch(mockAction);

      expect(actionBus.dispatch).toHaveBeenCalledWith(mockAction);
    });
  });

  describe('useActionHandler', () => {
    it('should register handler on mount', () => {
      const handler = jest.fn();
      const unsubscribe = jest.fn();
      (actionBus.register as jest.Mock).mockReturnValue(unsubscribe);

      useActionHandler('test:action', handler);

      expect(actionBus.register).toHaveBeenCalledWith('test:action', expect.any(Function));
    });

    it('should return unsubscribe function from useEffect', () => {
      const handler = jest.fn();
      const unsubscribe = jest.fn();
      (actionBus.register as jest.Mock).mockReturnValue(unsubscribe);

      useActionHandler('test:action', handler);

      // Verificar que se registró el handler
      expect(actionBus.register).toHaveBeenCalledWith('test:action', expect.any(Function));
    });
  });

  describe('useActionQuery', () => {
    it('should return a query function', () => {
      const query = useActionQuery();
      expect(typeof query).toBe('function');
    });

    it('should query ActionBus', async () => {
      const mockAction: Action = { type: 'test:query' };
      const mockResult = { data: 'result' };
      (actionBus.query as jest.Mock).mockResolvedValue(mockResult);

      const query = useActionQuery();
      const result = await query(mockAction);

      expect(actionBus.query).toHaveBeenCalledWith(mockAction);
      expect(result).toBe(mockResult);
    });
  });
});
