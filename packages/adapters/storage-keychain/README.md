# @nativefy-adapter/storage-keychain

Adapter de almacenamiento seguro para Nativefy Framework usando `react-native-keychain`.

## Instalación

```bash
pnpm add @nativefy-adapter/storage-keychain react-native-keychain
```

## Cuándo Usar

| Adapter | Caso de Uso |
|---------|-------------|
| storage-async | Datos no sensibles, compatibilidad |
| storage-mmkv | Alto rendimiento, datos frecuentes |
| **storage-keychain** | **Datos sensibles (tokens, passwords)** |

**Keychain** usa encriptación nativa del sistema:
- **iOS**: Keychain Services (AES-256)
- **Android**: Keystore + EncryptedSharedPreferences

**Usar para**:
- Tokens de autenticación
- Refresh tokens
- API keys
- Contraseñas
- Datos personales sensibles

## Uso

### Configuración del Provider

```typescript
import { NativefyProvider } from "@nativefy/core";
import { KeychainStorageAdapter } from "@nativefy-adapter/storage-keychain";
import { MMKVStorageAdapter } from "@nativefy-adapter/storage-mmkv";

const config = {
  // Storage regular para datos no sensibles
  storage: new MMKVStorageAdapter(),
  // Storage seguro para datos sensibles
  secureStorage: new KeychainStorageAdapter(),
};

function App() {
  return (
    <NativefyProvider config={config}>
      <MyApp />
    </NativefyProvider>
  );
}
```

### Uso en Componentes

```typescript
import { useAdapter, StoragePort } from "@nativefy/core";

function AuthService() {
  const secureStorage = useAdapter<StoragePort>("secureStorage");

  // Guardar tokens después del login
  const saveAuthTokens = async (accessToken: string, refreshToken: string) => {
    await secureStorage.setItem("access_token", accessToken);
    await secureStorage.setItem("refresh_token", refreshToken);
  };

  // Recuperar token para peticiones
  const getAccessToken = async (): Promise<string | null> => {
    return secureStorage.getItem<string>("access_token");
  };

  // Limpiar tokens en logout
  const clearAuthTokens = async () => {
    await secureStorage.removeItem("access_token");
    await secureStorage.removeItem("refresh_token");
  };
}
```

### Ejemplo: Login Completo

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

    // Guardar tokens de forma segura
    await secureStorage.setItem("access_token", response.data.accessToken);
    await secureStorage.setItem("refresh_token", response.data.refreshToken);
    await secureStorage.setItem("user_email", email);

    // Configurar header para futuras peticiones
    http.setHeader("Authorization", `Bearer ${response.data.accessToken}`);
  };

  const loginWithBiometrics = async () => {
    // Verificar si hay credenciales guardadas
    const savedEmail = await secureStorage.getItem<string>("user_email");
    if (!savedEmail) {
      throw new Error("No hay sesión guardada");
    }

    // Autenticar con biometría
    const { success } = await biometrics.authenticate("Confirma tu identidad");
    if (!success) {
      throw new Error("Autenticación biométrica fallida");
    }

    // Recuperar y usar token guardado
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

### Ejemplo: Almacenar Datos Sensibles

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

| Método | Retorno | Descripción |
|--------|---------|-------------|
| `getItem<T>(key)` | `Promise<T \| null>` | Obtiene un valor encriptado |
| `setItem<T>(key, value)` | `Promise<void>` | Guarda un valor encriptado |
| `removeItem(key)` | `Promise<void>` | Elimina un valor |
| `clear()` | `Promise<void>` | Limpia todo el storage seguro |

## Configuración de Seguridad

El adapter usa `ACCESSIBLE.WHEN_UNLOCKED` por defecto, lo que significa:
- Los datos solo son accesibles cuando el dispositivo está desbloqueado
- Máxima seguridad para datos sensibles

## Consideraciones

### Rendimiento
- Más lento que MMKV/AsyncStorage debido a la encriptación
- Usar solo para datos que realmente necesitan seguridad

### Límites
- Cada item se guarda como una "credencial" separada
- Ideal para pocos items de alto valor (tokens, keys)

### Migración
Si cambias de AsyncStorage a Keychain, debes migrar los datos:

```typescript
const migrateToSecure = async () => {
  const oldToken = await asyncStorage.getItem("auth_token");
  if (oldToken) {
    await keychainStorage.setItem("auth_token", oldToken);
    await asyncStorage.removeItem("auth_token");
  }
};
```

