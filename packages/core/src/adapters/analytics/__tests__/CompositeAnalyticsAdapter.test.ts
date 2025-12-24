import { CompositeAnalyticsAdapter } from '../CompositeAnalyticsAdapter';
import { AnalyticsPort } from '../../../ports/AnalyticsPort';

describe('CompositeAnalyticsAdapter', () => {
  let adapter1: jest.Mocked<AnalyticsPort>;
  let adapter2: jest.Mocked<AnalyticsPort>;
  let composite: CompositeAnalyticsAdapter;

  beforeEach(() => {
    adapter1 = {
      capability: 'analytics' as const,
      init: jest.fn().mockResolvedValue(undefined),
      identify: jest.fn(),
      track: jest.fn(),
      screen: jest.fn(),
      reset: jest.fn(),
    };

    adapter2 = {
      capability: 'analytics' as const,
      init: jest.fn().mockResolvedValue(undefined),
      identify: jest.fn(),
      track: jest.fn(),
      screen: jest.fn(),
      reset: jest.fn(),
    };

    composite = new CompositeAnalyticsAdapter([adapter1, adapter2]);
  });

  describe('capability', () => {
    it('should have analytics capability', () => {
      expect(composite.capability).toBe('analytics');
    });
  });

  describe('init', () => {
    it('should initialize all adapters', async () => {
      await composite.init();

      expect(adapter1.init).toHaveBeenCalled();
      expect(adapter2.init).toHaveBeenCalled();
    });

    it('should wait for all adapters to initialize', async () => {
      adapter1.init.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 10)));
      adapter2.init.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 10)));

      const start = Date.now();
      await composite.init();
      const duration = Date.now() - start;

      expect(duration).toBeGreaterThanOrEqual(10);
    });
  });

  describe('identify', () => {
    it('should call identify on all adapters', () => {
      const userId = 'user123';
      const traits = { name: 'John', email: 'john@example.com' };

      composite.identify(userId, traits);

      expect(adapter1.identify).toHaveBeenCalledWith(userId, traits);
      expect(adapter2.identify).toHaveBeenCalledWith(userId, traits);
    });

    it('should call identify without traits', () => {
      const userId = 'user123';

      composite.identify(userId);

      expect(adapter1.identify).toHaveBeenCalledWith(userId, undefined);
      expect(adapter2.identify).toHaveBeenCalledWith(userId, undefined);
    });
  });

  describe('track', () => {
    it('should call track on all adapters', () => {
      const event = 'button_clicked';
      const properties = { button: 'login', page: 'home' };

      composite.track(event, properties);

      expect(adapter1.track).toHaveBeenCalledWith(event, properties);
      expect(adapter2.track).toHaveBeenCalledWith(event, properties);
    });

    it('should call track without properties', () => {
      const event = 'page_view';

      composite.track(event);

      expect(adapter1.track).toHaveBeenCalledWith(event, undefined);
      expect(adapter2.track).toHaveBeenCalledWith(event, undefined);
    });
  });

  describe('screen', () => {
    it('should call screen on all adapters', () => {
      const name = 'HomeScreen';
      const properties = { category: 'main' };

      composite.screen(name, properties);

      expect(adapter1.screen).toHaveBeenCalledWith(name, properties);
      expect(adapter2.screen).toHaveBeenCalledWith(name, properties);
    });

    it('should call screen without properties', () => {
      const name = 'LoginScreen';

      composite.screen(name);

      expect(adapter1.screen).toHaveBeenCalledWith(name, undefined);
      expect(adapter2.screen).toHaveBeenCalledWith(name, undefined);
    });
  });

  describe('reset', () => {
    it('should call reset on all adapters', () => {
      composite.reset();

      expect(adapter1.reset).toHaveBeenCalled();
      expect(adapter2.reset).toHaveBeenCalled();
    });
  });
});
