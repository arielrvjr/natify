import React from 'react';
import { DIProvider, useDIContainer, useUseCase, useAdapter, useUseCases } from '../DIProvider';
import { DIContainer } from '../Container';
import { Port } from '../../ports/Port';

// Mock Container
const mockContainer = {
  resolve: jest.fn(),
  tryResolve: jest.fn(),
  instance: jest.fn(),
  singleton: jest.fn(),
  register: jest.fn(),
  getKeys: jest.fn(),
  clear: jest.fn(),
  has: jest.fn(),
  remove: jest.fn(),
} as unknown as jest.Mocked<DIContainer>;

// Mock React Context
let contextValue: DIContainer | null = null;

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    createContext: jest.fn(() => ({
      Provider: ({ value, children }: { value: DIContainer; children: React.ReactNode }) => {
        contextValue = value;
        return children;
      },
      Consumer: ({ children }: { children: (value: DIContainer | null) => React.ReactNode }) =>
        children(contextValue),
    })),
    useContext: jest.fn(() => contextValue),
    useMemo: jest.fn(fn => fn()),
  };
});

describe('DIProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    contextValue = mockContainer;
  });

  describe('DIProvider component', () => {
    it('should provide container to children', () => {
      const TestComponent = () => {
        const container = useDIContainer();
        expect(container).toBe(mockContainer);
        return null;
      };

      React.createElement(
        DIProvider,
        { container: mockContainer, children: React.createElement(TestComponent) },
      );
    });
  });

  describe('useDIContainer', () => {
    it('should return container from context', () => {
      contextValue = mockContainer;
      const container = useDIContainer();
      expect(container).toBe(mockContainer);
    });

    it('should throw error if used outside DIProvider', () => {
      contextValue = null;
      expect(() => useDIContainer()).toThrow('useDIContainer must be used within DIProvider');
    });
  });

  describe('useUseCase', () => {
    it('should resolve UseCase from container', () => {
      const mockUseCase = { execute: jest.fn() };
      mockContainer.resolve.mockReturnValue(mockUseCase);
      contextValue = mockContainer;

      const useCase = useUseCase('auth:login');

      expect(useCase).toBe(mockUseCase);
      expect(mockContainer.resolve).toHaveBeenCalledWith('auth:login');
    });

    it('should throw error if used outside DIProvider', () => {
      contextValue = null;
      expect(() => useUseCase('auth:login')).toThrow(
        'useDIContainer must be used within DIProvider',
      );
    });
  });

  describe('useAdapter', () => {
    it('should resolve adapter by name', () => {
      const mockAdapter: Port = {
        capability: 'httpclient' as const,
      };
      // Primero intenta GetAdapterUseCase (retorna null), luego fallback directo
      mockContainer.tryResolve
        .mockReturnValueOnce(null) // GetAdapterUseCase no disponible
        .mockReturnValueOnce(mockAdapter); // adapter:http
      contextValue = mockContainer;

      const adapter = useAdapter('http');

      expect(adapter).toBe(mockAdapter);
      expect(mockContainer.tryResolve).toHaveBeenCalledWith('usecase:GetAdapterUseCase');
      expect(mockContainer.tryResolve).toHaveBeenCalledWith('adapter:http');
    });

    it('should resolve adapter by capability if not found by name', () => {
      const mockAdapter: Port = {
        capability: 'httpclient' as const,
      };
      // Primero intenta GetAdapterUseCase (retorna null), luego fallback
      mockContainer.tryResolve
        .mockReturnValueOnce(null) // GetAdapterUseCase no disponible
        .mockReturnValueOnce(null) // adapter:httpclient (por nombre) no encontrado
        .mockReturnValueOnce(mockAdapter); // Encontrado por capability
      mockContainer.getKeys.mockReturnValue(['adapter:http']);
      contextValue = mockContainer;

      const adapter = useAdapter('httpclient');

      expect(adapter).toBe(mockAdapter);
    });

    it('should throw error if adapter not found', () => {
      mockContainer.tryResolve
        .mockReturnValueOnce(null) // GetAdapterUseCase no disponible
        .mockReturnValueOnce(null); // adapter:nonexistent no encontrado
      mockContainer.getKeys.mockReturnValue([]);
      contextValue = mockContainer;

      expect(() => useAdapter('nonexistent')).toThrow(
        '[DI] No se encontró ningún adapter para "nonexistent"',
      );
    });
  });

  describe('useUseCases', () => {
    it('should resolve multiple UseCases', () => {
      const loginUseCase = { execute: jest.fn() };
      const registerUseCase = { execute: jest.fn() };
      mockContainer.resolve.mockReturnValueOnce(loginUseCase).mockReturnValueOnce(registerUseCase);
      contextValue = mockContainer;

      const useCases = useUseCases(['auth:login', 'auth:register']);

      expect(useCases.login).toBe(loginUseCase);
      expect(useCases.register).toBe(registerUseCase);
    });

      it('should throw error if used outside DIProvider', () => {
        contextValue = null;
        expect(() => useUseCases(['auth:login'])).toThrow(
          'useUseCases must be used within DIProvider',
        );
      });
    });

    describe('DIProvider component', () => {
      it('should provide container to children', () => {
        const TestComponent = () => {
          const container = useDIContainer();
          expect(container).toBe(mockContainer);
          return <div>Test</div>;
        };

        contextValue = mockContainer;
        React.createElement(
          DIProvider,
          { container: mockContainer, children: React.createElement(TestComponent) },
        );
      });
    });

    describe('useAdapter with GetAdapterUseCase', () => {
      it('should use GetAdapterUseCase when available', () => {
        const mockAdapter: Port = {
          capability: 'httpclient',
        };
        const mockGetAdapterUseCase = {
          execute: jest.fn(() => mockAdapter),
        };
        mockContainer.tryResolve.mockImplementation((key: string) => {
          if (key === 'usecase:GetAdapterUseCase') {
            return mockGetAdapterUseCase;
          }
          return null;
        });
        contextValue = mockContainer;

        const result = useAdapter<Port>('http');

        expect(mockGetAdapterUseCase.execute).toHaveBeenCalledWith('http');
        expect(result).toBe(mockAdapter);
      });
    });
});
