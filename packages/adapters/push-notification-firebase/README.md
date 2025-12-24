# @natify/push-notification-firebase

Adapter de Push Notifications usando `@react-native-firebase/messaging` para recibir notificaciones remotas y manejar tokens FCM.

> **Nota:** Este adapter se enfoca en notificaciones remotas. Para mostrar notificaciones locales, usa `@natify/push-notification-notifee`.

## Instalación

```bash
pnpm add @natify/push-notification-firebase @react-native-firebase/messaging
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
import { FirebasePushAdapter } from '@natify/push-notification-firebase';
import { NatifyApp } from '@natify/core';

const pushAdapter = new FirebasePushAdapter();

const adapters = {
  pushNotification: pushAdapter,
  // ... otros adapters
};

<NatifyApp adapters={adapters} modules={modules} />
```

## Características

- ✅ Notificaciones remotas (FCM)
- ✅ Tokens FCM/APNS
- ✅ Manejo de eventos (recibido, presionado, token refresh)
- ✅ Permisos de notificación
- ❌ Notificaciones locales (usa `@natify/push-notification-notifee`)
- ❌ Canales de notificación (usa `@natify/push-notification-notifee`)

## Ejemplo

```typescript
import { useAdapter } from '@natify/core';
import { PushNotificationPort } from '@natify/core';

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

  // Escuchar cuando se recibe una notificación remota
  useEffect(() => {
    const unsubscribe = push.onNotificationReceived(notification => {
      console.log('Notificación remota recibida:', notification);
      // Para mostrar la notificación localmente, usa @natify/push-notification-notifee
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

## Combinar con Notifee

Para mostrar notificaciones locales cuando recibes notificaciones remotas, puedes usar ambos adapters:

```typescript
import { FirebasePushAdapter } from '@natify/push-notification-firebase';
import { NotifeePushAdapter } from '@natify/push-notification-notifee';

const firebaseAdapter = new FirebasePushAdapter();
const notifeeAdapter = new NotifeePushAdapter();

// Escuchar notificaciones remotas y mostrarlas localmente
firebaseAdapter.onNotificationReceived(async (notification) => {
  // Mostrar usando Notifee
  await notifeeAdapter.displayNotification(notification);
});

const adapters = {
  pushNotification: firebaseAdapter, // Para tokens y notificaciones remotas
  pushNotificationLocal: notifeeAdapter, // Para notificaciones locales
};
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
