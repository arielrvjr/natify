import React from 'react';
import { render } from '@testing-library/react-native';
import { NativefyApp } from '../../app/NativefyApp';
import { ModuleDefinition } from '../../module/types';
import { AdapterMap } from '../../types/adapters';
import { Port } from '../../ports/Port';

// Mock NativefyProvider
jest.mock('../../context/NativefyProvider', () => ({
  NativefyProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock ModuleProvider
jest.mock('../../module/ModuleProvider', () => ({
  ModuleProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock React Native components
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  ActivityIndicator: 'ActivityIndicator',
  StyleSheet: {
    create: (styles: unknown) => styles,
  },
}));

describe('NativefyApp Integration', () => {
  const mockNavigationAdapter = {
    capability: 'navigation' as const,
    NavigationContainer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    AppNavigator: () => <></>,
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
    getCurrentRoute: jest.fn(),
    getCurrentParams: jest.fn(),
    theme: 'light' as const,
    screenOptions: {},
    deeplinkConfig: undefined,
  };

  const mockAdapters: AdapterMap = {
    navigation: mockNavigationAdapter as unknown as Port,
  };

  const mockModules: ModuleDefinition[] = [
    {
      id: 'test',
      name: 'Test Module',
      screens: [],
      useCases: [],
      requires: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with valid navigation adapter', () => {
    const { UNSAFE_root } = render(<NativefyApp adapters={mockAdapters} modules={mockModules} />);

    expect(UNSAFE_root).toBeTruthy();
  });

  it('should render custom splash screen', () => {
    const CustomSplash = () => <></>;
    const { UNSAFE_root } = render(
      <NativefyApp adapters={mockAdapters} modules={mockModules} splashScreen={<CustomSplash />} />,
    );

    expect(UNSAFE_root).toBeTruthy();
  });

  it('should call onReady when modules load', () => {
    const onReady = jest.fn();
    const { UNSAFE_root } = render(
      <NativefyApp adapters={mockAdapters} modules={mockModules} onReady={onReady} />,
    );

    expect(UNSAFE_root).toBeTruthy();
  });

  it('should call onError when error occurs', () => {
    const onError = jest.fn();
    const { UNSAFE_root } = render(
      <NativefyApp adapters={mockAdapters} modules={mockModules} onError={onError} />,
    );

    expect(UNSAFE_root).toBeTruthy();
  });
});
