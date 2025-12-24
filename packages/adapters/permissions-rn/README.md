# @natify/permissions-rn

Permissions adapter for Natify Framework using `react-native-permissions`.

## Installation

```bash
pnpm add @natify/permissions-rn react-native-permissions
```

## Native Configuration

### iOS

Add required permissions in `ios/YourApp/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to take photos</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>We need access to your photos</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to show nearby places</string>

<key>NSMicrophoneUsageDescription</key>
<string>We need microphone access to record audio</string>

<key>NSFaceIDUsageDescription</key>
<string>We use Face ID for secure authentication</string>
```

### Android

Add permissions in `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
```

## Usage

### Provider Configuration

```typescript
import { NatifyProvider } from "@natify/core";
import { RnPermissionsAdapter } from "@natify/permissions-rn";

const config = {
  permissions: new RnPermissionsAdapter(),
  // ... other adapters
};

function App() {
  return (
    <NatifyProvider config={config}>
      <MyApp />
    </NatifyProvider>
  );
}
```

### Usage in Components

```typescript
import { useAdapter, PermissionPort, PermissionStatus } from "@natify/core";

function CameraButton() {
  const permissions = useAdapter<PermissionPort>("permissions");

  const handlePress = async () => {
    // 1. Check current status
    const status = await permissions.check("camera");

    if (status === PermissionStatus.GRANTED) {
      openCamera();
      return;
    }

    if (status === PermissionStatus.BLOCKED) {
      // User blocked the permission, needs to go to settings
      Alert.alert(
        "Permission Required",
        "Please enable camera access in Settings",
        [
          { text: "Cancel" },
          { text: "Open Settings", onPress: () => permissions.openSettings() },
        ]
      );
      return;
    }

    // 2. Request permission
    const result = await permissions.request("camera");
    
    if (result === PermissionStatus.GRANTED) {
      openCamera();
    }
  };

  return <Button title="Open Camera" onPress={handlePress} />;
}
```

## Supported Permissions

| PermissionType | iOS | Android |
|----------------|-----|---------|
| `camera` | CAMERA | CAMERA |
| `photoLibrary` | PHOTO_LIBRARY | READ_EXTERNAL_STORAGE |
| `location` | LOCATION_WHEN_IN_USE | ACCESS_FINE_LOCATION |
| `notification` | REMINDERS* | READ_EXTERNAL_STORAGE* |
| `microphone` | MICROPHONE | RECORD_AUDIO |
| `biometrics` | FACE_ID | N/A** |

> **\* Notifications**: Push notifications on iOS/Android are handled differently and typically require libraries like `notifee` or `@react-native-firebase/messaging`. This adapter provides a basic fallback.

> **\*\* Biometrics on Android**: Biometric authentication on Android does not require an explicit runtime permission. Use the `BiometricPort` with `@natify/biometrics-rn` for this functionality.

## Permission Statuses

| PermissionStatus | Description |
|------------------|-------------|
| `GRANTED` | Permission granted |
| `DENIED` | Permission denied (can be requested again) |
| `BLOCKED` | Permanently blocked (requires going to Settings) |
| `UNAVAILABLE` | Hardware/functionality not available |
