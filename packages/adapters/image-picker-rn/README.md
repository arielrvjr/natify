# @natify/image-picker-rn

Image picker adapter using `react-native-image-picker`.

## Installation

```bash
pnpm add @natify/image-picker-rn react-native-image-picker
```

## Usage

```typescript
import { RnImagePickerAdapter } from "@natify/image-picker-rn";

const imagePicker = new RnImagePickerAdapter();

// Select image from gallery
const image = await imagePicker.pickImage({
  quality: 0.8,
  maxWidth: 800,
  maxHeight: 800,
});

// Take photo with camera
const photo = await imagePicker.takePhoto({
  quality: 0.8,
});

// Select multiple images
const images = await imagePicker.pickMultipleImages({
  quality: 0.8,
});
```

## Methods

- `pickImage(options?)`: Opens image selector (gallery)
- `takePhoto(options?)`: Opens camera to take a photo
- `pickMultipleImages(options?)`: Selects multiple images

## Options

- `quality`: Image quality (0-1), default 0.8
- `maxWidth`: Maximum image width
- `maxHeight`: Maximum image height
- `allowsMultipleSelection`: Allow multiple selection (only in pickImage)
- `mediaType`: Media type ('photo', 'video', 'mixed')
- `includeBase64`: Include base64 image data
