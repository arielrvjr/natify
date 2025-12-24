# @natify/ui

Librería de componentes UI para React Native con un **Design System** completo basado en tokens semánticos y soporte nativo para temas claro/oscuro.

## 🎨 Concepto del Design System

Este design system está construido sobre principios de **semántica** y **consistencia**, organizando los tokens de diseño por **propósito** en lugar de por tipo visual. Esto permite:

- ✅ **Mantenibilidad**: Cambiar un color en un lugar afecta toda la app
- ✅ **Accesibilidad**: Contraste garantizado entre superficies y contenido
- ✅ **Escalabilidad**: Fácil agregar nuevos temas o variantes
- ✅ **Consistencia**: Todos los componentes usan los mismos tokens

### Estructura del Design System

El sistema está organizado en **5 categorías semánticas**:

#### 1. **Surface** (Superficies)
Colores de fondo que crean jerarquía visual:
- `primary`: Fondo base de la aplicación
- `secondary`: Superficies elevadas (Cards, Inputs, Modals)

#### 2. **Content** (Contenido)
Colores de texto organizados por nivel de contraste:
- `primary`: Texto principal (alto contraste)
- `secondary`: Texto de apoyo (contraste medio)
- `tertiary`: Texto deshabilitado/placeholders (bajo contraste)
- `onPrimary`: Texto sobre elementos de acción primarios

#### 3. **Action** (Acciones)
Colores para interacciones del usuario:
- `primary`: Color principal de la marca para botones/links
- `pressed`: Estado de feedback táctil
- `disabled`: Elementos de acción inactivos

#### 4. **Status** (Estados)
Colores para comunicar estados del sistema:
- `error`: Errores y validaciones
- `success`: Confirmaciones exitosas
- `warning`: Alertas y precauciones
- `info`: Notificaciones informativas

#### 5. **Structure** (Estructura)
Elementos de soporte visual:
- `divider`: Líneas divisorias en listas
- `border`: Bordes de inputs y contenedores

### Sistema de Tipografía

Variantes tipográficas semánticas (no por tamaño):

| Variante | Uso | Ejemplo |
|----------|-----|---------|
| `title` | Títulos principales | Pantallas, Headers |
| `subtitle` | Subtítulos | Secciones, Cards |
| `body` | Texto principal | Párrafos, Contenido |
| `caption` | Texto secundario | Ayudas, Notas |
| `label` | Etiquetas | Formularios, Badges |

### Sistema de Espaciado

Espaciado consistente basado en múltiplos de 4:

```typescript
spacing: {
  xs: 4,      // Espaciado mínimo
  sm: 8,      // Espaciado pequeño
  md: 16,     // Espaciado medio (default)
  lg: 24,     // Espaciado grande
  xl: 32,     // Espaciado extra grande
  touchTarget: 48, // Tamaño mínimo táctil (accesibilidad)
}
```

## Instalación

```bash
pnpm add @natify/ui
```

## Configuración

Envuelve tu app con `ThemeProvider`:

```tsx
import { ThemeProvider } from "@natify/ui";

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

### 🧭 Navigation

| Componente | Descripción |
|------------|-------------|
| `TopAppBar` | Barra superior con título, acciones y navegación |
| `BottomBar` | Barra de navegación inferior con tabs |

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

### 🧭 Navigation

| Componente | Descripción |
|------------|-------------|
| `TopAppBar` | Barra superior con título, acciones y navegación |
| `BottomBar` | Barra de navegación inferior con tabs |

---

## Ejemplos

### Text

El componente `Text` usa las variantes tipográficas del design system:

```tsx
import { Text } from "@natify/ui";

<Text variant="title">Título Principal</Text>
<Text variant="subtitle">Subtítulo</Text>
<Text variant="body">Texto del cuerpo</Text>
<Text variant="caption" color={theme.colors.content.secondary}>
  Nota al pie
</Text>
<Text variant="label">Etiqueta</Text>

// Con color personalizado
<Text variant="body" color={theme.colors.status.error}>
  Mensaje de error
</Text>
```

### Button

Botones con variantes que usan los tokens de `action`:

```tsx
import { Button } from "@natify/ui";

// Variante primaria (usa action.primary)
<Button title="Primario" variant="primary" onPress={() => {}} />

// Variante secundaria (fondo surface.secondary)
<Button title="Secundario" variant="secondary" onPress={() => {}} />

// Variante ghost (transparente)
<Button title="Ghost" variant="ghost" onPress={() => {}} />

// Estados
<Button title="Cargando" loading onPress={() => {}} />
<Button title="Deshabilitado" disabled onPress={() => {}} />
```

### Input

```tsx
import { Input } from "@natify/ui";

<Input
  label="Email"
  placeholder="correo@ejemplo.com"
  keyboardType="email-address"
  error={errors.email}
/>
```

### Card

Las Cards usan `surface.secondary` para crear jerarquía visual:

```tsx
import { Card, Text } from "@natify/ui";

<Card padding="lg" onPress={() => {}}>
  <Text variant="subtitle">Título de la tarjeta</Text>
  <Text variant="body" color={theme.colors.content.secondary}>
    Contenido de la tarjeta
  </Text>
</Card>
```

### Layout

```tsx
import { Container, Row, Column, Spacer } from "@natify/ui";

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
import { ToastProvider, useToast, Button } from "@natify/ui";

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
import { Modal, ConfirmModal, Button, Text } from "@natify/ui";

const [visible, setVisible] = useState(false);

<Modal
  visible={visible}
  onClose={() => setVisible(false)}
  title="Mi Modal"
>
  <Text>Contenido del modal</Text>
</Modal>
```

### TopAppBar

Barra superior con título, subtítulo, botón de retroceso y acciones:

```tsx
import { TopAppBar } from "@natify/ui";

function MyScreen() {
  return (
    <>
      <TopAppBar
        title="Mi Pantalla"
        subtitle="Subtítulo opcional"
        showBack
        onBackPress={() => navigation.goBack()}
        actions={[
          {
            icon: <Icon name="search" />,
            onPress: () => console.log('Buscar'),
          },
          {
            icon: <Icon name="more" />,
            label: "Más",
            onPress: () => console.log('Más opciones'),
          },
        ]}
        elevated
      />
      {/* Contenido de la pantalla */}
    </>
  );
}
```

### BottomBar

Barra de navegación inferior con tabs, iconos y badges:

```tsx
import { BottomBar } from "@natify/ui";
import { useState } from "react";

function AppWithTabs() {
  const [activeTab, setActiveTab] = useState('home');

  const tabs = [
    {
      id: 'home',
      label: 'Inicio',
      icon: <Icon name="home" />,
    },
    {
      id: 'search',
      label: 'Buscar',
      icon: <Icon name="search" />,
      badge: 3, // Badge opcional (número o string)
    },
    {
      id: 'notifications',
      label: 'Notificaciones',
      icon: <Icon name="bell" />,
      badge: '99+', // Badge como string
    },
    {
      id: 'profile',
      label: 'Perfil',
      icon: <Icon name="user" />,
    },
  ];

  return (
    <View style={{ flex: 1 }}>
      {/* Contenido de la pantalla */}
      <BottomBar
        tabs={tabs}
        activeTabId={activeTab}
        onTabPress={setActiveTab}
        elevated
      />
    </View>
  );
}
```

// Modal de confirmación
<ConfirmModal
  visible={confirmVisible}
  onClose={() => setConfirmVisible(false)}
  onConfirm={handleDelete}
  title="¿Eliminar?"
  message="Esta acción no se puede deshacer"
  confirmVariant="primary"
  confirmText="Eliminar"
/>
```

### Form Controls

```tsx
import { Checkbox, Switch, RadioGroup } from "@natify/ui";

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
import { Avatar, Badge, BadgeWrapper } from "@natify/ui";

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

Puedes extender los temas por defecto o crear uno completamente personalizado:

```tsx
import { ThemeProvider, lightTheme, Theme } from "@natify/ui";

const customTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    // Personalizar solo lo necesario
    action: {
      ...lightTheme.colors.action,
      primary: "#FF6B6B", // Tu color de marca
      pressed: "#E55555",
    },
    status: {
      ...lightTheme.colors.status,
      success: "#4ECDC4",
    },
  },
};

<ThemeProvider theme={customTheme}>
  <App />
</ThemeProvider>
```

### Uso correcto de los tokens

**✅ Correcto**: Usar tokens semánticos
```tsx
// Texto principal
<Text color={theme.colors.content.primary} />

// Botón primario
<Button style={{ backgroundColor: theme.colors.action.primary }} />

// Borde de input
<View style={{ borderColor: theme.colors.structure.border }} />
```

**❌ Incorrecto**: Usar colores hardcodeados
```tsx
// ❌ No hacer esto
<Text color="#101828" />
<Button style={{ backgroundColor: "#007AFF" }} />
```

### Hook useTheme

Accede al tema completo y sus utilidades:

```tsx
import { useTheme } from "@natify/ui";

function MyComponent() {
  const { theme, isDark, toggleTheme } = useTheme();
  
  return (
    <View style={{ 
      backgroundColor: theme.colors.surface.primary,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
    }}>
      <Text variant="body" color={theme.colors.content.primary}>
        Tema actual: {isDark ? "Oscuro" : "Claro"}
      </Text>
      <Button title="Cambiar tema" onPress={toggleTheme} />
    </View>
  );
}
```

### Hook useThemedStyles

Crea estilos tipados que se actualizan automáticamente con el tema:

```tsx
import { useThemedStyles } from "@natify/ui";

function MyComponent() {
  const styles = useThemedStyles((theme) => ({
    container: {
      backgroundColor: theme.colors.surface.secondary,
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
      ...theme.shadows.md,
    },
    title: {
      ...theme.typography.title,
      color: theme.colors.content.primary,
      marginBottom: theme.spacing.md,
    },
  }));
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Componente</Text>
    </View>
  );
}
```

## 🎯 Mejores Prácticas

### 1. Usa tokens semánticos siempre

Los tokens están organizados por propósito, no por apariencia:

```tsx
// ✅ Correcto
theme.colors.content.primary    // Para texto principal
theme.colors.action.primary     // Para acciones principales
theme.colors.surface.secondary  // Para fondos elevados

// ❌ Evitar
theme.colors.blue               // No existe
theme.colors.darkGray           // No existe
```

### 2. Respeta la jerarquía de contenido

Usa los niveles de contraste apropiados:

```tsx
// Títulos y texto importante
<Text variant="title" color={theme.colors.content.primary} />

// Texto de apoyo
<Text variant="body" color={theme.colors.content.secondary} />

// Placeholders y deshabilitados
<Text variant="caption" color={theme.colors.content.tertiary} />
```

### 3. Usa el sistema de espaciado

Nunca hardcodees valores de padding/margin:

```tsx
// ✅ Correcto
padding: theme.spacing.md
marginTop: theme.spacing.lg
gap: theme.spacing.sm

// ❌ Evitar
padding: 16
marginTop: 24
gap: 8
```

### 4. Aprovecha las variantes tipográficas

No mezcles tamaños de fuente manualmente:

```tsx
// ✅ Correcto
<Text variant="title">Título</Text>
<Text variant="subtitle">Subtítulo</Text>
<Text variant="body">Cuerpo</Text>

// ❌ Evitar
<Text style={{ fontSize: 24, fontWeight: 'bold' }}>Título</Text>
```

## 📚 Referencia Completa del Tema

```typescript
interface Theme {
  colors: {
    surface: {
      primary: string;    // Fondo base
      secondary: string;  // Fondos elevados
    };
    content: {
      primary: string;    // Texto principal
      secondary: string;  // Texto secundario
      tertiary: string;   // Texto terciario/deshabilitado
      onPrimary: string;  // Texto sobre action.primary
    };
    action: {
      primary: string;     // Acción principal
      pressed: string;    // Estado presionado
      disabled: string;   // Estado deshabilitado
    };
    status: {
      error: string;      // Errores
      success: string;    // Éxitos
      warning: string;    // Advertencias
      info: string;       // Información
    };
    structure: {
      divider: string;    // Divisores
      border: string;     // Bordes
    };
  };
  spacing: {
    xs: number;          // 4
    sm: number;          // 8
    md: number;          // 16
    lg: number;          // 24
    xl: number;         // 32
    touchTarget: number; // 48
  };
  typography: {
    title: TypographyStyle;
    subtitle: TypographyStyle;
    body: TypographyStyle;
    caption: TypographyStyle;
    label: TypographyStyle;
  };
  borderRadius: {
    none: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  shadows: {
    none: object;
    sm: object;
    md: object;
    lg: object;
  };
  isDark: boolean;
}
```

