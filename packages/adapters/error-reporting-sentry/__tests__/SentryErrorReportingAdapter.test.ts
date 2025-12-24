import { SentryErrorReportingAdapter } from '../src';
import { SeverityLevel, NatifyError, NatifyErrorCode } from '@natify/core';

// Mock console methods
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

// Mock Sentry
const mockInit = jest.fn(); // Por defecto no lanza error
const mockCaptureException = jest.fn();
const mockCaptureMessage = jest.fn();
const mockSetUser = jest.fn();
const mockAddBreadcrumb = jest.fn();
const mockSetTags = jest.fn();
const mockSetTag = jest.fn();
const mockSetContext = jest.fn();
const mockScopeSetLevel = jest.fn();
const mockScopeSetContext = jest.fn();
const mockScopeClearBreadcrumbs = jest.fn();
const mockWithScope = jest.fn((callback) => {
  const scope = {
    setLevel: mockScopeSetLevel,
    setContext: mockScopeSetContext,
    clearBreadcrumbs: mockScopeClearBreadcrumbs,
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
    mockConsoleWarn.mockClear();
    mockConsoleError.mockClear();
    // Configurar mockInit para que no lance error por defecto
    mockInit.mockImplementation(() => {});
    // Reset mocks to default behavior
    mockWithScope.mockImplementation((callback) => {
      const scope = {
        setLevel: mockScopeSetLevel,
        setContext: mockScopeSetContext,
        clearBreadcrumbs: mockScopeClearBreadcrumbs,
      };
      callback(scope);
    });
    adapter = new SentryErrorReportingAdapter({
      dsn: mockDsn,
      environment: 'test',
    });
  });

  afterAll(() => {
    mockConsoleWarn.mockRestore();
    mockConsoleError.mockRestore();
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

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Not initialized'),
      );
    });

    it('should handle error in captureException catch block', () => {
      const error = new Error('Test error');
      // Make withScope throw an error
      mockWithScope.mockImplementationOnce(() => {
        throw new Error('Sentry error');
      });

      adapter.captureException(error);

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Error capturing exception'),
        expect.any(Error),
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

    it('should warn if not initialized', () => {
      const uninitializedAdapter = new SentryErrorReportingAdapter({
        dsn: mockDsn,
      });

      uninitializedAdapter.captureMessage('Test message');

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Not initialized'),
      );
    });

    it('should handle error in captureMessage catch block', () => {
      // Make withScope throw an error
      mockWithScope.mockImplementationOnce(() => {
        throw new Error('Sentry error');
      });

      adapter.captureMessage('Test message');

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Error capturing message'),
        expect.any(Error),
      );
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

    it('should warn if not initialized', () => {
      const uninitializedAdapter = new SentryErrorReportingAdapter({
        dsn: mockDsn,
      });

      uninitializedAdapter.setUser({ id: '123' });

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Not initialized'),
      );
    });

    it('should handle error in setUser catch block', () => {
      // Make setUser throw an error
      mockSetUser.mockImplementationOnce(() => {
        throw new Error('Sentry error');
      });

      adapter.setUser({ id: '123' });

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Error setting user'),
        expect.any(Error),
      );
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

    it('should warn if not initialized', () => {
      const uninitializedAdapter = new SentryErrorReportingAdapter({
        dsn: mockDsn,
      });

      uninitializedAdapter.addBreadcrumb({
        message: 'Test',
        category: 'test',
      });

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Not initialized'),
      );
    });

    it('should handle error in addBreadcrumb catch block', () => {
      // Make addBreadcrumb throw an error
      mockAddBreadcrumb.mockImplementationOnce(() => {
        throw new Error('Sentry error');
      });

      adapter.addBreadcrumb({
        message: 'Test',
        category: 'test',
      });

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Error adding breadcrumb'),
        expect.any(Error),
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

    it('should warn if not initialized', () => {
      const uninitializedAdapter = new SentryErrorReportingAdapter({
        dsn: mockDsn,
      });

      uninitializedAdapter.setTags({ version: '1.0.0' });

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Not initialized'),
      );
    });

    it('should handle error in setTags catch block', () => {
      // Make setTags throw an error
      mockSetTags.mockImplementationOnce(() => {
        throw new Error('Sentry error');
      });

      adapter.setTags({ version: '1.0.0' });

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Error setting tags'),
        expect.any(Error),
      );
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

    it('should warn if not initialized', () => {
      const uninitializedAdapter = new SentryErrorReportingAdapter({
        dsn: mockDsn,
      });

      uninitializedAdapter.setTag('key', 'value');

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Not initialized'),
      );
    });

    it('should handle error in setTag catch block', () => {
      // Make setTag throw an error
      mockSetTag.mockImplementationOnce(() => {
        throw new Error('Sentry error');
      });

      adapter.setTag('key', 'value');

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Error setting tag'),
        expect.any(Error),
      );
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

    it('should warn if not initialized', () => {
      const uninitializedAdapter = new SentryErrorReportingAdapter({
        dsn: mockDsn,
      });

      uninitializedAdapter.setContext('app', { version: '1.0.0' });

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Not initialized'),
      );
    });

    it('should handle error in setContext catch block', () => {
      // Make setContext throw an error
      mockSetContext.mockImplementationOnce(() => {
        throw new Error('Sentry error');
      });

      adapter.setContext('app', { version: '1.0.0' });

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Error setting context'),
        expect.any(Error),
      );
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

  describe('clearBreadcrumbs', () => {
    it('should do nothing if not initialized', () => {
      const uninitializedAdapter = new SentryErrorReportingAdapter({
        dsn: mockDsn,
      });

      uninitializedAdapter.clearBreadcrumbs();

      expect(mockWithScope).not.toHaveBeenCalled();
    });

    it('should clear breadcrumbs when initialized', async () => {
      await adapter.init();
      adapter.clearBreadcrumbs();

      expect(mockWithScope).toHaveBeenCalled();
      expect(mockScopeClearBreadcrumbs).toHaveBeenCalled();
    });

    it('should handle error in clearBreadcrumbs catch block', async () => {
      await adapter.init();
      // Make withScope throw an error
      mockWithScope.mockImplementationOnce(() => {
        throw new Error('Sentry error');
      });

      adapter.clearBreadcrumbs();

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Error clearing breadcrumbs'),
        expect.any(Error),
      );
    });
  });

  describe('mapSeverityToSentry', () => {
    beforeEach(async () => {
      await adapter.init();
    });

    it('should map all severity levels correctly', () => {
      const error = new Error('Test');
      
      // Test all levels
      adapter.captureException(error, undefined, SeverityLevel.FATAL);
      adapter.captureException(error, undefined, SeverityLevel.ERROR);
      adapter.captureException(error, undefined, SeverityLevel.WARNING);
      adapter.captureException(error, undefined, SeverityLevel.INFO);
      adapter.captureException(error, undefined, SeverityLevel.DEBUG);

      expect(mockScopeSetLevel).toHaveBeenCalledWith('fatal');
      expect(mockScopeSetLevel).toHaveBeenCalledWith('error');
      expect(mockScopeSetLevel).toHaveBeenCalledWith('warning');
      expect(mockScopeSetLevel).toHaveBeenCalledWith('info');
      expect(mockScopeSetLevel).toHaveBeenCalledWith('debug');
    });

    it('should default to error for unknown level', () => {
      const error = new Error('Test');
      // Use an invalid level (cast to bypass type checking)
      adapter.captureException(error, undefined, 'unknown' as SeverityLevel);

      // Should default to 'error'
      expect(mockScopeSetLevel).toHaveBeenCalledWith('error');
    });
  });

  describe('getSentryClient', () => {
    it('should return Sentry client', () => {
      const client = adapter.getSentryClient();

      expect(client).toBeDefined();
      expect(client.init).toBeDefined();
      expect(client.captureException).toBeDefined();
      expect(client.captureMessage).toBeDefined();
    });
  });
});

