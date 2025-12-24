# @natify/biometrics-rn

Biometric authentication adapter for Natify Framework using `react-native-biometrics`.

## Installation

```bash
pnpm add @natify/biometrics-rn react-native-biometrics
```

## Native Configuration

### iOS

Add Face ID description in `ios/YourApp/Info.plist`:

```xml
<key>NSFaceIDUsageDescription</key>
<string>We use Face ID for secure authentication</string>
```

### Android

No additional configuration required. The library uses Android's native biometric system.

## Usage

### Provider Configuration

```typescript
import { NatifyProvider } from "@natify/core";
import { RnBiometricAdapter } from "@natify/biometrics-rn";

const config = {
  biometrics: new RnBiometricAdapter(),
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
import { useAdapter, BiometricPort, BiometryType } from "@natify/core";

function SecureAction() {
  const biometrics = useAdapter<BiometricPort>("biometrics");

  const handleSecureAction = async () => {
    // 1. Check available biometric type
    const biometryType = await biometrics.getBiometryType();
    
    if (biometryType === BiometryType.None) {
      Alert.alert("No Biometrics", "Your device does not support biometric authentication");
      return;
    }

    // 2. Authenticate user
    const { success, error } = await biometrics.authenticate(
      "Confirm your identity to continue"
    );

    if (success) {
      // Proceed with secure action
      performSecureAction();
    } else {
      Alert.alert("Authentication Failed", error || "Could not verify your identity");
    }
  };

  return <Button title="Secure Action" onPress={handleSecureAction} />;
}
```

### Example: Biometric Login

```typescript
function BiometricLogin() {
  const biometrics = useAdapter<BiometricPort>("biometrics");
  const storage = useAdapter<StoragePort>("storage");

  const loginWithBiometrics = async () => {
    const biometryType = await biometrics.getBiometryType();
    
    const buttonText = biometryType === BiometryType.FaceID 
      ? "Use Face ID" 
      : "Use Fingerprint";

    const { success } = await biometrics.authenticate(
      `Sign in with ${buttonText}`
    );

    if (success) {
      // Retrieve saved token
      const token = await storage.getItem("auth_token");
      if (token) {
        navigateToHome();
      }
    }
  };

  return <Button title="Biometric Login" onPress={loginWithBiometrics} />;
}
```

## API

### BiometricPort

| Method | Return | Description |
|--------|--------|-------------|
| `getBiometryType()` | `Promise<BiometryType>` | Gets the available biometric type |
| `authenticate(prompt)` | `Promise<{ success, error? }>` | Shows authentication prompt |
| `isAvailable()` | `Promise<boolean>` | Checks if biometrics is available |

### BiometryType

| Value | Description |
|-------|-------------|
| `FaceID` | Face ID (iOS) |
| `Fingerprint` | Touch ID (iOS) or Fingerprint (Android) |
| `None` | No biometrics available |

## Common Use Cases

- **Biometric login**: Allow quick access without password
- **Confirm transactions**: Verify identity before payments
- **Access sensitive data**: Protect confidential information
- **App unlock**: After a period of inactivity
