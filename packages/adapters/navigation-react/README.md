# @nativefy/navigation-react

Adapter de navegación para Nativefy Framework usando `@react-navigation/native`.

## Instalación

```bash
pnpm add @nativefy/navigation-react @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context
```

### iOS

```bash
cd ios && pod install
```

### Android

No requiere configuración adicional.

## Uso

### 1. Definir Tipos de Rutas

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

### 2. Configurar el Adapter

```typescript
// App.tsx
import { NativefyProvider } from "@nativefy/core";
import { ReactNavigationAdapter } from "@nativefy/navigation-react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Crear el adapter (instancia global)
const navigationAdapter = new ReactNavigationAdapter();

const Stack = createNativeStackNavigator<RootStackParamList>();

const config = {
  navigation: navigationAdapter,
  // ... otros adapters
};

function App() {
  return (
    <NativefyProvider config={config}>
      {/* Importante: pasar la ref del adapter al NavigationContainer */}
      <NavigationContainer ref={navigationAdapter.navigationRef}>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </NativefyProvider>
  );
}
```

### 3. Uso en Componentes

```typescript
import { useAdapter, NavigationPort } from "@nativefy/core";

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
      <Button title="Ver Perfil" onPress={goToProfile} />
      <Button title="Configuración" onPress={goToSettings} />
    </View>
  );
}
```

### 4. Uso Fuera de React (Servicios, Interceptors)

Una de las ventajas principales del adapter es poder navegar desde cualquier lugar:

```typescript
// services/auth.service.ts
import { navigationAdapter } from "../config/nativefy";

class AuthService {
  async logout() {
    await this.clearTokens();

    // Navegar al login desde un servicio
    navigationAdapter.reset([{ name: "Login" }]);
  }
}

// En un interceptor HTTP
const httpAdapter = new AxiosHttpAdapter(
  "https://api.example.com",
  {},
  {
    onResponseError: async (error) => {
      if (error.response?.status === 401) {
        // Navegar al login cuando el token expira
        navigationAdapter.reset([{ name: "Login" }]);
      }
      return Promise.reject(error);
    },
  }
);
```

## API

### NavigationPort

| Método | Retorno | Descripción |
|--------|---------|-------------|
| `navigate(route, params?, options?)` | `void` | Navega a una pantalla |
| `goBack()` | `boolean` | Regresa a la pantalla anterior |
| `popToTop()` | `void` | Regresa al inicio del stack |
| `replace(route, params?)` | `void` | Reemplaza la pantalla actual |
| `reset(routes)` | `void` | Reinicia el stack de navegación |
| `getCurrentRoute()` | `string \| undefined` | Obtiene la ruta actual |
| `getCurrentParams()` | `T \| undefined` | Obtiene los parámetros actuales |
| `canGoBack()` | `boolean` | Verifica si puede regresar |
| `setOptions(options)` | `void` | Configura opciones de la pantalla |
| `addListener(event, callback)` | `() => void` | Agrega listener de eventos |

### Ejemplos de Navegación

```typescript
const navigation = useAdapter<NavigationPort>("navigation");

// Navegación simple
navigation.navigate("Home");

// Con parámetros
navigation.navigate("Profile", { userId: "123" });

// Reemplazar (no agrega al historial)
navigation.replace("Home");

// Regresar
if (navigation.canGoBack()) {
  navigation.goBack();
}

// Reset completo (útil después de login/logout)
navigation.reset([
  { name: "Home" },
  { name: "Profile", params: { userId: "123" } },
]);

// Configurar header dinámicamente
navigation.setOptions({
  title: "Nuevo Título",
  headerShown: true,
});
```

### Escuchar Eventos

```typescript
useEffect(() => {
  const unsubscribe = navigation.addListener("focus", () => {
    console.log("Pantalla enfocada - recargar datos");
    fetchData();
  });

  return unsubscribe;
}, []);
```

## Patrones Comunes

### Flujo de Autenticación

```typescript
function useAuthNavigation() {
  const navigation = useAdapter<NavigationPort>("navigation");
  const secureStorage = useAdapter<StoragePort>("secureStorage");

  const onLoginSuccess = async (token: string) => {
    await secureStorage.setItem("auth_token", token);

    // Resetear stack para que no pueda volver al login
    navigation.reset([{ name: "Home" }]);
  };

  const onLogout = async () => {
    await secureStorage.clear();

    // Resetear al login
    navigation.reset([{ name: "Login" }]);
  };

  return { onLoginSuccess, onLogout };
}
```

### Deep Linking

El adapter soporta deeplinks de forma automática. Configura los prefijos al crear el adapter:

```typescript
// App.tsx
import { createReactNavigationAdapter } from '@nativefy/navigation-react';

// Crear adapter con deeplinks (solo prefijos)
const navigationAdapter = createReactNavigationAdapter({
  prefixes: ['myapp://', 'https://myapp.com'],
});

// En NativefyApp (se pasa automáticamente)
<NativefyApp
  adapters={{ navigation: navigationAdapter }}
  modules={[AuthModule, ProductsModule]}
/>
```

**Configuración por pantalla (Recomendado):**

Define la configuración de deeplink en cada pantalla al crear el módulo:

```typescript
import { createModule } from "@nativefy/core";

export const ProductsModule = createModule("products", "Products")
  .screen({
    name: "ProductList",
    component: ProductListScreen,
    // Sin deeplink → se genera automáticamente: "products/productlist"
  })
  .screen({
    name: "ProductDetail",
    component: ProductDetailScreen,
    deeplink: {
      path: "product/:productId",
      parse: {
        productId: Number, // Convierte a número
      },
    },
  })
  .build();

// URLs resultantes:
// myapp://products/productlist (automático)
// myapp://product/123 (personalizado) → ProductDetail con { productId: 123 }
```

**URLs generadas automáticamente (sin configuración):**
- `myapp://auth/login` → `auth/Login`
- `myapp://products/productlist` → `products/ProductList`

**Con configuración personalizada por pantalla:**
- `myapp://product/123` → `products/ProductDetail` con `{ productId: 123 }`

Ver `DEEPLINKS.md` para documentación completa sobre deeplinks.

### Navegación Condicional

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

## Tipado Avanzado

Para tipado completo de parámetros, puedes usar el hook nativo de React Navigation:

```typescript
import { useNavigation } from "@nativefy/navigation-react";
import type { NativeStackNavigationProp } from "@nativefy/navigation-react";
import type { RootStackParamList } from "../types/navigation";

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Profile"
>;

function ProfileScreen() {
  // Tipado completo de rutas y parámetros
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  navigation.navigate("ProductDetail", {
    productId: "123",
    name: "Producto", // TypeScript valida los parámetros
  });
}
```

## Consideraciones

1. **Crear el adapter fuera de componentes**: Debe ser una instancia global
2. **Pasar la ref al NavigationContainer**: Obligatorio para que funcione
3. **Verificar isReady**: El adapter maneja esto internamente, pero ten en cuenta que la navegación no funciona antes de que el container esté montado

