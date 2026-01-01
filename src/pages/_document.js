// src/pages/_document.js
import SettingServices from "@services/SettingServices";
import Document, { Html, Head, Main, NextScript } from "next/document";
import { getI18nProps } from "@utils/i18n";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);

    const reqUrl = ctx.req?.url;
    const asPath = ctx.asPath;
    const pathname = ctx.pathname;
    const path = reqUrl || asPath || pathname || "";

    let seoSetting = null;
    let scriptSetting = { head: "", bodyStart: "", bodyEnd: "" };
    let error = null;

    try {
      // Fetch general metadata from backend API
      seoSetting = await SettingServices.getStoreSeoSetting(path);
      // ✅ חדש: טעינת סקריפטים דינמיים
      scriptSetting = await SettingServices.getStoreScripts();
    } catch (err) {
      error = true; // Mark error
      console.error("Failed to fetch settings:", err);
    }

    return { ...initialProps, seoSetting, scriptSetting, error };
  }

  render() {
    const { seoSetting, scriptSetting, error } = this.props;
    const { seo } = seoSetting || {};
    const { head, bodyStart, bodyEnd } = scriptSetting || {};
    const { favicon, meta_description, meta_img, meta_keywords, meta_title, meta_url } = seo || {};

    // יצירת manifest דינמי
    const manifestData = {
      name: meta_title,
      short_name: meta_title,
      description: meta_description,
      start_url: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#ffffff",
      icons: [
        {
          src: favicon,
          sizes: "any",
          type: "image/x-icon"
        },
        {
          src: meta_img,
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable"
        },
        {
          src: meta_img,
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable"
        }
      ]
    };

    // Check if there was an error during data fetching
    if (error) {
      return (
        <Html lang="he" dir="rtl">
          <head>
            <title>שגיאה - האתר אינו זמין</title>
          </head>
          <body>
            <h1>שגיאה</h1>
            <p>מצטערים, האתר אינו זמין כרגע. נסה שוב מאוחר יותר.</p>
          </body>
        </Html>
      );
    }

    return (
      <Html lang="he" dir="rtl">
        <Head>
          <link rel="icon" href={favicon || "/Tomer dates.png"} />
          <link rel="shortcut icon" href={favicon || "/Tomer dates.png"} />
          <link rel="apple-touch-icon" href={favicon || "/Tomer dates.png"} />
          <link rel="apple-touch-icon" sizes="180x180" href={favicon || "/Tomer dates.png"} />
          <link rel="icon" type="image/png" sizes="32x32" href={favicon || "/Tomer dates.png"} />
          <link rel="icon" type="image/png" sizes="16x16" href={favicon || "/Tomer dates.png"} />

          {/* Regular meta tags that Google prefers */}
          <title>{meta_title}</title>
          <meta
            name="description"
            content={meta_description}
          />

          <meta
            property="og:title"
            content={
              meta_title
            }
          />
          <meta property="og:type" content="eCommerce Website" />
          <meta
            property="og:description"
            content={
              meta_description
            }
          />
          <meta
            name="keywords"
            content={meta_keywords}
          />
          <meta
            property="og:url"
            content={
              meta_url
            }
          />
          <meta
            property="og:image"
            content={meta_img}
          />


          {/* יצירת manifest דינמי */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(manifestData)
            }}
          />

          {/* עדכון הקישור ל-manifest */}
          <link rel="manifest" href="/api/manifest" />

        </Head>
        <body>
{/* ----- BODY START SCRIPTS ----- */}
          {bodyStart && (
            <script dangerouslySetInnerHTML={{ __html: bodyStart }} />
          )}


          <Main />
          <NextScript />

          {/* ✅ סקריפטים מה-API לסוף ה-body */}
    {bodyEnd && (
  <span dangerouslySetInnerHTML={{ __html: bodyEnd }} />
)}
        </body>
      </Html>
    );
  }
}


export async function getStaticProps(context) {
  return {
    props: await getI18nProps(context),
  };
}

export default MyDocument;
