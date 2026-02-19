/**
 * Cache module for storing Jira API responses in memory
 * Implements TTL-based expiration and manual invalidation
 */

/**
 * Represents a cached entry with data, timestamp, and TTL
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * In-memory cache implementation with TTL support
 */
export class Cache {
  private store: Map<string, CacheEntry<any>>;

  constructor() {
    this.store = new Map();
  }

  /**
   * Retrieve data from cache if it exists and hasn't expired
   * @param key - Cache key
   * @returns Cached data or null if not found or expired
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    const now = Date.now();
    const age = now - entry.timestamp;
    
    if (age > entry.ttl * 1000) {
      // Entry has expired, remove it
      this.store.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Store data in cache with specified TTL
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttl - Time to live in seconds (optional, defaults to 120)
   */
  set<T>(key: string, data: T, ttl: number = 120): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    
    this.store.set(key, entry);
  }

  /**
   * Remove a specific entry from cache
   * @param key - Cache key to invalidate
   */
  invalidate(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clear all entries from cache
   */
  clear(): void {
    this.store.clear();
  }
}
