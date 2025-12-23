import { ConsoleLoggerAdapter } from '../ConsoleLoggerAdapter';
import { LogLevel } from '../../../ports/LoggerPort';

describe('ConsoleLoggerAdapter', () => {
  let adapter: ConsoleLoggerAdapter;
  let consoleDebug: jest.SpyInstance;
  let consoleInfo: jest.SpyInstance;
  let consoleWarn: jest.SpyInstance;
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    adapter = new ConsoleLoggerAdapter();
    consoleDebug = jest.spyOn(console, 'debug').mockImplementation();
    consoleInfo = jest.spyOn(console, 'info').mockImplementation();
    consoleWarn = jest.spyOn(console, 'warn').mockImplementation();
    consoleError = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should have logger capability', () => {
    expect(adapter.capability).toBe('logger');
  });

  it('should log debug messages', () => {
    adapter.debug('Debug message');
    expect(consoleDebug).toHaveBeenCalledWith('[DEBUG] Debug message');
  });

  it('should log info messages', () => {
    adapter.info('Info message');
    expect(consoleInfo).toHaveBeenCalledWith('[INFO] - Info message');
  });

  it('should log warn messages', () => {
    adapter.warn('Warn message');
    expect(consoleWarn).toHaveBeenCalledWith('[WARN] - Warn message');
  });

  it('should log error messages', () => {
    const error = new Error('Test error');
    adapter.error('Error message', error);
    expect(consoleError).toHaveBeenCalledWith('[ERROR] - Error message', error);
  });

  it('should use log method with DEBUG level', () => {
    adapter.log(LogLevel.DEBUG, 'Debug via log');
    expect(consoleDebug).toHaveBeenCalledWith('[DEBUG] Debug via log', undefined);
  });

  it('should use log method with INFO level', () => {
    adapter.log(LogLevel.INFO, 'Info via log');
    expect(consoleInfo).toHaveBeenCalledWith('[INFO] - Info via log', undefined);
  });

  it('should use log method with WARN level', () => {
    adapter.log(LogLevel.WARN, 'Warn via log');
    expect(consoleWarn).toHaveBeenCalledWith('[WARN] - Warn via log', undefined);
  });

  it('should use log method with ERROR level', () => {
    adapter.log(LogLevel.ERROR, 'Error via log');
    expect(consoleError).toHaveBeenCalledWith('[ERROR] - Error via log', undefined);
  });

  it('should default to info for unknown log level', () => {
    // Usar un valor numérico que no esté en el enum para forzar el default
    adapter.log(999 as LogLevel, 'Unknown level');
    expect(consoleInfo).toHaveBeenCalledWith('[INFO] - Unknown level', undefined);
  });
});
