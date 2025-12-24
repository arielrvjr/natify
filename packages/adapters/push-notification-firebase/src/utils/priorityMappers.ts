import { AndroidImportance } from '@notifee/react-native';
import { PushNotificationPriority } from '@natify/core';

/**
 * Mapea la prioridad de Firebase a PushNotificationPriority
 */
export function mapFirebasePriorityToPriority(
  priority?: 'min' | 'low' | 'default' | 'high' | 'max',
): PushNotificationPriority {
  const priorityMap: Record<'min' | 'low' | 'default' | 'high' | 'max', PushNotificationPriority> = {
    min: PushNotificationPriority.Min,
    low: PushNotificationPriority.Low,
    default: PushNotificationPriority.Default,
    high: PushNotificationPriority.High,
    max: PushNotificationPriority.Max,
  };

  return priority ? priorityMap[priority] ?? PushNotificationPriority.Default : PushNotificationPriority.Default;
}

/**
 * Mapea la importancia de Android a PushNotificationPriority
 */
export function mapAndroidImportanceToPriority(importance?: AndroidImportance): PushNotificationPriority {
  const importanceMap: Record<AndroidImportance, PushNotificationPriority> = {
    [AndroidImportance.MIN]: PushNotificationPriority.Min,
    [AndroidImportance.LOW]: PushNotificationPriority.Low,
    [AndroidImportance.HIGH]: PushNotificationPriority.High,
    [AndroidImportance.DEFAULT]: PushNotificationPriority.Default,
  };

  return importance ? importanceMap[importance] ?? PushNotificationPriority.Default : PushNotificationPriority.Default;
}

/**
 * Mapea PushNotificationPriority a AndroidImportance
 */
export function mapPriorityToAndroidImportance(priority: PushNotificationPriority): AndroidImportance {
  const priorityMap: Record<PushNotificationPriority, AndroidImportance> = {
    [PushNotificationPriority.Min]: AndroidImportance.MIN,
    [PushNotificationPriority.Low]: AndroidImportance.LOW,
    [PushNotificationPriority.High]: AndroidImportance.HIGH,
    [PushNotificationPriority.Max]: AndroidImportance.HIGH, // AndroidImportance.MAX no existe, usar HIGH como máximo
    [PushNotificationPriority.Default]: AndroidImportance.DEFAULT,
  };

  return priorityMap[priority] ?? AndroidImportance.DEFAULT;
}

