// next.config.js
const runtimeCaching = require("next-pwa/cache");
const nextTranslate = require("next-translate-plugin");
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  runtimeCaching,
  buildExcludes: [/middleware-manifest\.json$/],
  scope: "/",
  sw: "service-worker.js",
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const baseConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
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
  }  
};

module.exports = nextTranslate(withPWA(baseConfig));