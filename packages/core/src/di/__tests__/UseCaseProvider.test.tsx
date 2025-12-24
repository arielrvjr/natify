import React from 'react';
import { render } from '@testing-library/react-native';
import { UseCaseProvider } from '../UseCaseProvider';
import { DIContainer } from '../Container';
import { RegisterModuleUseCase } from '../../module/usecases/RegisterModuleUseCase';
import { UnregisterModuleUseCase } from '../../module/usecases/UnregisterModuleUseCase';
import { GetModuleUseCase } from '../../module/usecases/GetModuleUseCase';
import { RegisterAdapterUseCase } from '../usecases/RegisterAdapterUseCase';
import { GetAdapterUseCase } from '../usecases/GetAdapterUseCase';

// Mock DIProvider
const mockContainer = new DIContainer();
let contextValue: DIContainer | null = null;

jest.mock('../DIProvider', () => {
  const actual = jest.requireActual('../DIProvider');
  return {
    ...actual,
    DIProvider: ({ children }: { children: React.ReactNode }) => children,
    useDIContainer: jest.fn(() => {
      if (!contextValue) {
        contextValue = mockContainer;
      }
      return contextValue;
    }),
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

describe('UseCaseProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    contextValue = mockContainer;
    mockContainer.clear();
  });

  it('should render children', () => {
    const TestComponent = () => <div>Test Content</div>;
    const { UNSAFE_root } = render(
      <UseCaseProvider>
        <TestComponent />
      </UseCaseProvider>,
    );

    expect(UNSAFE_root).toBeDefined();
  });

  it('should register all system UseCases in DI container', () => {
    render(
      <UseCaseProvider>
        <div>Test</div>
      </UseCaseProvider>,
    );

    // Verificar que los UseCases están registrados
    const registerModule = mockContainer.tryResolve<RegisterModuleUseCase>(
      'usecase:RegisterModuleUseCase',
    );
    const unregisterModule = mockContainer.tryResolve<UnregisterModuleUseCase>(
      'usecase:UnregisterModuleUseCase',
    );
    const getModule = mockContainer.tryResolve<GetModuleUseCase>('usecase:GetModuleUseCase');
    const registerAdapter = mockContainer.tryResolve<RegisterAdapterUseCase>(
      'usecase:RegisterAdapterUseCase',
    );
    const getAdapter = mockContainer.tryResolve<GetAdapterUseCase>('usecase:GetAdapterUseCase');

    expect(registerModule).toBeInstanceOf(RegisterModuleUseCase);
    expect(unregisterModule).toBeInstanceOf(UnregisterModuleUseCase);
    expect(getModule).toBeInstanceOf(GetModuleUseCase);
    expect(registerAdapter).toBeInstanceOf(RegisterAdapterUseCase);
    expect(getAdapter).toBeInstanceOf(GetAdapterUseCase);
  });

  it('should create new UseCase instances when container changes', () => {
    const { rerender } = render(
      <UseCaseProvider>
        <div>Test</div>
      </UseCaseProvider>,
    );

    const firstRegisterModule = mockContainer.tryResolve<RegisterModuleUseCase>(
      'usecase:RegisterModuleUseCase',
    );

    // Cambiar el container (simular cambio de contexto)
    const newContainer = new DIContainer();
    contextValue = newContainer;

    rerender(
      <UseCaseProvider>
        <div>Test</div>
      </UseCaseProvider>,
    );

    const secondRegisterModule = newContainer.tryResolve<RegisterModuleUseCase>(
      'usecase:RegisterModuleUseCase',
    );

    // Deberían ser instancias diferentes
    expect(secondRegisterModule).toBeInstanceOf(RegisterModuleUseCase);
    expect(secondRegisterModule).not.toBe(firstRegisterModule);
  });

  it('should register UseCases with correct keys', () => {
    render(
      <UseCaseProvider>
        <div>Test</div>
      </UseCaseProvider>,
    );

    expect(mockContainer.has('usecase:RegisterModuleUseCase')).toBe(true);
    expect(mockContainer.has('usecase:UnregisterModuleUseCase')).toBe(true);
    expect(mockContainer.has('usecase:GetModuleUseCase')).toBe(true);
    expect(mockContainer.has('usecase:RegisterAdapterUseCase')).toBe(true);
    expect(mockContainer.has('usecase:GetAdapterUseCase')).toBe(true);
  });
});
