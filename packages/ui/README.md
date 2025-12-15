# @nativefy/ui

Librería de componentes UI para React Native con soporte de temas.

## Instalación

```bash
pnpm add @nativefy/ui
```

## Configuración

Envuelve tu app con `ThemeProvider`:

```tsx
import { ThemeProvider } from "@nativefy/ui";

export default function App() {
  return (
    <ThemeProvider followSystem>
      <YourApp />
    </ThemeProvider>
  );
}
```

## Componentes

### 🎨 Base

| Componente | Descripción |
|------------|-------------|
| `Text` | Texto con variantes tipográficas |
| `Button` | Botón con variantes y estados |
| `Input` | Campo de entrada con label y error |
| `Card` | Tarjeta con variantes |

### 📐 Layout

| Componente | Descripción |
|------------|-------------|
| `Container` | Contenedor principal con padding |
| `Row` | Flex horizontal |
| `Column` | Flex vertical |
| `Spacer` | Espaciado flexible |
| `Divider` | Línea divisoria |

### 💬 Feedback

| Componente | Descripción |
|------------|-------------|
| `Loading` | Indicador de carga |
| `Modal` | Modal con header/footer |
| `ConfirmModal` | Modal de confirmación |
| `Toast` / `useToast` | Sistema de notificaciones |

### 📝 Form

| Componente | Descripción |
|------------|-------------|
| `Checkbox` | Casilla de verificación |
| `Switch` | Toggle on/off |
| `RadioGroup` | Grupo de opciones |

### 🖼️ Display

| Componente | Descripción |
|------------|-------------|
| `Avatar` | Avatar con imagen o iniciales |
| `Badge` | Etiqueta/contador |
| `BadgeWrapper` | Wrapper para agregar badge |
| `EmptyState` | Estado vacío |

---

## Ejemplos

### Text

```tsx
import { Text } from "@nativefy/ui";

<Text variant="h1" weight="bold">Título</Text>
<Text variant="body" color="#666">Descripción</Text>
<Text variant="caption">Nota al pie</Text>
```

### Button

```tsx
import { Button } from "@nativefy/ui";

<Button title="Primario" variant="primary" onPress={() => {}} />
<Button title="Outline" variant="outline" onPress={() => {}} />
<Button title="Cargando" loading onPress={() => {}} />
<Button title="Eliminar" variant="danger" onPress={() => {}} />
```

### Input

```tsx
import { Input } from "@nativefy/ui";

<Input
  label="Email"
  placeholder="correo@ejemplo.com"
  keyboardType="email-address"
  error={errors.email}
/>
```

### Card

```tsx
import { Card, Text } from "@nativefy/ui";

<Card variant="elevated" padding="lg" onPress={() => {}}>
  <Text variant="h4">Título</Text>
  <Text>Contenido de la tarjeta</Text>
</Card>
```

### Layout

```tsx
import { Container, Row, Column, Spacer } from "@nativefy/ui";

<Container padding>
  <Row justify="between" align="center">
    <Text>Izquierda</Text>
    <Text>Derecha</Text>
  </Row>
  
  <Spacer size="lg" />
  
  <Column gap="md">
    <Text>Item 1</Text>
    <Text>Item 2</Text>
  </Column>
</Container>
```

### Toast

```tsx
import { ToastProvider, useToast, Button } from "@nativefy/ui";

// En el root
<ToastProvider>
  <App />
</ToastProvider>

// En cualquier componente
function MyComponent() {
  const toast = useToast();
  
  return (
    <>
      <Button title="Success" onPress={() => toast.success("¡Guardado!")} />
      <Button title="Error" onPress={() => toast.error("Algo salió mal")} />
    </>
  );
}
```

### Modal

```tsx
import { Modal, ConfirmModal, Button, Text } from "@nativefy/ui";

const [visible, setVisible] = useState(false);

<Modal
  visible={visible}
  onClose={() => setVisible(false)}
  title="Mi Modal"
>
  <Text>Contenido del modal</Text>
</Modal>

// Modal de confirmación
<ConfirmModal
  visible={confirmVisible}
  onClose={() => setConfirmVisible(false)}
  onConfirm={handleDelete}
  title="¿Eliminar?"
  message="Esta acción no se puede deshacer"
  confirmVariant="danger"
  confirmText="Eliminar"
/>
```

### Form Controls

```tsx
import { Checkbox, Switch, RadioGroup } from "@nativefy/ui";

<Checkbox
  checked={agreed}
  onChange={setAgreed}
  label="Acepto los términos"
/>

<Switch
  value={notifications}
  onChange={setNotifications}
  label="Notificaciones"
/>

<RadioGroup
  options={[
    { value: "light", label: "Claro" },
    { value: "dark", label: "Oscuro" },
  ]}
  value={theme}
  onChange={setTheme}
  label="Tema"
/>
```

### Avatar & Badge

```tsx
import { Avatar, Badge, BadgeWrapper } from "@nativefy/ui";

<Avatar name="John Doe" size="lg" />
<Avatar source={{ uri: "https://..." }} size="md" />

<Badge count={5} variant="error" />

<BadgeWrapper count={3}>
  <Avatar name="User" />
</BadgeWrapper>
```

---

## Temas

### Tema personalizado

```tsx
import { ThemeProvider, lightTheme, Theme } from "@nativefy/ui";

const customTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: "#FF6B6B",
    secondary: "#4ECDC4",
  },
};

<ThemeProvider theme={customTheme}>
  <App />
</ThemeProvider>
```

### Hook useTheme

```tsx
import { useTheme } from "@nativefy/ui";

function MyComponent() {
  const { theme, isDark, toggleTheme } = useTheme();
  
  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Button title="Toggle Theme" onPress={toggleTheme} />
    </View>
  );
}
```

### Hook useThemedStyles

```tsx
import { useThemedStyles } from "@nativefy/ui";

const styles = useThemedStyles((theme) => ({
  container: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
}));
```

