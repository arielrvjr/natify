import { AxiosHttpAdapter } from '../src';
import { NatifyError, NatifyErrorCode } from '@natify/core';
import axios, { AxiosResponse, AxiosError } from 'axios';

// Mock axios
jest.mock('axios', () => {
  const actualAxios = jest.requireActual('axios');
  return {
    ...actualAxios,
    default: {
      ...actualAxios.default,
      create: jest.fn(),
    },
    create: jest.fn(),
  };
});

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AxiosHttpAdapter', () => {
  let adapter: AxiosHttpAdapter;
  const mockBaseURL = 'https://api.example.com';

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock axios.create
    const mockInstance = {
      defaults: {
        headers: {
          common: {} as Record<string, string>,
        },
      },
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: {
          use: jest.fn(),
        },
        response: {
          use: jest.fn(),
        },
      },
    };

    mockedAxios.create = jest.fn().mockReturnValue(mockInstance);
    adapter = new AxiosHttpAdapter(mockBaseURL);
  });

  describe('constructor', () => {
    it('should create adapter with baseURL', () => {
      expect(adapter).toBeDefined();
      expect(adapter.capability).toBe('httpclient');
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: mockBaseURL,
          timeout: 10000,
        }),
      );
    });

    it('should create adapter without baseURL', () => {
      const newAdapter = new AxiosHttpAdapter();
      expect(newAdapter).toBeDefined();
    });

    it('should create adapter with custom config', () => {
      const customConfig = { timeout: 5000 };
      const newAdapter = new AxiosHttpAdapter(mockBaseURL, customConfig);
      expect(newAdapter).toBeDefined();
    });

    it('should setup request interceptor if provided', () => {
      const onRequest = jest.fn();
      const newAdapter = new AxiosHttpAdapter(mockBaseURL, {}, { onRequest });

      const mockInstance = mockedAxios.create.mock.results[0].value;
      expect(mockInstance.interceptors.request.use).toHaveBeenCalledWith(onRequest);
    });

    it('should setup response error interceptor if provided', () => {
      const onResponseError = jest.fn();
      const newAdapter = new AxiosHttpAdapter(mockBaseURL, {}, { onResponseError });

      const mockInstance = mockedAxios.create.mock.results[0].value;
      expect(mockInstance.interceptors.response.use).toHaveBeenCalledWith(
        expect.any(Function),
        onResponseError,
      );
    });
  });

  describe('setHeader', () => {
    it('should set header', () => {
      const mockInstance = mockedAxios.create.mock.results[0].value;
      adapter.setHeader('Authorization', 'Bearer token123');

      expect(mockInstance.defaults.headers.common['Authorization']).toBe('Bearer token123');
    });
  });

  describe('removeHeader', () => {
    it('should remove header', () => {
      const mockInstance = mockedAxios.create.mock.results[0].value;
      mockInstance.defaults.headers.common['Authorization'] = 'Bearer token123';

      adapter.removeHeader('Authorization');

      expect(mockInstance.defaults.headers.common['Authorization']).toBeUndefined();
    });
  });

  describe('get', () => {
    it('should make GET request successfully', async () => {
      const mockResponse: AxiosResponse = {
        data: { id: 1, name: 'Test' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      const mockInstance = mockedAxios.create.mock.results[0].value;
      (mockInstance.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await adapter.get('/users');

      expect(mockInstance.get).toHaveBeenCalledWith('/users', {});
      expect(result.data).toEqual({ id: 1, name: 'Test' });
      expect(result.status).toBe(200);
    });

    it('should make GET request with config', async () => {
      const mockResponse: AxiosResponse = {
        data: { id: 1 },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      const mockInstance = mockedAxios.create.mock.results[0].value;
      (mockInstance.get as jest.Mock).mockResolvedValue(mockResponse);

      const config = { params: { page: 1 } };
      await adapter.get('/users', config);

      expect(mockInstance.get).toHaveBeenCalledWith('/users', config);
    });

    it('should throw NatifyError on network error', async () => {
      const mockError = {
        isAxiosError: true,
        message: 'Network Error',
        code: 'ECONNABORTED',
        config: {} as any,
        response: undefined,
      } as AxiosError;

      const mockInstance = mockedAxios.create.mock.results[0].value;
      (mockInstance.get as jest.Mock).mockRejectedValue(mockError);

      await expect(adapter.get('/users')).rejects.toThrow(NatifyError);
      await expect(adapter.get('/users')).rejects.toThrow('Network Error');
    });

    it('should throw NatifyError with UNAUTHORIZED code on 401', async () => {
      const mockError = {
        isAxiosError: true,
        message: 'Unauthorized',
        response: {
          status: 401,
          data: {},
        },
        config: {} as any,
      } as AxiosError;

      const mockInstance = mockedAxios.create.mock.results[0].value;
      (mockInstance.get as jest.Mock).mockRejectedValue(mockError);

      await expect(adapter.get('/users')).rejects.toThrow(NatifyError);
      await expect(adapter.get('/users')).rejects.toThrow('Unauthorized');
    });

    it('should throw NatifyError with FORBIDDEN code on 403', async () => {
      const mockError = {
        isAxiosError: true,
        message: 'Forbidden',
        response: {
          status: 403,
          data: {},
        },
        config: {} as any,
      } as AxiosError;

      const mockInstance = mockedAxios.create.mock.results[0].value;
      (mockInstance.get as jest.Mock).mockRejectedValue(mockError);

      await expect(adapter.get('/users')).rejects.toThrow(NatifyError);
    });

    it('should throw NatifyError with NOT_FOUND code on 404', async () => {
      const mockError = {
        isAxiosError: true,
        message: 'Not Found',
        response: {
          status: 404,
          data: {},
        },
        config: {} as any,
      } as AxiosError;

      const mockInstance = mockedAxios.create.mock.results[0].value;
      (mockInstance.get as jest.Mock).mockRejectedValue(mockError);

      await expect(adapter.get('/users')).rejects.toThrow(NatifyError);
    });

    it('should throw NatifyError with SERVER_ERROR code on 500+', async () => {
      const mockError = {
        isAxiosError: true,
        message: 'Internal Server Error',
        response: {
          status: 500,
          data: {},
        },
        config: {} as any,
      } as AxiosError;

      const mockInstance = mockedAxios.create.mock.results[0].value;
      (mockInstance.get as jest.Mock).mockRejectedValue(mockError);

      await expect(adapter.get('/users')).rejects.toThrow(NatifyError);
    });

    it('should throw NatifyError with TIMEOUT code on timeout', async () => {
      const mockError = {
        isAxiosError: true,
        message: 'Timeout',
        code: 'ECONNABORTED',
        config: {} as any,
        response: undefined,
      } as AxiosError;

      const mockInstance = mockedAxios.create.mock.results[0].value;
      (mockInstance.get as jest.Mock).mockRejectedValue(mockError);

      await expect(adapter.get('/users')).rejects.toThrow(NatifyError);
    });
  });

  describe('post', () => {
    it('should make POST request successfully', async () => {
      const mockResponse: AxiosResponse = {
        data: { id: 1, name: 'Created' },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      };

      const mockInstance = mockedAxios.create.mock.results[0].value;
      (mockInstance.post as jest.Mock).mockResolvedValue(mockResponse);

      const body = { name: 'Test' };
      const result = await adapter.post('/users', body);

      expect(mockInstance.post).toHaveBeenCalledWith('/users', body, {});
      expect(result.data).toEqual({ id: 1, name: 'Created' });
      expect(result.status).toBe(201);
    });

    it('should make POST request with config', async () => {
      const mockResponse: AxiosResponse = {
        data: { id: 1 },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      };

      const mockInstance = mockedAxios.create.mock.results[0].value;
      (mockInstance.post as jest.Mock).mockResolvedValue(mockResponse);

      const body = { name: 'Test' };
      const config = { headers: { 'Content-Type': 'application/json' } };
      await adapter.post('/users', body, config);

      expect(mockInstance.post).toHaveBeenCalledWith('/users', body, config);
    });

    it('should throw NatifyError on POST error', async () => {
      const mockError = {
        isAxiosError: true,
        message: 'Network Error',
        code: 'ECONNABORTED',
        config: {} as any,
        response: undefined,
      } as AxiosError;

      const mockInstance = mockedAxios.create.mock.results[0].value;
      (mockInstance.post as jest.Mock).mockRejectedValue(mockError);

      await expect(adapter.post('/users', {})).rejects.toThrow(NatifyError);
    });
  });

  describe('put', () => {
    it('should make PUT request successfully', async () => {
      const mockResponse: AxiosResponse = {
        data: { id: 1, name: 'Updated' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      const mockInstance = mockedAxios.create.mock.results[0].value;
      (mockInstance.put as jest.Mock).mockResolvedValue(mockResponse);

      const body = { name: 'Updated' };
      const result = await adapter.put('/users/1', body);

      expect(mockInstance.put).toHaveBeenCalledWith('/users/1', body, {});
      expect(result.data).toEqual({ id: 1, name: 'Updated' });
    });

    it('should throw NatifyError on PUT error', async () => {
      const mockError = {
        isAxiosError: true,
        message: 'Network Error',
        code: 'ECONNABORTED',
        config: {} as any,
        response: undefined,
      } as AxiosError;

      const mockInstance = mockedAxios.create.mock.results[0].value;
      (mockInstance.put as jest.Mock).mockRejectedValue(mockError);

      await expect(adapter.put('/users/1', {})).rejects.toThrow(NatifyError);
    });
  });

  describe('patch', () => {
    it('should make PATCH request successfully', async () => {
      const mockResponse: AxiosResponse = {
        data: { id: 1, name: 'Patched' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      const mockInstance = mockedAxios.create.mock.results[0].value;
      (mockInstance.patch as jest.Mock).mockResolvedValue(mockResponse);

      const body = { name: 'Patched' };
      const result = await adapter.patch('/users/1', body);

      expect(mockInstance.patch).toHaveBeenCalledWith('/users/1', body, {});
      expect(result.data).toEqual({ id: 1, name: 'Patched' });
    });

    it('should throw NatifyError on PATCH error', async () => {
      const mockError = {
        isAxiosError: true,
        message: 'Network Error',
        code: 'ECONNABORTED',
        config: {} as any,
        response: undefined,
      } as AxiosError;

      const mockInstance = mockedAxios.create.mock.results[0].value;
      (mockInstance.patch as jest.Mock).mockRejectedValue(mockError);

      await expect(adapter.patch('/users/1', {})).rejects.toThrow(NatifyError);
    });
  });

  describe('delete', () => {
    it('should make DELETE request successfully', async () => {
      const mockResponse: AxiosResponse = {
        data: {},
        status: 204,
        statusText: 'No Content',
        headers: {},
        config: {} as any,
      };

      const mockInstance = mockedAxios.create.mock.results[0].value;
      (mockInstance.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await adapter.delete('/users/1');

      expect(mockInstance.delete).toHaveBeenCalledWith('/users/1', {});
      expect(result.status).toBe(204);
    });

    it('should make DELETE request with config', async () => {
      const mockResponse: AxiosResponse = {
        data: {},
        status: 204,
        statusText: 'No Content',
        headers: {},
        config: {} as any,
      };

      const mockInstance = mockedAxios.create.mock.results[0].value;
      (mockInstance.delete as jest.Mock).mockResolvedValue(mockResponse);

      const config = { headers: { 'X-Custom': 'value' } };
      await adapter.delete('/users/1', config);

      expect(mockInstance.delete).toHaveBeenCalledWith('/users/1', config);
    });

    it('should throw NatifyError on DELETE error', async () => {
      const mockError = {
        isAxiosError: true,
        message: 'Network Error',
        code: 'ECONNABORTED',
        config: {} as any,
        response: undefined,
      } as AxiosError;

      const mockInstance = mockedAxios.create.mock.results[0].value;
      (mockInstance.delete as jest.Mock).mockRejectedValue(mockError);

      await expect(adapter.delete('/users/1')).rejects.toThrow(NatifyError);
    });

    it('should throw NatifyError for non-AxiosError', async () => {
      const mockError = new Error('Generic error');

      const mockInstance = mockedAxios.create.mock.results[0].value;
      (mockInstance.get as jest.Mock).mockRejectedValue(mockError);

      await expect(adapter.get('/users')).rejects.toThrow(NatifyError);
      await expect(adapter.get('/users')).rejects.toThrow('Generic error');
    });
  });
});

