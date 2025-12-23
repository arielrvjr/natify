import { validateNavigationAdapter } from '../validation';
import { AdapterMap } from '../../../types/adapters';
import { Port } from '../../../ports/Port';

describe('validateNavigationAdapter', () => {
  const createValidNavigationAdapter = () => ({
    capability: 'navigation' as const,
    NavigationContainer: () => null,
    AppNavigator: () => null,
  });

  it('should return navigation adapter if valid', () => {
    const adapter = createValidNavigationAdapter();
    const adapters: AdapterMap = {
      navigation: adapter as unknown as Port,
    };

    const result = validateNavigationAdapter(adapters);

    expect(result).toBe(adapter);
    expect(result.NavigationContainer).toBeDefined();
    expect(result.AppNavigator).toBeDefined();
  });

  it('should throw error if navigation adapter is missing', () => {
    const adapters: AdapterMap = {};

    expect(() => validateNavigationAdapter(adapters)).toThrow(
      '[NativefyApp] Navigation adapter is required',
    );
  });

  it('should throw error if NavigationContainer is missing', () => {
    const adapter = {
      capability: 'navigation' as const,
      AppNavigator: () => null,
    };
    const adapters: AdapterMap = {
      navigation: adapter as unknown as Port,
    };

    expect(() => validateNavigationAdapter(adapters)).toThrow(
      '[NativefyApp] Navigation adapter must provide NavigationContainer',
    );
  });

  it('should throw error if AppNavigator is missing', () => {
    const adapter = {
      capability: 'navigation' as const,
      NavigationContainer: () => null,
    };
    const adapters: AdapterMap = {
      navigation: adapter as unknown as Port,
    };

    expect(() => validateNavigationAdapter(adapters)).toThrow(
      '[NativefyApp] Navigation adapter must provide NavigationContainer',
    );
  });
});
