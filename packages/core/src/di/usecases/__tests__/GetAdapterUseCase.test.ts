import { GetAdapterUseCase } from '../GetAdapterUseCase';
import { DIContainer } from '../../Container';
import { Port } from '../../../ports/Port';
import { NatifyError, NatifyErrorCode } from '../../../errors';

describe('GetAdapterUseCase', () => {
  let container: DIContainer;
  let useCase: GetAdapterUseCase;

  beforeEach(() => {
    container = new DIContainer();
    useCase = new GetAdapterUseCase(container);
  });

  describe('execute', () => {
    it('should return adapter by name', () => {
      const mockAdapter: Port = {
        capability: 'httpclient',
      };
      container.instance('adapter:http', mockAdapter);

      const result = useCase.execute<Port>('http');

      expect(result).toBe(mockAdapter);
    });

    it('should return adapter by capability when name not found', () => {
      const mockAdapter: Port = {
        capability: 'httpclient',
      };
      container.instance('adapter:http', mockAdapter);

      const result = useCase.execute<Port>('httpclient');

      expect(result).toBe(mockAdapter);
    });

    it('should find adapter by capability when registered with different name', () => {
      const mockAdapter: Port = {
        capability: 'storage',
      };
      container.instance('adapter:myStorage', mockAdapter);

      const result = useCase.execute<Port>('storage');

      expect(result).toBe(mockAdapter);
    });

    it('should throw NatifyError when adapter not found', () => {
      expect(() => {
        useCase.execute('nonexistent');
      }).toThrow(NatifyError);

      try {
        useCase.execute('nonexistent');
      } catch (error) {
        expect(error).toBeInstanceOf(NatifyError);
        if (error instanceof NatifyError) {
          expect(error.code).toBe(NatifyErrorCode.VALIDATION_ERROR);
          expect(error.message).toContain('No adapter found for "nonexistent"');
          expect(error.context).toEqual({ lookupKey: 'nonexistent' });
        }
      }
    });

    it('should return correct type when adapter exists', () => {
      interface CustomPort extends Port {
        customMethod(): void;
      }

      const mockAdapter: CustomPort = {
        capability: 'custom',
        customMethod: jest.fn(),
      };
      container.instance('adapter:custom', mockAdapter);

      const result = useCase.execute<CustomPort>('custom');

      expect(result).toBe(mockAdapter);
      expect(result.customMethod).toBeDefined();
    });
  });

  describe('executeAll', () => {
    it('should return all adapters by capability', () => {
      const httpAdapter: Port = { capability: 'httpclient' };
      const storageAdapter: Port = { capability: 'storage' };
      container.instance('adapter:http', httpAdapter);
      container.instance('adapter:storage', storageAdapter);

      const result = useCase.executeAll();

      expect(result.httpclient).toBe(httpAdapter);
      expect(result.storage).toBe(storageAdapter);
    });

    it('should include adapters by name if different from capability', () => {
      const storageAdapter: Port = { capability: 'storage' };
      container.instance('adapter:myStorage', storageAdapter);

      const result = useCase.executeAll();

      expect(result.storage).toBe(storageAdapter);
      expect(result.myStorage).toBe(storageAdapter);
    });

    it('should not duplicate when name equals capability', () => {
      const httpAdapter: Port = { capability: 'httpclient' };
      container.instance('adapter:httpclient', httpAdapter);

      const result = useCase.executeAll();

      expect(result.httpclient).toBe(httpAdapter);
      expect(Object.keys(result)).toEqual(['httpclient']);
    });

    it('should return empty object when no adapters registered', () => {
      const result = useCase.executeAll();

      expect(result).toEqual({});
    });

    it('should handle multiple adapters with same capability', () => {
      const adapter1: Port = { capability: 'storage' };
      const adapter2: Port = { capability: 'storage' };
      container.instance('adapter:storage1', adapter1);
      container.instance('adapter:storage2', adapter2);

      const result = useCase.executeAll();

      // El último registrado debería ser el que se retorna
      expect(result.storage).toBe(adapter2);
      expect(result.storage1).toBe(adapter1);
      expect(result.storage2).toBe(adapter2);
    });
  });
});

