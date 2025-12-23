# @nativefy/push-notification-notifee

Adapter de Push Notifications usando `react-native-notifee`.

## Instalación

```bash
pnpm add @nativefy/push-notification-notifee react-native-notifee
```

### iOS

```bash
cd ios && pod install
```

### Android

No requiere configuración adicional.

## Uso

```typescript
import { NotifeePushAdapter } from '@nativefy/push-notification-notifee';
import { NativefyApp } from '@nativefy/core';

const pushAdapter = new NotifeePushAdapter();

const adapters = {
  pushNotification: pushAdapter,
  // ... otros adapters
};

<NativefyApp adapters={adapters} modules={modules} />
```

## Características

- ✅ Notificaciones locales
- ✅ Notificaciones programadas
- ✅ Canales de notificación (Android)
- ✅ Acciones de notificación (botones)
- ✅ Manejo de eventos (recibido, presionado)
- ✅ Permisos de notificación

## Limitaciones

- ❌ No proporciona tokens FCM/APNS (usa Firebase adapter para eso)
- ❌ Solo notificaciones locales y UI de notificaciones remotas

## Ejemplo

```typescript
import { useAdapter } from '@nativefy/core';
import { PushNotificationPort } from '@nativefy/core';

function MyComponent() {
  const push = useAdapter<PushNotificationPort>('pushNotification');

  // Solicitar permisos
  const requestPermission = async () => {
    const granted = await push.requestPermission();
    if (granted) {
      console.log('Permisos concedidos');
    }
  };

  // Mostrar notificación
  const showNotification = async () => {
    await push.displayNotification({
      title: 'Hola',
      body: 'Esta es una notificación',
      data: { userId: '123' },
    });
  };

  // Escuchar cuando se presiona una notificación
  useEffect(() => {
    const unsubscribe = push.onNotificationPressed(notification => {
      console.log('Notificación presionada:', notification);
    });
    return unsubscribe;
  }, [push]);
}
```

