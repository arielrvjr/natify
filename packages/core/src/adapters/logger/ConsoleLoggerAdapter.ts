import { LoggerPort, LogLevel } from '../../ports';

export class ConsoleLoggerAdapter implements LoggerPort {
  readonly capability = 'logger';
  log(level: LogLevel, message: string, metadata?: object): void {
    switch (level) {
      case LogLevel.DEBUG:
        this.debug(message, metadata);
        break;
      case LogLevel.INFO:
        this.info(message, metadata);
        break;
      case LogLevel.WARN:
        this.warn(message, metadata);
        break;
      case LogLevel.ERROR:
        this.error(message, metadata);
        break;
      default:
        this.info(message, metadata);
    }
  }
  debug(message: string, ...args: any[]): void {
    // eslint-disable-next-line no-console
    console.debug(`[DEBUG] ${message}`, ...args);
  }

  info(message: string, ...args: any[]): void {
    // eslint-disable-next-line no-console
    console.info(`[INFO] - ${message}`, ...args);
  }

  warn(message: string, ...args: any[]): void {
    console.warn(`[WARN] - ${message}`, ...args);
  }

  error(message: string, error?: any): void {
    console.error(`[ERROR] - ${message}`, error);
  }
}
