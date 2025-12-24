import { Port } from './Port';

export interface ImagePickerOptions {
  /**
   * Calidad de la imagen (0-1)
   * @default 0.8
   */
  quality?: number;

  /**
   * Ancho máximo de la imagen
   */
  maxWidth?: number;

  /**
   * Alto máximo de la imagen
   */
  maxHeight?: number;

  /**
   * Permitir seleccionar múltiples imágenes
   * @default false
   */
  allowsMultipleSelection?: boolean;

  /**
   * Tipo de medio a seleccionar
   * @default 'photo'
   */
  mediaType?: 'photo' | 'video' | 'mixed';

  /**
   * Incluir datos base64 de la imagen
   * @default false
   */
  includeBase64?: boolean;
}

export interface ImagePickerResult {
  /**
   * URI de la imagen seleccionada
   */
  uri: string;

  /**
   * Tipo MIME de la imagen
   */
  type?: string;

  /**
   * Nombre del archivo
   */
  fileName?: string;

  /**
   * Tamaño del archivo en bytes
   */
  fileSize?: number;

  /**
   * Ancho de la imagen
   */
  width?: number;

  /**
   * Alto de la imagen
   */
  height?: number;

  /**
   * Datos base64 (si includeBase64 es true)
   */
  base64?: string;
}

export interface ImagePickerPort extends Port {
  readonly capability: 'image-picker';

  /**
   * Abre el selector de imágenes (galería o cámara)
   * @param options Opciones de configuración
   * @returns Resultado con la imagen seleccionada o null si se canceló
   */
  pickImage(options?: ImagePickerOptions): Promise<ImagePickerResult | null>;

  /**
   * Abre la cámara para tomar una foto
   * @param options Opciones de configuración
   * @returns Resultado con la imagen capturada o null si se canceló
   */
  takePhoto(options?: ImagePickerOptions): Promise<ImagePickerResult | null>;

  /**
   * Abre el selector de imágenes múltiples
   * @param options Opciones de configuración
   * @returns Array de imágenes seleccionadas
   */
  pickMultipleImages(options?: ImagePickerOptions): Promise<ImagePickerResult[]>;
}
