/**
 * @module utils/cache
 * High-performance in-memory TTL caching utility with automated cleanup,
 * pattern invalidation, and hit/miss statistics.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class InMemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTtlMs: number;
  private hits = 0;
  private misses = 0;

  constructor(defaultTtlSeconds = 30) {
    this.defaultTtlMs = defaultTtlSeconds * 1000;
  }

  /**
   * Set a value in the cache with optional custom TTL in seconds.
   */
  set<T>(key: string, value: T, ttlSeconds?: number): void {
    const ttlMs = ttlSeconds !== undefined ? ttlSeconds * 1000 : this.defaultTtlMs;
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Retrieve a value from the cache. Returns undefined if key is missing or expired.
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return undefined;
    }

    this.hits++;
    return entry.value as T;
  }

  /**
   * Check if a key exists and is not expired.
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Invalidate a single key.
   */
  del(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate keys matching a prefix or regular expression pattern.
   */
  delPattern(pattern: string | RegExp): void {
    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (typeof pattern === 'string' ? key.startsWith(pattern) : pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all entries in the cache.
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get cache performance metrics (hits, misses, hitRatio, totalEntries).
   */
  getStats() {
    const totalRequests = this.hits + this.misses;
    const hitRatio = totalRequests > 0 ? Number((this.hits / totalRequests).toFixed(4)) : 0;

    return {
      hits: this.hits,
      misses: this.misses,
      hitRatio,
      totalEntries: this.cache.size,
    };
  }
}

export const globalCache = new InMemoryCache(30);
