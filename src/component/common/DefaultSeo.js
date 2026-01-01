// src/component/common/DefaultSeo.js
import React from "react";
import Head from "next/head";

/**
 * DefaultSeo - קומפוננטה לניהול SEO tags
 * 
 * @param {string} title - כותרת העמוד הספציפי
 * @param {string} description - תיאור העמוד הספציפי
 * @param {object} seo - אובייקט SEO מהשרת (מגיע מ-getServerSideProps)
 *   - meta_title: כותרת האתר הגלובלית
 *   - meta_description: תיאור האתר הגלובלי
 *   - meta_keywords: מילות מפתח
 *   - meta_url: URL של האתר
 *   - meta_img: תמונה ל-Open Graph
 *   - favicon: favicon דינמי
 *   - theme_color: צבע theme (אופציונלי)
 *   - viewport: הגדרות viewport (אופציונלי)
 */
const DefaultSeo = ({ title, description, seo = {} }) => {
  const {
    favicon,
    meta_description,
    meta_img,
    meta_keywords,
    meta_title,
    meta_url,
    theme_color,
    viewport
  } = seo;

  // יצירת הכותרת הסופית - רק אם יש נתונים
  const pageTitle = title && meta_title
    ? `${title} | ${meta_title}`
    : title || meta_title;

  // תיאור העמוד - רק אם יש נתונים
  const pageDescription = description || meta_description;

  return (
    <Head>
      {/* Viewport - חיוני ל-responsive, מוצג תמיד */}
      <meta
        name="viewport"
        content={viewport || "minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover"}
      />

      {/* Title & Description */}
      {pageTitle && <title>{pageTitle}</title>}
      {pageDescription && <meta name="description" content={pageDescription} />}
      {meta_keywords && <meta name="keywords" content={meta_keywords} />}

      {/* Theme Color - רק אם מגיע מהשרת */}
      {theme_color && <meta name="theme-color" content={theme_color} />}

      {/* PWA Meta Tags - רק אם מגיע מהשרת */}
      {theme_color && <meta name="apple-mobile-web-app-capable" content="yes" />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="he_IL" />
      {meta_url && <meta property="og:url" content={meta_url} />}
      {pageTitle && <meta property="og:title" content={pageTitle} />}
      {pageDescription && <meta property="og:description" content={pageDescription} />}
      {meta_img && <meta property="og:image" content={meta_img} />}
      {meta_title && <meta property="og:site_name" content={meta_title} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      {pageTitle && <meta name="twitter:title" content={pageTitle} />}
      {pageDescription && <meta name="twitter:description" content={pageDescription} />}
      {meta_img && <meta name="twitter:image" content={meta_img} />}

      {/* Favicon - סט מלא של favicon tags - רק אם מגיע מהשרת */}
      {favicon && (
        <>
          <link rel="icon" href={favicon} />
          <link rel="shortcut icon" href={favicon} />
          <link rel="apple-touch-icon" href={favicon} />
          <link rel="apple-touch-icon" sizes="180x180" href={favicon} />
          <link rel="icon" type="image/png" sizes="32x32" href={favicon} />
          <link rel="icon" type="image/png" sizes="16x16" href={favicon} />
        </>
      )}
    </Head>
  );
};

export default DefaultSeo;