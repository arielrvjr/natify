import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
  MediaType,
  PhotoQuality,
} from 'react-native-image-picker';
import {
  ImagePickerPort,
  ImagePickerOptions,
  ImagePickerResult,
  NatifyError,
  NatifyErrorCode,
} from '@natify/core';

export class RnImagePickerAdapter implements ImagePickerPort {
  readonly capability = 'image-picker';

  async pickImage(options?: ImagePickerOptions): Promise<ImagePickerResult | null> {
    try {
      const result = await this.launchImageLibrary(options);
      return this.mapResponseToResult(result);
    } catch (error) {
      throw new NatifyError(NatifyErrorCode.UNKNOWN, 'Error al seleccionar imagen', error, {
        options,
      });
    }
  }

  async takePhoto(options?: ImagePickerOptions): Promise<ImagePickerResult | null> {
    try {
      const result = await this.launchCamera(options);
      return this.mapResponseToResult(result);
    } catch (error) {
      throw new NatifyError(NatifyErrorCode.UNKNOWN, 'Error al tomar foto', error, { options });
    }
  }

  async pickMultipleImages(options?: ImagePickerOptions): Promise<ImagePickerResult[]> {
    try {
      const result = await this.launchImageLibrary({
        ...options,
        allowsMultipleSelection: true,
      });
      return this.mapMultipleResponseToResults(result);
    } catch (error) {
      throw new NatifyError(NatifyErrorCode.UNKNOWN, 'Error al seleccionar imágenes', error, {
        options,
      });
    }
  }

  private launchImageLibrary(options?: ImagePickerOptions): Promise<ImagePickerResponse> {
    return new Promise((resolve, reject) => {
      const mediaType: MediaType =
        options?.mediaType === 'video'
          ? 'video'
          : options?.mediaType === 'mixed'
            ? 'mixed'
            : 'photo';

      launchImageLibrary(
        {
          mediaType,
          quality: (options?.quality ?? 0.8) as PhotoQuality,
          maxWidth: options?.maxWidth,
          maxHeight: options?.maxHeight,
          selectionLimit: options?.allowsMultipleSelection ? 0 : 1,
          includeBase64: options?.includeBase64 ?? false,
        },
        (response: ImagePickerResponse) => {
          if (response.didCancel) {
            resolve(response);
            return;
          }
          if (response.errorCode) {
            reject(new Error(response.errorMessage || 'Error desconocido'));
            return;
          }
          resolve(response);
        },
      );
    });
  }

  private launchCamera(options?: ImagePickerOptions): Promise<ImagePickerResponse> {
    return new Promise((resolve, reject) => {
      const mediaType: MediaType = options?.mediaType === 'video' ? 'video' : 'photo';

      launchCamera(
        {
          mediaType,
          quality: (options?.quality ?? 0.8) as PhotoQuality,
          maxWidth: options?.maxWidth,
          maxHeight: options?.maxHeight,
          includeBase64: options?.includeBase64 ?? false,
        },
        (response: ImagePickerResponse) => {
          if (response.didCancel) {
            resolve(response);
            return;
          }
          if (response.errorCode) {
            reject(new Error(response.errorMessage || 'Error desconocido'));
            return;
          }
          resolve(response);
        },
      );
    });
  }

  private mapResponseToResult(response: ImagePickerResponse): ImagePickerResult | null {
    if (response.didCancel || !response.assets || response.assets.length === 0) {
      return null;
    }

    const asset = response.assets[0];
    return {
      uri: asset.uri || '',
      type: asset.type,
      fileName: asset.fileName,
      fileSize: asset.fileSize,
      width: asset.width,
      height: asset.height,
      base64: asset.base64,
    };
  }

  private mapMultipleResponseToResults(response: ImagePickerResponse): ImagePickerResult[] {
    if (response.didCancel || !response.assets || response.assets.length === 0) {
      return [];
    }

    return response.assets.map(asset => ({
      uri: asset.uri || '',
      type: asset.type,
      fileName: asset.fileName,
      fileSize: asset.fileSize,
      width: asset.width,
      height: asset.height,
      base64: asset.base64,
    }));
  }
}

