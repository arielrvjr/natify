import React, { useEffect, useMemo, ReactNode } from 'react';
import { useDIContainer } from './DIProvider';
import {
  RegisterModuleUseCase,
  UnregisterModuleUseCase,
  GetModuleUseCase,
} from '../module/usecases';
import { RegisterAdapterUseCase, GetAdapterUseCase } from './usecases';

/**
 * Provider que inicializa y registra los UseCases del sistema en el DI container
 *
 * Este provider debe estar dentro de DIProvider para funcionar.
 */
export const UseCaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const container = useDIContainer();

  // Crear UseCases (trabajan directamente con DIContainer)
  const useCases = useMemo(
    () => ({
      registerModule: new RegisterModuleUseCase(container),
      unregisterModule: new UnregisterModuleUseCase(container),
      getModule: new GetModuleUseCase(container),
      registerAdapter: new RegisterAdapterUseCase(container),
      getAdapter: new GetAdapterUseCase(container),
    }),
    [container],
  );

  // Registrar UseCases en el DI container
  useEffect(() => {
    container.instance('usecase:RegisterModuleUseCase', useCases.registerModule);
    container.instance('usecase:UnregisterModuleUseCase', useCases.unregisterModule);
    container.instance('usecase:GetModuleUseCase', useCases.getModule);
    container.instance('usecase:RegisterAdapterUseCase', useCases.registerAdapter);
    container.instance('usecase:GetAdapterUseCase', useCases.getAdapter);
  }, [container, useCases]);

  return <>{children}</>;
};
