import { actionBus, createAction } from '../src/actions/ActionBus';
import { Action } from '../src/actions/types';

describe('ActionBus', () => {
  beforeEach(() => {
    actionBus.clear();
  });

  describe('register', () => {
    it('should register a handler for an action type', () => {
      const handler = jest.fn();
      const unregister = actionBus.register('test:action', handler);

      expect(actionBus.hasHandlers('test:action')).toBe(true);
      expect(typeof unregister).toBe('function');
    });

    it('should allow multiple handlers for same action type', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      actionBus.register('test:action', handler1);
      actionBus.register('test:action', handler2);

      expect(actionBus.hasHandlers('test:action')).toBe(true);
    });

    it('should return unregister function', () => {
      const handler = jest.fn();
      const unregister = actionBus.register('test:action', handler);

      unregister();

      expect(actionBus.hasHandlers('test:action')).toBe(false);
    });
  });

  describe('dispatch', () => {
    it('should dispatch action to registered handler', async () => {
      const handler = jest.fn().mockResolvedValue(undefined);
      actionBus.register('test:action', handler);

      const action: Action<'test:action'> = { type: 'test:action' };
      const result = await actionBus.dispatch(action);

      expect(handler).toHaveBeenCalledWith(action);
      expect(result.success).toBe(true);
    });

    it('should dispatch action with payload', async () => {
      const handler = jest.fn().mockResolvedValue(undefined);
      actionBus.register('test:action', handler);

      const action: Action<'test:action', { value: string }> = {
        type: 'test:action',
        payload: { value: 'test' },
      };
      await actionBus.dispatch(action);

      expect(handler).toHaveBeenCalledWith(action);
    });

    it('should call all handlers for same action type', async () => {
      const handler1 = jest.fn().mockResolvedValue(undefined);
      const handler2 = jest.fn().mockResolvedValue(undefined);

      actionBus.register('test:action', handler1);
      actionBus.register('test:action', handler2);

      const action: Action<'test:action'> = { type: 'test:action' };
      await actionBus.dispatch(action);

      expect(handler1).toHaveBeenCalledWith(action);
      expect(handler2).toHaveBeenCalledWith(action);
    });

    it('should return success if no handlers registered', async () => {
      const action: Action<'test:action'> = { type: 'test:action' };
      const result = await actionBus.dispatch(action);

      expect(result.success).toBe(true);
    });

    it('should handle errors in handlers', async () => {
      const error = new Error('Handler error');
      const handler = jest.fn().mockRejectedValue(error);
      actionBus.register('test:action', handler);

      const action: Action<'test:action'> = { type: 'test:action' };
      const result = await actionBus.dispatch(action);

      expect(result.success).toBe(false);
      expect(result.error).toBe(error);
    });

    it('should return data from handler', async () => {
      const handler = jest.fn().mockResolvedValue({ data: 'result' });
      actionBus.register('test:action', handler);

      const action: Action<'test:action'> = { type: 'test:action' };
      const result = await actionBus.dispatch<Action<'test:action'>, { data: string }>(action);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ data: 'result' });
    });
  });

  describe('query', () => {
    it('should return data from handler', async () => {
      const handler = jest.fn().mockResolvedValue({ data: 'result' });
      actionBus.register('test:action', handler);

      const action: Action<'test:action'> = { type: 'test:action' };
      const result = await actionBus.query<Action<'test:action'>, { data: string }>(action);

      expect(result).toEqual({ data: 'result' });
    });

    it('should return undefined if no handlers', async () => {
      const action: Action<'test:action'> = { type: 'test:action' };
      const result = await actionBus.query<Action<'test:action'>, { data: string }>(action);

      expect(result).toBeUndefined();
    });
  });

  describe('use (middleware)', () => {
    it('should execute middleware before handlers', async () => {
      const middleware = jest.fn().mockImplementation(async (action, next) => {
        await next();
      });
      const handler = jest.fn().mockResolvedValue(undefined);

      actionBus.use(middleware);
      actionBus.register('test:action', handler);

      const action: Action<'test:action'> = { type: 'test:action' };
      await actionBus.dispatch(action);

      expect(middleware).toHaveBeenCalledWith(action, expect.any(Function));
      expect(handler).toHaveBeenCalled();
    });
  });

  describe('hasHandlers', () => {
    it('should return true if handlers exist', () => {
      actionBus.register('test:action', jest.fn());

      expect(actionBus.hasHandlers('test:action')).toBe(true);
    });

    it('should return false if no handlers', () => {
      expect(actionBus.hasHandlers('test:action')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all handlers and middlewares', () => {
      actionBus.register('test:action', jest.fn());
      actionBus.use(jest.fn());

      actionBus.clear();

      expect(actionBus.hasHandlers('test:action')).toBe(false);
    });
  });
});

describe('createAction', () => {
  it('should create action without payload', () => {
    const logoutAction = createAction<'auth:logout'>('auth:logout');
    const action = logoutAction();

    expect(action.type).toBe('auth:logout');
    expect(action.payload).toBeUndefined();
  });

  it('should create action with payload', () => {
    const navigateAction = createAction<'navigation:navigate', { route: string }>(
      'navigation:navigate',
    );
    const action = navigateAction({ route: '/home' });

    expect(action.type).toBe('navigation:navigate');
    expect(action.payload).toEqual({ route: '/home' });
  });
});

