jest.mock('@notifee/react-native', () => ({
  AndroidImportance: {
    MIN: 1,
    LOW: 2,
    DEFAULT: 3,
    HIGH: 4,
  },
}));

import {
  mapFirebasePriorityToPriority,
  mapAndroidImportanceToPriority,
  mapPriorityToAndroidImportance,
} from '../priorityMappers';
import { PushNotificationPriority } from '@natify/core';
import { AndroidImportance } from '@notifee/react-native';

describe('priorityMappers', () => {
  describe('mapFirebasePriorityToPriority', () => {
    it('should map all Firebase priority values correctly', () => {
      expect(mapFirebasePriorityToPriority('min')).toBe(PushNotificationPriority.Min);
      expect(mapFirebasePriorityToPriority('low')).toBe(PushNotificationPriority.Low);
      expect(mapFirebasePriorityToPriority('default')).toBe(PushNotificationPriority.Default);
      expect(mapFirebasePriorityToPriority('high')).toBe(PushNotificationPriority.High);
      expect(mapFirebasePriorityToPriority('max')).toBe(PushNotificationPriority.Max);
    });

    it('should return Default for undefined', () => {
      expect(mapFirebasePriorityToPriority(undefined)).toBe(PushNotificationPriority.Default);
    });

    it('should return Default for invalid priority', () => {
      expect(mapFirebasePriorityToPriority('invalid' as any)).toBe(PushNotificationPriority.Default);
    });
  });

  describe('mapAndroidImportanceToPriority', () => {
    it('should map all Android importance values correctly', () => {
      expect(mapAndroidImportanceToPriority(AndroidImportance.MIN)).toBe(PushNotificationPriority.Min);
      expect(mapAndroidImportanceToPriority(AndroidImportance.LOW)).toBe(PushNotificationPriority.Low);
      expect(mapAndroidImportanceToPriority(AndroidImportance.HIGH)).toBe(PushNotificationPriority.High);
      expect(mapAndroidImportanceToPriority(AndroidImportance.DEFAULT)).toBe(PushNotificationPriority.Default);
    });

    it('should return Default for undefined', () => {
      expect(mapAndroidImportanceToPriority(undefined)).toBe(PushNotificationPriority.Default);
    });
  });

  describe('mapPriorityToAndroidImportance', () => {
    it('should map all priority values correctly', () => {
      expect(mapPriorityToAndroidImportance(PushNotificationPriority.Min)).toBe(AndroidImportance.MIN);
      expect(mapPriorityToAndroidImportance(PushNotificationPriority.Low)).toBe(AndroidImportance.LOW);
      expect(mapPriorityToAndroidImportance(PushNotificationPriority.High)).toBe(AndroidImportance.HIGH);
      expect(mapPriorityToAndroidImportance(PushNotificationPriority.Default)).toBe(AndroidImportance.DEFAULT);
    });

    it('should map Max to HIGH (since MAX does not exist)', () => {
      expect(mapPriorityToAndroidImportance(PushNotificationPriority.Max)).toBe(AndroidImportance.HIGH);
    });
  });
});

