import { LoggerPort, LogLevel } from '../../ports';

export class ConsoleLoggerAdapter implements LoggerPort {
  readonly capability = 'logger';

  /**
   * Mapa de niveles de log a sus funciones correspondientes
   */
  private readonly logHandlers: Record<LogLevel, (message: string, metadata?: object) => void> = {
    [LogLevel.DEBUG]: (message: string, metadata?: object) => this.debug(message, metadata),
    [LogLevel.INFO]: (message: string, metadata?: object) => this.info(message, metadata),
    [LogLevel.WARN]: (message: string, metadata?: object) => this.warn(message, metadata),
    [LogLevel.ERROR]: (message: string, metadata?: object) => this.error(message, metadata),
  };

  log(level: LogLevel, message: string, metadata?: object): void {
    const handler = this.logHandlers[level] ?? this.logHandlers[LogLevel.INFO];
    handler(message, metadata);
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
