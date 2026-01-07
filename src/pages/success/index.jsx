// src/pages/success/index.jsx
import React, { useContext, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { IoHome } from "react-icons/io5";
import { PiListMagnifyingGlassBold } from "react-icons/pi";
import { useRouter } from "next/router";

// Internal import
import cartSuccess from "public/cart success2.svg"
import leaf from "public/leaf.svg"
import Link from "next/link";
import Layout from "@layout/Layout";
import Loading from "@component/preloader/Loading";
import { SidebarContext } from "@context/SidebarContext";
import Cookies from "js-cookie";
import useCart from "@hooks/useCart";
import scrollUp from "src/functions/scrollUp";
import MainBT from "@component/button/MainBT";
import { trackPurchase as trackFlashyPurchase } from "@services/flashy";
import googleAnalytics, { trackPurchase } from "@services/googleAnalytics";
import { trackFbPurchase } from "@services/facebookPixel";
import OrderServices from "@services/OrderServices";
import CustomerServices from "@services/CustomerServices";
import { UserContext } from "@context/UserContext";
import { getI18nProps } from "@utils/i18n";

const Success = () => {
  const { isLoading } = useContext(SidebarContext);
  const { state: { userInfo }, dispatch } = useContext(UserContext);
  const t = useTranslations();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [purchaseTracked, setPurchaseTracked] = useState(false);

  const { emptyCart } = useCart();

  // רענון מידע המשתמש בטעינת העמוד
  useEffect(() => {
    const refreshUserInfo = async () => {
      // רק אם יש משתמש מחובר
      if (!userInfo) return;

      try {
        // קריאה ל-/me לעדכון מידע המשתמש (כולל unpaidBalance ו-availableCredit)
        const updatedUserInfo = await CustomerServices.getCurrentCustomer();
        
        if (updatedUserInfo) {
          // עדכון המידע ב-context וב-cookies
          dispatch({ type: "USER_LOGIN", payload: updatedUserInfo });
          Cookies.set("userInfo", JSON.stringify(updatedUserInfo));
        }
      } catch (error) {
        console.error("Error refreshing user info:", error);
        // אם יש שגיאה - לא נתק את המשתמש, רק נדפיס שגיאה
      }
    };

    refreshUserInfo();
  }, []); // רץ רק פעם אחת בטעינת העמוד

  // קבלת פרטי ההזמנה מ-URL parameters
  useEffect(() => {
    const getOrderInfo = async () => {
      try {
        // חילוץ orderId ו-token מה-URL
        const orderId = router.query.orderId;
        const token = router.query.token;

        if (orderId) {
          // קבלת פרטי ההזמנה מהשרת והעברת הטוקן לשרת (אם קיים)
          const orderData = await OrderServices.getOrderById(orderId, token || null);
          setOrder(orderData);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      }
    };

    // רק אם יש query parameters
    if (router.query.orderId) {
      getOrderInfo();
    }
  }, [router.query]);

  // Flashy Purchase Tracking
  useEffect(() => {
    if (order && !purchaseTracked && typeof window !== 'undefined') {
      // מניעת שליחה כפולה
      if (window.__flashyPurchaseSent) return;

      trackFlashyPurchase(order);
      setPurchaseTracked(true);
      window.__flashyPurchaseSent = true;
    }
  }, [order, purchaseTracked]);

  // GA4 Purchase Tracking
  useEffect(() => {
    if (
      order &&                      // יש הזמנה
      googleAnalytics.isDataLayerAvailable() &&     // dataLayer זמין
      !window.__gaPurchaseSent      // לא נשלח כבר
    ) {
      trackPurchase(order);
      // למנוע דאבל-פייר
      window.__gaPurchaseSent = true;
    }
  }, [order]);

  // Meta Pixel Purchase Tracking
  useEffect(() => {
    if (
      order &&
      typeof window !== "undefined" &&
      !window.__fbPurchaseSent
    ) {
      trackFbPurchase(order);
      window.__fbPurchaseSent = true; // למנוע כפילות
    }
  }, [order]);

  // ריקון העגלה
  useEffect(() => {
    scrollUp();
    Cookies.remove("couponInfo");
    sessionStorage.removeItem("products");
    sessionStorage.removeItem("customerNote");
    emptyCart();

    return () => {
      Cookies.remove("couponInfo");
      sessionStorage.removeItem("products");
      sessionStorage.removeItem("customerNote");
      emptyCart();
    }
  }, [])

  return (
    <>
      <Layout title={t('orderCompletedSuccessfully')} description={t('orderCompletedDescription')}>
        {isLoading ? (
          <Loading loading={isLoading} />
        ) : (
          <div className='w-full mx-auto flex flex-col justify-center items-center gap-2 py-32 px-10 lg:px-0'>
            <img className="md:w-1/5 w-2/3 mr-8" src={cartSuccess.src} alt="הרכישה הושלמה בהצלחה" />
            <h1 className="sm:text-4xl text-xl text-center font-bold">{t('thankYouForPurchase')}</h1>
            <h3 className="sm:text-xl text-lg text-center">{t('orsderInProcess')}</h3>
            <div className="flex items-center justify-center flex-wrap gap-5 mt-3 h-11">
              <Link href="/" target="_top">
                <MainBT className='w-fit! px-6'>
                  <div className="flex items-center gap-2">
                    <IoHome /> {t('backToHome')}
                  </div>
                </MainBT>
              </Link>
              <Link href="/user/my-orders" target="_top">
                <MainBT className='w-fit! px-6'>
                  <div className="flex items-center gap-2">
                    <PiListMagnifyingGlassBold size={20} /> {t('viewOrder')}
                  </div>
                </MainBT>
              </Link>
            </div>
          </div>
        )}
        <style>
          {`
          #enable-toolbar-trigger {
            display: none;
            }
            `}
        </style>
      </Layout>
    </>
  );
};

export async function getStaticProps(context) {
  return {
    props: await getI18nProps(context),
  };
}

export default Success;