// src/pages/_document.js
import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="he" dir="rtl">
        <Head>
          {/* Manifest for PWA - דינמי דרך API */}
          <link rel="manifest" href="/api/manifest" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;