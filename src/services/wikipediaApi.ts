// /home/snippedia/snip-pedia/src/services/wikipediaApi.ts

const WIKIPEDIA_API_BASE = "https://en.wikipedia.org/w/api.php";
const PAGEVIEWS_API_BASE =
  "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents";

/**
 * Wikipedia REST/Pageviews expects titles as "slug":
 * - spaces -> underscores
 * - then URL encoded
 */
const toWikiSlug = (title: string) =>
  encodeURIComponent(String(title || "").trim().replace(/ /g, "_"));

export const getPageViews = async (title: string): Promise<number> => {
  try {
    const t = String(title || "").trim();
    if (!t) return 0;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const formatDate = (date: Date) =>
      date.toISOString().slice(0, 10).replace(/-/g, "");

    // IMPORTANT: Pageviews API requires the normalized title slug
    const slug = toWikiSlug(t);

    const response = await fetch(
      `${PAGEVIEWS_API_BASE}/${slug}/daily/${formatDate(startDate)}/${formatDate(endDate)}`
    );

    if (!response.ok) {
      console.warn(`Failed to fetch pageviews for ${t} (${response.status})`);
      return 0;
    }

    const data = await response.json();
    return data?.items?.reduce((sum: number, item: any) => sum + (item?.views || 0), 0) || 0;
  } catch (error) {
    console.warn(`Failed to fetch pageviews for ${title}:`, error);
    return 0;
  }
};

export const fetchWikipediaContent = async (titles: string[]) => {
  // sanitize titles
  const cleanTitles = (titles || [])
    .map((t) => String(t || "").trim())
    .filter(Boolean);

  // return safe empty structure (prevents callers from crashing on undefined)
  if (!cleanTitles.length) {
    return { query: { pages: {} } };
  }

  // MediaWiki action API supports pipe-separated titles
  const titlesString = cleanTitles.join("|");

  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    prop: "extracts|pageimages|categories|links|images|info",
    titles: titlesString,
    exintro: "1",
    explaintext: "1",
    pithumbsize: "1000",
    imlimit: "5",
    // include canonical url + protection
    inprop: "url|protection",
  });

  const response = await fetch(`${WIKIPEDIA_API_BASE}?${params.toString()}`);
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Failed to fetch Wikipedia content (${response.status}): ${text || response.statusText}`);
  }

  return response.json();
};
