// src/pages/_app.js
import "@styles/custom.css";
import { CartProvider } from "react-use-cart";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import { Provider } from "react-redux";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Hotjar from '@hotjar/browser';
import Script from "next/script";
import { NextIntlClientProvider } from 'next-intl';

// Internal import
import store from "@redux/store";
import useAsync from "@hooks/useAsync";
import { UserProvider } from "@context/UserContext";
import DefaultSeo from "@component/common/DefaultSeo";
import { SidebarProvider } from "@context/SidebarContext";
import SettingServices from "@services/SettingServices";
import { trackPageView as trackFlashyPageView } from "@services/flashy";
import { trackPageView } from "@services/googleAnalytics";
import { trackFbPageView } from "@services/facebookPixel";

let persistor = persistStore(store);

const siteId = 5076708;
const hotjarVersion = 6;

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  const {
    data: storeSetting,
    loading,
    error,
  } = useAsync(SettingServices.getStoreSetting);

  // Route change tracking: Flashy + GA4 + Meta Pixel
  useEffect(() => {
    if (!loading && !error) {
      const handleRouteChange = (url) => {
        // 1. Flashy Page View
        trackFlashyPageView(url);

        // 2. GA4 Page View דרך dataLayer (GTM-friendly)
        trackPageView(url);

        // 3. Meta Pixel PageView (בשביל SPA ניווט)
        trackFbPageView();
      };

      router.events.on("routeChangeComplete", handleRouteChange);
      return () => {
        router.events.off("routeChangeComplete", handleRouteChange);
      };
    }
  }, [loading, error, router.events]);

  // Redirects
  useEffect(() => {
    if (router.pathname === "/product-category/מבצעים") {
      router.push("/offers");
    }
  }, [router.pathname]);

  // Hotjar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      Hotjar.init(siteId, hotjarVersion);
    }
  }, []);

  const isProductPage = router.pathname.startsWith("/product/");

  return (
    <div>
      {/* GA4 (gtag.js) */}
      {/* <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-E7TH64F9LG"
        strategy="afterInteractive"
      /> */}

      {/* GA4 Consent + Config */}
      {/* <Script id="ga4-consent-config" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}

          // מצב הסכמה ברירת מחדל לאירופה/UK/EEA/שווייץ:
          for ( const mode of [{"analytics_storage":"denied","ad_storage":"denied","ad_user_data":"denied","ad_personalization":"denied","region":["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IS","IE","IT","LV","LI","LT","LU","MT","NL","NO","PL","PT","RO","SK","SI","ES","SE","GB","CH"]}] || [] ) {
            gtag("consent", "default", { "wait_for_update": 500, ...mode });
          }

          gtag("js", new Date());
          gtag("set", "developer_id.dOGY3NW", true);

          gtag("config", "G-E7TH64F9LG", {
            "track_404": true,
            "allow_google_signals": true,
            "logged_in": false,                  // אם תרצה לעדכן דינמית בהמשך - אפשר
            "linker": { "domains": [], "allow_incoming": false },
            "custom_map": { "dimension1": "logged_in" }
          });
        `}
      </Script> */}

      {/* Flashy Pixel */}
      <Script
        id="flashy-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function (a, b, c) {
              if (!a.flashy) {
                a.flashy = function () {
                  a.flashy.event && a.flashy.event(arguments),
                  a.flashy.queue.push(arguments);
                };
                a.flashy.queue = [];
                var d = document.getElementsByTagName('script')[0],
                    e = document.createElement(b);
                e.src = c; e.async = true;
                d.parentNode.insertBefore(e, d);
              }
            })(window, 'script', 'https://js.flashyapp.com/thunder.js');
            flashy('init', '${process.env.NEXT_PUBLIC_FLASHY_ACCOUNT_ID}');
          `,
        }}
      />

      {/* Meta Pixel (Facebook) */}
      <Script id="fb-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          
          fbq('init', '${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>

      {/* Providers */}
      <NextIntlClientProvider
        locale={router.locale || 'he'}
        messages={pageProps.messages}
        timeZone="Asia/Jerusalem"
      >
        <GoogleOAuthProvider clientId={storeSetting?.google_client_id || ""}>
          <UserProvider>
            <Provider store={store}>
              <PersistGate loading={null} persistor={persistor}>
                <SidebarProvider>
                  <CartProvider>

                    {/* רק בעמודים כלליים, לא בעמודי מוצר */}
                    {!isProductPage && <DefaultSeo />}

                    <Component {...pageProps} />

                  </CartProvider>
                </SidebarProvider>
              </PersistGate>
            </Provider>
          </UserProvider>
        </GoogleOAuthProvider>
      </NextIntlClientProvider>
    </div>
  );
}

export default MyApp;