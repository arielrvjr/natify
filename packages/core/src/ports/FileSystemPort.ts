import { Port } from './Port';

/**
 * Información de un archivo
 */
export interface FileInfo {
  /** Ruta completa del archivo */
  path: string;
  /** Tamaño en bytes */
  size: number;
  /** Fecha de última modificación */
  lastModified: Date;
  /** Tipo MIME del archivo (si está disponible) */
  mimeType?: string;
  /** Si el archivo existe */
  exists: boolean;
}

/**
 * Opciones para descargar un archivo
 */
export interface DownloadOptions {
  /** Headers HTTP adicionales */
  headers?: Record<string, string>;
  /** Callback de progreso (bytes descargados, total) */
  onProgress?: (bytesDownloaded: number, totalBytes: number) => void;
  /** Timeout en milisegundos */
  timeout?: number;
  /** Si sobrescribir el archivo si ya existe */
  overwrite?: boolean;
}

/**
 * Opciones para subir un archivo
 */
export interface UploadOptions {
  /** Headers HTTP adicionales */
  headers?: Record<string, string>;
  /** Callback de progreso (bytes subidos, total) */
  onProgress?: (bytesUploaded: number, totalBytes: number) => void;
  /** Timeout en milisegundos */
  timeout?: number;
  /** Nombre del campo en el formulario multipart (default: 'file') */
  fieldName?: string;
  /** Parámetros adicionales para el formulario */
  formData?: Record<string, string | number>;
}

/**
 * Resultado de una descarga
 */
export interface DownloadResult {
  /** Ruta local del archivo descargado */
  path: string;
  /** Tamaño del archivo en bytes */
  size: number;
}

/**
 * Resultado de una subida
 */
export interface UploadResult {
  /** Respuesta del servidor */
  data: any;
  /** Status HTTP */
  status: number;
  /** Headers de respuesta */
  headers: Record<string, string>;
}

/**
 * Puerto para operaciones con el sistema de archivos.
 * Incluye operaciones locales (lectura, escritura) y de transferencia (descarga, subida).
 */
export interface FileSystemPort extends Port {
  readonly capability: 'filesystem';

  /**
   * Lee el contenido de un archivo local.
   * @param filePath Ruta del archivo
   * @param encoding Codificación del archivo (default: 'utf8'). Para binarios usar 'base64'
   * @returns Contenido del archivo como string o base64
   */
  readFile(filePath: string, encoding?: 'utf8' | 'base64'): Promise<string>;

  /**
   * Escribe contenido en un archivo local.
   * @param filePath Ruta donde guardar el archivo
   * @param content Contenido a escribir
   * @param encoding Codificación (default: 'utf8'). Para binarios usar 'base64'
   */
  writeFile(filePath: string, content: string, encoding?: 'utf8' | 'base64'): Promise<void>;

  /**
   * Elimina un archivo local.
   * @param filePath Ruta del archivo a eliminar
   */
  deleteFile(filePath: string): Promise<void>;

  /**
   * Verifica si un archivo existe.
   * @param filePath Ruta del archivo
   * @returns true si existe, false si no
   */
  exists(filePath: string): Promise<boolean>;

  /**
   * Obtiene información de un archivo.
   * @param filePath Ruta del archivo
   * @returns Información del archivo o null si no existe
   */
  getFileInfo(filePath: string): Promise<FileInfo | null>;

  /**
   * Lista archivos en un directorio.
   * @param dirPath Ruta del directorio
   * @returns Lista de rutas de archivos
   */
  listFiles(dirPath: string): Promise<string[]>;

  /**
   * Crea un directorio (y sus padres si no existen).
   * @param dirPath Ruta del directorio a crear
   */
  mkdir(dirPath: string): Promise<void>;

  /**
   * Elimina un directorio y su contenido.
   * @param dirPath Ruta del directorio
   * @param recursive Si eliminar recursivamente (default: true)
   */
  rmdir(dirPath: string, recursive?: boolean): Promise<void>;

  /**
   * Descarga un archivo desde una URL y lo guarda localmente.
   * @param url URL del archivo a descargar
   * @param destinationPath Ruta local donde guardar el archivo
   * @param options Opciones de descarga
   * @returns Información del archivo descargado
   */
  downloadFile(
    url: string,
    destinationPath: string,
    options?: DownloadOptions,
  ): Promise<DownloadResult>;

  /**
   * Sube un archivo local a un servidor.
   * @param filePath Ruta local del archivo a subir
   * @param url URL del endpoint donde subir
   * @param options Opciones de subida
   * @returns Respuesta del servidor
   */
  uploadFile(filePath: string, url: string, options?: UploadOptions): Promise<UploadResult>;

  /**
   * Obtiene la ruta del directorio de documentos de la app.
   * @returns Ruta absoluta del directorio de documentos
   */
  getDocumentsPath(): string;

  /**
   * Obtiene la ruta del directorio de caché de la app.
   * @returns Ruta absoluta del directorio de caché
   */
  getCachePath(): string;

  /**
   * Obtiene la ruta del directorio temporal de la app.
   * @returns Ruta absoluta del directorio temporal
   */
  getTempPath(): string;
}

