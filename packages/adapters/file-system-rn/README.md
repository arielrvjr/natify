# @natify/file-system-rn

File system adapter for Natify Framework using `react-native-blob-util`.

## Installation

```bash
pnpm add @natify/file-system-rn react-native-blob-util
```

### iOS

```bash
cd ios && pod install && cd ..
```

### Android

No additional configuration required.

## Usage

### Provider Configuration

```typescript
import { NatifyProvider } from "@natify/core";
import { RnFileSystemAdapter } from "@natify/file-system-rn";

const config = {
  filesystem: new RnFileSystemAdapter(),
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

## Local Operations

### Read File

```typescript
import { useAdapter, FileSystemPort } from "@natify/core";

function MyComponent() {
  const fileSystem = useAdapter<FileSystemPort>("filesystem");

  const readFile = async () => {
    try {
      // Read as text
      const content = await fileSystem.readFile("/path/to/file.txt", "utf8");
      console.log(content);

      // Read as base64 (for images, PDFs, etc.)
      const imageBase64 = await fileSystem.readFile("/path/to/image.png", "base64");
    } catch (error) {
      console.error("Error reading file:", error);
    }
  };
}
```

### Write File

```typescript
const writeFile = async () => {
  // Write text
  await fileSystem.writeFile("/path/to/file.txt", "Hello World", "utf8");

  // Write base64
  await fileSystem.writeFile("/path/to/image.png", base64String, "base64");
};
```

### Check Existence

```typescript
const checkFile = async () => {
  const exists = await fileSystem.exists("/path/to/file.txt");
  if (exists) {
    console.log("File exists!");
  }
};
```

### Get File Information

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

### List Files in Directory

```typescript
const listFiles = async () => {
  const files = await fileSystem.listFiles("/path/to/directory");
  console.log("Files:", files);
};
```

### Directory Operations

```typescript
// Create directory
await fileSystem.mkdir("/path/to/new/directory");

// Delete directory (recursive by default)
await fileSystem.rmdir("/path/to/directory", true);
```

## Directory Paths

```typescript
// Get system directory paths
const documentsPath = fileSystem.getDocumentsPath();
const cachePath = fileSystem.getCachePath();
const tempPath = fileSystem.getTempPath();

// Save file in documents
const filePath = `${documentsPath}/myfile.txt`;
await fileSystem.writeFile(filePath, "Content", "utf8");
```

## File Download

### Simple Download

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

### Download with Progress

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
      timeout: 30000, // 30 seconds
    }
  );
};
```

### Download with Custom Headers

```typescript
await fileSystem.downloadFile(url, destinationPath, {
  headers: {
    Authorization: "Bearer your-token",
    "Custom-Header": "value",
  },
});
```

## File Upload

### Simple Upload

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

### Upload with Progress

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
    fieldName: "video", // Form field name
    formData: {
      title: "My Video",
      description: "Video description",
    },
  });
};
```

### Upload with Additional FormData

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

## Common Use Cases

### Download and Save PDF

```typescript
const downloadPDF = async (url: string, filename: string) => {
  const documentsPath = fileSystem.getDocumentsPath();
  const filePath = `${documentsPath}/${filename}`;

  await fileSystem.downloadFile(url, filePath, {
    onProgress: (downloaded, total) => {
      // Update UI with progress
      updateProgressBar((downloaded / total) * 100);
    },
  });

  return filePath;
};
```

### Upload Image from Gallery

```typescript
import { useAdapter, FileSystemPort, ImagePickerPort } from "@natify/core";

function ImageUploader() {
  const fileSystem = useAdapter<FileSystemPort>("filesystem");
  const imagePicker = useAdapter<ImagePickerPort>("imagepicker");

  const uploadImage = async () => {
    // 1. Select image
    const image = await imagePicker.pickImage({
      quality: 0.8,
    });

    if (!image) return;

    // 2. Upload image
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

### Read and Process JSON

```typescript
const loadConfig = async () => {
  const configPath = `${fileSystem.getDocumentsPath()}/config.json`;
  
  try {
    const content = await fileSystem.readFile(configPath, "utf8");
    const config = JSON.parse(content);
    return config;
  } catch (error) {
    // If doesn't exist, create default one
    const defaultConfig = { theme: "light", language: "en" };
    await fileSystem.writeFile(
      configPath,
      JSON.stringify(defaultConfig, null, 2),
      "utf8"
    );
    return defaultConfig;
  }
};
```

### File Cache

```typescript
const getCachedFile = async (url: string, filename: string) => {
  const cachePath = fileSystem.getCachePath();
  const filePath = `${cachePath}/${filename}`;

  // Check if already cached
  const exists = await fileSystem.exists(filePath);
  if (exists) {
    return filePath;
  }

  // Download and save to cache
  await fileSystem.downloadFile(url, filePath);
  return filePath;
};
```

## API

### FileSystemPort

| Method | Description |
|--------|-------------|
| `readFile(path, encoding?)` | Reads file content |
| `writeFile(path, content, encoding?)` | Writes content to file |
| `deleteFile(path)` | Deletes file |
| `exists(path)` | Checks if file exists |
| `getFileInfo(path)` | Gets file information |
| `listFiles(dirPath)` | Lists files in directory |
| `mkdir(dirPath)` | Creates directory |
| `rmdir(dirPath, recursive?)` | Deletes directory |
| `downloadFile(url, destination, options?)` | Downloads file from URL |
| `uploadFile(filePath, url, options?)` | Uploads file to server |
| `getDocumentsPath()` | Documents directory path |
| `getCachePath()` | Cache directory path |
| `getTempPath()` | Temp directory path |

## Types

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

## Notes

- **Encoding**: Use `'utf8'` for text and `'base64'` for binaries (images, PDFs, etc.)
- **Paths**: Use `getDocumentsPath()`, `getCachePath()`, or `getTempPath()` to get system paths
- **Progress**: Progress callbacks run on main thread, ideal for updating UI
- **Errors**: All errors are converted to `NatifyError` with appropriate codes
