import { MixpanelAnalyticsAdapter } from '../src';
import { NatifyError } from '@natify/core';

// Mock console methods
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

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
    mockConsoleWarn.mockClear();
    mockConsoleError.mockClear();
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

  afterAll(() => {
    mockConsoleWarn.mockRestore();
    mockConsoleError.mockRestore();
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

    it('should auto-init when autoInit is true', async () => {
      const autoInitAdapter = new MixpanelAnalyticsAdapter({
        token: mockToken,
        autoInit: true,
      });

      // Wait a bit for async auto-init
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockMixpanel.init).toHaveBeenCalled();
    });

    it('should handle auto-init error gracefully', async () => {
      mockMixpanel.init.mockRejectedValueOnce(new Error('Init error'));

      const autoInitAdapter = new MixpanelAnalyticsAdapter({
        token: mockToken,
        autoInit: true,
      });

      // Wait a bit for async auto-init
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Error during auto-init'),
        expect.any(Error),
      );
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

    it('should throw NatifyError on initialization failure', async () => {
      const error = new Error('Init failed');
      mockMixpanel.init.mockRejectedValueOnce(error);

      const result = await adapter.init().catch((e) => e);
      
      expect(result).toBeInstanceOf(NatifyError);
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

    it('should identify user with traits using super properties', () => {
      const traits = {
        email: 'test@example.com',
        name: 'Test User',
        plan: 'premium',
      };

      adapter.identify('user-123', traits);

      expect(mockMixpanel.identify).toHaveBeenCalledWith('user-123');
      expect(mockPeople.set).toHaveBeenCalledWith(traits);
    });

    it('should identify user with traits using setUserProperties when useSuperProperties is false', () => {
      const adapterWithoutSuperProps = new MixpanelAnalyticsAdapter({
        token: mockToken,
        autoInit: false,
        useSuperProperties: false,
      });

      adapterWithoutSuperProps.init().then(() => {
        const traits = {
          email: 'test@example.com',
          name: 'Test User',
        };

        adapterWithoutSuperProps.identify('user-123', traits);

        expect(mockMixpanel.identify).toHaveBeenCalledWith('user-123');
        expect(mockMixpanel.setUserProperties).toHaveBeenCalledWith(traits);
      });
    });

    it('should not set traits when traits object is empty', () => {
      adapter.identify('user-123', {});

      expect(mockMixpanel.identify).toHaveBeenCalledWith('user-123');
      expect(mockPeople.set).not.toHaveBeenCalled();
      expect(mockMixpanel.setUserProperties).not.toHaveBeenCalled();
    });

    it('should warn if not initialized', () => {
      const uninitializedAdapter = new MixpanelAnalyticsAdapter({
        token: mockToken,
        autoInit: false,
      });

      uninitializedAdapter.identify('user-123');

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Not initialized'),
      );
    });

    it('should handle error in identify catch block', () => {
      // Make identify throw an error
      mockMixpanel.identify.mockImplementationOnce(() => {
        throw new Error('Identify error');
      });

      adapter.identify('user-123');

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Error identifying user'),
        expect.any(Error),
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

    it('should warn if not initialized', () => {
      const uninitializedAdapter = new MixpanelAnalyticsAdapter({
        token: mockToken,
        autoInit: false,
      });

      uninitializedAdapter.track('test_event');

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Not initialized'),
      );
    });

    it('should handle error in track catch block', () => {
      // Make track throw an error
      mockMixpanel.track.mockImplementationOnce(() => {
        throw new Error('Track error');
      });

      adapter.track('test_event');

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Error tracking event'),
        expect.any(Error),
      );
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

    it('should warn if not initialized', () => {
      const uninitializedAdapter = new MixpanelAnalyticsAdapter({
        token: mockToken,
        autoInit: false,
      });

      uninitializedAdapter.screen('HomeScreen');

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Not initialized'),
      );
    });

    it('should handle error in screen catch block', () => {
      // Make track throw an error
      mockMixpanel.track.mockImplementationOnce(() => {
        throw new Error('Screen tracking error');
      });

      adapter.screen('HomeScreen');

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Error tracking screen'),
        expect.any(Error),
      );
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

    it('should do nothing if not initialized', () => {
      const uninitializedAdapter = new MixpanelAnalyticsAdapter({
        token: mockToken,
        autoInit: false,
      });

      uninitializedAdapter.reset();

      expect(mockMixpanel.reset).not.toHaveBeenCalled();
    });

    it('should handle error in reset catch block', () => {
      // Make reset throw an error
      mockMixpanel.reset.mockImplementationOnce(() => {
        throw new Error('Reset error');
      });

      adapter.reset();

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Error resetting session'),
        expect.any(Error),
      );
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

    it('should warn if not initialized', () => {
      const uninitializedAdapter = new MixpanelAnalyticsAdapter({
        token: mockToken,
        autoInit: false,
      });

      uninitializedAdapter.registerSuperProperties({ key: 'value' });

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Not initialized'),
      );
    });

    it('should handle error in registerSuperProperties catch block', () => {
      // Make registerSuperProperties throw an error
      mockMixpanel.registerSuperProperties.mockImplementationOnce(() => {
        throw new Error('Register error');
      });

      adapter.registerSuperProperties({ key: 'value' });

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Error registering super properties'),
        expect.any(Error),
      );
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

    it('should warn if not initialized', () => {
      const uninitializedAdapter = new MixpanelAnalyticsAdapter({
        token: mockToken,
        autoInit: false,
      });

      uninitializedAdapter.registerSuperProperty('key', 'value');

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Not initialized'),
      );
    });

    it('should handle error in registerSuperProperty catch block', () => {
      // Make registerSuperProperties throw an error
      mockMixpanel.registerSuperProperties.mockImplementationOnce(() => {
        throw new Error('Register error');
      });

      adapter.registerSuperProperty('key', 'value');

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Error registering super property'),
        expect.any(Error),
      );
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

    it('should warn if not initialized', () => {
      const uninitializedAdapter = new MixpanelAnalyticsAdapter({
        token: mockToken,
        autoInit: false,
      });

      uninitializedAdapter.incrementUserProperty('count');

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Not initialized'),
      );
    });

    it('should handle error in incrementUserProperty catch block', () => {
      // Make getPeople().increment throw an error
      mockPeople.increment.mockImplementationOnce(() => {
        throw new Error('Increment error');
      });

      adapter.incrementUserProperty('count');

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Error incrementing user property'),
        expect.any(Error),
      );
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

    it('should warn if not initialized', () => {
      const uninitializedAdapter = new MixpanelAnalyticsAdapter({
        token: mockToken,
        autoInit: false,
      });

      uninitializedAdapter.setUserProperties({ plan: 'premium' });

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Not initialized'),
      );
    });

    it('should handle error in setUserProperties catch block', () => {
      // Make getPeople().set throw an error
      mockPeople.set.mockImplementationOnce(() => {
        throw new Error('Set error');
      });

      adapter.setUserProperties({ plan: 'premium' });

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Error setting user properties'),
        expect.any(Error),
      );
    });
  });

  describe('getMixpanelClient', () => {
    it('should return Mixpanel client instance', () => {
      const client = adapter.getMixpanelClient();

      expect(client).toBeDefined();
      expect(client.init).toBeDefined();
      expect(client.track).toBeDefined();
      expect(client.identify).toBeDefined();
    });
  });
});

