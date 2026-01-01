// src/component/common/DefaultSeo.js
import React from "react";
import Head from "next/head";

// Internal import
import useGetSetting from "@hooks/useGetSetting";

const DefaultSeo = () => {
  const { storeCustomizationSetting } = useGetSetting() || {};
  const { seo } = storeCustomizationSetting || {};
  const { favicon, meta_description, meta_img, meta_keywords, meta_title, meta_url } = seo || {};

  const title = meta_title || "";
  const url = meta_url || "";
  const image = meta_img || "";

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={meta_description || ""} />
      <meta name="keywords" content={meta_keywords || ""} />
      
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="he_IL" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={meta_description || ""} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={title} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={meta_description || ""} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional Meta Tags */}
      <meta
        name="viewport"
        content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover"
      />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="theme-color" content="#ffffff" />
      
      {/* Link Tags */}
      <link rel="apple-touch-icon" href="/Tomer dates.png" />
      <link rel="manifest" href="/api/manifest" />
      {favicon && <link rel="icon" href={favicon} />}
    </Head>
  );
};

export default DefaultSeo;