import { createMMKV, MMKV } from 'react-native-mmkv';
import { StoragePort } from '@natify/core';
import { setMMKVValue } from './utils/setters';

export class MMKVStorageAdapter implements StoragePort {
  readonly capability = 'storage';
  private storage: MMKV;
  constructor(instanceId = 'natify-storage') {
    this.storage = createMMKV({ id: instanceId });
  }

  async getItem<T = string>(key: string): Promise<T | null> {
    const value = this.storage.getString(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  async setItem<T = string>(key: string, value: T): Promise<void> {
    setMMKVValue(this.storage, key, value);
    return Promise.resolve();
  }

  async removeItem(key: string): Promise<void> {
    this.storage.remove(key);
    return Promise.resolve();
  }

  async clear(): Promise<void> {
    this.storage.clearAll();
    return Promise.resolve();
  }
}
