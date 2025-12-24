import { validateAdaptersConfig, ValidateAdapters, AdaptersFor } from '../validation';
import { Port } from '../../ports/Port';
import { HttpClientPort } from '../../ports/HttpClientPort';
import { StoragePort } from '../../ports/StoragePort';

describe('module/validation', () => {
  describe('validateAdaptersConfig', () => {
    it('should pass when all required adapters are present', () => {
      const adapters = {
        http: { capability: 'httpclient' as const } as HttpClientPort,
        storage: { capability: 'storage' as const } as StoragePort,
      };

      expect(() => {
        validateAdaptersConfig(adapters, ['http', 'storage']);
      }).not.toThrow();
    });

    it('should throw error when adapter is missing', () => {
      const adapters = {
        http: { capability: 'httpclient' as const } as HttpClientPort,
      };

      expect(() => {
        validateAdaptersConfig(adapters, ['http', 'storage']);
      }).toThrow('[Natify] Adapter configuration errors:');
      expect(() => {
        validateAdaptersConfig(adapters, ['http', 'storage']);
      }).toThrow("Missing required adapter: 'storage'");
    });

    it('should throw error when adapter is null', () => {
      const adapters = {
        http: { capability: 'httpclient' as const } as HttpClientPort,
        storage: null as unknown as StoragePort,
      };

      expect(() => {
        validateAdaptersConfig(adapters, ['http', 'storage']);
      }).toThrow("Adapter 'storage' is null or undefined");
    });

    it('should throw error when adapter is undefined', () => {
      const adapters = {
        http: { capability: 'httpclient' as const } as HttpClientPort,
        storage: undefined as unknown as StoragePort,
      };

      expect(() => {
        validateAdaptersConfig(adapters, ['http', 'storage']);
      }).toThrow("Adapter 'storage' is null or undefined");
    });

    it('should include all errors in message', () => {
      const adapters = {
        http: { capability: 'httpclient' as const } as HttpClientPort,
      };

      expect(() => {
        validateAdaptersConfig(adapters, ['http', 'storage', 'navigation']);
      }).toThrow("Missing required adapter: 'storage'");
      expect(() => {
        validateAdaptersConfig(adapters, ['http', 'storage', 'navigation']);
      }).toThrow("Missing required adapter: 'navigation'");
    });
  });

  describe('ValidateAdapters type', () => {
    it('should be a valid type', () => {
      const adapters = {
        http: { capability: 'httpclient' as const } as HttpClientPort,
        storage: { capability: 'storage' as const } as StoragePort,
      };

      type TestType = ValidateAdapters<typeof adapters, ['http', 'storage']>;
      // TypeScript compile-time check - if this compiles, the type works
      const _test: TestType = adapters;
      expect(_test).toBeDefined();
    });
  });

  describe('AdaptersFor type', () => {
    it('should be a valid type', () => {
      type TestAdapters = AdaptersFor<['http', 'storage']>;
      const adapters: TestAdapters = {
        http: { capability: 'httpclient' as const } as HttpClientPort,
        storage: { capability: 'storage' as const } as StoragePort,
      };

      expect(adapters).toBeDefined();
      expect(adapters.http).toBeDefined();
      expect(adapters.storage).toBeDefined();
    });
  });
});

