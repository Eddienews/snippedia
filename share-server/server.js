import express from "express";

const app = express();
app.set("trust proxy", true); // ✅ importante atrás de proxy (Cloudflare/Apache)

const PORT = process.env.PORT || 5055;

function esc(s = "") {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function fetchJson(url) {
  const r = await fetch(url, {
    headers: { "User-Agent": "snippedia-sharebot/1.0" },
  });
  if (!r.ok) throw new Error(`fetch failed ${r.status}`);
  return await r.json();
}

app.get("/s/:id", async (req, res) => {
  const id = req.params.id;

  let title = "Snippedia";
  let desc = "Wikipedia in a TikTok-style feed. Learn while you scroll.";
  let img = "https://snippedia.app/og-image.png";

  try {
    const api =
      `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*` +
      `&pageids=${encodeURIComponent(id)}` +
      `&prop=extracts|pageimages|info` +
      `&exintro=1&explaintext=1` +
      `&piprop=thumbnail&pilimit=1&pithumbsize=1200` +
      `&inprop=url`;

    const data = await fetchJson(api);
    const pages = data?.query?.pages || {};
    const p = pages[Object.keys(pages)[0]];

    if (p?.title) title = p.title;
    if (p?.extract) desc = String(p.extract).replace(/\s+/g, " ").slice(0, 180);
    if (p?.thumbnail?.source) img = p.thumbnail.source;
  } catch {
    // keep defaults
  }

  // ✅ força https na URL canônica (melhor pra WhatsApp)
  const canonicalUrl = `https://snippedia.app/s/${encodeURIComponent(id)}`;

  // ✅ manda o usuário pro app, mas bots ficam com as OG tags
  const appUrl = `https://snippedia.app/?id=${encodeURIComponent(id)}&q=${encodeURIComponent(title)}`;

  res.set("Content-Type", "text/html; charset=utf-8");
  res.set("Cache-Control", "public, max-age=300"); // 5 min (ajuda preview)

  res.send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)} • Snippedia</title>

  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Snippedia" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(desc)}" />
  <meta property="og:image" content="${esc(img)}" />
  <meta property="og:url" content="${esc(canonicalUrl)}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(desc)}" />
  <meta name="twitter:image" content="${esc(img)}" />

  <meta http-equiv="refresh" content="0; url=${esc(appUrl)}" />
</head>
<body>
  Redirecting to Snippedia…
  <script>location.replace(${JSON.stringify(appUrl)});</script>
</body>
</html>`);
});

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, service: "snippedia-share", port: PORT });
});

app.listen(PORT, () => console.log("Share server on", PORT));
