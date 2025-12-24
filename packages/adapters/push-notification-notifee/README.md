# @natify/push-notification-notifee

Push Notifications adapter using `react-native-notifee`.

## Installation

```bash
pnpm add @natify/push-notification-notifee react-native-notifee
```

### iOS

```bash
cd ios && pod install
```

### Android

No additional configuration required.

## Usage

```typescript
import { NotifeePushAdapter } from '@natify/push-notification-notifee';
import { NatifyApp } from '@natify/core';

const pushAdapter = new NotifeePushAdapter();

const adapters = {
  pushNotification: pushAdapter,
  // ... other adapters
};

<NatifyApp adapters={adapters} modules={modules} />
```

## Features

- ✅ Local notifications
- ✅ Scheduled notifications
- ✅ Notification channels (Android)
- ✅ Notification actions (buttons)
- ✅ Event handling (received, pressed)
- ✅ Notification permissions

## Limitations

- ❌ Does not provide FCM/APNS tokens (use Firebase adapter for that)
- ❌ Only local notifications and remote notification UI

## Example

```typescript
import { useAdapter } from '@natify/core';
import { PushNotificationPort } from '@natify/core';

function MyComponent() {
  const push = useAdapter<PushNotificationPort>('pushNotification');

  // Request permissions
  const requestPermission = async () => {
    const granted = await push.requestPermission();
    if (granted) {
      console.log('Permissions granted');
    }
  };

  // Display notification
  const showNotification = async () => {
    await push.displayNotification({
      title: 'Hello',
      body: 'This is a notification',
      data: { userId: '123' },
    });
  };

  // Listen when a notification is pressed
  useEffect(() => {
    const unsubscribe = push.onNotificationPressed(notification => {
      console.log('Notification pressed:', notification);
    });
    return unsubscribe;
  }, [push]);
}
```
