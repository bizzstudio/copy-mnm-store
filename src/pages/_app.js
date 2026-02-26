// src/pages/_app.js
import "@styles/custom.css";
import { CartProvider } from "react-use-cart";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import { Provider } from "react-redux";
import { useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Hotjar from '@hotjar/browser';
import { NextIntlClientProvider } from 'next-intl';
import Head from "next/head";
import Cookies from "js-cookie";

// Internal import
import store from "@redux/store";
import useAsync from "@hooks/useAsync";
import { UserContext, UserProvider } from "@context/UserContext";
import { SidebarProvider } from "@context/SidebarContext";
import SettingServices from "@services/SettingServices";
import { trackPageView as trackFlashyPageView } from "@services/flashy";
import { trackPageView } from "@services/googleAnalytics";
import { trackFbPageView } from "@services/facebookPixel";
import { sanitizeScripts } from "@utils/sanitizeScripts";

let persistor = persistStore(store);

const siteId = 5076708;
const hotjarVersion = 6;

const getCartStorageId = (userInfo) => {
  const userIdentifier = userInfo?._id || userInfo?.id || userInfo?.email || "guest";
  return `react-use-cart-${encodeURIComponent(String(userIdentifier))}`;
};


const getUserInfoFromCookie = () => {
  try {
    const rawUserInfo = Cookies.get("userInfo");
    return rawUserInfo ? JSON.parse(rawUserInfo) : null;
  } catch (error) {
    return null;
  }
};

const UserScopedCartProvider = ({ children }) => {
  const { state } = useContext(UserContext);
  const cookieUserInfo = getUserInfoFromCookie();
  const cartStorageId = getCartStorageId(state?.userInfo || cookieUserInfo);

  return (
    <CartProvider key={cartStorageId} id={cartStorageId}>
      {children}
    </CartProvider>
  );
};

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [dynamicScripts, setDynamicScripts] = useState({ head: '', bodyStart: '', bodyEnd: '' });
  const trackingInitialized = useRef(false);
  const hotjarInitialized = useRef(false);

  const {
    data: storeSetting,
    loading,
    error,
  } = useAsync(SettingServices.getStoreSetting);

  // טעינת סקריפטים דינמיים (פעם אחת)
  useEffect(() => {
    SettingServices.getStoreScripts()
      .then(scripts => {
        const sanitized = sanitizeScripts(scripts);
        setDynamicScripts(sanitized);
      })
      .catch(err => {
        console.error("Failed to load dynamic scripts:", err);
        // ממשיכים בלי scripts - לא מפילים את האתר
      });
  }, []);

  // הרצת bodyStart script (תחילת BODY)
  useEffect(() => {
    if (dynamicScripts.bodyStart) {
      try {
        // יצירת script element וריצה
        const script = document.createElement('script');
        script.textContent = dynamicScripts.bodyStart;
        document.body.insertBefore(script, document.body.firstChild);
        // ניקוי אחרי הרצה
        return () => {
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        };
      } catch (err) {
        console.error("Error executing bodyStart script:", err);
      }
    }
  }, [dynamicScripts.bodyStart]);

  // הרצת bodyEnd script (סוף BODY)
  useEffect(() => {
    if (dynamicScripts.bodyEnd) {
      try {
        // יצירת script element וריצה
        const script = document.createElement('script');
        script.textContent = dynamicScripts.bodyEnd;
        document.body.appendChild(script);
        // ניקוי אחרי הרצה
        return () => {
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        };
      } catch (err) {
        console.error("Error executing bodyEnd script:", err);
      }
    }
  }, [dynamicScripts.bodyEnd]);

  // Route change tracking: Flashy + GA4 + Meta Pixel
  // עם הגנה מפני double events ב-React 19 Strict Mode
  useEffect(() => {
    if (!loading && !error && !trackingInitialized.current) {
      trackingInitialized.current = true;

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
        trackingInitialized.current = false;
      };
    }
  }, [loading, error, router.events]);

  // Redirects
  useEffect(() => {
    if (router.pathname === "/product-category/מבצעים") {
      router.push("/offers");
    }
  }, [router.pathname]);

  // Hotjar - עם הגנה מפני double init ב-React 19 Strict Mode
  useEffect(() => {
    if (typeof window !== 'undefined' && !hotjarInitialized.current) {
      hotjarInitialized.current = true;
      try {
        Hotjar.init(siteId, hotjarVersion);
      } catch (err) {
        console.error("Hotjar init error:", err);
      }
    }
  }, []);

  return (
    <>
      {/* סקריפטים דינמיים ב-HEAD */}
      {dynamicScripts.head && (
        <Head>
          <script dangerouslySetInnerHTML={{ __html: dynamicScripts.head }} />
        </Head>
      )}

      {/* Flashy Pixel */}
      {/* <Script
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
      /> */}

      {/* Meta Pixel (Facebook) */}
      {/* <Script id="fb-pixel" strategy="afterInteractive">
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
      </Script> */}

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
                  <UserScopedCartProvider>
                    <Component {...pageProps} />
                  </UserScopedCartProvider>
                </SidebarProvider>
              </PersistGate>
            </Provider>
          </UserProvider>
        </GoogleOAuthProvider>
      </NextIntlClientProvider>
    </>
  );
}

export default MyApp;
