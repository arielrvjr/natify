import { RnFileSystemAdapter } from '../src';
import { NativefyError } from '@nativefy/core';

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

    it('should throw NativefyError on read error', async () => {
      const error = new Error('Read failed');
      fs.readFile.mockRejectedValue(error);

      await expect(adapter.readFile('/path/to/file.txt')).rejects.toThrow(NativefyError);
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

    it('should throw NativefyError on write error', async () => {
      const error = new Error('Write failed');
      fs.exists.mockResolvedValue(true);
      fs.writeFile.mockRejectedValue(error);

      await expect(adapter.writeFile('/path/to/file.txt', 'content')).rejects.toThrow(
        NativefyError,
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

    it('should throw NativefyError on delete error', async () => {
      const error = new Error('Delete failed');
      fs.exists.mockResolvedValue(true);
      fs.unlink.mockRejectedValue(error);

      await expect(adapter.deleteFile('/path/to/file.txt')).rejects.toThrow(NativefyError);
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

    it('should throw NativefyError on stat error', async () => {
      const error = new Error('Stat failed');
      fs.exists.mockResolvedValue(true);
      fs.stat.mockRejectedValue(error);

      await expect(adapter.getFileInfo('/path/to/file.txt')).rejects.toThrow(NativefyError);
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

    it('should throw NativefyError on list error', async () => {
      const error = new Error('List failed');
      fs.exists.mockResolvedValue(true);
      fs.ls.mockRejectedValue(error);

      await expect(adapter.listFiles('/path/to/dir')).rejects.toThrow(NativefyError);
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

    it('should throw NativefyError on mkdir error', async () => {
      const error = new Error('Mkdir failed');
      fs.exists.mockResolvedValue(false);
      fs.mkdir.mockRejectedValue(error);

      await expect(adapter.mkdir('/path/to/new-dir')).rejects.toThrow(NativefyError);
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
      fs.rmdir.mockResolvedValue(undefined);

      await adapter.rmdir('/path/to/dir', false);

      expect(fs.rmdir).toHaveBeenCalledWith('/path/to/dir');
    });

    it('should not throw error if directory does not exist', async () => {
      fs.exists.mockResolvedValue(false);

      await adapter.rmdir('/path/to/non-existent-dir');

      expect(fs.unlink).not.toHaveBeenCalled();
      expect(fs.rmdir).not.toHaveBeenCalled();
    });
  });

  describe('downloadFile', () => {
    it('should download file successfully', async () => {
      const mockStat = { size: 2048, lastModified: Date.now() };
      const mockFetchResult = {
        progress: jest.fn().mockReturnThis(),
      };
      const mockFetch = jest.fn().mockResolvedValue(mockFetchResult);
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
      const mockFetchResult = {
        progress: jest.fn().mockReturnThis(),
      };
      const mockFetch = jest.fn().mockResolvedValue(mockFetchResult);
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
      const mockFetchResult = {
        progress: jest.fn((callback) => {
          callback(1024, 2048);
          return mockFetchResult;
        }),
      };
      const mockFetch = jest.fn().mockResolvedValue(mockFetchResult);
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

    it('should throw NativefyError on download error', async () => {
      fs.exists.mockResolvedValue(false);
      fs.mkdir.mockResolvedValue(undefined);
      
      // Mock config para que retorne un objeto con fetch que rechace
      const error = new Error('Download failed');
      const mockFetchFn = jest.fn().mockRejectedValue(error);
      const mockConfigObj = {
        fetch: mockFetchFn,
      };
      config.mockReturnValue(mockConfigObj);

      await expect(
        adapter.downloadFile('https://example.com/file.txt', '/path/to/file.txt'),
      ).rejects.toThrow(NativefyError);
    });
  });

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      const mockStat = { size: 1024 };
      const mockFetchResult = {
        progress: jest.fn().mockReturnThis(),
        info: jest.fn().mockReturnValue({ status: 200 }),
        text: jest.fn().mockResolvedValue('{"success": true}'),
      };
      const mockFetch = jest.fn().mockResolvedValue(mockFetchResult);
      config.mockReturnValue({
        fetch: mockFetch,
      });
      fs.exists.mockResolvedValue(true);
      fs.stat.mockResolvedValue(mockStat);

      const result = await adapter.uploadFile('/path/to/file.txt', 'https://example.com/upload');

      expect(result.status).toBe(200);
    });

    it('should throw NativefyError if file does not exist', async () => {
      fs.exists.mockResolvedValue(false);

      await expect(
        adapter.uploadFile('/path/to/non-existent.txt', 'https://example.com/upload'),
      ).rejects.toThrow(NativefyError);
    });

    it('should throw NativefyError on upload error', async () => {
      const error = new Error('Upload failed');
      fs.exists.mockResolvedValue(true);
      const mockFetch = jest.fn().mockRejectedValue(error);
      config.mockReturnValue({
        fetch: mockFetch,
      });

      await expect(
        adapter.uploadFile('/path/to/file.txt', 'https://example.com/upload'),
      ).rejects.toThrow(NativefyError);
    });
  });
});

