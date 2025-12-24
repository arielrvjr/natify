# @natify/navigation-react

Navigation adapter for Natify Framework using `@react-navigation/native`.

## Installation

```bash
pnpm add @natify/navigation-react @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context
```

### iOS

```bash
cd ios && pod install
```

### Android

No additional configuration required.

## Usage

### 1. Define Route Types

```typescript
// types/navigation.ts
export type RootStackParamList = {
  Home: undefined;
  Profile: { userId: string };
  Settings: undefined;
  Login: undefined;
  ProductDetail: { productId: string; name: string };
};
```

### 2. Configure the Adapter

#### With NatifyApp (Recommended)

```typescript
// App.tsx
import { NatifyApp } from "@natify/core";
import { createReactNavigationAdapter } from "@natify/navigation-react";

// Create adapter with configuration
const navigationAdapter = createReactNavigationAdapter({
  theme: 'dark',
  screenOptions: {
    headerStyle: { backgroundColor: '#000' },
    headerTintColor: '#fff',
  },
  deeplinkConfig: {
    prefixes: ['myapp://', 'https://myapp.com'],
  },
});

export default function App() {
  return (
    <NatifyApp
      adapters={{ navigation: navigationAdapter }}
      modules={[AuthModule, ProductsModule]}
    />
  );
}
```

#### With NatifyProvider (Level 1 - Abstraction Only)

```typescript
// App.tsx
import { NatifyProvider } from "@natify/core";
import { createReactNavigationAdapter } from "@natify/navigation-react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Create adapter with configuration
const navigationAdapter = createReactNavigationAdapter({
  theme: 'light',
  screenOptions: {
    headerShown: true,
  },
});

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  return (
    <NatifyProvider adapters={{ navigation: navigationAdapter }}>
      <NavigationContainer ref={navigationAdapter.navigationRef}>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </NatifyProvider>
  );
}
```

### 3. Usage in Components

```typescript
import { useAdapter, NavigationPort } from "@natify/core";

function HomeScreen() {
  const navigation = useAdapter<NavigationPort>("navigation");

  const goToProfile = () => {
    navigation.navigate("Profile", { userId: "123" });
  };

  const goToSettings = () => {
    navigation.navigate("Settings");
  };

  return (
    <View>
      <Button title="View Profile" onPress={goToProfile} />
      <Button title="Settings" onPress={goToSettings} />
    </View>
  );
}
```

### 4. Usage Outside React (Services, Interceptors)

One of the main advantages of the adapter is being able to navigate from anywhere:

```typescript
// services/auth.service.ts
import { navigationAdapter } from "../config/natify";

class AuthService {
  async logout() {
    await this.clearTokens();

    // Navigate to login from a service
    navigationAdapter.reset([{ name: "Login" }]);
  }
}

// In an HTTP interceptor
const httpAdapter = new AxiosHttpAdapter(
  "https://api.example.com",
  {},
  {
    onResponseError: async (error) => {
      if (error.response?.status === 401) {
        // Navigate to login when token expires
        navigationAdapter.reset([{ name: "Login" }]);
      }
      return Promise.reject(error);
    },
  }
);
```

## API

### NavigationPort

| Method | Return | Description |
|--------|--------|-------------|
| `navigate(route, params?, options?)` | `void` | Navigates to a screen |
| `goBack()` | `boolean` | Goes back to previous screen |
| `popToTop()` | `void` | Goes back to the beginning of the stack |
| `replace(route, params?)` | `void` | Replaces current screen |
| `reset(routes)` | `void` | Resets navigation stack |
| `getCurrentRoute()` | `string \| undefined` | Gets current route |
| `getCurrentParams()` | `T \| undefined` | Gets current parameters |
| `canGoBack()` | `boolean` | Checks if can go back |
| `setOptions(options)` | `void` | Configures screen options |
| `addListener(event, callback)` | `() => void` | Adds event listener |

### Navigation Examples

```typescript
const navigation = useAdapter<NavigationPort>("navigation");

// Simple navigation
navigation.navigate("Home");

// With parameters
navigation.navigate("Profile", { userId: "123" });

// Replace (doesn't add to history)
navigation.replace("Home");

// Go back
if (navigation.canGoBack()) {
  navigation.goBack();
}

// Complete reset (useful after login/logout)
navigation.reset([
  { name: "Home" },
  { name: "Profile", params: { userId: "123" } },
]);

// Configure header dynamically
navigation.setOptions({
  title: "New Title",
  headerShown: true,
});
```

### Listening to Events

```typescript
useEffect(() => {
  const unsubscribe = navigation.addListener("focus", () => {
    console.log("Screen focused - reload data");
    fetchData();
  });

  return unsubscribe;
}, []);
```

## Common Patterns

### Authentication Flow

```typescript
function useAuthNavigation() {
  const navigation = useAdapter<NavigationPort>("navigation");
  const secureStorage = useAdapter<StoragePort>("secureStorage");

  const onLoginSuccess = async (token: string) => {
    await secureStorage.setItem("auth_token", token);

    // Reset stack so user can't go back to login
    navigation.reset([{ name: "Home" }]);
  };

  const onLogout = async () => {
    await secureStorage.clear();

    // Reset to login
    navigation.reset([{ name: "Login" }]);
  };

  return { onLoginSuccess, onLogout };
}
```

### Deep Linking

The adapter supports deeplinks automatically. Configure prefixes when creating the adapter:

```typescript
// App.tsx
import { createReactNavigationAdapter } from '@natify/navigation-react';

// Create adapter with deeplinks
const navigationAdapter = createReactNavigationAdapter({
  deeplinkConfig: {
    prefixes: ['myapp://', 'https://myapp.com'],
  },
});

// In NatifyApp (passed automatically)
<NatifyApp
  adapters={{ navigation: navigationAdapter }}
  modules={[AuthModule, ProductsModule]}
/>
```

**With theme and screenOptions:**

```typescript
const navigationAdapter = createReactNavigationAdapter({
  theme: 'dark', // 'light' | 'dark' | Theme object
  screenOptions: {
    headerStyle: { backgroundColor: '#000' },
    headerTintColor: '#fff',
    headerShown: true,
  },
  deeplinkConfig: {
    prefixes: ['myapp://'],
  },
});
```

**Per-screen configuration (Recommended):**

Define deeplink configuration for each screen when creating the module:

```typescript
import { createModule } from "@natify/core";

export const ProductsModule = createModule("products", "Products")
  .screen({
    name: "ProductList",
    component: ProductListScreen,
    // No deeplink → automatically generated: "products/productlist"
  })
  .screen({
    name: "ProductDetail",
    component: ProductDetailScreen,
    deeplink: {
      path: "product/:productId",
      parse: {
        productId: Number, // Converts to number
      },
    },
  })
  .build();

// Resulting URLs:
// myapp://products/productlist (automatic)
// myapp://product/123 (custom) → ProductDetail with { productId: 123 }
```

**Automatically generated URLs (without configuration):**
- `myapp://auth/login` → `auth/Login`
- `myapp://products/productlist` → `products/ProductList`

**With custom per-screen configuration:**
- `myapp://product/123` → `products/ProductDetail` with `{ productId: 123 }`

See `DEEPLINKS.md` for complete deeplink documentation.

### Conditional Navigation

```typescript
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const navigation = useAdapter<NavigationPort>("navigation");
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.replace("Login");
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

## Advanced Typing

For complete parameter typing, you can use React Navigation's native hook:

```typescript
import { useNavigation } from "@natify/navigation-react";
import type { NativeStackNavigationProp } from "@natify/navigation-react";
import type { RootStackParamList } from "../types/navigation";

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Profile"
>;

function ProfileScreen() {
  // Complete route and parameter typing
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  navigation.navigate("ProductDetail", {
    productId: "123",
    name: "Product", // TypeScript validates parameters
  });
}
```

## Adapter Configuration

### Configuration Options

```typescript
interface ReactNavigationAdapterConfig {
  /**
   * Deeplink configuration (optional)
   */
  deeplinkConfig?: {
    prefixes: string[];
    config?: LinkingOptions['config'];
    filter?: (url: string) => boolean;
    getInitialURL?: () => Promise<string | null | undefined>;
    subscribe?: (listener: (url: string) => void) => () => void;
  };

  /**
   * Navigation theme ('light' | 'dark' | React Navigation Theme object)
   */
  theme?: 'light' | 'dark' | Theme;

  /**
   * Global screen options
   * Applied to all screens in the stack navigator
   */
  screenOptions?: ScreenOptions;
}
```

### Configuration Examples

```typescript
// Minimal configuration
const adapter1 = createReactNavigationAdapter();

// Theme only
const adapter2 = createReactNavigationAdapter({
  theme: 'dark',
});

// Theme and screenOptions
const adapter3 = createReactNavigationAdapter({
  theme: 'dark',
  screenOptions: {
    headerStyle: { backgroundColor: '#1a1a1a' },
    headerTintColor: '#fff',
    headerTitleStyle: { fontWeight: 'bold' },
  },
});

// Complete configuration
const adapter4 = createReactNavigationAdapter({
  theme: 'dark',
  screenOptions: {
    headerShown: true,
    animation: 'slide_from_right',
  },
  deeplinkConfig: {
    prefixes: ['myapp://', 'https://myapp.com'],
  },
});
```

## Considerations

1. **Create adapter outside components**: Must be a global instance
2. **Configuration in adapter**: `theme` and `screenOptions` are configured when creating the adapter, not in `NatifyApp`
3. **Verify isReady**: The adapter handles this internally, but keep in mind that navigation doesn't work before the container is mounted
