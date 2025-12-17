# @nativefy-adapter/push-notification-firebase

Adapter de Push Notifications usando `@react-native-firebase/messaging` y `react-native-notifee`.

## Instalación

```bash
pnpm add @nativefy-adapter/push-notification-firebase @react-native-firebase/messaging react-native-notifee
```

### iOS

1. Configura Firebase en tu proyecto iOS (agrega `GoogleService-Info.plist`)
2. Instala pods:
```bash
cd ios && pod install
```

### Android

1. Configura Firebase en tu proyecto Android (agrega `google-services.json`)
2. Configura el archivo `android/app/build.gradle`:
```gradle
apply plugin: 'com.google.gms.google-services'
```

## Uso

```typescript
import { FirebasePushAdapter } from '@nativefy-adapter/push-notification-firebase';
import { NativefyApp } from '@nativefy/core';

const pushAdapter = new FirebasePushAdapter();

const adapters = {
  pushNotification: pushAdapter,
  // ... otros adapters
};

<NativefyApp adapters={adapters} modules={modules} />
```

## Características

- ✅ Notificaciones remotas (FCM)
- ✅ Notificaciones locales
- ✅ Tokens FCM/APNS
- ✅ Canales de notificación (Android)
- ✅ Acciones de notificación (botones)
- ✅ Manejo de eventos (recibido, presionado, token refresh)
- ✅ Permisos de notificación

## Ejemplo

```typescript
import { useAdapter } from '@nativefy/core';
import { PushNotificationPort } from '@nativefy/core';

function MyComponent() {
  const push = useAdapter<PushNotificationPort>('pushNotification');

  // Solicitar permisos y obtener token
  const setupPush = async () => {
    const granted = await push.requestPermission();
    if (granted) {
      const token = await push.getToken();
      console.log('Token FCM:', token?.token);
      
      // Enviar token al servidor
      await fetch('/api/register-device', {
        method: 'POST',
        body: JSON.stringify({ token: token?.token }),
      });
    }
  };

  // Escuchar cuando se recibe una notificación
  useEffect(() => {
    const unsubscribe = push.onNotificationReceived(notification => {
      console.log('Notificación recibida:', notification);
    });
    return unsubscribe;
  }, [push]);

  // Escuchar cuando se presiona una notificación
  useEffect(() => {
    const unsubscribe = push.onNotificationPressed(notification => {
      console.log('Notificación presionada:', notification);
      // Navegar a una pantalla específica
    });
    return unsubscribe;
  }, [push]);

  // Escuchar cuando se actualiza el token
  useEffect(() => {
    const unsubscribe = push.onTokenRefresh(token => {
      console.log('Token actualizado:', token.token);
      // Actualizar token en el servidor
    });
    return unsubscribe;
  }, [push]);
}
```

## Configuración de Firebase

### iOS

1. Descarga `GoogleService-Info.plist` desde Firebase Console
2. Agrégalo a `ios/Examples/GoogleService-Info.plist`

### Android

1. Descarga `google-services.json` desde Firebase Console
2. Agrégalo a `android/app/google-services.json`
3. Agrega el plugin en `android/build.gradle`:
```gradle
buildscript {
  dependencies {
    classpath 'com.google.gms:google-services:4.4.0'
  }
}
```

