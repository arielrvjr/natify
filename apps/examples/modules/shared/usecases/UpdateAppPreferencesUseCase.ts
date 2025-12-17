import { StoragePort } from '@nativefy/core';
import { AppPreferences } from '../types/AppPreferences';

/**
 * UseCase para actualizar las preferencias de la aplicación
 */
export class UpdateAppPreferencesUseCase {
  constructor(private readonly storage: StoragePort) {}

  /**
   * Actualiza las preferencias (merge parcial)
   */
  async execute(updates: Partial<AppPreferences>): Promise<AppPreferences> {
    // Obtener preferencias actuales
    const current = await this.storage.getItem<AppPreferences>('app_preferences') || {
      darkMode: false,
      notifications: true,
      language: 'es',
      biometricsEnabled: false,
    };

    // Merge con las actualizaciones
    const updated: AppPreferences = {
      ...current,
      ...updates,
    };

    // Guardar
    await this.storage.setItem('app_preferences', updated);

    return updated;
  }
}

