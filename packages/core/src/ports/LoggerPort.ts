import { Port } from './Port';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LoggerPort extends Port {
  readonly capability: 'logger';
  log(level: LogLevel, message: string, metadata?: object): void;
  debug(message: string, metadata?: object): void;
  info(message: string, metadata?: object): void;
  warn(message: string, metadata?: object): void;
  error(message: string, error?: Error, metadata?: object): void;
}
