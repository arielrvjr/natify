# @natify/push-notification-firebase

Push Notifications adapter using `@react-native-firebase/messaging` to receive remote notifications and handle FCM tokens.

> **Note:** This adapter focuses on remote notifications. To display local notifications, use `@natify/push-notification-notifee`.

## Installation

```bash
pnpm add @natify/push-notification-firebase @react-native-firebase/messaging
```

### iOS

1. Configure Firebase in your iOS project (add `GoogleService-Info.plist`)
2. Install pods:
```bash
cd ios && pod install
```

### Android

1. Configure Firebase in your Android project (add `google-services.json`)
2. Configure `android/app/build.gradle`:
```gradle
apply plugin: 'com.google.gms.google-services'
```

## Usage

```typescript
import { FirebasePushAdapter } from '@natify/push-notification-firebase';
import { NatifyApp } from '@natify/core';

const pushAdapter = new FirebasePushAdapter();

const adapters = {
  pushNotification: pushAdapter,
  // ... other adapters
};

<NatifyApp adapters={adapters} modules={modules} />
```

## Features

- ✅ Remote notifications (FCM)
- ✅ FCM/APNS tokens
- ✅ Event handling (received, pressed, token refresh)
- ✅ Notification permissions
- ❌ Local notifications (use `@natify/push-notification-notifee`)
- ❌ Notification channels (use `@natify/push-notification-notifee`)

## Example

```typescript
import { useAdapter } from '@natify/core';
import { PushNotificationPort } from '@natify/core';

function MyComponent() {
  const push = useAdapter<PushNotificationPort>('pushNotification');

  // Request permissions and get token
  const setupPush = async () => {
    const granted = await push.requestPermission();
    if (granted) {
      const token = await push.getToken();
      console.log('FCM Token:', token?.token);
      
      // Send token to server
      await fetch('/api/register-device', {
        method: 'POST',
        body: JSON.stringify({ token: token?.token }),
      });
    }
  };

  // Listen when a remote notification is received
  useEffect(() => {
    const unsubscribe = push.onNotificationReceived(notification => {
      console.log('Remote notification received:', notification);
      // To display the notification locally, use @natify/push-notification-notifee
    });
    return unsubscribe;
  }, [push]);

  // Listen when a notification is pressed
  useEffect(() => {
    const unsubscribe = push.onNotificationPressed(notification => {
      console.log('Notification pressed:', notification);
      // Navigate to a specific screen
    });
    return unsubscribe;
  }, [push]);

  // Listen when token is refreshed
  useEffect(() => {
    const unsubscribe = push.onTokenRefresh(token => {
      console.log('Token refreshed:', token.token);
      // Update token on server
    });
    return unsubscribe;
  }, [push]);
}
```

## Combining with Notifee

To display local notifications when receiving remote notifications, you can use both adapters:

```typescript
import { FirebasePushAdapter } from '@natify/push-notification-firebase';
import { NotifeePushAdapter } from '@natify/push-notification-notifee';

const firebaseAdapter = new FirebasePushAdapter();
const notifeeAdapter = new NotifeePushAdapter();

// Listen to remote notifications and display them locally
firebaseAdapter.onNotificationReceived(async (notification) => {
  // Display using Notifee
  await notifeeAdapter.displayNotification(notification);
});

const adapters = {
  pushNotification: firebaseAdapter, // For tokens and remote notifications
  pushNotificationLocal: notifeeAdapter, // For local notifications
};
```

## Firebase Configuration

### iOS

1. Download `GoogleService-Info.plist` from Firebase Console
2. Add it to `ios/Examples/GoogleService-Info.plist`

### Android

1. Download `google-services.json` from Firebase Console
2. Add it to `android/app/google-services.json`
3. Add plugin in `android/build.gradle`:
```gradle
buildscript {
  dependencies {
    classpath 'com.google.gms:google-services:4.4.0'
  }
}
```
