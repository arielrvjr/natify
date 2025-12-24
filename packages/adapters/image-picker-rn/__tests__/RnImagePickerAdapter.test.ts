const mockLaunchImageLibrary = jest.fn();
const mockLaunchCamera = jest.fn();

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: mockLaunchImageLibrary,
  launchCamera: mockLaunchCamera,
}));

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
  StyleSheet: {
    create: jest.fn((styles) => styles),
    flatten: jest.fn((style) => style),
  },
}));

import { RnImagePickerAdapter } from '../src';
import { NatifyError } from '@natify/core';

describe('RnImagePickerAdapter', () => {
  let adapter: RnImagePickerAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new RnImagePickerAdapter();
  });

  describe('capability', () => {
    it('should have correct capability', () => {
      expect(adapter.capability).toBe('image-picker');
    });
  });

  describe('pickImage', () => {
    it('should return image result when selection succeeds', async () => {
      const mockResponse = {
        didCancel: false,
        errorCode: undefined,
        assets: [
          {
            uri: 'file:///path/to/image.jpg',
            type: 'image/jpeg',
            fileName: 'image.jpg',
            fileSize: 1024,
            width: 100,
            height: 100,
            base64: 'base64string',
          },
        ],
      };

      mockLaunchImageLibrary.mockImplementation((options, callback) => {
        callback(mockResponse);
      });

      const result = await adapter.pickImage();

      expect(result).toEqual({
        uri: 'file:///path/to/image.jpg',
        type: 'image/jpeg',
        fileName: 'image.jpg',
        fileSize: 1024,
        width: 100,
        height: 100,
        base64: 'base64string',
      });
      expect(mockLaunchImageLibrary).toHaveBeenCalled();
    });

    it('should return null when user cancels', async () => {
      const mockResponse = {
        didCancel: true,
        errorCode: undefined,
        assets: [],
      };

      mockLaunchImageLibrary.mockImplementation((options, callback) => {
        callback(mockResponse);
      });

      const result = await adapter.pickImage();

      expect(result).toBeNull();
    });

    it('should return null when no assets', async () => {
      const mockResponse = {
        didCancel: false,
        errorCode: undefined,
        assets: [],
      };

      mockLaunchImageLibrary.mockImplementation((options, callback) => {
        callback(mockResponse);
      });

      const result = await adapter.pickImage();

      expect(result).toBeNull();
    });

    it('should throw NatifyError when error occurs', async () => {
      const mockResponse = {
        didCancel: false,
        errorCode: 'permission',
        errorMessage: 'Permission denied',
        assets: [],
      };

      mockLaunchImageLibrary.mockImplementation((options, callback) => {
        callback(mockResponse);
      });

      await expect(adapter.pickImage()).rejects.toThrow(NatifyError);
      await expect(adapter.pickImage()).rejects.toThrow('Error al seleccionar imagen');
    });

    it('should pass options to launchImageLibrary', async () => {
      const mockResponse = {
        didCancel: true,
        errorCode: undefined,
        assets: [],
      };

      mockLaunchImageLibrary.mockImplementation((options, callback) => {
        callback(mockResponse);
      });

      await adapter.pickImage({
        mediaType: 'video',
        quality: 0.5,
        maxWidth: 800,
        maxHeight: 600,
        includeBase64: true,
      });

      expect(mockLaunchImageLibrary).toHaveBeenCalledWith(
        {
          mediaType: 'video',
          quality: 0.5,
          maxWidth: 800,
          maxHeight: 600,
          selectionLimit: 1,
          includeBase64: true,
        },
        expect.any(Function),
      );
    });

    it('should handle mixed mediaType', async () => {
      const mockResponse = {
        didCancel: true,
        errorCode: undefined,
        assets: [],
      };

      mockLaunchImageLibrary.mockImplementation((options, callback) => {
        callback(mockResponse);
      });

      await adapter.pickImage({
        mediaType: 'mixed',
      });

      expect(mockLaunchImageLibrary).toHaveBeenCalledWith(
        expect.objectContaining({
          mediaType: 'mixed',
        }),
        expect.any(Function),
      );
    });

    it('should handle errorCode in launchImageLibrary', async () => {
      const mockResponse = {
        didCancel: false,
        errorCode: 'permission',
        errorMessage: 'Permission denied',
        assets: [],
      };

      mockLaunchImageLibrary.mockImplementation((options, callback) => {
        callback(mockResponse);
      });

      await expect(adapter.pickImage()).rejects.toThrow(NatifyError);
    });

    it('should handle empty uri in mapResponseToResult', async () => {
      const mockResponse = {
        didCancel: false,
        errorCode: undefined,
        assets: [
          {
            uri: undefined,
            type: 'image/jpeg',
            fileName: 'image.jpg',
            fileSize: 1024,
            width: 100,
            height: 100,
          },
        ],
      };

      mockLaunchImageLibrary.mockImplementation((options, callback) => {
        callback(mockResponse);
      });

      const result = await adapter.pickImage();

      expect(result).toEqual({
        uri: '',
        type: 'image/jpeg',
        fileName: 'image.jpg',
        fileSize: 1024,
        width: 100,
        height: 100,
        base64: undefined,
      });
    });
  });

  describe('takePhoto', () => {
    it('should return photo result when capture succeeds', async () => {
      const mockResponse = {
        didCancel: false,
        errorCode: undefined,
        assets: [
          {
            uri: 'file:///path/to/photo.jpg',
            type: 'image/jpeg',
            fileName: 'photo.jpg',
            fileSize: 2048,
            width: 200,
            height: 200,
          },
        ],
      };

      mockLaunchCamera.mockImplementation((options, callback) => {
        callback(mockResponse);
      });

      const result = await adapter.takePhoto();

      expect(result).toEqual({
        uri: 'file:///path/to/photo.jpg',
        type: 'image/jpeg',
        fileName: 'photo.jpg',
        fileSize: 2048,
        width: 200,
        height: 200,
        base64: undefined,
      });
      expect(mockLaunchCamera).toHaveBeenCalled();
    });

    it('should return null when user cancels', async () => {
      const mockResponse = {
        didCancel: true,
        errorCode: undefined,
        assets: [],
      };

      mockLaunchCamera.mockImplementation((options, callback) => {
        callback(mockResponse);
      });

      const result = await adapter.takePhoto();

      expect(result).toBeNull();
    });

    it('should throw NatifyError when error occurs', async () => {
      const mockResponse = {
        didCancel: false,
        errorCode: 'camera_unavailable',
        errorMessage: 'Camera not available',
        assets: [],
      };

      mockLaunchCamera.mockImplementation((options, callback) => {
        callback(mockResponse);
      });

      await expect(adapter.takePhoto()).rejects.toThrow(NatifyError);
      await expect(adapter.takePhoto()).rejects.toThrow('Error al tomar foto');
    });

    it('should handle errorCode in launchCamera', async () => {
      const mockResponse = {
        didCancel: false,
        errorCode: 'camera_error',
        errorMessage: 'Camera error',
        assets: [],
      };

      mockLaunchCamera.mockImplementation((options, callback) => {
        callback(mockResponse);
      });

      await expect(adapter.takePhoto()).rejects.toThrow(NatifyError);
    });

    it('should pass options to launchCamera', async () => {
      const mockResponse = {
        didCancel: true,
        errorCode: undefined,
        assets: [],
      };

      mockLaunchCamera.mockImplementation((options, callback) => {
        callback(mockResponse);
      });

      await adapter.takePhoto({
        mediaType: 'video',
        quality: 0.7,
        maxWidth: 1920,
        maxHeight: 1080,
        includeBase64: false,
      });

      expect(mockLaunchCamera).toHaveBeenCalledWith(
        {
          mediaType: 'video',
          quality: 0.7,
          maxWidth: 1920,
          maxHeight: 1080,
          includeBase64: false,
        },
        expect.any(Function),
      );
    });
  });

  describe('pickMultipleImages', () => {
    it('should return array of image results when selection succeeds', async () => {
      const mockResponse = {
        didCancel: false,
        errorCode: undefined,
        assets: [
          {
            uri: 'file:///path/to/image1.jpg',
            type: 'image/jpeg',
            fileName: 'image1.jpg',
            fileSize: 1024,
            width: 100,
            height: 100,
          },
          {
            uri: 'file:///path/to/image2.jpg',
            type: 'image/jpeg',
            fileName: 'image2.jpg',
            fileSize: 2048,
            width: 200,
            height: 200,
          },
        ],
      };

      mockLaunchImageLibrary.mockImplementation((options, callback) => {
        callback(mockResponse);
      });

      const result = await adapter.pickMultipleImages();

      expect(result).toHaveLength(2);
      expect(result[0].uri).toBe('file:///path/to/image1.jpg');
      expect(result[1].uri).toBe('file:///path/to/image2.jpg');
      expect(mockLaunchImageLibrary).toHaveBeenCalledWith(
        expect.objectContaining({
          selectionLimit: 0,
        }),
        expect.any(Function),
      );
    });

    it('should return empty array when user cancels', async () => {
      const mockResponse = {
        didCancel: true,
        errorCode: undefined,
        assets: [],
      };

      mockLaunchImageLibrary.mockImplementation((options, callback) => {
        callback(mockResponse);
      });

      const result = await adapter.pickMultipleImages();

      expect(result).toEqual([]);
    });

    it('should return empty array when no assets', async () => {
      const mockResponse = {
        didCancel: false,
        errorCode: undefined,
        assets: [],
      };

      mockLaunchImageLibrary.mockImplementation((options, callback) => {
        callback(mockResponse);
      });

      const result = await adapter.pickMultipleImages();

      expect(result).toEqual([]);
    });

    it('should throw NatifyError when error occurs', async () => {
      const mockResponse = {
        didCancel: false,
        errorCode: 'permission',
        errorMessage: 'Permission denied',
        assets: [],
      };

      mockLaunchImageLibrary.mockImplementation((options, callback) => {
        callback(mockResponse);
      });

      await expect(adapter.pickMultipleImages()).rejects.toThrow(NatifyError);
      await expect(adapter.pickMultipleImages()).rejects.toThrow('Error al seleccionar imágenes');
    });

    it('should handle empty uri in mapMultipleResponseToResults', async () => {
      const mockResponse = {
        didCancel: false,
        errorCode: undefined,
        assets: [
          {
            uri: undefined,
            type: 'image/jpeg',
            fileName: 'image1.jpg',
            fileSize: 1024,
            width: 100,
            height: 100,
          },
          {
            uri: 'file:///path/to/image2.jpg',
            type: 'image/png',
            fileName: 'image2.png',
            fileSize: 2048,
            width: 200,
            height: 200,
          },
        ],
      };

      mockLaunchImageLibrary.mockImplementation((options, callback) => {
        callback(mockResponse);
      });

      const result = await adapter.pickMultipleImages();

      expect(result).toHaveLength(2);
      expect(result[0].uri).toBe('');
      expect(result[1].uri).toBe('file:///path/to/image2.jpg');
    });
  });
});

