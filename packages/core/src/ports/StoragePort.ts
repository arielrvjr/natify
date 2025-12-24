import { Port } from './Port';

export interface StoragePort extends Port {
  readonly capability: 'storage';
  getItem<T = string>(key: string): Promise<T | null>;
  setItem<T = string>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}
