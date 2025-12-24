import React from 'react';
import { render } from '@testing-library/react-native';
import { SplashScreen } from '../SplashScreen';

// Mock React Native components
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  ActivityIndicator: 'ActivityIndicator',
  StyleSheet: {
    create: (styles: unknown) => styles,
  },
}));

describe('SplashScreen', () => {
  it('should render with default props', () => {
    const { UNSAFE_root } = render(<SplashScreen />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should render with custom message', () => {
    const { UNSAFE_root } = render(<SplashScreen message="Loading app..." />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should render with custom colors', () => {
    const { UNSAFE_root } = render(<SplashScreen color="#FF0000" backgroundColor="#000000" />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should render with logo', () => {
    const Logo = () => <></>;
    const { UNSAFE_root } = render(<SplashScreen logo={<Logo />} />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should apply custom styles', () => {
    const { UNSAFE_root } = render(
      <SplashScreen message="Custom message" color="#00FF00" backgroundColor="#FFFFFF" />,
    );
    expect(UNSAFE_root).toBeTruthy();
  });
});
