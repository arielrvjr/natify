import { StoragePort } from '@natify/core';
import AsyncStorage, { AsyncStorageStatic } from '@react-native-async-storage/async-storage';
import { serializeValue } from './utils/serializers';

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
    await this.storage.setItem(key, serializeValue(value));
  }

  async removeItem(key: string): Promise<void> {
    await this.storage.removeItem(key);
  }
}

