import Keychain from 'react-native-keychain';
import { StoragePort } from '@nativefy/core';

export class KeychainStorageAdapter implements StoragePort {
  readonly capability: 'storage' = 'storage';
  async setItem<T = string>(key: string, value: T): Promise<void> {
    let genericPassword = null;
    if (typeof value === 'object') {
      genericPassword = JSON.stringify(value);
    } else if (typeof value === 'string') {
      genericPassword = value;
    } else if (typeof value === 'number') {
      genericPassword = value.toString();
    } else if (typeof value === 'boolean') {
      genericPassword = value.valueOf().toString();
    }

    const credentials = await Keychain.setGenericPassword(key, genericPassword!, {
      service: key,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
    });

    if (!credentials) {
      throw new Error(`[KeychainStorageAdapter] Failed to set item with key "${key}"`);
    }
  }

  async getItem<T = string>(key: string): Promise<T | null> {
    const credentials = await Keychain.getGenericPassword({ service: key });
    if (!credentials) {
      return null;
    }
    try {
      return JSON.parse(credentials.password) as T;
    } catch {
      return credentials.password as unknown as T;
    }
  }

  async removeItem(key: string): Promise<void> {
    const result = await Keychain.resetGenericPassword({
      service: key,
    });
    if (result === false) {
      throw new Error(`[KeychainStorageAdapter] Failed to remove item with key "${key}"`);
    }
  }
  async clear(): Promise<void> {
    const result = await Keychain.resetGenericPassword();
    if (result === false) {
      throw new Error(`[KeychainStorageAdapter] Failed to clear storage`);
    }
  }
}
