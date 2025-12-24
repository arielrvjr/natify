# @natify/store-zustand

State management adapter for Natify Framework using `zustand`.

## Installation

```bash
pnpm add @natify/store-zustand zustand
```

## Why Zustand

- **Minimal boilerplate**: No Providers or complex reducers required
- **TypeScript first**: Full typing without extra configuration
- **Performance**: Only re-renders components using the changed state
- **Flexibility**: Works inside and outside React

## Usage

### Provider Configuration

```typescript
import { NatifyProvider } from "@natify/core";
import { ZustandStoreAdapter } from "@natify/store-zustand";

const config = {
  stateManager: new ZustandStoreAdapter(),
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

### Create a Store

```typescript
import { useAdapter, StateManagerPort } from "@natify/core";

// Define state type
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

// Create store
function createAuthStore(stateManager: StateManagerPort) {
  return stateManager.createStore<AuthState>((set, get) => ({
    // Initial state
    user: null,
    isAuthenticated: false,

    // Actions
    login: (user) => set({ user, isAuthenticated: true }),
    logout: () => set({ user: null, isAuthenticated: false }),
  }));
}

// Export for global use
export const authStore = createAuthStore(stateManagerAdapter);
```

### Usage in Components

```typescript
function UserProfile() {
  // Specific selector - only re-renders if 'user' changes
  const user = authStore.useStore((state) => state.user);
  const logout = authStore.useStore((state) => state.logout);

  if (!user) {
    return <LoginPrompt />;
  }

  return (
    <View>
      <Text>Hello, {user.name}</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}

function AuthStatus() {
  // Another component, same store
  const isAuthenticated = authStore.useStore((state) => state.isAuthenticated);
  
  return <Text>{isAuthenticated ? "Connected" : "Disconnected"}</Text>;
}
```

### Usage Outside React

```typescript
// In services, utilities, etc.
function checkAuth() {
  const { isAuthenticated, user } = authStore.getState();
  
  if (!isAuthenticated) {
    throw new Error("Not authenticated");
  }
  
  return user;
}

// Update state from anywhere
function handleTokenExpired() {
  authStore.setState({ user: null, isAuthenticated: false });
}

// Subscribe to changes
const unsubscribe = authStore.subscribe((state, prevState) => {
  if (state.isAuthenticated !== prevState.isAuthenticated) {
    console.log("Auth status changed:", state.isAuthenticated);
  }
});
```

### Example: Cart Store

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

      // Recalculate total
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

### Example: Store with Persistence

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
    language: "en",
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
        language: language || "en",
        notifications: notifications ?? true,
      });
    },
  }));

  return store;
}
```

## API

### StateManagerPort

| Method | Return | Description |
|--------|--------|-------------|
| `createStore<T>(setup)` | `StoreApi<T>` | Creates a new store |

### StoreApi

| Property/Method | Type | Description |
|-----------------|------|-------------|
| `useStore(selector?)` | Hook | Reactive selector for components |
| `getState()` | `T` | Gets current state |
| `setState(partial)` | `void` | Updates state |
| `subscribe(listener)` | `() => void` | Subscribes to changes, returns unsubscribe |

### Selectors

```typescript
// Complete selector (re-renders on any change)
const state = store.useStore();

// Specific selector (only re-renders if that value changes)
const user = store.useStore((s) => s.user);

// Derived selector
const itemCount = store.useStore((s) => s.items.length);

// Multiple values (use shallow comparison)
const { user, isLoading } = store.useStore(
  (s) => ({ user: s.user, isLoading: s.isLoading }),
  shallow
);
```

## Best Practices

1. **One store per domain**: AuthStore, CartStore, SettingsStore
2. **Specific selectors**: Avoid selecting the entire state
3. **Actions in store**: Keep mutation logic inside the store
4. **Strong typing**: Define interfaces for all state
