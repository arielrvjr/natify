import { ConsoleLoggerAdapter } from '../src/adapters/logger/ConsoleLoggerAdapter';
import { LogLevel } from '../src/ports/LoggerPort';

// Mock console methods
const consoleDebug = jest.spyOn(console, 'debug').mockImplementation();
const consoleInfo = jest.spyOn(console, 'info').mockImplementation();
const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();
const consoleError = jest.spyOn(console, 'error').mockImplementation();

describe('ConsoleLoggerAdapter', () => {
  let adapter: ConsoleLoggerAdapter;

  beforeEach(() => {
    adapter = new ConsoleLoggerAdapter();
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleDebug.mockRestore();
    consoleInfo.mockRestore();
    consoleWarn.mockRestore();
    consoleError.mockRestore();
  });

  describe('constructor', () => {
    it('should create adapter with logger capability', () => {
      expect(adapter.capability).toBe('logger');
    });
  });

  describe('log', () => {
    it('should log DEBUG level', () => {
      adapter.log(LogLevel.DEBUG, 'Debug message');

      expect(consoleDebug).toHaveBeenCalledWith('[DEBUG] Debug message', undefined);
    });

    it('should log INFO level', () => {
      adapter.log(LogLevel.INFO, 'Info message');

      expect(consoleInfo).toHaveBeenCalledWith('[INFO] - Info message', undefined);
    });

    it('should log WARN level', () => {
      adapter.log(LogLevel.WARN, 'Warning message');

      expect(consoleWarn).toHaveBeenCalledWith('[WARN] - Warning message', undefined);
    });

    it('should log ERROR level', () => {
      adapter.log(LogLevel.ERROR, 'Error message');

      expect(consoleError).toHaveBeenCalledWith('[ERROR] - Error message', undefined);
    });

    it('should log with metadata', () => {
      const metadata = { userId: '123', action: 'login' };
      adapter.log(LogLevel.INFO, 'Info message', metadata);

      expect(consoleInfo).toHaveBeenCalledWith('[INFO] - Info message', metadata);
    });
  });

  describe('debug', () => {
    it('should log debug message', () => {
      adapter.debug('Debug message');

      expect(consoleDebug).toHaveBeenCalledWith('[DEBUG] Debug message');
    });

    it('should log debug with additional args', () => {
      adapter.debug('Debug message', { key: 'value' }, 'extra');

      expect(consoleDebug).toHaveBeenCalledWith('[DEBUG] Debug message', { key: 'value' }, 'extra');
    });
  });

  describe('info', () => {
    it('should log info message', () => {
      adapter.info('Info message');

      expect(consoleInfo).toHaveBeenCalledWith('[INFO] - Info message');
    });

    it('should log info with additional args', () => {
      adapter.info('Info message', { key: 'value' });

      expect(consoleInfo).toHaveBeenCalledWith('[INFO] - Info message', { key: 'value' });
    });
  });

  describe('warn', () => {
    it('should log warning message', () => {
      adapter.warn('Warning message');

      expect(consoleWarn).toHaveBeenCalledWith('[WARN] - Warning message');
    });

    it('should log warning with additional args', () => {
      adapter.warn('Warning message', { key: 'value' });

      expect(consoleWarn).toHaveBeenCalledWith('[WARN] - Warning message', { key: 'value' });
    });
  });

  describe('error', () => {
    it('should log error message', () => {
      adapter.error('Error message');

      expect(consoleError).toHaveBeenCalledWith('[ERROR] - Error message', undefined);
    });

    it('should log error with error object', () => {
      const error = new Error('Test error');
      adapter.error('Error message', error);

      expect(consoleError).toHaveBeenCalledWith('[ERROR] - Error message', error);
    });
  });
});

