
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
}

class IntelligentCache {
  private cache = new Map<string, CacheItem<any>>();
  private readonly MAX_SIZE = 1000;
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private stats: CacheStats = { hits: 0, misses: 0, hitRate: 0 };

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    // Remove oldest/least accessed items if cache is full
    if (this.cache.size >= this.MAX_SIZE) {
      this.evictLeastRecentlyUsed();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now()
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
    
    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
    
    // Update access statistics
    item.accessCount++;
    item.lastAccessed = Date.now();
    
    this.stats.hits++;
    this.updateHitRate();
    return item.data;
  }

  private evictLeastRecentlyUsed(): void {
    let oldestKey = '';
    let oldestTime = Infinity;

    for (const [key, item] of this.cache) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, hitRate: 0 };
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.MAX_SIZE,
      ...this.stats,
      keys: Array.from(this.cache.keys())
    };
  }

  // Preload data for better UX with caching
  async preload<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = this.get<T>(key);
    if (cached) return cached;

    const data = await fetcher();
    this.set(key, data, ttl);
    return data;
  }

  // Memoized computation with cache
  memoize<T extends any[], R>(
    fn: (...args: T) => R,
    keyGenerator: (...args: T) => string,
    ttl?: number
  ) {
    return (...args: T): R => {
      const key = `memoized:${keyGenerator(...args)}`;
      const cached = this.get<R>(key);
      
      if (cached !== null) {
        return cached;
      }
      
      const result = fn(...args);
      this.set(key, result, ttl);
      return result;
    };
  }

  // Batch operations for better performance
  setMany<T>(items: Array<{ key: string; data: T; ttl?: number }>): void {
    items.forEach(({ key, data, ttl }) => {
      this.set(key, data, ttl);
    });
  }

  getMany<T>(keys: string[]): Array<{ key: string; data: T | null }> {
    return keys.map(key => ({
      key,
      data: this.get<T>(key)
    }));
  }
}

export const cache = new IntelligentCache();
