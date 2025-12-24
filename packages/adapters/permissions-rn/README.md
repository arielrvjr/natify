# @natify/permissions-rn

Adapter de permisos para Natify Framework usando `react-native-permissions`.

## Instalación

```bash
pnpm add @natify/permissions-rn react-native-permissions
```

## Configuración Nativa

### iOS

Agrega los permisos necesarios en `ios/YourApp/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>Necesitamos acceso a la cámara para tomar fotos</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Necesitamos acceso a tus fotos</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>Necesitamos tu ubicación para mostrarte lugares cercanos</string>

<key>NSMicrophoneUsageDescription</key>
<string>Necesitamos acceso al micrófono para grabar audio</string>

<key>NSFaceIDUsageDescription</key>
<string>Usamos Face ID para autenticación segura</string>
```

### Android

Agrega los permisos en `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
```

## Uso

### Configuración del Provider

```typescript
import { NatifyProvider } from "@natify/core";
import { RnPermissionsAdapter } from "@natify/permissions-rn";

const config = {
  permissions: new RnPermissionsAdapter(),
  // ... otros adapters
};

function App() {
  return (
    <NatifyProvider config={config}>
      <MyApp />
    </NatifyProvider>
  );
}
```

### Uso en Componentes

```typescript
import { useAdapter, PermissionPort, PermissionStatus } from "@natify/core";

function CameraButton() {
  const permissions = useAdapter<PermissionPort>("permissions");

  const handlePress = async () => {
    // 1. Verificar estado actual
    const status = await permissions.check("camera");

    if (status === PermissionStatus.GRANTED) {
      openCamera();
      return;
    }

    if (status === PermissionStatus.BLOCKED) {
      // El usuario bloqueó el permiso, necesita ir a settings
      Alert.alert(
        "Permiso Requerido",
        "Por favor habilita el acceso a la cámara en Configuración",
        [
          { text: "Cancelar" },
          { text: "Abrir Configuración", onPress: () => permissions.openSettings() },
        ]
      );
      return;
    }

    // 2. Solicitar permiso
    const result = await permissions.request("camera");
    
    if (result === PermissionStatus.GRANTED) {
      openCamera();
    }
  };

  return <Button title="Abrir Cámara" onPress={handlePress} />;
}
```

## Permisos Soportados

| PermissionType | iOS | Android |
|----------------|-----|---------|
| `camera` | CAMERA | CAMERA |
| `photoLibrary` | PHOTO_LIBRARY | READ_EXTERNAL_STORAGE |
| `location` | LOCATION_WHEN_IN_USE | ACCESS_FINE_LOCATION |
| `notification` | REMINDERS* | READ_EXTERNAL_STORAGE* |
| `microphone` | MICROPHONE | RECORD_AUDIO |
| `biometrics` | FACE_ID | N/A** |

> **\* Notificaciones**: Las notificaciones push en iOS/Android se manejan de forma diferente y típicamente requieren librerías como `notifee` o `@react-native-firebase/messaging`. Este adapter proporciona un fallback básico.

> **\*\* Biometrics en Android**: La autenticación biométrica en Android no requiere un permiso runtime explícito. Usa el `BiometricPort` con `@natify/biometrics-rn` para esta funcionalidad.

## Estados de Permiso

| PermissionStatus | Descripción |
|------------------|-------------|
| `GRANTED` | Permiso concedido |
| `DENIED` | Permiso denegado (se puede volver a solicitar) |
| `BLOCKED` | Bloqueado permanentemente (requiere ir a Settings) |
| `UNAVAILABLE` | El hardware/funcionalidad no está disponible |

