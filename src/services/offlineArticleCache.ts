import type { WikipediaArticle } from "@/services/wikipediaService";

const OFFLINE_CACHE_KEY = "snippedia-offline-articles-v1";
const MAX_BUCKETS = 12;
const MAX_ARTICLES_PER_BUCKET = 24;
const CACHE_TTL_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

type OfflineBucket = {
  key: string;
  updatedAt: string;
  articles: WikipediaArticle[];
};

type OfflineCacheStore = {
  buckets: OfflineBucket[];
};

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function normalizeArticles(items: WikipediaArticle[]): WikipediaArticle[] {
  const seen = new Set<string>();
  const out: WikipediaArticle[] = [];
  for (const item of items) {
    const id = String(item?.id ?? "").trim();
    if (!id || seen.has(id) || !item.image) continue;
    seen.add(id);
    out.push(item);
  }
  return out.slice(0, MAX_ARTICLES_PER_BUCKET);
}

function readStore(): OfflineCacheStore {
  const raw = safeParse<OfflineCacheStore>(localStorage.getItem(OFFLINE_CACHE_KEY), { buckets: [] });
  if (!Array.isArray(raw.buckets)) return { buckets: [] };
  const now = Date.now();
  const buckets = raw.buckets.filter((bucket) => {
    const ts = Date.parse(bucket.updatedAt);
    if (Number.isNaN(ts)) return false;
    return now - ts <= CACHE_TTL_MS;
  });
  if (buckets.length !== raw.buckets.length) {
    writeStore({ buckets });
  }
  return { buckets };
}

function writeStore(store: OfflineCacheStore) {
  localStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify(store));
}

export function saveOfflineArticles(cacheKey: string, articles: WikipediaArticle[]) {
  const normalized = normalizeArticles(articles);
  if (normalized.length === 0) return;

  const store = readStore();
  const nextBuckets = [
    {
      key: cacheKey,
      updatedAt: new Date().toISOString(),
      articles: normalized,
    },
    ...store.buckets.filter((b) => b.key !== cacheKey),
  ].slice(0, MAX_BUCKETS);

  writeStore({ buckets: nextBuckets });
}

export function readOfflineArticles(cacheKey: string): WikipediaArticle[] {
  const store = readStore();
  const bucket = store.buckets.find((b) => b.key === cacheKey);
  if (!bucket || !Array.isArray(bucket.articles)) return [];
  return normalizeArticles(bucket.articles);
}
