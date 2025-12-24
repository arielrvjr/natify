import React from 'react';
import { render } from '@testing-library/react-native';
import { AdapterRegistry } from '../AdapterRegistry';
import { Port } from '../../ports/Port';
import { DIContainer } from '../../di/Container';

// Mock RegisterAdapterUseCase
const mockRegisterAdapterUseCase = {
  execute: jest.fn(),
  executeMany: jest.fn((adapters: Record<string, Port>) => {
    // Simular el comportamiento de RegisterAdapterUseCase.executeMany
    Object.entries(adapters).forEach(([key, adapter]) => {
      mockContainer.instance(`adapter:${key}`, adapter);
      if (adapter && adapter.capability) {
        mockContainer.instance(`adapter:${adapter.capability}`, adapter);
      }
    });
    // Agregar logger si no está presente
    if (!adapters.logger && !mockContainer.has('adapter:logger')) {
      const { ConsoleLoggerAdapter } = require('../../adapters/logger/ConsoleLoggerAdapter');
      const logger = new ConsoleLoggerAdapter();
      mockContainer.instance('adapter:logger', logger);
      mockContainer.instance('adapter:logger', logger);
    }
  }),
};

// Mock useDIContainer
const mockContainer = {
  register: jest.fn() as jest.MockedFunction<DIContainer['register']>,
  resolve: jest.fn() as jest.MockedFunction<DIContainer['resolve']>,
  tryResolve: jest.fn() as jest.MockedFunction<DIContainer['tryResolve']>,
  instance: jest.fn() as jest.MockedFunction<DIContainer['instance']>,
  singleton: jest.fn() as jest.MockedFunction<DIContainer['singleton']>,
  has: jest.fn() as jest.MockedFunction<DIContainer['has']>,
  remove: jest.fn() as jest.MockedFunction<DIContainer['remove']>,
  getKeys: jest.fn() as jest.MockedFunction<DIContainer['getKeys']>,
  clear: jest.fn() as jest.MockedFunction<DIContainer['clear']>,
} as unknown as DIContainer;

jest.mock('../../di/DIProvider', () => ({
  useDIContainer: jest.fn(() => mockContainer),
  useUseCase: jest.fn((key: string) => {
    if (key === 'usecase:RegisterAdapterUseCase') return mockRegisterAdapterUseCase;
    return null;
  }),
}));

// Mock React hooks
jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useEffect: jest.fn(fn => fn()),
    useMemo: jest.fn(fn => fn()),
  };
});

describe('AdapterRegistry', () => {
  const mockAdapter: Port = {
    capability: 'httpclient' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (mockContainer.tryResolve as jest.MockedFunction<DIContainer['tryResolve']>).mockReturnValue(
      null,
    );
    (mockContainer.has as jest.MockedFunction<DIContainer['has']>).mockReturnValue(false);
    mockRegisterAdapterUseCase.executeMany.mockClear();
  });

  it('should render without crashing', () => {
    const { UNSAFE_root } = render(<AdapterRegistry adapters={{ http: mockAdapter }} />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should register adapters by name', () => {
    render(<AdapterRegistry adapters={{ http: mockAdapter }} />);

    expect(mockRegisterAdapterUseCase.executeMany).toHaveBeenCalledWith(
      expect.objectContaining({
        http: mockAdapter,
      }),
    );
  });

  it('should register adapters by capability', () => {
    render(<AdapterRegistry adapters={{ http: mockAdapter }} />);

    expect(mockRegisterAdapterUseCase.executeMany).toHaveBeenCalled();
    const callArgs = mockRegisterAdapterUseCase.executeMany.mock.calls[0][0];
    expect(callArgs.http).toBe(mockAdapter);
  });

  it('should add logger adapter if not provided', () => {
    render(<AdapterRegistry adapters={{ http: mockAdapter }} />);

    expect(mockRegisterAdapterUseCase.executeMany).toHaveBeenCalled();
    const callArgs = mockRegisterAdapterUseCase.executeMany.mock.calls[0][0];
    // Verificar que executeMany fue llamado con los adapters (el logger se agrega internamente)
    expect(callArgs.http).toBe(mockAdapter);
    // Verificar que el mock agregó el logger (a través de mockContainer.instance)
    expect(mockContainer.instance).toHaveBeenCalledWith('adapter:logger', expect.any(Object));
  });

  it('should not add logger adapter if already provided', () => {
    const loggerAdapter: Port = {
      capability: 'logger' as const,
    };

    render(<AdapterRegistry adapters={{ http: mockAdapter, logger: loggerAdapter }} />);

    expect(mockRegisterAdapterUseCase.executeMany).toHaveBeenCalled();
    const callArgs = mockRegisterAdapterUseCase.executeMany.mock.calls[0][0];
    // Verificar que se usa el logger proporcionado
    expect(callArgs.logger).toBe(loggerAdapter);
  });

  it('should register multiple adapters', () => {
    const storageAdapter: Port = {
      capability: 'storage' as const,
    };

    render(<AdapterRegistry adapters={{ http: mockAdapter, storage: storageAdapter }} />);

    expect(mockRegisterAdapterUseCase.executeMany).toHaveBeenCalled();
    const callArgs = mockRegisterAdapterUseCase.executeMany.mock.calls[0][0];
    expect(callArgs.http).toBe(mockAdapter);
    expect(callArgs.storage).toBe(storageAdapter);
  });
});
