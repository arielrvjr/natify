# @nativefy/storage-mmkv

The **High Performance Storage Adapter** for the Nativefy Framework.
This package implements the `IAsyncStorage` interface using [react-native-mmkv](https://www.google.com/search?q=https://github.com/mamous/react-native-mmkv), which is roughly **30x faster** than the standard AsyncStorage

**Architectural Note:** Although MMKV is synchronous by nature, this adapter wraps operations in Promises to maintain interchangeability with other `IAsyncStorage` implementations (like Keychain or filesystem-based storage).

## Installation

Since this is an adapter, you must install both the package and its native driver (Peer Dependency) in your application.

### Using pnpm (Recommended)

**Bash**

```
pnpm add @nativefy/storage-mmkv react-native-mmkv
```

### Using yarn

**Bash**

```
yarn add @nativefy/storage-mmkv react-native-mmkv
```

### Native Linking (Required)

After installation, you must install the pods for iOS and rebuild your application since MMKV uses C++ JSI bindings.

**Bash**

```
cd ios && pod install && cd ..
# Rebuild the app
pnpm run android # or pnpm run ios
```

---

## Setup & Integration

Register this adapter in your `NativefyProvider` configuration at the root of your application (`App.tsx`).

**TypeScript**

```
import { NativefyProvider } from '@nativefy/core';
import { MMKVAdapter } from '@nativefy/storage-mmkv';
import { AxiosHttpAdapter } from '@nativefy/http-axios';

// 1. Instantiate the adapter
// Optional: You can pass an instance ID for data isolation
const fastStorage = new MMKVAdapter('user-preferences');

// 2. Register in the config container
const config = {
  // Register by specific name (recommended)
  'storage-fast': fastStorage,

  // Or register as the default 'storage' capability
  'storage': fastStorage,

  // ... other adapters
  'http': new AxiosHttpAdapter()
};

export default function App() {
  return (
    <NativefyProvider config={config}>
      <YourMainNavigator />
    </NativefyProvider>
  );
}
```

---

## Usage

Consume the storage anywhere in your components using the `useAdapter` hook. You don't need to import this package directly in your UI components, just use the Core interfaces.

### By Capability Name (Generic)

Get the first available adapter that handles `'storage'`.

**TypeScript**

```
import { useAdapter } from '@nativefy/core';
import { IAsyncStorage } from '@nativefy/core/interfaces';

const SettingsScreen = () => {
  // Returns the default storage adapter
  const storage = useAdapter<IAsyncStorage>('storage');

  const saveTheme = async () => {
    await storage.setItem('theme', 'dark');
  };
};
```

### By Instance Name (Specific)

If you registered it as `'storage-fast'` in the config.

**TypeScript**

```
import { useAdapter } from '@nativefy/core';
import { IAsyncStorage } from '@nativefy/core/interfaces';

const CacheManager = () => {
  // Explicitly request the fast storage (MMKV)
  const fastStorage = useAdapter<IAsyncStorage>('storage-fast');

  const clearCache = async () => {
    await fastStorage.clear();
  };
};
```

---

## API Reference

This adapter fully implements `IAsyncStorage`.

| **Method**   | **Signature**                                      | **Description**                                   |
| ------------ | -------------------------------------------------- | ------------------------------------------------- |
| `getItem`    | `getItem<T>(key: string): Promise<T \| null>`      | Retrieves a value. Auto-parses JSON if possible.  |
| `setItem`    | `setItem<T>(key: string, value: T): Promise<void>` | Saves a value. Auto-stringifies objects/arrays.   |
| `removeItem` | `removeItem(key: string): Promise<void>`           | Deletes a single key.                             |
| `clear`      | `clear(): Promise<void>`                           | **Warning:**Wipes all data in this MMKV instance. |

### Capability Tag

- **Property:** `capability`
- **Value:** `'storage'`

---

## Troubleshooting

#### `Error: MMKV JSI bindings are not installed`

This means the native C++ code isn't linked.

1. Ensure you installed `react-native-mmkv` in your **App's** `package.json`.
2. Run `cd ios && pod install`.
3. Kill the Metro Bundler and restart with cache reset: `pnpm start --reset-cache`.
4. Rebuild the app binary (`pnpm run ios` / `pnpm run android`).

#### `Unable to resolve module react-native-mmkv`

If using a Monorepo, ensure `react-native-mmkv` is hoisted or installed in the app's dependencies, not just inside the adapter.
