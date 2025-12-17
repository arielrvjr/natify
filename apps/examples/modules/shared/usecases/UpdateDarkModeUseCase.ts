import { StoragePort } from '@nativefy/core';
import { AppPreferences } from '../types/AppPreferences';

/**
 * UseCase específico para actualizar el modo oscuro
 */
export class UpdateDarkModeUseCase {
  constructor(private readonly storage: StoragePort) {}

  /**
   * Actualiza el modo oscuro
   */
  async execute(darkMode: boolean): Promise<AppPreferences> {
    // Obtener preferencias actuales
    const current = await this.storage.getItem<AppPreferences>('app_preferences') || {
      darkMode: false,
      notifications: true,
      language: 'es',
      biometricsEnabled: false,
    };

    // Actualizar solo darkMode
    const updated: AppPreferences = {
      ...current,
      darkMode,
    };

    // Guardar
    await this.storage.setItem('app_preferences', updated);

    return updated;
  }
}

