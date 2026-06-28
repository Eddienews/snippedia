// /src/services/wikipediaService.ts
// Snippedia Wikipedia + Wikimedia Pageviews service
// ✅ Guarantees: every returned article has a stable string `id`
// ✅ Trending (All): uses Wikimedia "top" endpoint + maps views
// ✅ Trending (Category): computes views via per-article pageviews endpoint (so no more 0 views)
// ✅ Robust fallback when Wikimedia datasets are not yet published (tries last N days)

export const DEFAULT_LANG = "en";

export type WikipediaArticle = {
  id: string;              // ALWAYS defined (string)
  pageid?: number;         // optional numeric pageid
  title: string;
  url?: string;
  content?: string;        // preferred snippet/summary
  extract?: string;        // sometimes used by components
  description?: string;    // optional
  image?: string | null;
  views?: number;          // daily views (yesterday/most recent available)
  category?: string;       // optional UI use
};

type TopArticlesResponse = {
  items?: Array<{
    articles?: Array<{
      article?: string; // slug in underscore form
      views?: number;
    }>;
  }>;
};

const USED_CACHE = new Set<string>();

export function clearUsedArticlesCache() {
  USED_CACHE.clear();
}

/* ----------------------------- small utilities ---------------------------- */

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "Accept": "application/json",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return (await res.json()) as T;
}

function ymdUTC(d: Date) {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return { yyyy, mm, dd };
}

function decodeWikiTitleFromTop(slug: string) {
  // Top endpoint returns underscores, sometimes percent-encoded.
  // Also includes "Special:" etc — we keep as title string.
  const s = (slug || "").replace(/_/g, " ");
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

function slugToTitle(slug: string) {
  return (slug || "").replace(/_/g, " ");
}

function titleToSlug(title: string) {
  return (title || "").trim().replace(/ /g, "_");
}

function normalizeKey(s: string) {
  return (s || "").trim().toLowerCase();
}

function normalizeTitleKey(s: string) {
  return (s || "").trim().replace(/_/g, " ").toLowerCase();
}

function ensureId(a: Partial<WikipediaArticle>): WikipediaArticle {
  const idCandidate =
    (a as any)?.id ??
    (a as any)?.pageid ??
    (a as any)?.pageId ??
    (a as any)?.key ??
    (a as any)?.slug ??
    (a as any)?.title ??
    (a as any)?.displaytitle ??
    "";

  return {
    id: String(idCandidate),
    pageid: typeof (a as any)?.pageid === "number" ? (a as any).pageid : undefined,
    title: String(a.title ?? ""),
    url: a.url,
    content: a.content,
    extract: a.extract,
    description: a.description,
    image: a.image ?? null,
    views: typeof a.views === "number" ? a.views : 0,
    category: a.category,
  };
}

function dedupeById(list: WikipediaArticle[]) {
  const seen = new Set<string>();
  const out: WikipediaArticle[] = [];
  for (const a of list) {
    const id = a.id || a.title;
    if (!id) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(a);
  }
  return out;
}

function markAndFilterUnused(list: WikipediaArticle[]) {
  const out: WikipediaArticle[] = [];
  for (const a of list) {
    const key = normalizeKey(a.id || a.title);
    if (!key) continue;
    if (USED_CACHE.has(key)) continue;
    USED_CACHE.add(key);
    out.push(a);
  }
  return out;
}

/* -------------------------- Wikipedia API endpoints ------------------------- */

function apiBase(lang: string) {
  return `https://${lang}.wikipedia.org/w/api.php`;
}

/**
 * REST summary gives title, extract, and image (thumbnail/original), plus canonical URLs.
 */
async function getSummaryByTitle(title: string, lang = DEFAULT_LANG): Promise<WikipediaArticle | null> {
  const safe = encodeURIComponent(titleToSlug(title));
  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${safe}`;
  const data = await fetchJson<any>(url);

  const finalTitle = (data.title || data.displaytitle || title).toString();
  const pageid = typeof data.pageid === "number" ? data.pageid : undefined;
  const image =
    data?.originalimage?.source ??
    data?.thumbnail?.source ??
    null;

  const canonical =
    data?.content_urls?.desktop?.page ??
    data?.content_urls?.mobile?.page ??
    undefined;

  return ensureId({
    id: pageid ?? finalTitle,
    pageid,
    title: finalTitle,
    url: canonical,
    content: data.extract ?? "",
    extract: data.extract ?? "",
    description: data.description ?? "",
    image,
    views: 0,
  });
}

/**
 * Batch details via Action API (titles=...), returns basic info + pageimages + extract + url.
 * This is faster than calling REST summary for many titles.
 */
async function getManyByTitles(titles: string[], lang = DEFAULT_LANG): Promise<WikipediaArticle[]> {
  const cleaned = titles
    .map((t) => (t || "").trim())
    .filter(Boolean);

  if (!cleaned.length) return [];

  // Wikipedia API supports up to ~50 titles per request comfortably.
  const CHUNK = 50;
  const out: WikipediaArticle[] = [];

  for (let i = 0; i < cleaned.length; i += CHUNK) {
    const chunk = cleaned.slice(i, i + CHUNK);

    const params = new URLSearchParams({
      action: "query",
      format: "json",
      prop: "extracts|pageimages|info",
      exintro: "1",
      explaintext: "1",
      inprop: "url",
      piprop: "original|thumbnail",
      pithumbsize: "800",
      redirects: "1",
      titles: chunk.join("|"),
      origin: "*",
    });

    const url = `${apiBase(lang)}?${params.toString()}`;
    const data = await fetchJson<any>(url);
    const pages = data?.query?.pages ? Object.values<any>(data.query.pages) : [];

    for (const p of pages) {
      if (!p || p.missing) continue;

      const title = (p.title || "").toString();
      const pageid = typeof p.pageid === "number" ? p.pageid : undefined;
      const image =
        p?.original?.source ??
        p?.thumbnail?.source ??
        null;

      out.push(
        ensureId({
          id: pageid ?? title,
          pageid,
          title,
          url: p.fullurl,
          content: p.extract ?? "",
          extract: p.extract ?? "",
          image,
          views: 0,
        })
      );
    }
  }

  return dedupeById(out);
}

export async function searchArticles(query: string, lang = DEFAULT_LANG, limit = 24): Promise<WikipediaArticle[]> {
  const q = (query || "").trim();
  if (!q) return [];

  const params = new URLSearchParams({
    action: "query",
    format: "json",
    list: "search",
    srsearch: q,
    srlimit: String(Math.max(1, Math.min(50, limit))),
    srnamespace: "0",
    origin: "*",
  });

  const url = `${apiBase(lang)}?${params.toString()}`;
  const data = await fetchJson<any>(url);

  const hits = (data?.query?.search ?? []) as Array<any>;
  const titles = hits.map((h) => String(h.title || "")).filter(Boolean);
  const qNorm = normalizeTitleKey(q);
  const qRaw = q.trim();

  const titleRank = new Map<string, number>();
  titles.forEach((title, idx) => {
    titleRank.set(normalizeTitleKey(title), idx);
  });

  let details = await getManyByTitles(titles, lang);
  details = await attachViewsPerArticle(details, lang, Math.min(24, details.length));

  details.sort((a, b) => {
    const aTitle = String(a.title || "");
    const bTitle = String(b.title || "");
    const aNorm = normalizeTitleKey(aTitle);
    const bNorm = normalizeTitleKey(bTitle);

    const aExactCase = aTitle === qRaw ? 1 : 0;
    const bExactCase = bTitle === qRaw ? 1 : 0;
    if (aExactCase !== bExactCase) return bExactCase - aExactCase;

    const aExact = aNorm === qNorm ? 1 : 0;
    const bExact = bNorm === qNorm ? 1 : 0;
    if (aExact !== bExact) return bExact - aExact;

    const aStarts = aNorm.startsWith(qNorm) ? 1 : 0;
    const bStarts = bNorm.startsWith(qNorm) ? 1 : 0;
    if (aStarts !== bStarts) return bStarts - aStarts;

    const aRank = titleRank.get(aNorm) ?? Number.MAX_SAFE_INTEGER;
    const bRank = titleRank.get(bNorm) ?? Number.MAX_SAFE_INTEGER;
    if (aRank !== bRank) return aRank - bRank;

    return 0;
  });

  return details.map((a) => ensureId(a));

}

export async function getRandomArticles(limit = 12, query = "", lang = DEFAULT_LANG): Promise<WikipediaArticle[]> {
  // If a query is provided, prefer search-based randomness (more relevant).
  if (query && query.trim().length > 0) {
    const found = await searchArticles(query, lang, Math.max(24, limit * 3));
    const shuffled = [...found].sort(() => Math.random() - 0.5);
    const withImg = shuffled.filter((a) => !!a.image);
const picked = markAndFilterUnused(withImg).slice(0, Math.max(1, limit));
const enriched = await attachViewsPerArticle(picked, lang, Math.min(24, picked.length));
return enriched;

  }

  const params = new URLSearchParams({
    action: "query",
    format: "json",
    list: "random",
    rnnamespace: "0",
    rnlimit: String(Math.max(1, Math.min(50, limit * 3))),
    origin: "*",
  });

  const url = `${apiBase(lang)}?${params.toString()}`;
  const data = await fetchJson<any>(url);

  const hits = (data?.query?.random ?? []) as Array<any>;
  const titles = hits.map((h) => String(h.title || "")).filter(Boolean);

  const details = await getManyByTitles(titles, lang);
  const withImg = details.filter((a) => !!a.image);
const picked = markAndFilterUnused(withImg).slice(0, Math.max(1, limit));
const enriched = await attachViewsPerArticle(picked, lang, Math.min(24, picked.length));
return enriched;

}

/* ------------------------------- Pageviews -------------------------------- */

async function fetchTopArticles(lang = DEFAULT_LANG): Promise<Array<{ title: string; raw: string; views: number }>> {
  // Wikimedia "top" can return 404 if yesterday dataset isn't published yet.
  const MAX_DAYS_BACK = 7;

  for (let back = 1; back <= MAX_DAYS_BACK; back++) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - back);
    const { yyyy, mm, dd } = ymdUTC(d);

    const url =
      `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/` +
      `${encodeURIComponent(lang)}.wikipedia/all-access/${yyyy}/${mm}/${dd}`;

    try {
      const data = await fetchJson<TopArticlesResponse>(url);
      const list = data.items?.[0]?.articles ?? [];

      const out = list
        .map((a) => {
          const raw = String(a.article ?? "");
          return {
            raw,
            title: decodeWikiTitleFromTop(raw),
            views: Number(a.views ?? 0),
          };
        })
        .filter((x) => x.title && Number.isFinite(x.views));

      if (out.length) return out;
    } catch {
      continue;
    }
  }

  return [];
}

async function fetchPerArticleViews(title: string, lang = DEFAULT_LANG): Promise<number> {
  // Uses per-article endpoint for a single day. If yesterday missing, tries back N days.
  const MAX_DAYS_BACK = 7;

  const articleSlug = encodeURIComponent(titleToSlug(title));

  for (let back = 1; back <= MAX_DAYS_BACK; back++) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - back);
    const { yyyy, mm, dd } = ymdUTC(d);

    // start/end in YYYYMMDD00 (daily granularity expects full timestamps)
    const start = `${yyyy}${mm}${dd}00`;
    const end = start;

    const url =
      `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/` +
      `${encodeURIComponent(lang)}.wikipedia/all-access/all-agents/${articleSlug}/daily/${start}/${end}`;

    try {
      const data = await fetchJson<any>(url);
      const items = data?.items ?? [];
      const v = Number(items?.[0]?.views ?? 0);
      if (Number.isFinite(v) && v >= 0) return v;
    } catch {
      continue;
    }
  }

  return 0;
}

async function attachViewsPerArticle(list: WikipediaArticle[], lang = DEFAULT_LANG, max = 24) {
  // Avoid hammering: only compute for first `max` candidates.
  const slice = list.slice(0, Math.max(1, max));

  const views = await Promise.all(
    slice.map(async (a) => {
      const v = await fetchPerArticleViews(a.title, lang);
      return { id: a.id, v };
    })
  );

  const map = new Map<string, number>();
  for (const x of views) map.set(String(x.id), x.v);

  return list.map((a) => ({
    ...a,
    views: map.get(a.id) ?? a.views ?? 0,
  }));
}

/* ------------------------------- Trending --------------------------------- */

export async function getTrendingArticles(limit = 12, lang = DEFAULT_LANG): Promise<WikipediaArticle[]> {
  try {
    const top = await fetchTopArticles(lang);

    // If top failed (empty), fallback
    if (!top.length) {
      const fallback = await searchArticles("Current events", lang, Math.max(24, limit * 3));
      const withImg = fallback.filter((a) => !!a.image);
      if (withImg.length) return markAndFilterUnused(withImg).slice(0, Math.max(1, limit));
      return await getRandomArticles(limit, "", lang);
    }

    const wanted = top.slice(0, Math.max(30, limit * 4));
    const titles = wanted.map((x) => x.title);

    const details = await getManyByTitles(titles, lang);

    // Map views back with stronger normalization (title + raw slug)
    const viewsMap = new Map<string, number>();
    for (const t of wanted) {
  viewsMap.set(normalizeKey(t.title), t.views);
  viewsMap.set(normalizeKey(t.raw), t.views);
  viewsMap.set(normalizeKey(t.raw.replace(/_/g, " ")), t.views);
  viewsMap.set(normalizeKey(titleToSlug(t.title)), t.views); // ✅ novo
}


    const enriched = details.map((a) => {
      const keyTitle = normalizeKey(a.title);
const keySlug = normalizeKey(titleToSlug(a.title));        // Foo_Bar
const keySlugSpaces = normalizeKey(slugToTitle(titleToSlug(a.title))); // Foo Bar

const v =
  viewsMap.get(keyTitle) ??
  viewsMap.get(keySlug) ??
  viewsMap.get(keySlugSpaces) ??
  a.views ??
  0;


      return ensureId({
        ...a,
        views: v,
        content: a.content ?? a.extract ?? a.description ?? "",
      });
    });

    const filtered = enriched.filter((a) => !!a.image);
    filtered.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));

    if (!filtered.length) return await getRandomArticles(limit, "", lang);

    return markAndFilterUnused(filtered).slice(0, Math.max(1, limit));
  } catch {
    const fallback = await searchArticles("Current events", lang, Math.max(24, limit * 3));
    const withImg = fallback.filter((a) => !!a.image);
    if (withImg.length) return markAndFilterUnused(withImg).slice(0, Math.max(1, limit));
    return await getRandomArticles(limit, "", lang);
  }
}

/**
 * Category trending:
 * - We cannot use Wikimedia "top" (it’s not category-based).
 * - So we build a candidate set via search, then attach per-article views
 *   (so your category trending will NOT show 0 views anymore).
 */
export async function getTrendingArticlesByCategory(
  category: string,
  limit = 12,
  lang = DEFAULT_LANG
): Promise<WikipediaArticle[]> {
  const cat = (category || "").trim();
  if (!cat || cat === "All") return getTrendingArticles(limit, lang);

  // Broader candidate pool to find images and then sort by views.
const candidates = await searchArticles(cat, lang, Math.max(36, limit * 5));

const withImg = candidates
  .map((a) => ensureId({ ...a, category: cat }))
  .filter((a) => !!a.image);

if (!withImg.length) {
  return getRandomArticlesByCategory(cat, limit, lang);
}

// 1) Remove usados antes (pra não gastar chamadas de views em artigos que nem vão aparecer)
const filtered = markAndFilterUnused(withImg);
const pool = filtered.slice(0, Math.max(24, limit * 4)); // um pool razoável

// 2) Agora sim: attach views só no que pode entrar no ranking final
const enriched = await attachViewsPerArticle(pool, lang, Math.max(24, limit * 4));

// 3) Ordena por views e retorna
enriched.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));

return enriched.slice(0, Math.max(1, limit));
}

/* ------------------------------ Category Random --------------------------- */

export async function getRandomArticlesByCategory(
  category: string,
  limit = 12,
  lang = DEFAULT_LANG
): Promise<WikipediaArticle[]> {
  const cat = (category || "").trim();
  if (!cat || cat === "All") return getRandomArticles(limit, "", lang);

  // Search-based random that stays on topic
  const pool = await searchArticles(cat, lang, Math.max(36, limit * 5));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const withImg = shuffled
    .map((a) => ensureId({ ...a, category: cat }))
    .filter((a) => !!a.image);

  const picked = markAndFilterUnused(withImg).slice(0, Math.max(1, limit));
  if (picked.length) return picked;

  // Hard fallback
  return getRandomArticles(limit, cat, lang);
}

/* ------------------------------ Article by ID ----------------------------- */
/**
 * Added to fix: "getArticleById is not exported" build error.
 * Accepts pageid number/string OR a title-like string.
 */
export async function getArticleById(
  id: string | number,
  lang = DEFAULT_LANG
): Promise<WikipediaArticle | null> {
  const key = String(id ?? "").trim();
  if (!key) return null;

  // Numeric pageid -> action API by pageids
  if (/^\d+$/.test(key)) {
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      prop: "extracts|pageimages|info",
      exintro: "0",
      explaintext: "1",
      inprop: "url",
      piprop: "original|thumbnail",
      pithumbsize: "1000",
      pageids: key,
      origin: "*",
    });

    const url = `${apiBase(lang)}?${params.toString()}`;
    const data = await fetchJson<any>(url);
    const page = data?.query?.pages?.[key];
    if (!page || page.missing) return null;

    const title = String(page.title || "");
    const pageid = typeof page.pageid === "number" ? page.pageid : undefined;
    const image =
      page?.original?.source ??
      page?.thumbnail?.source ??
      null;

    return ensureId({
      id: pageid ?? title,
      pageid,
      title,
      url: page.fullurl,
      content: page.extract ?? "",
      extract: page.extract ?? "",
      image,
      views: 0,
    });
  }

  // Otherwise treat as title/slug
  const title = slugToTitle(key);
  const summary = await getSummaryByTitle(title, lang);
  return summary ? ensureId(summary) : null;
}
