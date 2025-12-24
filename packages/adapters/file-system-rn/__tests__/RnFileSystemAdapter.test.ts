import { RnFileSystemAdapter } from '../src';
import { NatifyError } from '@natify/core';

// Mock react-native-blob-util
const mockFs = {
  readFile: jest.fn(),
  writeFile: jest.fn(),
  unlink: jest.fn(),
  exists: jest.fn(),
  stat: jest.fn(),
  ls: jest.fn(),
  mkdir: jest.fn(),
  rmdir: jest.fn(),
};

const mockConfig = jest.fn().mockReturnValue({
  fetch: jest.fn().mockReturnValue({
    progress: jest.fn().mockReturnThis(),
  }),
});

jest.mock('react-native-blob-util', () => {
  const fs = {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    unlink: jest.fn(),
    exists: jest.fn(),
    stat: jest.fn(),
    ls: jest.fn(),
    mkdir: jest.fn(),
    rmdir: jest.fn(),
    dirs: {
      DocumentDir: '/documents',
      CacheDir: '/cache',
    },
  };

  const config = jest.fn();

  return {
    __esModule: true,
    default: {
      fs,
      config,
    },
    fs,
    config,
  };
});

// Obtener referencias a los mocks después de que jest.mock se ejecute
const getMockFs = () => {
  const rnBlobUtil = require('react-native-blob-util');
  return rnBlobUtil.default?.fs || rnBlobUtil.fs;
};

const getMockConfig = () => {
  const rnBlobUtil = require('react-native-blob-util');
  return rnBlobUtil.default?.config || rnBlobUtil.config;
};

describe('RnFileSystemAdapter', () => {
  let adapter: RnFileSystemAdapter;
  let fs: typeof mockFs;
  let config: typeof mockConfig;

  beforeEach(() => {
    jest.clearAllMocks();
    fs = getMockFs();
    config = getMockConfig();
    adapter = new RnFileSystemAdapter();
  });

  describe('constructor', () => {
    it('should create adapter', () => {
      expect(adapter).toBeDefined();
      expect(adapter.capability).toBe('filesystem');
    });
  });

  describe('readFile', () => {
    it('should read file with utf8 encoding', async () => {
      fs.readFile.mockResolvedValue('file content');

      const content = await adapter.readFile('/path/to/file.txt');

      expect(fs.readFile).toHaveBeenCalledWith('/path/to/file.txt', 'utf8');
      expect(content).toBe('file content');
    });

    it('should read file with base64 encoding', async () => {
      fs.readFile.mockResolvedValue('base64content');

      const content = await adapter.readFile('/path/to/file.jpg', 'base64');

      expect(fs.readFile).toHaveBeenCalledWith('/path/to/file.jpg', 'base64');
      expect(content).toBe('base64content');
    });

    it('should throw NatifyError on read error', async () => {
      const error = new Error('Read failed');
      fs.readFile.mockRejectedValue(error);

      await expect(adapter.readFile('/path/to/file.txt')).rejects.toThrow(NatifyError);
      await expect(adapter.readFile('/path/to/file.txt')).rejects.toThrow('Failed to read file');
    });
  });

  describe('writeFile', () => {
    it('should write file with utf8 encoding', async () => {
      fs.exists.mockResolvedValue(true);
      fs.writeFile.mockResolvedValue(undefined);

      await adapter.writeFile('/path/to/file.txt', 'content');

      expect(fs.writeFile).toHaveBeenCalledWith('/path/to/file.txt', 'content', 'utf8');
    });

    it('should create parent directory if not exists', async () => {
      fs.exists.mockResolvedValue(false);
      fs.mkdir.mockResolvedValue(undefined);
      fs.writeFile.mockResolvedValue(undefined);

      await adapter.writeFile('/path/to/file.txt', 'content');

      expect(fs.mkdir).toHaveBeenCalledWith('/path/to');
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should throw NatifyError on write error', async () => {
      const error = new Error('Write failed');
      fs.exists.mockResolvedValue(true);
      fs.writeFile.mockRejectedValue(error);

      await expect(adapter.writeFile('/path/to/file.txt', 'content')).rejects.toThrow(
        NatifyError,
      );
    });
  });

  describe('deleteFile', () => {
    it('should delete existing file', async () => {
      fs.exists.mockResolvedValue(true);
      fs.unlink.mockResolvedValue(undefined);

      await adapter.deleteFile('/path/to/file.txt');

      expect(fs.unlink).toHaveBeenCalledWith('/path/to/file.txt');
    });

    it('should not throw error if file does not exist', async () => {
      fs.exists.mockResolvedValue(false);

      await adapter.deleteFile('/path/to/non-existent.txt');

      expect(fs.unlink).not.toHaveBeenCalled();
    });

    it('should throw NatifyError on delete error', async () => {
      const error = new Error('Delete failed');
      fs.exists.mockResolvedValue(true);
      fs.unlink.mockRejectedValue(error);

      await expect(adapter.deleteFile('/path/to/file.txt')).rejects.toThrow(NatifyError);
    });
  });

  describe('exists', () => {
    it('should return true when file exists', async () => {
      fs.exists.mockResolvedValue(true);

      const exists = await adapter.exists('/path/to/file.txt');

      expect(exists).toBe(true);
    });

    it('should return false when file does not exist', async () => {
      fs.exists.mockResolvedValue(false);

      const exists = await adapter.exists('/path/to/non-existent.txt');

      expect(exists).toBe(false);
    });

    it('should return false on error', async () => {
      fs.exists.mockRejectedValue(new Error('Check failed'));

      const exists = await adapter.exists('/path/to/file.txt');

      expect(exists).toBe(false);
    });
  });

  describe('getFileInfo', () => {
    it('should return file info when file exists', async () => {
      const mockStat = {
        size: 1024,
        lastModified: Date.now(),
      };
      fs.exists.mockResolvedValue(true);
      fs.stat.mockResolvedValue(mockStat);

      const info = await adapter.getFileInfo('/path/to/file.txt');

      expect(info).toBeDefined();
      expect(info?.size).toBe(1024);
      expect(info?.exists).toBe(true);
    });

    it('should return null when file does not exist', async () => {
      fs.exists.mockResolvedValue(false);

      const info = await adapter.getFileInfo('/path/to/non-existent.txt');

      expect(info).toBeNull();
    });

    it('should throw NatifyError on stat error', async () => {
      const error = new Error('Stat failed');
      fs.exists.mockResolvedValue(true);
      fs.stat.mockRejectedValue(error);

      await expect(adapter.getFileInfo('/path/to/file.txt')).rejects.toThrow(NatifyError);
    });
  });

  describe('listFiles', () => {
    it('should return list of files', async () => {
      const mockFiles = ['file1.txt', 'file2.txt'];
      fs.exists.mockResolvedValue(true);
      fs.ls.mockResolvedValue(mockFiles);

      const files = await adapter.listFiles('/path/to/dir');

      expect(files).toEqual(mockFiles);
    });

    it('should return empty array when directory does not exist', async () => {
      fs.exists.mockResolvedValue(false);

      const files = await adapter.listFiles('/path/to/non-existent-dir');

      expect(files).toEqual([]);
    });

    it('should throw NatifyError on list error', async () => {
      const error = new Error('List failed');
      fs.exists.mockResolvedValue(true);
      fs.ls.mockRejectedValue(error);

      await expect(adapter.listFiles('/path/to/dir')).rejects.toThrow(NatifyError);
    });
  });

  describe('mkdir', () => {
    it('should create directory', async () => {
      fs.exists.mockResolvedValue(false);
      fs.mkdir.mockResolvedValue(undefined);

      await adapter.mkdir('/path/to/new-dir');

      expect(fs.mkdir).toHaveBeenCalledWith('/path/to/new-dir');
    });

    it('should not create directory if already exists', async () => {
      fs.exists.mockResolvedValue(true);

      await adapter.mkdir('/path/to/existing-dir');

      expect(fs.mkdir).not.toHaveBeenCalled();
    });

    it('should throw NatifyError on mkdir error', async () => {
      const error = new Error('Mkdir failed');
      fs.exists.mockResolvedValue(false);
      fs.mkdir.mockRejectedValue(error);

      await expect(adapter.mkdir('/path/to/new-dir')).rejects.toThrow(NatifyError);
    });
  });

  describe('rmdir', () => {
    it('should remove directory recursively', async () => {
      fs.exists.mockResolvedValue(true);
      fs.unlink.mockResolvedValue(undefined);

      await adapter.rmdir('/path/to/dir', true);

      expect(fs.unlink).toHaveBeenCalledWith('/path/to/dir');
    });

    it('should remove directory non-recursively', async () => {
      fs.exists.mockResolvedValue(true);
      fs.unlink.mockResolvedValue(undefined);

      await adapter.rmdir('/path/to/dir', false);

      // react-native-blob-util solo tiene unlink, que elimina archivos y directorios
      expect(fs.unlink).toHaveBeenCalledWith('/path/to/dir');
    });

    it('should not throw error if directory does not exist', async () => {
      fs.exists.mockResolvedValue(false);

      await adapter.rmdir('/path/to/non-existent-dir');

      expect(fs.unlink).not.toHaveBeenCalled();
      expect(fs.rmdir).not.toHaveBeenCalled();
    });

    it('should throw NatifyError on rmdir error', async () => {
      const error = new Error('Rmdir failed');
      fs.exists.mockResolvedValue(true);
      fs.unlink.mockRejectedValue(error);

      await expect(adapter.rmdir('/path/to/dir')).rejects.toThrow(NatifyError);
    });
  });

  describe('downloadFile', () => {
    it('should download file successfully', async () => {
      const mockStat = { size: 2048, lastModified: Date.now() };
      const mockFetchResult = Promise.resolve();
      mockFetchResult.progress = jest.fn().mockReturnValue(mockFetchResult);
      const mockFetch = jest.fn().mockReturnValue(mockFetchResult);
      config.mockReturnValue({
        fetch: mockFetch,
      });
      fs.exists.mockResolvedValue(false);
      fs.mkdir.mockResolvedValue(undefined);
      fs.stat.mockResolvedValue(mockStat);

      const result = await adapter.downloadFile('https://example.com/file.txt', '/path/to/file.txt');

      expect(result.path).toBe('/path/to/file.txt');
      expect(result.size).toBe(2048);
    });

    it('should create parent directory before download', async () => {
      const mockStat = { size: 2048 };
      const mockFetchResult = Promise.resolve();
      mockFetchResult.progress = jest.fn().mockReturnValue(mockFetchResult);
      const mockFetch = jest.fn().mockReturnValue(mockFetchResult);
      config.mockReturnValue({
        fetch: mockFetch,
      });
      fs.exists.mockResolvedValue(false);
      fs.mkdir.mockResolvedValue(undefined);
      fs.stat.mockResolvedValue(mockStat);

      await adapter.downloadFile('https://example.com/file.txt', '/path/to/file.txt');

      expect(fs.mkdir).toHaveBeenCalledWith('/path/to');
    });

    it('should call onProgress callback', async () => {
      const mockStat = { size: 2048 };
      const onProgress = jest.fn();
      const mockFetchResult = Promise.resolve();
      mockFetchResult.progress = jest.fn((callback) => {
        callback(1024, 2048);
        return mockFetchResult;
      });
      const mockFetch = jest.fn().mockReturnValue(mockFetchResult);
      config.mockReturnValue({
        fetch: mockFetch,
      });
      fs.exists.mockResolvedValue(false);
      fs.mkdir.mockResolvedValue(undefined);
      fs.stat.mockResolvedValue(mockStat);

      await adapter.downloadFile('https://example.com/file.txt', '/path/to/file.txt', {
        onProgress,
      });

      expect(onProgress).toHaveBeenCalledWith(1024, 2048);
    });

    it('should return existing file info when overwrite is false and file exists', async () => {
      const mockStat = { size: 1024, lastModified: Date.now() };
      const mockFileInfo = {
        path: '/path/to/file.txt',
        size: 1024,
        lastModified: new Date(),
        exists: true,
        mimeType: 'text/plain',
      };
      fs.exists.mockResolvedValue(true);
      fs.stat.mockResolvedValue(mockStat);

      // Mock getFileInfo to return the file info
      jest.spyOn(adapter, 'getFileInfo').mockResolvedValue(mockFileInfo);

      const result = await adapter.downloadFile('https://example.com/file.txt', '/path/to/file.txt', {
        overwrite: false,
      });

      expect(result.path).toBe('/path/to/file.txt');
      expect(result.size).toBe(1024);
      expect(config).not.toHaveBeenCalled(); // Should not download
    });

    it('should throw NatifyError on download error', async () => {
      fs.exists.mockResolvedValue(false);
      fs.mkdir.mockResolvedValue(undefined);
      
      // El código llama a: ReactNativeBlobUtil.config(config).fetch('GET', url).progress(...)
      // fetch() debe devolver un objeto con progress() que devuelve una promesa que rechace
      const downloadError = new Error('Download failed');
      
      // Crear un objeto que tenga un método progress() que devuelva una promesa rechazada
      // Usar mockRejectedValue para que Jest maneje correctamente la promesa rechazada
      const mockFetchResult = {
        progress: jest.fn().mockRejectedValue(downloadError),
      };
      
      const mockFetchFn = jest.fn().mockReturnValue(mockFetchResult);
      const mockConfigObj = {
        fetch: mockFetchFn,
      };
      config.mockReturnValue(mockConfigObj);

      await expect(async () => {
        await adapter.downloadFile('https://example.com/file.txt', '/path/to/file.txt');
      }).rejects.toThrow(NatifyError);
    });
  });

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      const mockStat = { size: 1024 };
      const mockFetchResult = Promise.resolve({
        info: jest.fn().mockReturnValue({ status: 200 }),
        json: jest.fn().mockReturnValue({ success: true }),
        text: jest.fn().mockReturnValue('{"success": true}'),
      });
      mockFetchResult.uploadProgress = jest.fn().mockReturnValue(mockFetchResult);
      const mockFetch = jest.fn().mockReturnValue(mockFetchResult);
      config.mockReturnValue({
        fetch: mockFetch,
      });
      fs.exists.mockResolvedValue(true);
      fs.stat.mockResolvedValue(mockStat);

      const result = await adapter.uploadFile('/path/to/file.txt', 'https://example.com/upload');

      expect(result.status).toBe(200);
    });

    it('should throw NatifyError if file does not exist', async () => {
      fs.exists.mockResolvedValue(false);

      await expect(
        adapter.uploadFile('/path/to/non-existent.txt', 'https://example.com/upload'),
      ).rejects.toThrow(NatifyError);
    });

    it('should throw NatifyError on upload error', async () => {
      const error = new Error('Upload failed');
      fs.exists.mockResolvedValue(true);
      fs.stat.mockResolvedValue({ size: 1024 });
      
      // El código llama a: ReactNativeBlobUtil.config(config).fetch('POST', url, headers, formData).uploadProgress(...)
      // uploadProgress() debe devolver una promesa rechazada
      // Usar mockRejectedValue para que Jest maneje correctamente la promesa rechazada
      const mockFetchResult = {
        uploadProgress: jest.fn().mockRejectedValue(error),
      };
      
      const mockFetch = jest.fn().mockReturnValue(mockFetchResult);
      config.mockReturnValue({
        fetch: mockFetch,
      });

      await expect(async () => {
        await adapter.uploadFile('/path/to/file.txt', 'https://example.com/upload');
      }).rejects.toThrow(NatifyError);
    });

    it('should throw NatifyError when getFileInfo returns null', async () => {
      fs.exists.mockResolvedValue(true);
      // Mock getFileInfo to return null
      jest.spyOn(adapter, 'getFileInfo').mockResolvedValue(null);

      await expect(
        adapter.uploadFile('/path/to/file.txt', 'https://example.com/upload'),
      ).rejects.toThrow(NatifyError);
    });

    it('should call onProgress callback during upload', async () => {
      const mockStat = { size: 1024 };
      const onProgress = jest.fn();
      const mockFetchResult = Promise.resolve({
        info: jest.fn().mockReturnValue({ status: 200 }),
        json: jest.fn().mockReturnValue({ success: true }),
        text: jest.fn().mockReturnValue('{"success": true}'),
      });
      mockFetchResult.uploadProgress = jest.fn((callback) => {
        callback(512, 1024);
        return mockFetchResult;
      });
      const mockFetch = jest.fn().mockReturnValue(mockFetchResult);
      config.mockReturnValue({
        fetch: mockFetch,
      });
      fs.exists.mockResolvedValue(true);
      fs.stat.mockResolvedValue(mockStat);

      await adapter.uploadFile('/path/to/file.txt', 'https://example.com/upload', {
        onProgress,
      });

      expect(onProgress).toHaveBeenCalledWith(512, 1024);
    });

    it('should use text() when json() fails', async () => {
      const mockStat = { size: 1024 };
      const mockFetchResult = Promise.resolve({
        info: jest.fn().mockReturnValue({ status: 200, headers: {} }),
        json: jest.fn().mockImplementation(() => {
          throw new Error('Not JSON');
        }),
        text: jest.fn().mockReturnValue('plain text response'),
      });
      mockFetchResult.uploadProgress = jest.fn().mockReturnValue(mockFetchResult);
      const mockFetch = jest.fn().mockReturnValue(mockFetchResult);
      config.mockReturnValue({
        fetch: mockFetch,
      });
      fs.exists.mockResolvedValue(true);
      fs.stat.mockResolvedValue(mockStat);

      const result = await adapter.uploadFile('/path/to/file.txt', 'https://example.com/upload');

      expect(result.data).toBe('plain text response');
    });
  });

  describe('getDocumentsPath', () => {
    it('should return documents directory path', () => {
      const path = adapter.getDocumentsPath();

      expect(path).toBe('/documents');
      expect(typeof path).toBe('string');
    });
  });

  describe('getCachePath', () => {
    it('should return cache directory path', () => {
      const path = adapter.getCachePath();

      expect(path).toBe('/cache');
      expect(typeof path).toBe('string');
    });
  });

  describe('getTempPath', () => {
    it('should return temp directory path', () => {
      const path = adapter.getTempPath();

      expect(path).toBe('/cache');
      expect(typeof path).toBe('string');
      // getTempPath returns CacheDir
      expect(path).toBe(adapter.getCachePath());
    });
  });
});

