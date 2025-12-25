// src/lib/seo.js
export function buildSeo({ defaults = {}, page = {} }) {
  const baseUrl = (defaults.meta_url || "").replace(/\/$/, "");
  const siteName = defaults.meta_title || "MNM יבוא שיווק והפצה";
  const title = page.title || defaults.meta_title || siteName;
  const description = page.description || defaults.meta_description || "";
  const image = absUrl(baseUrl, page.image || defaults.meta_img || "/logo/logo-color.png");
  const url = absUrl(baseUrl, page.path || "/");

  return {
    title,
    description,
    canonical: url,
    openGraph: {
      url,
      title,
      description,
      site_name: siteName,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      type: page.type || "website",
      locale: "he_IL",
    },
    twitter: { cardType: "summary_large_image" },
    additionalLinkTags: [
      ...(defaults.favicon ? [{ rel: "icon", href: absUrl(baseUrl, defaults.favicon) }] : []),
      { rel: "manifest", href: "/api/manifest" },
    ],
  };
}

export function withOrigin(defaults, req) {
  const proto = (req.headers["x-forwarded-proto"] || "https").toString().split(",")[0];
  const host = (req.headers["x-forwarded-host"] || req.headers["host"]).toString().split(",")[0];
  const origin = `${proto}://${host}`;
  return { ...defaults, meta_url: defaults?.meta_url || origin };
}

function absUrl(base, pth) {
  if (!pth) return "";
  if (/^https?:\/\//i.test(pth)) return pth;
  if (!base) return pth.startsWith("/") ? pth : `/${pth}`;
  return `${base}/${pth.replace(/^\//, "")}`;
}