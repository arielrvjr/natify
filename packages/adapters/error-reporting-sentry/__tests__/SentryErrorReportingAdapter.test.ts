import { SentryErrorReportingAdapter } from '../src';
import { SeverityLevel, NatifyError, NatifyErrorCode } from '@natify/core';

// Mock Sentry
const mockInit = jest.fn(); // Por defecto no lanza error
const mockCaptureException = jest.fn();
const mockCaptureMessage = jest.fn();
const mockSetUser = jest.fn();
const mockAddBreadcrumb = jest.fn();
const mockSetTags = jest.fn();
const mockSetTag = jest.fn();
const mockSetContext = jest.fn();
const mockWithScope = jest.fn((callback) => {
  const scope = {
    setLevel: jest.fn(),
    setContext: jest.fn(),
  };
  callback(scope);
});

jest.mock('@sentry/react-native', () => {
  return {
    init: (...args: any[]) => mockInit(...args),
    captureException: (...args: any[]) => mockCaptureException(...args),
    captureMessage: (...args: any[]) => mockCaptureMessage(...args),
    setUser: (...args: any[]) => mockSetUser(...args),
    addBreadcrumb: (...args: any[]) => mockAddBreadcrumb(...args),
    setTags: (...args: any[]) => mockSetTags(...args),
    setTag: (...args: any[]) => mockSetTag(...args),
    setContext: (...args: any[]) => mockSetContext(...args),
    withScope: (callback: any) => mockWithScope(callback),
  };
});

describe('SentryErrorReportingAdapter', () => {
  let adapter: SentryErrorReportingAdapter;
  const mockDsn = 'https://test@sentry.io/123';

  beforeEach(() => {
    jest.clearAllMocks();
    // Configurar mockInit para que no lance error por defecto
    mockInit.mockImplementation(() => {});
    adapter = new SentryErrorReportingAdapter({
      dsn: mockDsn,
      environment: 'test',
    });
  });

  describe('constructor', () => {
    it('should create adapter with default config', () => {
      const newAdapter = new SentryErrorReportingAdapter({
        dsn: mockDsn,
      });

      expect(newAdapter).toBeDefined();
      expect(newAdapter.capability).toBe('error-reporting');
    });

    it('should create adapter with custom config', () => {
      const newAdapter = new SentryErrorReportingAdapter({
        dsn: mockDsn,
        environment: 'production',
        release: '1.0.0',
        debug: true,
        enableTracing: true,
      });

      expect(newAdapter).toBeDefined();
    });
  });

  describe('init', () => {
    it('should initialize Sentry successfully', async () => {
      await adapter.init();

      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn: mockDsn,
          environment: 'test',
        }),
      );
    });

    it('should use provided DSN parameter', async () => {
      const customDsn = 'https://custom@sentry.io/456';
      await adapter.init(customDsn);

      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn: customDsn,
        }),
      );
    });

    it('should merge options with config', async () => {
      await adapter.init(undefined, { maxBreadcrumbs: 50 });

      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn: mockDsn,
          maxBreadcrumbs: 50,
        }),
      );
    });

    it('should not initialize twice', async () => {
      await adapter.init();
      await adapter.init();

      expect(mockInit).toHaveBeenCalledTimes(1);
    });

    it('should throw NatifyError on initialization failure', async () => {
      mockInit.mockImplementation(() => {
        throw new Error('Init failed');
      });

      await expect(adapter.init()).rejects.toThrow(NatifyError);
      await expect(adapter.init()).rejects.toThrow('Failed to initialize Sentry');
    });
  });

  describe('captureException', () => {
    beforeEach(async () => {
      await adapter.init();
    });

    it('should capture exception with default level', () => {
      const error = new Error('Test error');
      adapter.captureException(error);

      expect(mockWithScope).toHaveBeenCalled();
      expect(mockCaptureException).toHaveBeenCalledWith(error);
    });

    it('should capture exception with custom level', () => {
      const error = new Error('Test error');
      adapter.captureException(error, undefined, SeverityLevel.FATAL);

      expect(mockWithScope).toHaveBeenCalled();
      expect(mockCaptureException).toHaveBeenCalledWith(error);
    });

    it('should capture exception with context', () => {
      const error = new Error('Test error');
      const context = { screen: 'TestScreen', action: 'test' };

      adapter.captureException(error, context);

      expect(mockWithScope).toHaveBeenCalled();
      expect(mockCaptureException).toHaveBeenCalledWith(error);
    });

    it('should warn if not initialized', () => {
      const uninitializedAdapter = new SentryErrorReportingAdapter({
        dsn: mockDsn,
      });
      const error = new Error('Test error');

      uninitializedAdapter.captureException(error);

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Not initialized'),
      );
    });
  });

  describe('captureMessage', () => {
    beforeEach(async () => {
      await adapter.init();
    });

    it('should capture message with default level', () => {
      adapter.captureMessage('Test message');

      expect(mockWithScope).toHaveBeenCalled();
      expect(mockCaptureMessage).toHaveBeenCalledWith('Test message');
    });

    it('should capture message with custom level', () => {
      adapter.captureMessage('Test message', SeverityLevel.WARNING);

      expect(mockWithScope).toHaveBeenCalled();
      expect(mockCaptureMessage).toHaveBeenCalledWith('Test message');
    });

    it('should capture message with context', () => {
      const context = { feature: 'test' };
      adapter.captureMessage('Test message', SeverityLevel.INFO, context);

      expect(mockWithScope).toHaveBeenCalled();
      expect(mockCaptureMessage).toHaveBeenCalledWith('Test message');
    });
  });

  describe('setUser', () => {
    beforeEach(async () => {
      await adapter.init();
    });

    it('should set user context', () => {
      const user = {
        id: '123',
        email: 'test@example.com',
        username: 'testuser',
      };

      adapter.setUser(user);

      expect(mockSetUser).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '123',
          email: 'test@example.com',
          username: 'testuser',
        }),
      );
    });

    it('should clear user when set to null', () => {
      adapter.setUser(null);

      expect(mockSetUser).toHaveBeenCalledWith(null);
    });

    it('should store current user', () => {
      const user = { id: '123', email: 'test@example.com' };
      adapter.setUser(user);

      expect(adapter.getUser()).toEqual(user);
    });
  });

  describe('addBreadcrumb', () => {
    beforeEach(async () => {
      await adapter.init();
    });

    it('should add breadcrumb', () => {
      const breadcrumb = {
        message: 'Test breadcrumb',
        category: 'test',
        level: SeverityLevel.INFO,
        data: { key: 'value' },
      };

      adapter.addBreadcrumb(breadcrumb);

      expect(mockAddBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test breadcrumb',
          category: 'test',
        }),
      );
    });
  });

  describe('setTags', () => {
    beforeEach(async () => {
      await adapter.init();
    });

    it('should set tags', () => {
      const tags = { version: '1.0.0', platform: 'ios' };
      adapter.setTags(tags);

      expect(mockSetTags).toHaveBeenCalledWith(tags);
    });
  });

  describe('setTag', () => {
    beforeEach(async () => {
      await adapter.init();
    });

    it('should set single tag', () => {
      adapter.setTag('key', 'value');

      expect(mockSetTag).toHaveBeenCalledWith('key', 'value');
    });
  });

  describe('setContext', () => {
    beforeEach(async () => {
      await adapter.init();
    });

    it('should set context', () => {
      const context = { app: { version: '1.0.0' } };
      adapter.setContext('app', context);

      expect(mockSetContext).toHaveBeenCalledWith('app', context);
    });
  });

  describe('clearUser', () => {
    beforeEach(async () => {
      await adapter.init();
    });

    it('should clear user', () => {
      adapter.setUser({ id: '123' });
      adapter.clearUser();

      expect(mockSetUser).toHaveBeenLastCalledWith(null);
    });
  });

  describe('getUser', () => {
    it('should return null when no user is set', () => {
      expect(adapter.getUser()).toBeNull();
    });

    it('should return current user', async () => {
      await adapter.init();
      const user = { id: '123', email: 'test@example.com' };
      adapter.setUser(user);

      expect(adapter.getUser()).toEqual(user);
    });
  });
});

