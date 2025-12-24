import { createModule } from '@natify/core';
import { GetAppPreferencesUseCase } from './usecases/GetAppPreferencesUseCase';
import { UpdateAppPreferencesUseCase } from './usecases/UpdateAppPreferencesUseCase';
import { UpdateDarkModeUseCase } from './usecases/UpdateDarkModeUseCase';

/**
 * Módulo compartido para preferencias de la aplicación
 *
 * Este módulo proporciona UseCases para gestionar las preferencias
 * de la aplicación que pueden ser usados por cualquier otro módulo.
 */
export const SharedModule = createModule('shared', 'Shared')
  .requires('storage')
  .useCase('getAppPreferences', (adapters) =>
    new GetAppPreferencesUseCase(adapters.storage)
  )
  .useCase('updateAppPreferences', (adapters) =>
    new UpdateAppPreferencesUseCase(adapters.storage)
  )
  .useCase('updateDarkMode', (adapters) =>
    new UpdateDarkModeUseCase(adapters.storage)
  )
  .build();

