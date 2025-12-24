import { MMKV } from 'react-native-mmkv';

/**
 * Establece un valor en MMKV según su tipo
 */
export function setMMKVValue<T>(storage: MMKV, key: string, value: T): void {
  const setters: Record<string, (val: T) => void> = {
    object: (val) => storage.set(key, JSON.stringify(val)),
    string: (val) => storage.set(key, val as unknown as string),
    number: (val) => storage.set(key, val as unknown as number),
    boolean: (val) => storage.set(key, val as unknown as boolean),
  };

  const type = typeof value;
  const setter = setters[type];

  if (setter) {
    setter(value);
  }
}

