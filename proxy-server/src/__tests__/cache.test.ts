import { Cache } from '../cache';

describe('Cache', () => {
  let cache: Cache;

  beforeEach(() => {
    cache = new Cache();
  });

  describe('set and get', () => {
    it('should store and retrieve data', () => {
      const testData = { message: 'Hello, World!' };
      cache.set('test-key', testData);
      
      const retrieved = cache.get<typeof testData>('test-key');
      expect(retrieved).toEqual(testData);
    });

    it('should return null for non-existent key', () => {
      const retrieved = cache.get('non-existent');
      expect(retrieved).toBeNull();
    });

    it('should handle different data types', () => {
      cache.set('string', 'test');
      cache.set('number', 42);
      cache.set('object', { foo: 'bar' });
      cache.set('array', [1, 2, 3]);

      expect(cache.get('string')).toBe('test');
      expect(cache.get('number')).toBe(42);
      expect(cache.get('object')).toEqual({ foo: 'bar' });
      expect(cache.get('array')).toEqual([1, 2, 3]);
    });
  });

  describe('TTL expiration', () => {
    it('should return null for expired entries', async () => {
      const testData = { message: 'Expires soon' };
      cache.set('expiring-key', testData, 1); // 1 second TTL
      
      // Data should be available immediately
      expect(cache.get('expiring-key')).toEqual(testData);
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Data should be expired
      expect(cache.get('expiring-key')).toBeNull();
    });

    it('should use default TTL of 120 seconds', () => {
      const testData = { message: 'Default TTL' };
      cache.set('default-ttl-key', testData);
      
      // Data should still be available after a short time
      expect(cache.get('default-ttl-key')).toEqual(testData);
    });

    it('should respect custom TTL', async () => {
      cache.set('short-ttl', 'data1', 1);
      cache.set('long-ttl', 'data2', 10);
      
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      expect(cache.get('short-ttl')).toBeNull();
      expect(cache.get('long-ttl')).toBe('data2');
    });
  });

  describe('invalidate', () => {
    it('should remove specific entry', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      cache.invalidate('key1');
      
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBe('value2');
    });

    it('should handle invalidating non-existent key', () => {
      expect(() => cache.invalidate('non-existent')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should remove all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      
      cache.clear();
      
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
      expect(cache.get('key3')).toBeNull();
    });

    it('should work on empty cache', () => {
      expect(() => cache.clear()).not.toThrow();
    });
  });
});
