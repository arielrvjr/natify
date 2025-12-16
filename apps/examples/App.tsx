import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NativefyApp } from '@nativefy/core';
import { AxiosHttpAdapter } from '@nativefy-adapter/http-axios';
import { MMKVStorageAdapter } from '@nativefy-adapter/storage-mmkv';
import { KeychainStorageAdapter } from '@nativefy-adapter/storage-keychain';
import { createReactNavigationAdapter } from '@nativefy-adapter/navigation-react';
import { RnBiometricAdapter } from '@nativefy-adapter/biometrics-rn';
import { RnPermissionsAdapter } from '@nativefy-adapter/permissions-rn';
import { RnImagePickerAdapter } from '@nativefy-adapter/image-picker-rn';
import { YupValidationAdapter } from '@nativefy-adapter/validation-yup';
// Módulos
import { AuthModule, ProductsModule, ProfileModule } from './modules';
import { ThemeProvider } from '@nativefy/ui';

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
const navigationAdapter = createReactNavigationAdapter();
const biometricAdapter = new RnBiometricAdapter();
const permissionsAdapter = new RnPermissionsAdapter();
const imagePickerAdapter = new RnImagePickerAdapter();
const validationAdapter = new YupValidationAdapter();

// Configuración de adapters
const adapters = {
  http: httpAdapter,
  storage: storageAdapter,
  secureStorage: secureStorageAdapter,
  navigation: navigationAdapter,
  biometrics: biometricAdapter,
  permissions: permissionsAdapter,
  imagePicker: imagePickerAdapter,
  validation: validationAdapter,
};

// Módulos de la app
const modules = [AuthModule, ProductsModule, ProfileModule];

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NativefyApp
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
            headerStyle: { backgroundColor: '#007AFF' },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontWeight: '600' },
          }}
        />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
