import { handleAxiosError } from '../errorHandler';
import { NatifyError, NatifyErrorCode } from '@natify/core';
import axios from 'axios';

jest.mock('axios');

describe('errorHandler', () => {
  describe('handleAxiosError', () => {
    it('should map 401 to UNAUTHORIZED', () => {
      const error = {
        isAxiosError: true,
        response: { status: 401 },
        message: 'Unauthorized',
        config: { url: '/api/test', method: 'GET' },
      };

      (axios.isAxiosError as jest.Mock).mockReturnValue(true);

      expect(() => handleAxiosError(error)).toThrow(NatifyError);
      try {
        handleAxiosError(error);
      } catch (e: any) {
        expect(e.code).toBe(NatifyErrorCode.UNAUTHORIZED);
      }
    });

    it('should map 403 to FORBIDDEN', () => {
      const error = {
        isAxiosError: true,
        response: { status: 403 },
        message: 'Forbidden',
        config: { url: '/api/test', method: 'GET' },
      };

      (axios.isAxiosError as jest.Mock).mockReturnValue(true);

      try {
        handleAxiosError(error);
      } catch (e: any) {
        expect(e.code).toBe(NatifyErrorCode.FORBIDDEN);
      }
    });

    it('should map 404 to NOT_FOUND', () => {
      const error = {
        isAxiosError: true,
        response: { status: 404 },
        message: 'Not Found',
        config: { url: '/api/test', method: 'GET' },
      };

      (axios.isAxiosError as jest.Mock).mockReturnValue(true);

      try {
        handleAxiosError(error);
      } catch (e: any) {
        expect(e.code).toBe(NatifyErrorCode.NOT_FOUND);
      }
    });

    it('should map 500+ to SERVER_ERROR', () => {
      const error = {
        isAxiosError: true,
        response: { status: 500 },
        message: 'Server Error',
        config: { url: '/api/test', method: 'GET' },
      };

      (axios.isAxiosError as jest.Mock).mockReturnValue(true);

      try {
        handleAxiosError(error);
      } catch (e: any) {
        expect(e.code).toBe(NatifyErrorCode.SERVER_ERROR);
      }
    });

    it('should map ECONNABORTED to TIMEOUT', () => {
      const error = {
        isAxiosError: true,
        code: 'ECONNABORTED',
        message: 'Timeout',
        config: { url: '/api/test', method: 'GET' },
      };

      (axios.isAxiosError as jest.Mock).mockReturnValue(true);

      try {
        handleAxiosError(error);
      } catch (e: any) {
        expect(e.code).toBe(NatifyErrorCode.TIMEOUT);
      }
    });

    it('should map unknown error to UNKNOWN', () => {
      const error = new Error('Unknown error');

      (axios.isAxiosError as jest.Mock).mockReturnValue(false);

      try {
        handleAxiosError(error);
      } catch (e: any) {
        expect(e.code).toBe(NatifyErrorCode.UNKNOWN);
        expect(e.message).toBe('Unknown error');
      }
    });
  });
});

