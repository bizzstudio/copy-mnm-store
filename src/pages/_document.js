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
      <script src="https://bizzstudio.co.il/consent/cookie-consent.js"></script>
<script src="https://cdn.enable.co.il/licenses/enable-L669sin2yb9r7u-1017-80592/init.js"></script>
        </body>
      </Html>
    );
  }
}

export default MyDocument;
