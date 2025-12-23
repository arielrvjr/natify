import { DIContainer, container } from '../src/di/Container';

describe('DIContainer', () => {
  let diContainer: DIContainer;

  beforeEach(() => {
    diContainer = new DIContainer();
  });

  describe('register', () => {
    it('should register a factory', () => {
      const factory = jest.fn(() => ({ value: 'test' }));

      diContainer.register('test', factory);

      expect(diContainer.has('test')).toBe(true);
    });

    it('should create new instance each time', () => {
      let counter = 0;
      const factory = jest.fn(() => ({ id: counter++ }));

      diContainer.register('test', factory);

      const instance1 = diContainer.resolve<{ id: number }>('test');
      const instance2 = diContainer.resolve<{ id: number }>('test');

      expect(instance1.id).toBe(0);
      expect(instance2.id).toBe(1);
      expect(factory).toHaveBeenCalledTimes(2);
    });
  });

  describe('singleton', () => {
    it('should register a singleton', () => {
      let counter = 0;
      const factory = jest.fn(() => ({ id: counter++ }));

      diContainer.singleton('test', factory);

      const instance1 = diContainer.resolve<{ id: number }>('test');
      const instance2 = diContainer.resolve<{ id: number }>('test');

      expect(instance1.id).toBe(0);
      expect(instance2.id).toBe(0);
      expect(instance1).toBe(instance2);
      expect(factory).toHaveBeenCalledTimes(1);
    });
  });

  describe('instance', () => {
    it('should register an existing instance', () => {
      const instance = { value: 'test' };

      diContainer.instance('test', instance);

      const resolved = diContainer.resolve<typeof instance>('test');
      expect(resolved).toBe(instance);
    });
  });

  describe('resolve', () => {
    it('should resolve registered dependency', () => {
      const factory = jest.fn(() => ({ value: 'test' }));
      diContainer.register('test', factory);

      const result = diContainer.resolve<{ value: string }>('test');

      expect(result.value).toBe('test');
      expect(factory).toHaveBeenCalled();
    });

    it('should throw error if dependency not registered', () => {
      expect(() => {
        diContainer.resolve('non-existent');
      }).toThrow('[DIContainer] Dependency not registered: "non-existent"');
    });
  });

  describe('tryResolve', () => {
    it('should resolve registered dependency', () => {
      const factory = jest.fn(() => ({ value: 'test' }));
      diContainer.register('test', factory);

      const result = diContainer.tryResolve<{ value: string }>('test');

      expect(result?.value).toBe('test');
    });

    it('should return undefined if dependency not registered', () => {
      const result = diContainer.tryResolve('non-existent');

      expect(result).toBeUndefined();
    });
  });

  describe('has', () => {
    it('should return true if dependency is registered', () => {
      diContainer.register('test', () => ({}));

      expect(diContainer.has('test')).toBe(true);
    });

    it('should return false if dependency is not registered', () => {
      expect(diContainer.has('non-existent')).toBe(false);
    });
  });

  describe('remove', () => {
    it('should remove registered dependency', () => {
      diContainer.register('test', () => ({}));
      expect(diContainer.has('test')).toBe(true);

      diContainer.remove('test');

      expect(diContainer.has('test')).toBe(false);
    });

    it('should remove singleton', () => {
      diContainer.singleton('test', () => ({}));
      diContainer.remove('test');

      expect(diContainer.has('test')).toBe(false);
      expect(() => {
        diContainer.resolve('test');
      }).toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all dependencies', () => {
      diContainer.register('test1', () => ({}));
      diContainer.register('test2', () => ({}));
      diContainer.singleton('test3', () => ({}));

      diContainer.clear();

      expect(diContainer.has('test1')).toBe(false);
      expect(diContainer.has('test2')).toBe(false);
      expect(diContainer.has('test3')).toBe(false);
    });
  });

  describe('getKeys', () => {
    it('should return all registered keys', () => {
      diContainer.register('test1', () => ({}));
      diContainer.register('test2', () => ({}));
      diContainer.singleton('test3', () => ({}));

      const keys = diContainer.getKeys();

      expect(keys).toContain('test1');
      expect(keys).toContain('test2');
      expect(keys).toContain('test3');
      expect(keys.length).toBe(3);
    });

    it('should return empty array if no dependencies', () => {
      const keys = diContainer.getKeys();

      expect(keys).toEqual([]);
    });
  });
});

describe('container (global instance)', () => {
  beforeEach(() => {
    container.clear();
  });

  it('should be a DIContainer instance', () => {
    expect(container).toBeInstanceOf(DIContainer);
  });

  it('should be a singleton', () => {
    const { container: container2 } = require('../src/di/Container');
    expect(container).toBe(container2);
  });
});

