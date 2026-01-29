import { DIContainer } from './Container';
import {
  RegisterModuleUseCase,
  UnregisterModuleUseCase,
  GetModuleUseCase,
} from '../module/usecases';
import { RegisterAdapterUseCase, GetAdapterUseCase } from './usecases';
import { ConsoleLoggerAdapter } from '../adapters/logger/ConsoleLoggerAdapter';

/**
 * Inicializa y registra los UseCases del sistema en el contenedor DI
 *
 * Esta función debe llamarse de forma síncrona antes de que cualquier
 * componente intente usar los use cases del sistema.
 *
 * También registra el logger por defecto (ConsoleLoggerAdapter) si no está presente,
 * ya que es requerido por varios componentes del sistema.
 *
 * @param container - Contenedor DI donde registrar los use cases
 */
export function initializeSystemUseCases(container: DIContainer): void {
  // Verificar si ya están inicializados para evitar duplicados
  if (container.has('usecase:RegisterAdapterUseCase')) {
    return;
  }

  // Crear instancias de los UseCases del sistema
  const registerModule = new RegisterModuleUseCase(container);
  const unregisterModule = new UnregisterModuleUseCase(container);
  const getModule = new GetModuleUseCase(container);
  const registerAdapter = new RegisterAdapterUseCase(container);
  const getAdapter = new GetAdapterUseCase(container);

  // Registrar en el contenedor de forma síncrona
  container.instance('usecase:RegisterModuleUseCase', registerModule);
  container.instance('usecase:UnregisterModuleUseCase', unregisterModule);
  container.instance('usecase:GetModuleUseCase', getModule);
  container.instance('usecase:RegisterAdapterUseCase', registerAdapter);
  container.instance('usecase:GetAdapterUseCase', getAdapter);

  // Registrar logger por defecto si no está presente
  // Esto es crítico porque ModuleProvider y otros componentes lo necesitan
  // El logger se registra por nombre y por capability (ambos son 'logger')
  if (!container.has('adapter:logger')) {
    const defaultLogger = new ConsoleLoggerAdapter();
    // Registrar por nombre (adapter:logger) y por capability (también adapter:logger)
    // Como el nombre y capability son iguales, una sola llamada es suficiente
    container.instance('adapter:logger', defaultLogger);
  }
}
