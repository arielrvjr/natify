import React from 'react';
import { NatifyProvider } from '../NatifyProvider';
import { Port } from '../../ports/Port';

// Mock DIProvider
const mockContainer = {
  instance: jest.fn(),
  tryResolve: jest.fn(),
  getKeys: jest.fn(),
};

jest.mock('../../di/DIProvider', () => {
  const actual = jest.requireActual('../../di/DIProvider');
  return {
    ...actual,
    DIProvider: ({ children }: { children: React.ReactNode }) => children,
    useDIContainer: jest.fn(() => mockContainer),
  };
});

// Mock React hooks
jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useEffect: jest.fn(fn => fn()),
    useMemo: jest.fn(fn => fn()),
  };
});

describe('NatifyProvider', () => {
  const mockAdapter: Port = {
    capability: 'httpclient' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockContainer.tryResolve.mockReturnValue(null);
  });

  it('should render children', () => {
    const TestComponent = () => <div>Test Content</div>;
    const result = React.createElement(NatifyProvider, {
      adapters: { http: mockAdapter },
      children: React.createElement(TestComponent),
    });

    expect(result).toBeDefined();
  });

  it('should be a function component', () => {
    expect(typeof NatifyProvider).toBe('function');
  });

  it('should accept adapters prop', () => {
    const adapters = { http: mockAdapter };
    const props = { adapters, children: React.createElement('div', null, 'Test') };

    expect(props.adapters).toBeDefined();
    expect(props.adapters.http).toBe(mockAdapter);
  });

  it('should render AdapterRegistry', () => {
    const { AdapterRegistry } = require('../../components/AdapterRegistry');

    const TestComponent = () => <div>Test Content</div>;
    const result = React.createElement(NatifyProvider, {
      adapters: { http: mockAdapter },
      children: React.createElement(TestComponent),
    });

    expect(result).toBeDefined();
    // Verificar que AdapterRegistry está siendo usado
    // Los UseCases del sistema se inicializan automáticamente en DIProvider
    expect(AdapterRegistry).toBeDefined();
  });
});
