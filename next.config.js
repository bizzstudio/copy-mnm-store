// next.config.js
const baseConfig = {
  reactStrictMode: true,
  i18n: { locales: ["he"], defaultLocale: "he" },
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },

  async redirects() {
    return [
      {
        source: "/about-us",
        destination: "/עלינו",
        permanent: true,
      },
      {
        source: "/terms-and-conditions",
        destination: "/תקנון-אתר",
        permanent: true,
      },
      {
        source: "/contact-us",
        destination: "/צרו-קשר",
        permanent: true,
      },
    ];
  },

  // Block all search engines from indexing this store
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

module.exports = baseConfig;