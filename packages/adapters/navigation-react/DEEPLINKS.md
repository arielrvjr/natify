# Deeplinks con Navigation Adapter

Este documento explica cómo configurar y usar deeplinks con el adapter de navegación de React Navigation.

## 🚀 Configuración Básica

### 1. Crear el adapter con deeplinks

```typescript
import { createReactNavigationAdapter } from '@natify/navigation-react';

const navigationAdapter = createReactNavigationAdapter({
  prefixes: [
    'myapp://',              // Custom scheme
    'https://myapp.com',     // HTTPS
    'https://*.myapp.com',   // Wildcard subdomain
  ],
});
```

### 2. Usar en NatifyApp

El adapter automáticamente configura el `NavigationContainer` con linking:

```typescript
<NatifyApp
  adapters={{ navigation: navigationAdapter }}
  modules={[AuthModule, ProductsModule]}
/>
```

## 📱 Configuración Automática

El adapter genera automáticamente la configuración de linking basada en tus módulos:

```typescript
// Módulos registrados:
// - auth/Login
// - auth/Register
// - products/ProductList
// - products/ProductDetail

// URLs generadas automáticamente:
// myapp://auth/login
// myapp://auth/register
// myapp://products/productlist
// myapp://products/productdetail
```

## 🎯 Configuración por Pantalla (Recomendado)

Cada pantalla puede definir su propia configuración de deeplink al registrarse en el módulo:

```typescript
import { createModule } from "@natify/core";

export const ProductsModule = createModule("products", "Products")
  .screen({
    name: "ProductList",
    component: ProductListScreen,
    // Sin deeplink config → se genera automáticamente: "products/productlist"
  })
  .screen({
    name: "ProductDetail",
    component: ProductDetailScreen,
    // Configuración personalizada de deeplink
    deeplink: {
      path: "product/:productId",
      parse: {
        productId: (id: string) => id, // O Number para convertir a número
      },
    },
  })
  .build();

// URLs resultantes:
// myapp://products/productlist (automático)
// myapp://product/123 (personalizado) → ProductDetail con { productId: "123" }
```

### Ejemplos de Configuración por Pantalla

```typescript
// Ejemplo 1: Path personalizado simple
.screen({
  name: "Login",
  component: LoginScreen,
  deeplink: {
    path: "login", // En lugar de "auth/login"
  },
})

// Ejemplo 2: Con parámetros
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

// Ejemplo 3: Con múltiples parámetros
.screen({
  name: "UserProfile",
  component: UserProfileScreen,
  deeplink: {
    path: "user/:userId/:tab?",
    parse: {
      userId: Number,
      tab: (tab: string) => tab || "overview", // Valor por defecto
    },
  },
})

// Ejemplo 4: Con stringify (para generar URLs)
.screen({
  name: "ProductDetail",
  component: ProductDetailScreen,
  deeplink: {
    path: "product/:productId",
    parse: {
      productId: String,
    },
    stringify: {
      productId: (id: number) => String(id),
    },
  },
})
```

## 🔧 Configuración Global (Override)

Si necesitas un override completo o funciones avanzadas, puedes usar la configuración global del adapter:

```typescript
const navigationAdapter = createReactNavigationAdapter({
  prefixes: ['myapp://', 'https://myapp.com'],
  config: {
    screens: {
      // Override completo (ignora configuraciones de pantalla)
      'auth/Login': 'login',
      'products/ProductDetail': 'products/:productId',
    },
  },
});
```

**⚠️ Nota**: La configuración global del adapter tiene prioridad sobre las configuraciones de pantalla individuales.

### URLs con parámetros

```typescript
const navigationAdapter = createReactNavigationAdapter({
  prefixes: ['myapp://'],
  config: {
    screens: {
      'products/ProductDetail': {
        path: 'product/:productId',
        parse: {
          productId: (productId: string) => productId,
        },
      },
      'profile/Profile': {
        path: 'user/:userId',
        parse: {
          userId: Number, // Convierte a número
        },
      },
    },
  },
});

// URLs que funcionan:
// myapp://product/123
// myapp://user/456
```

### Navegación anidada

```typescript
const navigationAdapter = createReactNavigationAdapter({
  prefixes: ['myapp://'],
  config: {
    screens: {
      Main: {
        screens: {
          Home: 'home',
          Products: {
            screens: {
              ProductList: 'products',
              ProductDetail: 'products/:id',
            },
          },
        },
      },
    },
  },
});
```

## 🔧 Funciones Avanzadas

### Filtrar URLs

```typescript
const navigationAdapter = createReactNavigationAdapter({
  prefixes: ['myapp://'],
  filter: (url) => {
    // Solo procesar URLs que contengan 'deep'
    return url.includes('deep');
  },
});
```

### Obtener URL inicial personalizada

```typescript
import { Linking } from 'react-native';

const navigationAdapter = createReactNavigationAdapter({
  prefixes: ['myapp://'],
  getInitialURL: async () => {
    // Verificar si la app se abrió desde un deeplink
    const url = await Linking.getInitialURL();
    
    // Procesar o transformar la URL
    if (url?.includes('campaign')) {
      return url;
    }
    
    return undefined;
  },
});
```

### Suscribirse a cambios de URL

```typescript
import { Linking } from 'react-native';

const navigationAdapter = createReactNavigationAdapter({
  prefixes: ['myapp://'],
  subscribe: (listener) => {
    // Suscribirse a cambios de URL cuando la app está abierta
    const subscription = Linking.addEventListener('url', ({ url }) => {
      listener(url);
    });

    return () => {
      subscription.remove();
    };
  },
});
```

## 📱 Configuración Nativa

### iOS (Info.plist)

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>myapp</string>
    </array>
    <key>CFBundleURLName</key>
    <string>com.myapp</string>
  </dict>
</array>
```

### Android (AndroidManifest.xml)

```xml
<activity
  android:name=".MainActivity"
  android:launchMode="singleTask">
  <intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="myapp" />
  </intent-filter>
  
  <!-- Para HTTPS -->
  <intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data
      android:scheme="https"
      android:host="myapp.com" />
  </intent-filter>
</activity>
```

## 🧪 Probar Deeplinks

### iOS Simulator

```bash
xcrun simctl openurl booted "myapp://products/product/123"
```

### Android Emulator

```bash
adb shell am start -W -a android.intent.action.VIEW -d "myapp://products/product/123" com.myapp
```

### Desde terminal

```bash
# iOS
open "myapp://products/product/123"

# Android
adb shell am start -W -a android.intent.action.VIEW -d "myapp://products/product/123" com.myapp
```

## 📝 Ejemplos de Uso

### Ejemplo 1: Producto desde notificación

```typescript
// URL: myapp://products/product/123

// En ProductDetailScreen
import { useRoute } from '@react-navigation/native';

function ProductDetailScreen() {
  const route = useRoute();
  const { productId } = route.params; // "123"
  
  // Cargar producto...
}
```

### Ejemplo 2: Perfil de usuario

```typescript
// URL: myapp://user/456

// Configuración
config: {
  screens: {
    'profile/Profile': {
      path: 'user/:userId',
      parse: {
        userId: Number,
      },
    },
  },
}

// En ProfileScreen
function ProfileScreen() {
  const route = useRoute();
  const { userId } = route.params; // 456 (número)
}
```

### Ejemplo 3: Flujo de autenticación

```typescript
// URL: myapp://auth/reset-password?token=abc123

config: {
  screens: {
    'auth/ResetPassword': {
      path: 'auth/reset-password',
      parse: {
        token: String,
      },
    },
  },
}

// En ResetPasswordScreen
function ResetPasswordScreen() {
  const route = useRoute();
  const { token } = route.params; // "abc123"
}
```

## 🔍 Debugging

### Ver URL procesada

```typescript
import { Linking } from 'react-native';

// Ver URL inicial
Linking.getInitialURL().then(url => {
  console.log('Initial URL:', url);
});

// Escuchar cambios
Linking.addEventListener('url', ({ url }) => {
  console.log('Deeplink received:', url);
});
```

### Logs de React Navigation

React Navigation muestra logs cuando procesa deeplinks. Para verlos:

```typescript
import { NavigationContainer } from '@react-navigation/native';

// Habilitar logs (solo en desarrollo)
if (__DEV__) {
  NavigationContainer.useLinking = () => ({
    getInitialState: async () => {
      console.log('[Deeplink] Getting initial state...');
      // ...
    },
  });
}
```

## ⚠️ Consideraciones

1. **URLs universales**: Para HTTPS, configura App Links (Android) y Universal Links (iOS)
2. **Parámetros opcionales**: Usa `?` para parámetros opcionales: `product/:id?`
3. **Wildcards**: Usa `*` para wildcards: `products/*`
4. **Fallback**: Siempre define una ruta por defecto para URLs no reconocidas

## 📚 Recursos

- [React Navigation Deeplinking](https://reactnavigation.org/docs/deep-linking/)
- [iOS Universal Links](https://developer.apple.com/documentation/xcode/supporting-universal-links-in-your-app)
- [Android App Links](https://developer.android.com/training/app-links)

