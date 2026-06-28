import { useState, useEffect, useCallback } from "react";
import { WikipediaArticle } from "../services/wikipediaService";
import { useAnalytics } from "./useAnalytics";

export interface FavoriteItem {
  article: WikipediaArticle;
  savedAt: string;
  tags?: string[];
  collectionId: string;
}

const STORAGE_KEY = "snippedia-favorites";
const COLLECTIONS_KEY = "snippedia-favorite-collections";
const LEGACY_KEY = "wikitok-favorites";
const LEGACY_BOOKMARKS_KEY = "wikitok-bookmarks";
const LEGACY_SNIPPEDIA_BOOKMARKS_KEY = "snippedia-bookmarks";

// ✅ evento interno para sincronizar TODOS os componentes que usam o hook
const FAVORITES_EVENT = "snippedia-favorites-updated";
const DEFAULT_COLLECTION_ID = "default";

export interface FavoriteCollection {
  id: string;
  name: string;
  createdAt: string;
}

const DEFAULT_COLLECTION: FavoriteCollection = {
  id: DEFAULT_COLLECTION_ID,
  name: "Saved",
  createdAt: new Date(0).toISOString(),
};

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

const idKey = (id: string | number) => String(id ?? "").trim();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stableArticleId(article: Partial<WikipediaArticle> & { title?: string; pageid?: number }) {
  const directId = article.id;
  if (directId != null && String(directId).trim() !== "") {
    return String(directId).trim();
  }

  const pageId = article?.pageid;
  if (typeof pageId === "number") {
    return String(pageId);
  }

  const title = String(article?.title ?? "").trim();
  if (title) {
    return `title:${title.toLowerCase()}`;
  }

  return "";
}

function normalizeFavoriteItem(raw: unknown): FavoriteItem | null {
  if (!isRecord(raw)) return null;

  const articleRaw =
    isRecord(raw.article) ? (raw.article as Partial<WikipediaArticle>) : (raw as Partial<WikipediaArticle>);
  const title = String(articleRaw.title ?? "").trim();
  const normalizedId = stableArticleId(articleRaw);
  if (!normalizedId || !title) return null;

  const article: WikipediaArticle = {
    ...articleRaw,
    id: normalizedId,
    title,
  };

  return {
    article,
    savedAt: typeof raw.savedAt === "string" ? raw.savedAt : new Date().toISOString(),
    tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : undefined,
    collectionId:
      typeof raw.collectionId === "string" && raw.collectionId.trim()
        ? raw.collectionId.trim()
        : DEFAULT_COLLECTION_ID,
  };
}

function normalizeFavorites(raw: unknown): FavoriteItem[] {
  const arr = Array.isArray(raw) ? raw : [];
  const out: FavoriteItem[] = [];
  const seen = new Set<string>();

  for (const item of arr) {
    const normalized = normalizeFavoriteItem(item);
    if (!normalized) continue;
    const key = idKey(normalized.article.id);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(normalized);
  }

  return out;
}

function convertLegacyBookmarks(raw: unknown): FavoriteItem[] {
  const arr = Array.isArray(raw) ? raw : [];
  return normalizeFavorites(
    arr
      .map((item) => (isRecord(item) ? item : null))
      .filter((item): item is Record<string, unknown> => item !== null)
      .map((item) => ({
        article: {
          id: typeof item.id === "string" || typeof item.id === "number" ? item.id : undefined,
          title: typeof item.title === "string" ? item.title : "",
        },
        savedAt: typeof item.timestamp === "string" ? item.timestamp : undefined,
        collectionId: DEFAULT_COLLECTION_ID,
      }))
  );
}

function normalizeCollections(raw: unknown): FavoriteCollection[] {
  const arr = Array.isArray(raw) ? raw : [];
  const seen = new Set<string>();
  const out: FavoriteCollection[] = [];

  for (const item of arr) {
    if (!isRecord(item)) continue;
    const id = typeof item.id === "string" && item.id.trim() ? item.id.trim() : "";
    const name = typeof item.name === "string" && item.name.trim() ? item.name.trim() : "";
    if (!id || !name || seen.has(id)) continue;
    seen.add(id);
    out.push({
      id,
      name,
      createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
    });
  }

  if (!out.some((c) => c.id === DEFAULT_COLLECTION_ID)) {
    return [DEFAULT_COLLECTION, ...out];
  }

  return out;
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [collections, setCollections] = useState<FavoriteCollection[]>([DEFAULT_COLLECTION]);
  const { trackEngagement } = useAnalytics();

  const load = useCallback(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    setFavorites(normalizeFavorites(safeParse<unknown[]>(raw, [])));
    const rawCollections = localStorage.getItem(COLLECTIONS_KEY);
    const normalizedCollections = normalizeCollections(safeParse<unknown[]>(rawCollections, [DEFAULT_COLLECTION]));
    setCollections(normalizedCollections);
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(normalizedCollections));
  }, []);

  const persist = useCallback((items: FavoriteItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    // ✅ avisa todo mundo no mesmo tab
    window.dispatchEvent(new CustomEvent(FAVORITES_EVENT));
  }, []);

  useEffect(() => {
    // Collections bootstrap
    const rawCollections = localStorage.getItem(COLLECTIONS_KEY);
    const normalizedCollections = normalizeCollections(safeParse<unknown[]>(rawCollections, [DEFAULT_COLLECTION]));
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(normalizedCollections));
    setCollections(normalizedCollections);

    // 1) Prefer new key
    const rawNew = localStorage.getItem(STORAGE_KEY);
    if (rawNew) {
      const normalized = normalizeFavorites(safeParse<unknown[]>(rawNew, []));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      setFavorites(normalized);
    } else {
      // 2) Migrate legacy favorites -> new
      const rawLegacy = localStorage.getItem(LEGACY_KEY);
      if (rawLegacy) {
        const legacy = normalizeFavorites(safeParse<unknown[]>(rawLegacy, []));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));
        localStorage.removeItem(LEGACY_KEY);
        setFavorites(legacy);
      } else {
        // 3) Migrate old bookmarks keys -> new favorites schema
        const rawLegacyBookmarks = localStorage.getItem(LEGACY_BOOKMARKS_KEY);
        const rawSnippediaBookmarks = localStorage.getItem(LEGACY_SNIPPEDIA_BOOKMARKS_KEY);
        const bookmarks = rawSnippediaBookmarks ?? rawLegacyBookmarks;

        if (bookmarks) {
          const migrated = convertLegacyBookmarks(safeParse<unknown[]>(bookmarks, []));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
          localStorage.removeItem(LEGACY_BOOKMARKS_KEY);
          localStorage.removeItem(LEGACY_SNIPPEDIA_BOOKMARKS_KEY);
          setFavorites(migrated);
        } else {
          setFavorites([]);
        }
      }
    }

    const onUpdated = () => load();
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) load(); // ✅ se mudar (outra aba / ou mesmo)
    };

    window.addEventListener(FAVORITES_EVENT, onUpdated as EventListener);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(FAVORITES_EVENT, onUpdated as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, [load]);

  const addToFavorites = (article: WikipediaArticle, tags?: string[], collectionId?: string) => {
    const normalizedId = stableArticleId(article);
    if (!normalizedId) return;
    const targetCollectionId =
      typeof collectionId === "string" && collectionId.trim() ? collectionId.trim() : DEFAULT_COLLECTION_ID;

    const normalizedArticle: WikipediaArticle = {
      ...article,
      id: normalizedId,
      title: String(article.title ?? "").trim(),
    };

    const newFavorite: FavoriteItem = {
      article: normalizedArticle,
      savedAt: new Date().toISOString(),
      tags,
      collectionId: targetCollectionId,
    };

    setFavorites((prev) => {
      const key = idKey(normalizedArticle.id);
      const filtered = prev.filter((item) => idKey(item.article.id) !== key);
      const next = [newFavorite, ...filtered];
      persist(next);

      // Analytics
      trackEngagement(normalizedArticle.id, "favorite");

      // Mantém seu evento antigo (se algum lugar escuta isso)
      window.dispatchEvent(
        new CustomEvent("article-favorited", { detail: { articleId: article.id } })
      );

      return next;
    });
  };

  const removeFromFavorites = (articleId: string | number) => {
    setFavorites((prev) => {
      const key = idKey(articleId);
      const next = prev.filter((item) => idKey(item.article.id) !== key);
      persist(next);
      return next;
    });
  };

  const isFavorite = (articleId: string | number) => {
    const key = idKey(articleId);
    return favorites.some((item) => idKey(item.article.id) === key);
  };

  const getFavoritesByTag = (tag: string) => favorites.filter((item) => item.tags?.includes(tag));

  const createCollection = (name: string) => {
    const normalizedName = name.trim();
    if (!normalizedName) return null;

    const exists = collections.some((c) => c.name.toLowerCase() === normalizedName.toLowerCase());
    if (exists) return null;

    const created: FavoriteCollection = {
      id: `col-${Date.now()}`,
      name: normalizedName,
      createdAt: new Date().toISOString(),
    };
    const next = [...collections, created];
    setCollections(next);
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(FAVORITES_EVENT));
    return created;
  };

  const assignFavoriteToCollection = (articleId: string | number, collectionId: string) => {
    const targetCollectionId =
      typeof collectionId === "string" && collectionId.trim() ? collectionId.trim() : DEFAULT_COLLECTION_ID;
    const collectionExists = collections.some((c) => c.id === targetCollectionId);
    if (!collectionExists) return;

    setFavorites((prev) => {
      const key = idKey(articleId);
      const next = prev.map((item) =>
        idKey(item.article.id) === key ? { ...item, collectionId: targetCollectionId } : item
      );
      persist(next);
      return next;
    });
  };

  const deleteCollection = (collectionId: string) => {
    if (collectionId === DEFAULT_COLLECTION_ID) return;
    const nextCollections = collections.filter((c) => c.id !== collectionId);
    setCollections(nextCollections);
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(nextCollections));

    setFavorites((prev) => {
      const nextFavorites = prev.map((item) =>
        item.collectionId === collectionId ? { ...item, collectionId: DEFAULT_COLLECTION_ID } : item
      );
      persist(nextFavorites);
      return nextFavorites;
    });
  };

  const clearFavorites = () => {
    setFavorites([]);
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(FAVORITES_EVENT));
  };

  return {
    favorites,
    collections,
    defaultCollectionId: DEFAULT_COLLECTION_ID,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    getFavoritesByTag,
    createCollection,
    assignFavoriteToCollection,
    deleteCollection,
    clearFavorites,
  };
};
