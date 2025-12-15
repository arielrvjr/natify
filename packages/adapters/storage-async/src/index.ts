import { StoragePort } from '@nativefy/core';
import AsyncStorage, { AsyncStorageStatic } from '@react-native-async-storage/async-storage';

export class AsyncStorageAdapter implements StoragePort {
  readonly capability = 'storage';
  readonly storage: AsyncStorageStatic;

  constructor() {
    this.storage = AsyncStorage;
  }

  async clear(): Promise<void> {
    await this.storage.clear();
  }

  async getItem<T = string>(key: string): Promise<T | null> {
    const value = await this.storage.getItem(key);
    if (value === null) {
      return null;
    }
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  async setItem<T = string>(key: string, value: T): Promise<void> {
    if (typeof value === 'object') {
      this.storage.setItem(key, JSON.stringify(value));
    } else if (typeof value === 'string') {
      this.storage.setItem(key, value);
    } else if (typeof value === 'number') {
      this.storage.setItem(key, value.toString());
    } else if (typeof value === 'boolean') {
      this.storage.setItem(key, value.valueOf().toString());
    }
  }

  async removeItem(key: string): Promise<void> {
    await this.storage.removeItem(key);
  }
}
