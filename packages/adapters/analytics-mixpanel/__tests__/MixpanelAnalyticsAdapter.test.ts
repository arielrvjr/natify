import { MixpanelAnalyticsAdapter } from '../src';
import { NativefyError } from '@nativefy/core';

// Crear un objeto mock único para getPeople que se reutilice
const mockPeople = {
  set: jest.fn(),
  increment: jest.fn(),
};

jest.mock('mixpanel-react-native', () => {
  // Crear los mocks dentro de la factory function
  const init = jest.fn().mockResolvedValue(undefined);
  const identify = jest.fn();
  const track = jest.fn();
  const registerSuperProperties = jest.fn();
  const setUserProperties = jest.fn();
  // getPeople debe devolver siempre el mismo objeto mock
  const getPeople = jest.fn(() => mockPeople);
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
    // Limpiar también los mocks de mockPeople
    mockPeople.set.mockClear();
    mockPeople.increment.mockClear();
    mockMixpanel = getMockMixpanel();
    // Asegurar que getPeople devuelve el mismo objeto
    mockMixpanel.getPeople.mockReturnValue(mockPeople);
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
      const error = new Error('Init failed');
      mockMixpanel.init.mockRejectedValueOnce(error);

      const result = await adapter.init().catch((e) => e);
      
      expect(result).toBeInstanceOf(NativefyError);
      expect(result.message).toContain('Failed to initialize Mixpanel');
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
      expect(mockPeople.set).toHaveBeenCalledWith(traits);
    });

    it('should warn if not initialized', () => {
      const uninitializedAdapter = new MixpanelAnalyticsAdapter({
        token: mockToken,
        autoInit: false,
      });

      uninitializedAdapter.identify('user-123');

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

      expect(mockPeople.increment).toHaveBeenCalledWith('count', 1);
    });

    it('should increment user property with custom value', () => {
      adapter.incrementUserProperty('count', 5);

      expect(mockPeople.increment).toHaveBeenCalledWith('count', 5);
    });
  });

  describe('setUserProperties', () => {
    beforeEach(async () => {
      await adapter.init();
    });

    it('should set user properties', () => {
      const properties = { plan: 'premium', role: 'admin' };
      adapter.setUserProperties(properties);

      expect(mockPeople.set).toHaveBeenCalledWith(properties);
    });
  });
});

