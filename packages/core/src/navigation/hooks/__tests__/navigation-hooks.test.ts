import { useNavigationParams, useCurrentRoute } from '../index';
import { NavigationPort } from '../../../ports/NavigationPort';

// Mock useAdapter
const mockNavigation: jest.Mocked<NavigationPort> = {
  capability: 'navigation' as const,
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  popToTop: jest.fn(),
  replace: jest.fn(),
  canGoBack: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn(),
  getCurrentRoute: jest.fn(),
  getCurrentParams: jest.fn(),
};

jest.mock('../../../di/DIProvider', () => ({
  useAdapter: jest.fn(() => mockNavigation),
}));

describe('navigation/hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useNavigationParams', () => {
    it('should return params from navigation adapter', () => {
      const mockParams = { productId: '123', title: 'Product' };
      mockNavigation.getCurrentParams.mockReturnValue(mockParams);

      const params = useNavigationParams<typeof mockParams>();

      expect(params).toEqual(mockParams);
      expect(mockNavigation.getCurrentParams).toHaveBeenCalled();
    });

    it('should return empty object if params are null', () => {
      mockNavigation.getCurrentParams.mockReturnValue({} as any);

      const params = useNavigationParams();

      expect(params).toEqual({});
    });
  });

  describe('useCurrentRoute', () => {
    it('should return current route from navigation adapter', () => {
      const mockRoute = 'products/ProductDetail';
      mockNavigation.getCurrentRoute.mockReturnValue(mockRoute);

      const route = useCurrentRoute();

      expect(route).toBe(mockRoute);
      expect(mockNavigation.getCurrentRoute).toHaveBeenCalled();
    });

    it('should return undefined if route is not available', () => {
      mockNavigation.getCurrentRoute.mockReturnValue(undefined);

      const route = useCurrentRoute();

      expect(route).toBeUndefined();
    });
  });
});
