# @natify/storage-async

Storage adapter for Natify Framework using `@react-native-async-storage/async-storage`.

## Installation

```bash
pnpm add @natify/storage-async @react-native-async-storage/async-storage
```

## When to Use

| Adapter | Use Case |
|---------|----------|
| **storage-async** | Non-sensitive data, maximum compatibility |
| storage-mmkv | High performance, frequent data access |
| storage-keychain | Sensitive data (tokens, passwords) |

**AsyncStorage** is ideal for:
- User preferences
- Data cache
- Onboarding state
- App configurations

**DO NOT use for**:
- Authentication tokens (use Keychain)
- Passwords
- Sensitive data

## Usage

### Provider Configuration

```typescript
import { NatifyProvider } from "@natify/core";
import { AsyncStorageAdapter } from "@natify/storage-async";

const config = {
  storage: new AsyncStorageAdapter(),
  // ... other adapters
};

function App() {
  return (
    <NatifyProvider config={config}>
      <MyApp />
    </NatifyProvider>
  );
}
```

### Usage in Components

```typescript
import { useAdapter, StoragePort } from "@natify/core";

function SettingsScreen() {
  const storage = useAdapter<StoragePort>("storage");

  // Save preferences
  const saveTheme = async (theme: "light" | "dark") => {
    await storage.setItem("user_theme", theme);
  };

  // Read preferences
  const loadTheme = async () => {
    const theme = await storage.getItem<string>("user_theme");
    return theme || "light";
  };

  // Save complex object
  const saveUserPreferences = async (prefs: UserPreferences) => {
    await storage.setItem("user_preferences", prefs);
  };

  // Read complex object
  const loadUserPreferences = async () => {
    const prefs = await storage.getItem<UserPreferences>("user_preferences");
    return prefs || defaultPreferences;
  };
}
```

### Example: Onboarding

```typescript
function OnboardingCheck() {
  const storage = useAdapter<StoragePort>("storage");
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    const completed = await storage.getItem<boolean>("onboarding_completed");
    setShowOnboarding(!completed);
  };

  const completeOnboarding = async () => {
    await storage.setItem("onboarding_completed", true);
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return <OnboardingFlow onComplete={completeOnboarding} />;
  }

  return <MainApp />;
}
```

### Example: Data Cache

```typescript
interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

function useCachedData<T>(key: string, fetcher: () => Promise<T>, ttl = 3600000) {
  const storage = useAdapter<StoragePort>("storage");

  const getData = async (): Promise<T> => {
    const cached = await storage.getItem<CachedData<T>>(`cache_${key}`);
    
    if (cached && Date.now() - cached.timestamp < cached.expiresIn) {
      return cached.data;
    }

    const freshData = await fetcher();
    await storage.setItem<CachedData<T>>(`cache_${key}`, {
      data: freshData,
      timestamp: Date.now(),
      expiresIn: ttl,
    });

    return freshData;
  };

  return { getData };
}
```

## API

### StoragePort

| Method | Return | Description |
|--------|--------|-------------|
| `getItem<T>(key)` | `Promise<T \| null>` | Gets a value by key |
| `setItem<T>(key, value)` | `Promise<void>` | Saves a value |
| `removeItem(key)` | `Promise<void>` | Removes a value |
| `clear()` | `Promise<void>` | Clears all storage |

### Supported Types

The adapter automatically serializes/deserializes:

- `string`
- `number`
- `boolean`
- `object` (JSON serializable)
- `array` (JSON serializable)

## Limitations

- **Asynchronous**: All operations are async (non-blocking)
- **Performance**: Slower than MMKV for frequent operations
- **No encryption**: Data is not encrypted (use Keychain for sensitive data)
- **Size limit**: ~6MB on Android, no limit on iOS
