# @nativefy-adapter/image-picker-rn

Adapter para selección de imágenes usando `react-native-image-picker`.

## Instalación

```bash
pnpm add @nativefy-adapter/image-picker-rn react-native-image-picker
```

## Uso

```typescript
import { RnImagePickerAdapter } from "@nativefy-adapter/image-picker-rn";

const imagePicker = new RnImagePickerAdapter();

// Seleccionar imagen de la galería
const image = await imagePicker.pickImage({
  quality: 0.8,
  maxWidth: 800,
  maxHeight: 800,
});

// Tomar foto con la cámara
const photo = await imagePicker.takePhoto({
  quality: 0.8,
});

// Seleccionar múltiples imágenes
const images = await imagePicker.pickMultipleImages({
  quality: 0.8,
});
```

## Métodos

- `pickImage(options?)`: Abre el selector de imágenes (galería)
- `takePhoto(options?)`: Abre la cámara para tomar una foto
- `pickMultipleImages(options?)`: Selecciona múltiples imágenes

## Opciones

- `quality`: Calidad de la imagen (0-1), por defecto 0.8
- `maxWidth`: Ancho máximo de la imagen
- `maxHeight`: Alto máximo de la imagen
- `allowsMultipleSelection`: Permitir selección múltiple (solo en pickImage)
- `mediaType`: Tipo de medio ('photo', 'video', 'mixed')
- `includeBase64`: Incluir datos base64 de la imagen
