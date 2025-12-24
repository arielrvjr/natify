import React, { StrictMode } from 'react';
import { StatusBar, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NatifyApp } from '@natify/core';
import { AxiosHttpAdapter } from '@natify/http-axios';
import { MMKVStorageAdapter } from '@natify/storage-mmkv';
import { KeychainStorageAdapter } from '@natify/storage-keychain';
import { createReactNavigationAdapter } from '@natify/navigation-react';
import { RnBiometricAdapter } from '@natify/biometrics-rn';
import { RnPermissionsAdapter } from '@natify/permissions-rn';
import { RnImagePickerAdapter } from '@natify/image-picker-rn';
// Módulos
import {
  AuthModule,
  ProductsModule,
  ProfileModule,
  SharedModule,
} from './modules';
import { ThemeProvider, useTheme } from '@natify/ui';

// Crear adapters
const httpAdapter = new AxiosHttpAdapter(
  undefined,
  {},
  {
    onRequest: config => {
      console.log(`[HTTP] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
  },
);

const storageAdapter = new MMKVStorageAdapter();
const secureStorageAdapter = new KeychainStorageAdapter();

// Configurar adapter de navegación con deeplinks
const navigationAdapter = createReactNavigationAdapter({
  prefixes: [
    'natify://', // Custom scheme
    'https://natify.app', // HTTPS (requiere configuración nativa)
  ],
  // Configuración personalizada opcional
  // Si no se proporciona, se genera automáticamente desde los módulos
  config: {
    screens: {
      'auth/Login': 'login',
      'auth/Register': 'register',
      'products/ProductList': 'products',
      'products/ProductDetail': 'product/:productId',
      'profile/Profile': 'profile',
      'profile/Settings': 'settings',
    },
  },
});

const biometricAdapter = new RnBiometricAdapter();
const permissionsAdapter = new RnPermissionsAdapter();
const imagePickerAdapter = new RnImagePickerAdapter();

// Configuración de adapters
// Nota: logger se agrega automáticamente si no se proporciona
const adapters = {
  http: httpAdapter,
  storage: storageAdapter,
  secureStorage: secureStorageAdapter,
  navigation: navigationAdapter,
  biometrics: biometricAdapter,
  permissions: permissionsAdapter,
  imagePicker: imagePickerAdapter,
};

// Módulos de la app
const modules = [SharedModule, AuthModule, ProductsModule, ProfileModule];

/**
 * Componente interno que usa el tema para configurar StatusBar y navegación
 */
function ThemedApp() {
  const { theme, isDark } = useTheme();

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={
          Platform.OS === 'android' ? theme.colors.surface.primary : undefined
        }
        translucent={Platform.OS === 'android'}
      />
      <NatifyApp
        adapters={adapters}
        modules={modules}
        initialModule="auth"
        onReady={loadedModules => {
          console.log(
            '[App] Modules loaded:',
            loadedModules.map(m => m.id),
          );
        }}
        onError={error => {
          console.error('[App] Error loading modules:', error);
        }}
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.surface.secondary,
          },
          headerTintColor: theme.colors.content.primary,
          headerTitleStyle: {
            fontWeight: '600',
            color: theme.colors.content.primary,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: theme.colors.surface.primary,
          },
        }}
      />
    </>
  );
}

function App() {
  return (
    <StrictMode>
      <SafeAreaProvider>
        <ThemeProvider>
          <ThemedApp />
        </ThemeProvider>
      </SafeAreaProvider>
    </StrictMode>
  );
}

export default App;
