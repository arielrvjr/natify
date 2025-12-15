# @nativefy-adapter/storage-async

Adapter de almacenamiento para Nativefy Framework usando `@react-native-async-storage/async-storage`.

## Instalación

```bash
pnpm add @nativefy-adapter/storage-async @react-native-async-storage/async-storage
```

## Cuándo Usar

| Adapter | Caso de Uso |
|---------|-------------|
| **storage-async** | Datos no sensibles, compatibilidad máxima |
| storage-mmkv | Alto rendimiento, datos frecuentes |
| storage-keychain | Datos sensibles (tokens, passwords) |

**AsyncStorage** es ideal para:
- Preferencias de usuario
- Cache de datos
- Estado de onboarding
- Configuraciones de app

**NO usar para**:
- Tokens de autenticación (usar Keychain)
- Contraseñas
- Datos sensibles

## Uso

### Configuración del Provider

```typescript
import { NativefyProvider } from "@nativefy/core";
import { AsyncStorageAdapter } from "@nativefy-adapter/storage-async";

const config = {
  storage: new AsyncStorageAdapter(),
  // ... otros adapters
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

function SettingsScreen() {
  const storage = useAdapter<StoragePort>("storage");

  // Guardar preferencias
  const saveTheme = async (theme: "light" | "dark") => {
    await storage.setItem("user_theme", theme);
  };

  // Leer preferencias
  const loadTheme = async () => {
    const theme = await storage.getItem<string>("user_theme");
    return theme || "light";
  };

  // Guardar objeto complejo
  const saveUserPreferences = async (prefs: UserPreferences) => {
    await storage.setItem("user_preferences", prefs);
  };

  // Leer objeto complejo
  const loadUserPreferences = async () => {
    const prefs = await storage.getItem<UserPreferences>("user_preferences");
    return prefs || defaultPreferences;
  };
}
```

### Ejemplo: Onboarding

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

### Ejemplo: Cache de Datos

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

| Método | Retorno | Descripción |
|--------|---------|-------------|
| `getItem<T>(key)` | `Promise<T \| null>` | Obtiene un valor por clave |
| `setItem<T>(key, value)` | `Promise<void>` | Guarda un valor |
| `removeItem(key)` | `Promise<void>` | Elimina un valor |
| `clear()` | `Promise<void>` | Limpia todo el storage |

### Tipos Soportados

El adapter serializa/deserializa automáticamente:

- `string`
- `number`
- `boolean`
- `object` (JSON serializable)
- `array` (JSON serializable)

## Limitaciones

- **Asíncrono**: Todas las operaciones son async (no bloquean)
- **Rendimiento**: Más lento que MMKV para operaciones frecuentes
- **Sin encriptación**: Los datos no están encriptados (usar Keychain para datos sensibles)
- **Límite de tamaño**: ~6MB en Android, sin límite en iOS

