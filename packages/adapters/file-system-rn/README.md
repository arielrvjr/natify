# @nativefy/file-system-rn

Adapter de sistema de archivos para Nativefy Framework usando `react-native-blob-util`.

## Instalación

```bash
pnpm add @nativefy/file-system-rn react-native-blob-util
```

### iOS

```bash
cd ios && pod install && cd ..
```

### Android

No requiere configuración adicional.

## Uso

### Configuración del Provider

```typescript
import { NativefyProvider } from "@nativefy/core";
import { RnFileSystemAdapter } from "@nativefy/file-system-rn";

const config = {
  filesystem: new RnFileSystemAdapter(),
  // ... otros adapters
};

function App() {
  return (
    <NativefyProvider config={config}>
      <MyApp />
    </NativefyProvider>
  );
}
```

## Operaciones Locales

### Leer Archivo

```typescript
import { useAdapter, FileSystemPort } from "@nativefy/core";

function MyComponent() {
  const fileSystem = useAdapter<FileSystemPort>("filesystem");

  const readFile = async () => {
    try {
      // Leer como texto
      const content = await fileSystem.readFile("/path/to/file.txt", "utf8");
      console.log(content);

      // Leer como base64 (para imágenes, PDFs, etc.)
      const imageBase64 = await fileSystem.readFile("/path/to/image.png", "base64");
    } catch (error) {
      console.error("Error reading file:", error);
    }
  };
}
```

### Escribir Archivo

```typescript
const writeFile = async () => {
  // Escribir texto
  await fileSystem.writeFile("/path/to/file.txt", "Hello World", "utf8");

  // Escribir base64
  await fileSystem.writeFile("/path/to/image.png", base64String, "base64");
};
```

### Verificar Existencia

```typescript
const checkFile = async () => {
  const exists = await fileSystem.exists("/path/to/file.txt");
  if (exists) {
    console.log("File exists!");
  }
};
```

### Obtener Información del Archivo

```typescript
const getInfo = async () => {
  const info = await fileSystem.getFileInfo("/path/to/file.pdf");
  if (info) {
    console.log("Size:", info.size, "bytes");
    console.log("Last modified:", info.lastModified);
    console.log("MIME type:", info.mimeType);
  }
};
```

### Listar Archivos en Directorio

```typescript
const listFiles = async () => {
  const files = await fileSystem.listFiles("/path/to/directory");
  console.log("Files:", files);
};
```

### Operaciones de Directorios

```typescript
// Crear directorio
await fileSystem.mkdir("/path/to/new/directory");

// Eliminar directorio (recursivo por defecto)
await fileSystem.rmdir("/path/to/directory", true);
```

## Rutas de Directorios

```typescript
// Obtener rutas de directorios del sistema
const documentsPath = fileSystem.getDocumentsPath();
const cachePath = fileSystem.getCachePath();
const tempPath = fileSystem.getTempPath();

// Guardar archivo en documentos
const filePath = `${documentsPath}/myfile.txt`;
await fileSystem.writeFile(filePath, "Content", "utf8");
```

## Descarga de Archivos

### Descarga Simple

```typescript
const downloadFile = async () => {
  const documentsPath = fileSystem.getDocumentsPath();
  const destinationPath = `${documentsPath}/downloaded.pdf`;

  const result = await fileSystem.downloadFile(
    "https://example.com/file.pdf",
    destinationPath
  );

  console.log("Downloaded to:", result.path);
  console.log("Size:", result.size, "bytes");
};
```

### Descarga con Progreso

```typescript
const downloadWithProgress = async () => {
  const destinationPath = `${fileSystem.getDocumentsPath()}/large-file.zip`;

  await fileSystem.downloadFile(
    "https://example.com/large-file.zip",
    destinationPath,
    {
      onProgress: (downloaded, total) => {
        const percent = (downloaded / total) * 100;
        console.log(`Progress: ${percent.toFixed(2)}%`);
      },
      headers: {
        Authorization: "Bearer token",
      },
      timeout: 30000, // 30 segundos
    }
  );
};
```

### Descarga con Headers Personalizados

```typescript
await fileSystem.downloadFile(url, destinationPath, {
  headers: {
    Authorization: "Bearer your-token",
    "Custom-Header": "value",
  },
});
```

## Subida de Archivos

### Subida Simple

```typescript
const uploadFile = async () => {
  const filePath = `${fileSystem.getDocumentsPath()}/document.pdf`;

  const result = await fileSystem.uploadFile(
    filePath,
    "https://api.example.com/upload"
  );

  console.log("Upload status:", result.status);
  console.log("Response:", result.data);
};
```

### Subida con Progreso

```typescript
const uploadWithProgress = async () => {
  const filePath = `${fileSystem.getDocumentsPath()}/large-video.mp4`;

  await fileSystem.uploadFile(filePath, "https://api.example.com/upload", {
    onProgress: (uploaded, total) => {
      const percent = (uploaded / total) * 100;
      console.log(`Upload progress: ${percent.toFixed(2)}%`);
    },
    headers: {
      Authorization: "Bearer token",
    },
    fieldName: "video", // Nombre del campo en el formulario
    formData: {
      title: "My Video",
      description: "Video description",
    },
  });
};
```

### Subida con FormData Adicional

```typescript
await fileSystem.uploadFile(filePath, uploadUrl, {
  fieldName: "file",
  formData: {
    userId: "123",
    category: "documents",
    metadata: JSON.stringify({ key: "value" }),
  },
  headers: {
    Authorization: "Bearer token",
  },
});
```

## Casos de Uso Comunes

### Descargar y Guardar PDF

```typescript
const downloadPDF = async (url: string, filename: string) => {
  const documentsPath = fileSystem.getDocumentsPath();
  const filePath = `${documentsPath}/${filename}`;

  await fileSystem.downloadFile(url, filePath, {
    onProgress: (downloaded, total) => {
      // Actualizar UI con progreso
      updateProgressBar((downloaded / total) * 100);
    },
  });

  return filePath;
};
```

### Subir Imagen desde Galería

```typescript
import { useAdapter, FileSystemPort, ImagePickerPort } from "@nativefy/core";

function ImageUploader() {
  const fileSystem = useAdapter<FileSystemPort>("filesystem");
  const imagePicker = useAdapter<ImagePickerPort>("imagepicker");

  const uploadImage = async () => {
    // 1. Seleccionar imagen
    const image = await imagePicker.pickImage({
      quality: 0.8,
    });

    if (!image) return;

    // 2. Subir imagen
    const result = await fileSystem.uploadFile(image.uri, "https://api.example.com/upload", {
      fieldName: "image",
      formData: {
        userId: currentUserId,
      },
      onProgress: (uploaded, total) => {
        setUploadProgress((uploaded / total) * 100);
      },
    });

    console.log("Image uploaded:", result);
  };
}
```

### Leer y Procesar JSON

```typescript
const loadConfig = async () => {
  const configPath = `${fileSystem.getDocumentsPath()}/config.json`;
  
  try {
    const content = await fileSystem.readFile(configPath, "utf8");
    const config = JSON.parse(content);
    return config;
  } catch (error) {
    // Si no existe, crear uno por defecto
    const defaultConfig = { theme: "light", language: "es" };
    await fileSystem.writeFile(
      configPath,
      JSON.stringify(defaultConfig, null, 2),
      "utf8"
    );
    return defaultConfig;
  }
};
```

### Cache de Archivos

```typescript
const getCachedFile = async (url: string, filename: string) => {
  const cachePath = fileSystem.getCachePath();
  const filePath = `${cachePath}/${filename}`;

  // Verificar si ya está en caché
  const exists = await fileSystem.exists(filePath);
  if (exists) {
    return filePath;
  }

  // Descargar y guardar en caché
  await fileSystem.downloadFile(url, filePath);
  return filePath;
};
```

## API

### FileSystemPort

| Método | Descripción |
|--------|-------------|
| `readFile(path, encoding?)` | Lee contenido de archivo |
| `writeFile(path, content, encoding?)` | Escribe contenido en archivo |
| `deleteFile(path)` | Elimina archivo |
| `exists(path)` | Verifica si archivo existe |
| `getFileInfo(path)` | Obtiene información del archivo |
| `listFiles(dirPath)` | Lista archivos en directorio |
| `mkdir(dirPath)` | Crea directorio |
| `rmdir(dirPath, recursive?)` | Elimina directorio |
| `downloadFile(url, destination, options?)` | Descarga archivo desde URL |
| `uploadFile(filePath, url, options?)` | Sube archivo a servidor |
| `getDocumentsPath()` | Ruta de directorio de documentos |
| `getCachePath()` | Ruta de directorio de caché |
| `getTempPath()` | Ruta de directorio temporal |

## Tipos

### DownloadOptions

```typescript
interface DownloadOptions {
  headers?: Record<string, string>;
  onProgress?: (downloaded: number, total: number) => void;
  timeout?: number;
  overwrite?: boolean;
}
```

### UploadOptions

```typescript
interface UploadOptions {
  headers?: Record<string, string>;
  onProgress?: (uploaded: number, total: number) => void;
  timeout?: number;
  fieldName?: string;
  formData?: Record<string, string | number>;
}
```

### FileInfo

```typescript
interface FileInfo {
  path: string;
  size: number;
  lastModified: Date;
  mimeType?: string;
  exists: boolean;
}
```

## Notas

- **Encoding**: Usa `'utf8'` para texto y `'base64'` para binarios (imágenes, PDFs, etc.)
- **Rutas**: Usa `getDocumentsPath()`, `getCachePath()`, o `getTempPath()` para obtener rutas del sistema
- **Progreso**: Los callbacks de progreso se ejecutan en el hilo principal, ideal para actualizar UI
- **Errores**: Todos los errores se convierten a `NativefyError` con códigos apropiados

