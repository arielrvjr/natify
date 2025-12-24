# @natify/storage-keychain

Secure storage adapter for Natify Framework using `react-native-keychain`.

## Installation

```bash
pnpm add @natify/storage-keychain react-native-keychain
```

## When to Use

| Adapter | Use Case |
|---------|----------|
| storage-async | Non-sensitive data, compatibility |
| storage-mmkv | High performance, frequent data |
| **storage-keychain** | **Sensitive data (tokens, passwords)** |

**Keychain** uses native system encryption:
- **iOS**: Keychain Services (AES-256)
- **Android**: Keystore + EncryptedSharedPreferences

**Use for**:
- Authentication tokens
- Refresh tokens
- API keys
- Passwords
- Sensitive personal data

## Usage

### Provider Configuration

```typescript
import { NatifyProvider } from "@natify/core";
import { KeychainStorageAdapter } from "@natify/storage-keychain";
import { MMKVStorageAdapter } from "@natify/storage-mmkv";

const config = {
  // Regular storage for non-sensitive data
  storage: new MMKVStorageAdapter(),
  // Secure storage for sensitive data
  secureStorage: new KeychainStorageAdapter(),
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

function AuthService() {
  const secureStorage = useAdapter<StoragePort>("secureStorage");

  // Save tokens after login
  const saveAuthTokens = async (accessToken: string, refreshToken: string) => {
    await secureStorage.setItem("access_token", accessToken);
    await secureStorage.setItem("refresh_token", refreshToken);
  };

  // Retrieve token for requests
  const getAccessToken = async (): Promise<string | null> => {
    return secureStorage.getItem<string>("access_token");
  };

  // Clear tokens on logout
  const clearAuthTokens = async () => {
    await secureStorage.removeItem("access_token");
    await secureStorage.removeItem("refresh_token");
  };
}
```

### Example: Complete Login

```typescript
function useAuth() {
  const http = useAdapter<HttpClientPort>("http");
  const secureStorage = useAdapter<StoragePort>("secureStorage");
  const biometrics = useAdapter<BiometricPort>("biometrics");

  const login = async (email: string, password: string) => {
    const response = await http.post<AuthResponse>("/auth/login", {
      email,
      password,
    });

    // Save tokens securely
    await secureStorage.setItem("access_token", response.data.accessToken);
    await secureStorage.setItem("refresh_token", response.data.refreshToken);
    await secureStorage.setItem("user_email", email);

    // Set header for future requests
    http.setHeader("Authorization", `Bearer ${response.data.accessToken}`);
  };

  const loginWithBiometrics = async () => {
    // Check if there are saved credentials
    const savedEmail = await secureStorage.getItem<string>("user_email");
    if (!savedEmail) {
      throw new Error("No saved session");
    }

    // Authenticate with biometrics
    const { success } = await biometrics.authenticate("Confirm your identity");
    if (!success) {
      throw new Error("Biometric authentication failed");
    }

    // Retrieve and use saved token
    const token = await secureStorage.getItem<string>("access_token");
    http.setHeader("Authorization", `Bearer ${token}`);
  };

  const logout = async () => {
    await secureStorage.clear();
    http.removeHeader("Authorization");
  };

  return { login, loginWithBiometrics, logout };
}
```

### Example: Store Sensitive Data

```typescript
interface SecureUserData {
  ssn?: string;
  bankAccount?: string;
  pin?: string;
}

function SecureDataManager() {
  const secureStorage = useAdapter<StoragePort>("secureStorage");

  const saveSecureData = async (data: SecureUserData) => {
    await secureStorage.setItem("secure_user_data", data);
  };

  const getSecureData = async (): Promise<SecureUserData | null> => {
    return secureStorage.getItem<SecureUserData>("secure_user_data");
  };

  const clearSecureData = async () => {
    await secureStorage.removeItem("secure_user_data");
  };
}
```

## API

### StoragePort

| Method | Return | Description |
|--------|--------|-------------|
| `getItem<T>(key)` | `Promise<T \| null>` | Gets an encrypted value |
| `setItem<T>(key, value)` | `Promise<void>` | Saves an encrypted value |
| `removeItem(key)` | `Promise<void>` | Removes a value |
| `clear()` | `Promise<void>` | Clears all secure storage |

## Security Configuration

The adapter uses `ACCESSIBLE.WHEN_UNLOCKED` by default, which means:
- Data is only accessible when the device is unlocked
- Maximum security for sensitive data

## Considerations

### Performance
- Slower than MMKV/AsyncStorage due to encryption
- Use only for data that really needs security

### Limits
- Each item is saved as a separate "credential"
- Ideal for few high-value items (tokens, keys)

### Migration
If you switch from AsyncStorage to Keychain, you must migrate the data:

```typescript
const migrateToSecure = async () => {
  const oldToken = await asyncStorage.getItem("auth_token");
  if (oldToken) {
    await keychainStorage.setItem("auth_token", oldToken);
    await asyncStorage.removeItem("auth_token");
  }
};
```
