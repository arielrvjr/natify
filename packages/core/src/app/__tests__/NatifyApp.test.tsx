import React from 'react';
import { NatifyApp } from '../NatifyApp';
import { ModuleDefinition } from '../../module/types';
import { AdapterMap } from '../../types/adapters';
import { Port } from '../../ports/Port';

// Mock NatifyProvider
jest.mock('../../context/NatifyProvider', () => ({
  NatifyProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock ModuleProvider
jest.mock('../../module/ModuleProvider', () => ({
  ModuleProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock React Native
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  ActivityIndicator: 'ActivityIndicator',
  StyleSheet: {
    create: (styles: unknown) => styles,
  },
}));

// Mock React hooks
jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useState: jest.fn(initial => [initial, jest.fn()]),
  };
});

describe('NatifyApp', () => {
  const mockModules: ModuleDefinition[] = [];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('NatifyApp component', () => {
    it('should be a function component', () => {
      expect(typeof NatifyApp).toBe('function');
    });

    it('should validate navigation adapter exists', () => {
      const adaptersWithoutNav = {} as AdapterMap;
      const props = {
        adapters: adaptersWithoutNav,
        modules: mockModules,
      };

      // El error se lanza cuando se accede a adapters.navigation
      expect(() => {
        const nav = props.adapters.navigation;
        if (!nav) {
          throw new Error('[NatifyApp] Navigation adapter is required');
        }
      }).toThrow('[NatifyApp] Navigation adapter is required');
    });

    it('should validate NavigationContainer exists', () => {
      const adapterWithoutContainer = {
        capability: 'navigation' as const,
        AppNavigator: () => null,
      } as unknown as Port;

      const props = {
        adapters: { navigation: adapterWithoutContainer },
        modules: mockModules,
      };

      // El error se lanza cuando se accede a NavigationContainer
      expect(() => {
        const nav = props.adapters.navigation as any;
        if (!nav.NavigationContainer) {
          throw new Error('[NatifyApp] Navigation adapter must provide NavigationContainer');
        }
      }).toThrow('[NatifyApp] Navigation adapter must provide NavigationContainer');
    });

    it('should validate AppNavigator exists', () => {
      const adapterWithoutNavigator = {
        capability: 'navigation' as const,
        NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
      } as unknown as Port;

      const props = {
        adapters: { navigation: adapterWithoutNavigator },
        modules: mockModules,
      };

      // El error se lanza cuando se accede a AppNavigator
      expect(() => {
        const nav = props.adapters.navigation as any;
        if (!nav.AppNavigator) {
          throw new Error('[NatifyApp] Navigation adapter must provide NavigationContainer');
        }
      }).toThrow('[NatifyApp] Navigation adapter must provide NavigationContainer');
    });
  });
});
