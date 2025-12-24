# @natify/biometrics-rn

Adapter de autenticación biométrica para Natify Framework usando `react-native-biometrics`.

## Instalación

```bash
pnpm add @natify/biometrics-rn react-native-biometrics
```

## Configuración Nativa

### iOS

Agrega la descripción de Face ID en `ios/YourApp/Info.plist`:

```xml
<key>NSFaceIDUsageDescription</key>
<string>Usamos Face ID para autenticación segura</string>
```

### Android

No requiere configuración adicional. La librería usa el sistema biométrico nativo de Android.

## Uso

### Configuración del Provider

```typescript
import { NatifyProvider } from "@natify/core";
import { RnBiometricAdapter } from "@natify/biometrics-rn";

const config = {
  biometrics: new RnBiometricAdapter(),
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
import { useAdapter, BiometricPort, BiometryType } from "@natify/core";

function SecureAction() {
  const biometrics = useAdapter<BiometricPort>("biometrics");

  const handleSecureAction = async () => {
    // 1. Verificar tipo de biometría disponible
    const biometryType = await biometrics.getBiometryType();
    
    if (biometryType === BiometryType.None) {
      Alert.alert("Sin Biometría", "Tu dispositivo no soporta autenticación biométrica");
      return;
    }

    // 2. Autenticar al usuario
    const { success, error } = await biometrics.authenticate(
      "Confirma tu identidad para continuar"
    );

    if (success) {
      // Proceder con la acción segura
      performSecureAction();
    } else {
      Alert.alert("Autenticación Fallida", error || "No se pudo verificar tu identidad");
    }
  };

  return <Button title="Acción Segura" onPress={handleSecureAction} />;
}
```

### Ejemplo: Login con Biometría

```typescript
function BiometricLogin() {
  const biometrics = useAdapter<BiometricPort>("biometrics");
  const storage = useAdapter<StoragePort>("storage");

  const loginWithBiometrics = async () => {
    const biometryType = await biometrics.getBiometryType();
    
    const buttonText = biometryType === BiometryType.FaceID 
      ? "Usar Face ID" 
      : "Usar Huella";

    const { success } = await biometrics.authenticate(
      `Inicia sesión con ${buttonText}`
    );

    if (success) {
      // Recuperar token guardado
      const token = await storage.getItem("auth_token");
      if (token) {
        navigateToHome();
      }
    }
  };

  return <Button title="Login Biométrico" onPress={loginWithBiometrics} />;
}
```

## API

### BiometricPort

| Método | Retorno | Descripción |
|--------|---------|-------------|
| `getBiometryType()` | `Promise<BiometryType>` | Obtiene el tipo de biometría disponible |
| `authenticate(prompt)` | `Promise<{ success, error? }>` | Muestra el prompt de autenticación |
| `isAvailable()` | `Promise<boolean>` | Verifica si la biometría está disponible |

### BiometryType

| Valor | Descripción |
|-------|-------------|
| `FaceID` | Face ID (iOS) |
| `Fingerprint` | Touch ID (iOS) o Huella (Android) |
| `None` | Sin biometría disponible |

## Casos de Uso Comunes

- **Login biométrico**: Permitir acceso rápido sin contraseña
- **Confirmar transacciones**: Verificar identidad antes de pagos
- **Acceso a datos sensibles**: Proteger información confidencial
- **Desbloqueo de app**: Después de un período de inactividad

