# Módulo Shared - Preferencias de la Aplicación

Este módulo compartido proporciona UseCases para gestionar las preferencias de la aplicación que pueden ser utilizados por cualquier otro módulo.

## Estructura

```
shared/
├── types/
│   └── AppPreferences.ts      # Tipos y valores por defecto
├── usecases/
│   ├── GetAppPreferencesUseCase.ts
│   ├── UpdateAppPreferencesUseCase.ts
│   └── UpdateDarkModeUseCase.ts
└── index.ts                   # Definición del módulo
```

## UseCases Disponibles

### `getAppPreferences`
Obtiene las preferencias guardadas o retorna los valores por defecto.

```typescript
const getPreferences = useUseCase<GetAppPreferencesUseCase>('shared:getAppPreferences');
const preferences = await getPreferences.execute();
// { darkMode: false, notifications: true, language: 'es', biometricsEnabled: false }
```

### `updateAppPreferences`
Actualiza las preferencias (merge parcial).

```typescript
const updatePreferences = useUseCase<UpdateAppPreferencesUseCase>('shared:updateAppPreferences');
const updated = await updatePreferences.execute({ 
  notifications: false 
});
```

### `updateDarkMode`
Actualiza específicamente el modo oscuro.

```typescript
const updateDarkMode = useUseCase<UpdateDarkModeUseCase>('shared:updateDarkMode');
const updated = await updateDarkMode.execute(true);
```

## Uso en ViewModels

```typescript
import { useUseCase } from '@nativefy/core';
import { GetAppPreferencesUseCase } from '../../shared/usecases/GetAppPreferencesUseCase';
import { UpdateDarkModeUseCase } from '../../shared/usecases/UpdateDarkModeUseCase';

export function useSettingsViewModel() {
  const getPreferences = useUseCase<GetAppPreferencesUseCase>('shared:getAppPreferences');
  const updateDarkMode = useUseCase<UpdateDarkModeUseCase>('shared:updateDarkMode');

  const toggleDarkMode = useCallback(async () => {
    const current = await getPreferences.execute();
    const newDarkMode = !current.darkMode;
    
    await updateDarkMode.execute(newDarkMode);
    setDarkMode(newDarkMode); // Sincronizar con ThemeProvider
  }, [getPreferences, updateDarkMode, setDarkMode]);
}
```

## Preferencias Disponibles

| Preferencia | Tipo | Descripción |
|------------|------|-------------|
| `darkMode` | `boolean` | Modo oscuro activado |
| `notifications` | `boolean` | Notificaciones activadas |
| `language` | `string` | Idioma de la aplicación |
| `biometricsEnabled` | `boolean` | Biometría habilitada |

## Persistencia

Las preferencias se guardan automáticamente usando `StoragePort` con la clave `app_preferences`.

## Carga Inicial

El componente `PreferencesLoader` en `App.tsx` carga las preferencias al inicio de la aplicación y sincroniza el modo oscuro con el `ThemeProvider`.

