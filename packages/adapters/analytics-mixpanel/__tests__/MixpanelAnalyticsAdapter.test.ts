import { MixpanelAnalyticsAdapter } from '../src';
import { NativefyError } from '@nativefy/core';

// Mock Mixpanel - Mixpanel es un default export con métodos estáticos
const mockInit = jest.fn().mockResolvedValue(undefined);
const mockIdentify = jest.fn();
const mockTrack = jest.fn();
const mockRegisterSuperProperties = jest.fn();
const mockSetUserProperties = jest.fn();
const mockGetPeople = jest.fn(() => ({
  set: jest.fn(),
  increment: jest.fn(),
}));
const mockReset = jest.fn();

jest.mock('mixpanel-react-native', () => {
  // Crear los mocks dentro de la factory function
  const init = jest.fn().mockResolvedValue(undefined);
  const identify = jest.fn();
  const track = jest.fn();
  const registerSuperProperties = jest.fn();
  const setUserProperties = jest.fn();
  const getPeople = jest.fn(() => ({
    set: jest.fn(),
    increment: jest.fn(),
  }));
  const reset = jest.fn();

  return {
    __esModule: true,
    default: {
      init,
      identify,
      track,
      registerSuperProperties,
      setUserProperties,
      getPeople,
      reset,
    },
  };
});

// Obtener referencias a los mocks después de que jest.mock se ejecute
const getMockMixpanel = () => {
  const mixpanel = require('mixpanel-react-native');
  return mixpanel.default || mixpanel;
};

describe('MixpanelAnalyticsAdapter', () => {
  let adapter: MixpanelAnalyticsAdapter;
  let mockMixpanel: ReturnType<typeof getMockMixpanel>;
  const mockToken = 'test-token-123';

  beforeEach(() => {
    jest.clearAllMocks();
    mockMixpanel = getMockMixpanel();
    adapter = new MixpanelAnalyticsAdapter({
      token: mockToken,
      autoInit: false, // Disable auto-init for tests
    });
  });

  describe('constructor', () => {
    it('should create adapter with default config', () => {
      const newAdapter = new MixpanelAnalyticsAdapter({
        token: mockToken,
        autoInit: false,
      });

      expect(newAdapter).toBeDefined();
      expect(newAdapter.capability).toBe('analytics');
    });

    it('should create adapter with custom config', () => {
      const newAdapter = new MixpanelAnalyticsAdapter({
        token: mockToken,
        autoInit: false,
        optOutTrackingByDefault: true,
        trackAutomaticEvents: true,
        useSuperProperties: false,
      });

      expect(newAdapter).toBeDefined();
    });
  });

  describe('init', () => {
    it('should initialize Mixpanel successfully', async () => {
      await adapter.init();

      expect(mockMixpanel.init).toHaveBeenCalledWith(
        mockToken,
        expect.objectContaining({
          optOutTrackingByDefault: false,
          trackAutomaticEvents: false,
        }),
      );
    });

    it('should not initialize twice', async () => {
      await adapter.init();
      await adapter.init();

      expect(mockMixpanel.init).toHaveBeenCalledTimes(1);
    });

    it('should throw NativefyError on initialization failure', async () => {
      mockMixpanel.init.mockRejectedValueOnce(new Error('Init failed'));

      await expect(adapter.init()).rejects.toThrow(NativefyError);
      await expect(adapter.init()).rejects.toThrow('Failed to initialize Mixpanel');
    });
  });

  describe('identify', () => {
    beforeEach(async () => {
      await adapter.init();
    });

    it('should identify user', () => {
      adapter.identify('user-123');

      expect(mockMixpanel.identify).toHaveBeenCalledWith('user-123');
    });

    it('should identify user with traits', () => {
      const traits = {
        email: 'test@example.com',
        name: 'Test User',
        plan: 'premium',
      };

      adapter.identify('user-123', traits);

      expect(mockMixpanel.identify).toHaveBeenCalledWith('user-123');
      expect(mockMixpanel.getPeople().set).toHaveBeenCalledWith(traits);
    });

    it('should warn if not initialized', () => {
      const uninitializedAdapter = new MixpanelAnalyticsAdapter({
        token: mockToken,
        autoInit: false,
      });

      adapter.identify('user-123');

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Not initialized'),
      );
    });
  });

  describe('track', () => {
    beforeEach(async () => {
      await adapter.init();
    });

    it('should track event without properties', () => {
      adapter.track('test_event');

      expect(mockMixpanel.track).toHaveBeenCalledWith('test_event', undefined);
    });

    it('should track event with properties', () => {
      const properties = { value: 100, currency: 'USD' };
      adapter.track('test_event', properties);

      expect(mockMixpanel.track).toHaveBeenCalledWith('test_event', properties);
    });
  });

  describe('screen', () => {
    beforeEach(async () => {
      await adapter.init();
    });

    it('should track screen view', () => {
      adapter.screen('HomeScreen');

      expect(mockMixpanel.track).toHaveBeenCalledWith('Screen Viewed', {
        screen_name: 'HomeScreen',
      });
    });

    it('should track screen view with properties', () => {
      const properties = { category: 'main' };
      adapter.screen('HomeScreen', properties);

      expect(mockMixpanel.track).toHaveBeenCalledWith('Screen Viewed', {
        screen_name: 'HomeScreen',
        category: 'main',
      });
    });
  });

  describe('reset', () => {
    beforeEach(async () => {
      await adapter.init();
    });

    it('should reset Mixpanel', () => {
      adapter.reset();

      expect(mockMixpanel.reset).toHaveBeenCalled();
    });
  });

  describe('registerSuperProperties', () => {
    beforeEach(async () => {
      await adapter.init();
    });

    it('should register super properties', () => {
      const properties = { app_version: '1.0.0', platform: 'ios' };
      adapter.registerSuperProperties(properties);

      expect(mockMixpanel.registerSuperProperties).toHaveBeenCalledWith(properties);
    });
  });

  describe('registerSuperProperty', () => {
    beforeEach(async () => {
      await adapter.init();
    });

    it('should register single super property', () => {
      adapter.registerSuperProperty('key', 'value');

      expect(mockMixpanel.registerSuperProperties).toHaveBeenCalledWith({ key: 'value' });
    });
  });

  describe('incrementUserProperty', () => {
    beforeEach(async () => {
      await adapter.init();
    });

    it('should increment user property with default value', () => {
      adapter.incrementUserProperty('count');

      expect(mockMixpanel.getPeople().increment).toHaveBeenCalledWith('count', 1);
    });

    it('should increment user property with custom value', () => {
      adapter.incrementUserProperty('count', 5);

      expect(mockMixpanel.getPeople().increment).toHaveBeenCalledWith('count', 5);
    });
  });

  describe('setUserProperties', () => {
    beforeEach(async () => {
      await adapter.init();
    });

    it('should set user properties', () => {
      const properties = { plan: 'premium', role: 'admin' };
      adapter.setUserProperties(properties);

      expect(mockMixpanel.getPeople().set).toHaveBeenCalledWith(properties);
    });
  });
});

