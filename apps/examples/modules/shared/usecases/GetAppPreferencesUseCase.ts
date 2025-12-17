import { StoragePort } from '@nativefy/core';
import { AppPreferences, DEFAULT_PREFERENCES } from '../types/AppPreferences';

/**
 * UseCase para obtener las preferencias de la aplicación
 */
export class GetAppPreferencesUseCase {
  constructor(private readonly storage: StoragePort) {}

  /**
   * Obtiene las preferencias guardadas o retorna los valores por defecto
   */
  async execute(): Promise<AppPreferences> {
    const saved = await this.storage.getItem<AppPreferences>('app_preferences');
    return saved || DEFAULT_PREFERENCES;
  }
}

