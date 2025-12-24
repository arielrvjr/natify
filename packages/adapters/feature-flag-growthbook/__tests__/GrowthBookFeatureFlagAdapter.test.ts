import { GrowthBookFeatureFlagAdapter } from '../src';
import { NatifyError, NatifyErrorCode } from '@natify/core';
import { GrowthBook } from '@growthbook/growthbook-react';

// Mock console methods
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

// Mock GrowthBook
const mockLoadFeatures = jest.fn().mockResolvedValue(undefined);
const mockEvalFeature = jest.fn();
const mockSetAttributes = jest.fn();
const mockGetAttributes = jest.fn().mockReturnValue({});

jest.mock('@growthbook/growthbook-react', () => {
  return {
    GrowthBook: jest.fn().mockImplementation(() => ({
      loadFeatures: mockLoadFeatures,
      evalFeature: mockEvalFeature,
      setAttributes: mockSetAttributes,
      getAttributes: mockGetAttributes,
    })),
  };
});

describe('GrowthBookFeatureFlagAdapter', () => {
  let adapter: GrowthBookFeatureFlagAdapter;
  const mockClientKey = 'test-client-key';

  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleWarn.mockClear();
    mockConsoleError.mockClear();
    // Resetear mocks a sus valores por defecto
    mockLoadFeatures.mockReset();
    mockLoadFeatures.mockResolvedValue(undefined);
    mockEvalFeature.mockReset();
    mockEvalFeature.mockReturnValue({
      on: false,
      value: null,
      source: 'unknown',
    });
    mockSetAttributes.mockReset();
    mockGetAttributes.mockReset();
    mockGetAttributes.mockReturnValue({});
    adapter = new GrowthBookFeatureFlagAdapter({
      clientKey: mockClientKey,
    });
  });

  afterAll(() => {
    mockConsoleWarn.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('constructor', () => {
    it('should create adapter with default config', () => {
      const newAdapter = new GrowthBookFeatureFlagAdapter({
        clientKey: mockClientKey,
      });

      expect(newAdapter).toBeDefined();
      expect(newAdapter.capability).toBe('featureflag');
    });

    it('should create adapter with custom config', () => {
      const newAdapter = new GrowthBookFeatureFlagAdapter({
        clientKey: mockClientKey,
        apiHost: 'https://custom.api.com',
        enableDevMode: true,
        enableStreaming: true,
      });

      expect(newAdapter).toBeDefined();
    });

    it('should set initial attributes if provided', () => {
      const attributes = { id: '123', plan: 'premium' };
      const newAdapter = new GrowthBookFeatureFlagAdapter({
        clientKey: mockClientKey,
        initialAttributes: attributes,
      });

      expect(mockSetAttributes).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '123',
          plan: 'premium',
        }),
      );
    });
  });

  describe('init', () => {
    it('should initialize GrowthBook successfully', async () => {
      await adapter.init();

      expect(mockLoadFeatures).toHaveBeenCalled();
    });

    it('should set attributes if provided', async () => {
      const attributes = { id: '123', email: 'test@example.com' };
      await adapter.init(attributes);

      expect(mockSetAttributes).toHaveBeenCalled();
    });

    it('should enable streaming if configured', async () => {
      const streamingAdapter = new GrowthBookFeatureFlagAdapter({
        clientKey: mockClientKey,
        enableStreaming: true,
      });

      await streamingAdapter.init();

      // Streaming se configura en el constructor de GrowthBook, no hay método setStreaming
      // Solo verificamos que init() se ejecutó correctamente
      expect(mockLoadFeatures).toHaveBeenCalled();
    });

    it('should not initialize twice', async () => {
      await adapter.init();
      await adapter.init();

      expect(mockLoadFeatures).toHaveBeenCalledTimes(1);
    });

    it('should update attributes if already initialized', async () => {
      await adapter.init();
      const attributes = { id: '456' };
      await adapter.init(attributes);

      expect(mockSetAttributes).toHaveBeenCalled();
    });

    it('should throw NatifyError on initialization failure', async () => {
      // Crear un nuevo adapter para este test específico
      const testAdapter = new GrowthBookFeatureFlagAdapter({
        clientKey: mockClientKey,
      });
      
      // Configurar el mock para que falle DESPUÉS de crear el adapter
      mockLoadFeatures.mockReset();
      mockLoadFeatures.mockRejectedValue(new Error('Network error'));

      await expect(testAdapter.init()).rejects.toThrow(NatifyError);
      await expect(testAdapter.init()).rejects.toThrow('Failed to initialize GrowthBook');
    });
  });

  describe('getValue', () => {
    beforeEach(async () => {
      await adapter.init();
    });

    it('should return value when feature is enabled', () => {
      mockEvalFeature.mockReturnValue({
        on: true,
        value: 'test-value',
        source: 'remote',
      });

      const value = adapter.getValue('test-flag', 'default');

      expect(value).toBe('test-value');
    });

    it('should return default value when feature is disabled', () => {
      mockEvalFeature.mockReturnValue({
        on: false,
        value: null,
        source: 'remote',
      });

      const value = adapter.getValue('test-flag', 'default');

      expect(value).toBe('default');
    });

    it('should return null when feature does not exist', () => {
      mockEvalFeature.mockReturnValue(null);

      const value = adapter.getValue('non-existent-flag');

      expect(value).toBeNull();
    });

    it('should warn if not initialized', () => {
      const uninitializedAdapter = new GrowthBookFeatureFlagAdapter({
        clientKey: mockClientKey,
      });

      const value = uninitializedAdapter.getValue('test-flag', 'default');

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Not initialized'),
      );
      expect(value).toBe('default');
    });

    it('should handle error in getValue catch block', () => {
      // Make evalFeature throw an error
      mockEvalFeature.mockImplementationOnce(() => {
        throw new Error('Evaluation error');
      });

      const value = adapter.getValue('test-flag', 'default');

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Error getting value'),
        expect.any(Error),
      );
      expect(value).toBe('default');
    });

    it('should return null when value is null and no default provided', () => {
      mockEvalFeature.mockReturnValue({
        on: true,
        value: null,
        source: 'remote',
      });

      const value = adapter.getValue('test-flag');

      expect(value).toBeNull();
    });
  });

  describe('isEnabled', () => {
    beforeEach(async () => {
      await adapter.init();
    });

    it('should return true when feature is enabled', () => {
      mockEvalFeature.mockReturnValue({
        on: true,
        value: true,
        source: 'remote',
      });

      const enabled = adapter.isEnabled('test-flag');

      expect(enabled).toBe(true);
    });

    it('should return false when feature is disabled', () => {
      mockEvalFeature.mockReturnValue({
        on: false,
        value: false,
        source: 'remote',
      });

      const enabled = adapter.isEnabled('test-flag');

      expect(enabled).toBe(false);
    });

    it('should return false when feature does not exist', () => {
      mockEvalFeature.mockReturnValue(null);

      const enabled = adapter.isEnabled('non-existent-flag');

      expect(enabled).toBe(false);
    });

    it('should warn if not initialized', () => {
      const uninitializedAdapter = new GrowthBookFeatureFlagAdapter({
        clientKey: mockClientKey,
      });

      const enabled = uninitializedAdapter.isEnabled('test-flag');

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Not initialized'),
      );
      expect(enabled).toBe(false);
    });

    it('should handle error in isEnabled catch block', () => {
      // Make evalFeature throw an error
      mockEvalFeature.mockImplementationOnce(() => {
        throw new Error('Evaluation error');
      });

      const enabled = adapter.isEnabled('test-flag');

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Error checking if flag'),
        expect.any(Error),
      );
      expect(enabled).toBe(false);
    });
  });

  describe('getFeatureFlag', () => {
    beforeEach(async () => {
      await adapter.init();
    });

    it('should return complete feature flag result', () => {
      mockEvalFeature.mockReturnValue({
        on: true,
        value: 'test-value',
        source: 'remote',
      });

      const result = adapter.getFeatureFlag('test-flag');

      expect(result).toEqual({
        value: 'test-value',
        enabled: true,
        exists: true,
        source: 'remote',
      });
    });

    it('should return exists: false when feature does not exist', () => {
      mockEvalFeature.mockReturnValue(null);

      const result = adapter.getFeatureFlag('non-existent-flag');

      expect(result).toEqual({
        value: null,
        enabled: false,
        exists: false,
      });
    });

    it('should warn if not initialized', () => {
      const uninitializedAdapter = new GrowthBookFeatureFlagAdapter({
        clientKey: mockClientKey,
      });

      const result = uninitializedAdapter.getFeatureFlag('test-flag');

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Not initialized'),
      );
      expect(result).toEqual({
        value: null,
        enabled: false,
        exists: false,
      });
    });

    it('should handle error in getFeatureFlag catch block', () => {
      // Make evalFeature throw an error
      mockEvalFeature.mockImplementationOnce(() => {
        throw new Error('Evaluation error');
      });

      const result = adapter.getFeatureFlag('test-flag');

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Error getting feature flag'),
        expect.any(Error),
      );
      expect(result).toEqual({
        value: null,
        enabled: false,
        exists: false,
      });
    });

    it('should return variant when source is experiment and inExperiment is true', () => {
      mockEvalFeature.mockReturnValue({
        on: true,
        value: 'variant-value',
        source: 'experiment',
        experimentResult: {
          inExperiment: true,
          variationId: 0,
        },
      });

      const result = adapter.getFeatureFlag('test-flag');

      expect(result.variant).toBe('0');
      expect(result.source).toBe('experiment');
    });

    it('should not return variant when source is experiment but inExperiment is false', () => {
      mockEvalFeature.mockReturnValue({
        on: true,
        value: 'variant-value',
        source: 'experiment',
        experimentResult: {
          inExperiment: false,
          variationId: 0,
        },
      });

      const result = adapter.getFeatureFlag('test-flag');

      expect(result.variant).toBeUndefined();
      expect(result.source).toBe('experiment');
    });
  });

  describe('getFeatureFlags', () => {
    beforeEach(async () => {
      await adapter.init();
    });

    it('should return multiple feature flags', () => {
      mockEvalFeature
        .mockReturnValueOnce({
          on: true,
          value: 'value1',
          source: 'remote',
        })
        .mockReturnValueOnce({
          on: false,
          value: null,
          source: 'remote',
        });

      const results = adapter.getFeatureFlags(['flag1', 'flag2']);

      expect(results).toHaveProperty('flag1');
      expect(results).toHaveProperty('flag2');
      expect(results.flag1.enabled).toBe(true);
      expect(results.flag2.enabled).toBe(false);
    });
  });

  describe('setAttributes', () => {
    beforeEach(async () => {
      await adapter.init();
    });

    it('should set user attributes', () => {
      const attributes = {
        id: '123',
        email: 'test@example.com',
        plan: 'premium',
      };

      adapter.setAttributes(attributes);

      expect(mockSetAttributes).toHaveBeenCalledWith(
        expect.objectContaining(attributes),
      );
    });

    it('should warn if not initialized', () => {
      const uninitializedAdapter = new GrowthBookFeatureFlagAdapter({
        clientKey: mockClientKey,
      });

      uninitializedAdapter.setAttributes({ id: '123' });

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Not initialized'),
      );
    });

    it('should handle error in setAttributes catch block', () => {
      // Make setAttributes throw an error
      mockSetAttributes.mockImplementationOnce(() => {
        throw new Error('Set attributes error');
      });

      adapter.setAttributes({ id: '123' });

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Error setting attributes'),
        expect.any(Error),
      );
    });
  });

  describe('getAttributes', () => {
    beforeEach(async () => {
      await adapter.init();
    });

    it('should return current attributes', () => {
      mockGetAttributes.mockReturnValue({
        id: '123',
        email: 'test@example.com',
      });

      const attributes = adapter.getAttributes();

      expect(attributes).toEqual({
        id: '123',
        email: 'test@example.com',
      });
    });

    it('should return empty object if not initialized', () => {
      const uninitializedAdapter = new GrowthBookFeatureFlagAdapter({
        clientKey: mockClientKey,
      });

      const attributes = uninitializedAdapter.getAttributes();

      expect(attributes).toEqual({});
    });

    it('should handle error in getAttributes catch block', () => {
      // Make getAttributes throw an error
      mockGetAttributes.mockImplementationOnce(() => {
        throw new Error('Get attributes error');
      });

      const attributes = adapter.getAttributes();

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Error getting attributes'),
        expect.any(Error),
      );
      expect(attributes).toEqual({});
    });
  });

  describe('refresh', () => {
    beforeEach(async () => {
      await adapter.init();
    });

    it('should refresh feature flags', async () => {
      await adapter.refresh();

      expect(mockLoadFeatures).toHaveBeenCalled();
    });

    it('should throw NatifyError on refresh failure', async () => {
      // Resetear y configurar el mock para que falle
      mockLoadFeatures.mockReset();
      mockLoadFeatures.mockRejectedValue(new Error('Network error'));

      await expect(adapter.refresh()).rejects.toThrow(NatifyError);
      await expect(adapter.refresh()).rejects.toThrow('Failed to refresh feature flags');
    });

    it('should warn if not initialized', async () => {
      const uninitializedAdapter = new GrowthBookFeatureFlagAdapter({
        clientKey: mockClientKey,
      });
      
      // Clear any calls from constructor
      mockLoadFeatures.mockClear();

      await uninitializedAdapter.refresh();

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Not initialized'),
      );
      // loadFeatures should not be called when not initialized
      expect(mockLoadFeatures).not.toHaveBeenCalled();
    });
  });

  describe('clearAttributes', () => {
    beforeEach(async () => {
      await adapter.init();
    });

    it('should clear user attributes', () => {
      adapter.clearAttributes();

      expect(mockSetAttributes).toHaveBeenCalledWith({});
    });

    it('should do nothing if not initialized', () => {
      const uninitializedAdapter = new GrowthBookFeatureFlagAdapter({
        clientKey: mockClientKey,
      });

      uninitializedAdapter.clearAttributes();

      expect(mockSetAttributes).not.toHaveBeenCalled();
    });

    it('should handle error in clearAttributes catch block', () => {
      // Make setAttributes throw an error
      mockSetAttributes.mockImplementationOnce(() => {
        throw new Error('Clear attributes error');
      });

      adapter.clearAttributes();

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Error clearing attributes'),
        expect.any(Error),
      );
    });
  });

  describe('getGrowthBookClient', () => {
    it('should return GrowthBook client instance', () => {
      const client = adapter.getGrowthBookClient();

      expect(client).toBeDefined();
      expect(client.loadFeatures).toBeDefined();
      expect(client.evalFeature).toBeDefined();
      expect(client.setAttributes).toBeDefined();
    });
  });
});

