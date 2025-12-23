import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorScreen } from '../ErrorScreen';

// Mock React Native components
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  StyleSheet: {
    create: (styles: unknown) => styles,
    flatten: (styles: unknown) => styles,
  },
}));

describe('ErrorScreen', () => {
  const mockError = new Error('Test error message');
  const mockRetry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with default props', () => {
    const { UNSAFE_root } = render(<ErrorScreen error={mockError} retry={mockRetry} />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should render with custom title', () => {
    const { UNSAFE_root } = render(
      <ErrorScreen error={mockError} retry={mockRetry} title="Custom error title" />,
    );
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should render with custom colors', () => {
    const { UNSAFE_root } = render(
      <ErrorScreen
        error={mockError}
        retry={mockRetry}
        titleColor="#FF0000"
        messageColor="#000000"
        backgroundColor="#FFFFFF"
        retryButtonColor="#00FF00"
      />,
    );
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should render with custom retry button text', () => {
    const { UNSAFE_root } = render(
      <ErrorScreen error={mockError} retry={mockRetry} retryButtonText="Try again" />,
    );
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should call retry when retry button is pressed', () => {
    const { getByText } = render(<ErrorScreen error={mockError} retry={mockRetry} />);

    // Buscar el botón de reintentar
    const retryButton = getByText('Reintentar');

    // Simular el press
    fireEvent.press(retryButton);

    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('should display error message', () => {
    const customError = new Error('Custom error message');
    const { getByText } = render(<ErrorScreen error={customError} retry={mockRetry} />);

    expect(getByText('Custom error message')).toBeTruthy();
  });

  it('should display custom title when provided', () => {
    const { getByText } = render(
      <ErrorScreen error={mockError} retry={mockRetry} title="Application Error" />,
    );

    expect(getByText('Application Error')).toBeTruthy();
  });
});
