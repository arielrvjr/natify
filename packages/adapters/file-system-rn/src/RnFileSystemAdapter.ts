import ReactNativeBlobUtil, {
  ReactNativeBlobUtilConfig,
  ReactNativeBlobUtilStat,
} from 'react-native-blob-util';
import {
  FileSystemPort,
  FileInfo,
  DownloadOptions,
  UploadOptions,
  DownloadResult,
  UploadResult,
  NatifyError,
  NatifyErrorCode,
} from '@natify/core';

/**
 * Adapter de sistema de archivos para React Native usando react-native-blob-util.
 *
 * Soporta:
 * - Lectura y escritura de archivos locales
 * - Descarga de archivos desde URLs
 * - Subida de archivos a servidores
 * - Operaciones de directorios
 *
 * @example
 * ```typescript
 * import { RnFileSystemAdapter } from '@natify/file-system-rn';
 *
 * const fileSystem = new RnFileSystemAdapter();
 *
 * // En NatifyProvider
 * const config = {
 *   filesystem: fileSystem,
 *   // ... otros adapters
 * };
 * ```
 */
export class RnFileSystemAdapter implements FileSystemPort {
  readonly capability = 'filesystem';

  private fs = ReactNativeBlobUtil.fs;

  /**
   * Lee el contenido de un archivo local
   */
  async readFile(filePath: string, encoding: 'utf8' | 'base64' = 'utf8'): Promise<string> {
    try {
      const content = await this.fs.readFile(filePath, encoding);
      return content as string;
    } catch (error) {
      throw new NatifyError(
        NatifyErrorCode.STORAGE_READ_ERROR,
        `Failed to read file: ${filePath}`,
        error,
        { filePath },
      );
    }
  }

  /**
   * Escribe contenido en un archivo local
   */
  async writeFile(
    filePath: string,
    content: string,
    encoding: 'utf8' | 'base64' = 'utf8',
  ): Promise<void> {
    try {
      // Crear directorio padre si no existe
      const dirPath = filePath.substring(0, filePath.lastIndexOf('/'));
      if (dirPath) {
        const exists = await this.fs.exists(dirPath);
        if (!exists) {
          await this.fs.mkdir(dirPath);
        }
      }

      await this.fs.writeFile(filePath, content, encoding);
    } catch (error) {
      throw new NatifyError(
        NatifyErrorCode.STORAGE_WRITE_ERROR,
        `Failed to write file: ${filePath}`,
        error,
        { filePath },
      );
    }
  }

  /**
   * Elimina un archivo local
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const exists = await this.fs.exists(filePath);
      if (!exists) {
        return; // No lanzar error si no existe
      }
      await this.fs.unlink(filePath);
    } catch (error) {
      throw new NatifyError(
        NatifyErrorCode.STORAGE_WRITE_ERROR,
        `Failed to delete file: ${filePath}`,
        error,
        { filePath },
      );
    }
  }

  /**
   * Verifica si un archivo existe
   */
  async exists(filePath: string): Promise<boolean> {
    try {
      return await this.fs.exists(filePath);
    } catch {
      return false;
    }
  }

  /**
   * Obtiene información de un archivo
   */
  async getFileInfo(filePath: string): Promise<FileInfo | null> {
    try {
      const exists = await this.fs.exists(filePath);
      if (!exists) {
        return null;
      }

      const stat: ReactNativeBlobUtilStat = await this.fs.stat(filePath);

      return {
        path: filePath,
        size: stat.size,
        lastModified: new Date(stat.lastModified || Date.now()),
        exists: true,
        mimeType: this.getMimeType(filePath),
      };
    } catch (error) {
      throw new NatifyError(
        NatifyErrorCode.STORAGE_READ_ERROR,
        `Failed to get file info: ${filePath}`,
        error,
        { filePath },
      );
    }
  }

  /**
   * Lista archivos en un directorio
   */
  async listFiles(dirPath: string): Promise<string[]> {
    try {
      const exists = await this.fs.exists(dirPath);
      if (!exists) {
        return [];
      }

      const files = await this.fs.ls(dirPath);
      return files;
    } catch (error) {
      throw new NatifyError(
        NatifyErrorCode.STORAGE_READ_ERROR,
        `Failed to list files in directory: ${dirPath}`,
        error,
        { dirPath },
      );
    }
  }

  /**
   * Crea un directorio (y sus padres si no existen)
   */
  async mkdir(dirPath: string): Promise<void> {
    try {
      const exists = await this.fs.exists(dirPath);
      if (exists) {
        return; // Ya existe
      }
      await this.fs.mkdir(dirPath);
    } catch (error) {
      throw new NatifyError(
        NatifyErrorCode.STORAGE_WRITE_ERROR,
        `Failed to create directory: ${dirPath}`,
        error,
        { dirPath },
      );
    }
  }

  /**
   * Elimina un directorio y su contenido
   */
  async rmdir(dirPath: string, _recursive: boolean = true): Promise<void> {
    try {
      const exists = await this.fs.exists(dirPath);
      if (!exists) {
        return; // No lanzar error si no existe
      }

      // react-native-blob-util solo tiene unlink, que elimina archivos y directorios
      await this.fs.unlink(dirPath);
    } catch (error) {
      throw new NatifyError(
        NatifyErrorCode.STORAGE_WRITE_ERROR,
        `Failed to remove directory: ${dirPath}`,
        error,
        { dirPath },
      );
    }
  }

  /**
   * Descarga un archivo desde una URL y lo guarda localmente
   */
  async downloadFile(
    url: string,
    destinationPath: string,
    options?: DownloadOptions,
  ): Promise<DownloadResult> {
    try {
      // Crear directorio padre si no existe
      const dirPath = destinationPath.substring(0, destinationPath.lastIndexOf('/'));
      if (dirPath) {
        const exists = await this.fs.exists(dirPath);
        if (!exists) {
          await this.fs.mkdir(dirPath);
        }
      }

      // Verificar si el archivo ya existe
      if (!options?.overwrite) {
        const exists = await this.fs.exists(destinationPath);
        if (exists) {
          const info = await this.getFileInfo(destinationPath);
          if (info) {
            return {
              path: destinationPath,
              size: info.size,
            };
          }
        }
      }

      const config: ReactNativeBlobUtilConfig = {
        fileCache: false,
        path: destinationPath,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          title: destinationPath.split('/').pop() || 'Download',
          description: 'File download',
          mime: this.getMimeType(destinationPath),
          mediaScannable: true,
        },
        ...(options?.headers && { headers: options.headers }),
        ...(options?.timeout && { timeout: options.timeout }),
      };

      await ReactNativeBlobUtil.config(config)
        .fetch('GET', url)
        .progress((received: string, total: string) => {
          const receivedNum = parseInt(received, 10);
          const totalNum = parseInt(total, 10);
          options?.onProgress?.(receivedNum, totalNum);
        });

      const stat = await this.fs.stat(destinationPath);

      return {
        path: destinationPath,
        size: stat.size,
      };
    } catch (error) {
      throw new NatifyError(
        NatifyErrorCode.NETWORK_ERROR,
        `Failed to download file from ${url}`,
        error,
        { url, destinationPath },
      );
    }
  }

  /**
   * Sube un archivo local a un servidor
   */
  async uploadFile(filePath: string, url: string, options?: UploadOptions): Promise<UploadResult> {
    try {
      const exists = await this.fs.exists(filePath);
      if (!exists) {
        throw new NatifyError(NatifyErrorCode.NOT_FOUND, `File not found: ${filePath}`, undefined, {
          filePath,
        });
      }

      const fileInfo = await this.getFileInfo(filePath);
      if (!fileInfo) {
        throw new NatifyError(NatifyErrorCode.NOT_FOUND, `File not found: ${filePath}`, undefined, {
          filePath,
        });
      }

      const fieldName = options?.fieldName || 'file';
      const formData: Record<string, any> = {
        [fieldName]: {
          uri: `file://${filePath}`,
          type: fileInfo.mimeType || 'application/octet-stream',
          name: filePath.split('/').pop() || 'file',
        },
        ...(options?.formData || {}),
      };

      const config: ReactNativeBlobUtilConfig = {
        ...(options?.headers && { headers: options.headers }),
        ...(options?.timeout && { timeout: options.timeout }),
      };

      const response = await ReactNativeBlobUtil.config(config)
        .fetch('POST', url, options?.headers || {}, formData)
        .uploadProgress((written: number, total: number) => {
          options?.onProgress?.(written, total);
        });

      const responseInfo = response.info();
      let responseData: any;

      try {
        responseData = response.json();
      } catch {
        responseData = response.text();
      }

      return {
        data: responseData,
        status: responseInfo.status || 200,
        headers: (responseInfo.headers as Record<string, string>) || {},
      };
    } catch (error) {
      if (error instanceof NatifyError) {
        throw error;
      }

      throw new NatifyError(
        NatifyErrorCode.NETWORK_ERROR,
        `Failed to upload file to ${url}`,
        error,
        { url, filePath },
      );
    }
  }

  /**
   * Obtiene la ruta del directorio de documentos de la app
   */
  getDocumentsPath(): string {
    return ReactNativeBlobUtil.fs.dirs.DocumentDir;
  }

  /**
   * Obtiene la ruta del directorio de caché de la app
   */
  getCachePath(): string {
    return ReactNativeBlobUtil.fs.dirs.CacheDir;
  }

  /**
   * Obtiene la ruta del directorio temporal de la app
   */
  getTempPath(): string {
    // react-native-blob-util usa CacheDir como directorio temporal
    return ReactNativeBlobUtil.fs.dirs.CacheDir;
  }

  /**
   * Obtiene el tipo MIME basado en la extensión del archivo
   */
  private getMimeType(filePath: string): string | undefined {
    const ext = filePath.split('.').pop()?.toLowerCase();
    if (!ext) return undefined;

    const mimeTypes: Record<string, string> = {
      // Imágenes
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      // Documentos
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      // Texto
      txt: 'text/plain',
      json: 'application/json',
      xml: 'application/xml',
      csv: 'text/csv',
      // Audio
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      // Video
      mp4: 'video/mp4',
      mov: 'video/quicktime',
    };

    return mimeTypes[ext];
  }
}
