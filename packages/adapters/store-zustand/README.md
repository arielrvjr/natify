# @nativefy-adapter/store-zustand

Adapter de gestión de estado para Nativefy Framework usando `zustand`.

## Instalación

```bash
pnpm add @nativefy-adapter/store-zustand zustand
```

## Por Qué Zustand

- **Mínimo boilerplate**: No requiere Providers ni reducers complejos
- **TypeScript first**: Tipado completo sin configuración extra
- **Rendimiento**: Solo re-renderiza componentes que usan el estado que cambió
- **Flexibilidad**: Funciona dentro y fuera de React

## Uso

### Configuración del Provider

```typescript
import { NativefyProvider } from "@nativefy/core";
import { ZustandStoreAdapter } from "@nativefy-adapter/store-zustand";

const config = {
  stateManager: new ZustandStoreAdapter(),
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

### Crear una Store

```typescript
import { useAdapter, StateManagerPort } from "@nativefy/core";

// Definir el tipo del estado
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

// Crear la store
function createAuthStore(stateManager: StateManagerPort) {
  return stateManager.createStore<AuthState>((set, get) => ({
    // Estado inicial
    user: null,
    isAuthenticated: false,

    // Acciones
    login: (user) => set({ user, isAuthenticated: true }),
    logout: () => set({ user: null, isAuthenticated: false }),
  }));
}

// Exportar para uso global
export const authStore = createAuthStore(stateManagerAdapter);
```

### Uso en Componentes

```typescript
function UserProfile() {
  // Selector específico - solo re-renderiza si 'user' cambia
  const user = authStore.useStore((state) => state.user);
  const logout = authStore.useStore((state) => state.logout);

  if (!user) {
    return <LoginPrompt />;
  }

  return (
    <View>
      <Text>Hola, {user.name}</Text>
      <Button title="Cerrar Sesión" onPress={logout} />
    </View>
  );
}

function AuthStatus() {
  // Otro componente, mismo store
  const isAuthenticated = authStore.useStore((state) => state.isAuthenticated);
  
  return <Text>{isAuthenticated ? "Conectado" : "Desconectado"}</Text>;
}
```

### Uso Fuera de React

```typescript
// En servicios, utilidades, etc.
function checkAuth() {
  const { isAuthenticated, user } = authStore.getState();
  
  if (!isAuthenticated) {
    throw new Error("No autenticado");
  }
  
  return user;
}

// Actualizar estado desde cualquier lugar
function handleTokenExpired() {
  authStore.setState({ user: null, isAuthenticated: false });
}

// Suscribirse a cambios
const unsubscribe = authStore.subscribe((state, prevState) => {
  if (state.isAuthenticated !== prevState.isAuthenticated) {
    console.log("Auth status changed:", state.isAuthenticated);
  }
});
```

### Ejemplo: Store de Carrito

```typescript
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clear: () => void;
}

function createCartStore(stateManager: StateManagerPort) {
  return stateManager.createStore<CartState>((set, get) => ({
    items: [],
    total: 0,

    addItem: (item) => {
      const { items } = get();
      const existing = items.find((i) => i.id === item.id);

      if (existing) {
        set({
          items: items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        });
      } else {
        set({ items: [...items, { ...item, quantity: 1 }] });
      }

      // Recalcular total
      const newItems = get().items;
      set({ total: newItems.reduce((sum, i) => sum + i.price * i.quantity, 0) });
    },

    removeItem: (id) => {
      const { items } = get();
      const newItems = items.filter((i) => i.id !== id);
      set({
        items: newItems,
        total: newItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
      });
    },

    updateQuantity: (id, quantity) => {
      if (quantity <= 0) {
        get().removeItem(id);
        return;
      }

      const { items } = get();
      const newItems = items.map((i) =>
        i.id === id ? { ...i, quantity } : i
      );
      set({
        items: newItems,
        total: newItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
      });
    },

    clear: () => set({ items: [], total: 0 }),
  }));
}
```

### Ejemplo: Store con Persistencia

```typescript
interface SettingsState {
  theme: "light" | "dark";
  language: string;
  notifications: boolean;
  setTheme: (theme: "light" | "dark") => void;
  setLanguage: (language: string) => void;
  toggleNotifications: () => void;
  hydrate: () => Promise<void>;
}

function createSettingsStore(
  stateManager: StateManagerPort,
  storage: StoragePort
) {
  const store = stateManager.createStore<SettingsState>((set, get) => ({
    theme: "light",
    language: "es",
    notifications: true,

    setTheme: async (theme) => {
      set({ theme });
      await storage.setItem("settings_theme", theme);
    },

    setLanguage: async (language) => {
      set({ language });
      await storage.setItem("settings_language", language);
    },

    toggleNotifications: async () => {
      const newValue = !get().notifications;
      set({ notifications: newValue });
      await storage.setItem("settings_notifications", newValue);
    },

    hydrate: async () => {
      const theme = await storage.getItem<"light" | "dark">("settings_theme");
      const language = await storage.getItem<string>("settings_language");
      const notifications = await storage.getItem<boolean>("settings_notifications");

      set({
        theme: theme || "light",
        language: language || "es",
        notifications: notifications ?? true,
      });
    },
  }));

  return store;
}
```

## API

### StateManagerPort

| Método | Retorno | Descripción |
|--------|---------|-------------|
| `createStore<T>(setup)` | `StoreApi<T>` | Crea una nueva store |

### StoreApi

| Propiedad/Método | Tipo | Descripción |
|------------------|------|-------------|
| `useStore(selector?)` | Hook | Selector reactivo para componentes |
| `getState()` | `T` | Obtiene el estado actual |
| `setState(partial)` | `void` | Actualiza el estado |
| `subscribe(listener)` | `() => void` | Suscribe a cambios, retorna unsubscribe |

### Selectores

```typescript
// Selector completo (re-renderiza en cualquier cambio)
const state = store.useStore();

// Selector específico (solo re-renderiza si ese valor cambia)
const user = store.useStore((s) => s.user);

// Selector derivado
const itemCount = store.useStore((s) => s.items.length);

// Múltiples valores (usar shallow comparison)
const { user, isLoading } = store.useStore(
  (s) => ({ user: s.user, isLoading: s.isLoading }),
  shallow
);
```

## Mejores Prácticas

1. **Un store por dominio**: AuthStore, CartStore, SettingsStore
2. **Selectores específicos**: Evita seleccionar todo el estado
3. **Acciones en el store**: Mantén la lógica de mutación dentro del store
4. **Tipado fuerte**: Define interfaces para todo el estado

