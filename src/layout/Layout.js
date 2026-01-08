// src/layout/Layout.js
import { useContext, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

// Internal import
import Navbar from "@layout/navbar/Navbar";
import Footer from "@layout/footer/Footer";
import NavBarTop from "./navbar/NavBarTop";
import FooterTop from "@layout/footer/FooterTop";
import MobileFooter from "@layout/footer/MobileFooter";
import FeatureCard from "@component/feature-card/FeatureCard";
import MainModal from "@component/modal/MainModal";
import UserAddressInitialize from "@component/userAddressInitialize/UserAddressInitialize";
import RegisterSuccess from "@component/login/RegisterSuccess";
import PopupServices from "@services/PopupServices";
import useAsync from "@hooks/useAsync";
import DynamicPopup from "@component/modal/DynamicPopup";
import StickyCart from "@component/cart/StickyCart";
import useCart from "@hooks/useCart";
import { UserContext } from "@context/UserContext";
import BeforeStartPopup from "@component/modal/BeforeStartPopup";
import useGetSetting from "@hooks/useGetSetting";
import FloatingWhatsApp from "@component/common/FloatingWhatsApp";
import CustomerServices from "@services/CustomerServices";
import RewardOffersManager from "@component/reward-offers/RewardOffersManager";
import DefaultSeo from "@component/common/DefaultSeo";

const Layout = ({ title, description, children, cashierPage = false, seo }) => {

  const { storeCustomizationSetting } = useGetSetting() || {};
  const { seo: defaultSeo } = storeCustomizationSetting || {};

  const { state: { userInfo }, dispatch } = useContext(UserContext);
  console.log('userInfo layout :>> ', userInfo);

  let currentLang = Cookies.get('_lang');

  switch (currentLang) {
    case 'he':
      currentLang = true;
      break;
    case 'en':
      currentLang = false;
      break;
    default:
      currentLang = false;
      break;
  }

  const router = useRouter();
  const { pathname } = router;

  // Cart items to determine welcome gift presence
  const { items } = useCart();

  // משיכת פופאפים דינאמיים
  const [currentPopup, setCurrentPopup] = useState(null);
  const { data: popupData, loading, error } = useAsync(() => PopupServices.getAllPopups());

  // בדיקה האם להציג פופאפ בעמוד הנוכחי
  useEffect(() => {
    if (popupData && popupData.length > 0) {
      const matchedPopup = popupData.find(
        (popup) => popup.pageToShow === pathname && popup.isActive
      );

      // בדיקה אם הפופאפ כבר הוצג
      if (matchedPopup && !sessionStorage.getItem(`popupShown_${matchedPopup._id}`)) {
        setCurrentPopup(matchedPopup || null);
      }
    }
  }, [pathname, popupData]);

  // הצגת הפופאפ ושמירת המידע ב-sessionStorage
  useEffect(() => {
    if (currentPopup) {
      sessionStorage.setItem(`popupShown_${currentPopup._id}`, 'true');
    }
  }, [currentPopup]);

  const [addressPopup, setAddressPopup] = useState(false);
  useEffect(() => {
    if (localStorage.firstTime && JSON.parse(localStorage.firstTime)) {
      localStorage.removeItem("plsRegisterAgain");
      localStorage.removeItem("waitingForVerification");
      setTimeout(() => {
        setAddressPopup(true);
      }, 3000);
    }
  }, [localStorage.firstTime]);

  const [showRegisterSuccess, setShowRegisterSuccess] = useState(false);
  useEffect(() => {
    const handleStorageChange = () => {
      if (localStorage.showRegisterSuccess && JSON.parse(localStorage.showRegisterSuccess)) {
        setShowRegisterSuccess(true);
        localStorage.removeItem('showRegisterSuccess');
      }
    };

    handleStorageChange();
    window.addEventListener("customLocalStorageChange", handleStorageChange);

    return () => {
      window.removeEventListener("customLocalStorageChange", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function (key, value) {
      const event = new Event('customLocalStorageChange');
      originalSetItem.apply(this, arguments);
      window.dispatchEvent(event);
    };
  }, []);


  // פופאפ לפני שמתחילים בחירת עיר
  const [showBeforeStartPopup, setShowBeforeStartPopup] = useState(false);
  // נבדוק בתנאי שהמשתמש אינו מחובר וכו'
  useEffect(() => {
    // אם יש יוזר -> לא מציגים את הפופאפ
    if (userInfo) return;

    // אם כבר יש פופאפ דינאמי או addressPopup וכו' -> חכה עם זה
    if (currentPopup || addressPopup || showRegisterSuccess) return;

    // אם כבר ראינו את הפופאפ
    if (sessionStorage.getItem("beforeStartPopupShown")) return;

    // במידה והגענו לכאן, נפתח את הפופאפ
    setShowBeforeStartPopup(true);
    sessionStorage.setItem("beforeStartPopupShown", "true");
  }, [
    userInfo,
    currentPopup,
    addressPopup,
    showRegisterSuccess,
    // וכל State אחר שמבטיח שלא תקפוץ כפילות
  ]);

  // יצירת props דינאמיים לפי העמוד הנוכחי
  const getWhatsAppProps = () => {
    const { pathname, query } = router;
    const { meta_title } = seo || defaultSeo || {};

    // עמוד מוצר
    if (pathname.startsWith('/product/')) {
      const productName = title?.replace(` | ${meta_title || "MNM יבוא שיווק והפצה"}`, '') || '';
      return {
        productName
      };
    }

    // עמוד קטגוריה
    if (pathname.startsWith('/product-category/')) {
      const categoryName = query.categoryName || '';
      const subCategoryName = query.subCategoryName || '';

      return {
        categoryName,
        subCategoryName,
        productName: ''
      };
    }

    // עמוד הזמנה
    if (pathname.startsWith('/order/')) {
      const orderNumber = title?.replace(` | ${meta_title || "MNM יבוא שיווק והפצה"}`, '') || '';
      return {
        orderNumber
      };
    }

    // ברירת מחדל
    return {};
  };

  // בדיקת תקפות טוקן ורענון מידע המשתמש בריענון
  useEffect(() => {
    const validateAndRefreshUser = async () => {
      // רק אם יש משתמש מחובר
      if (!userInfo) return;

      try {
        // קריאה ל-/me לעדכון מידע המשתמש (כולל unpaidBalance ו-availableCredit)
        const updatedUserInfo = await CustomerServices.getCurrentCustomer();

        if (updatedUserInfo) {
          // עדכון המידע ב-context וב-cookies
          dispatch({ type: "USER_LOGIN", payload: updatedUserInfo });
          Cookies.set("userInfo", JSON.stringify(updatedUserInfo));
        } else {
          // אם אין תשובה תקינה - הטוקן כנראה לא תקין
          dispatch({ type: "USER_LOGOUT" });
          Cookies.remove("userInfo");
          Cookies.remove("couponInfo");
          // אם זה לא עמוד הבית - העבר לעמוד הבית
          if (router.pathname !== "/") {
            router.push("/");
          }
        }
      } catch (error) {
        console.error("Token validation/refresh error:", error);
        // אם יש שגיאה - נתק את המשתמש
        dispatch({ type: "USER_LOGOUT" });
        Cookies.remove("userInfo");
        Cookies.remove("couponInfo");
        // אם זה לא עמוד הבית - העבר לעמוד הבית
        if (router.pathname !== "/") {
          router.push("/");
        }
      }
    };

    validateAndRefreshUser();
  }, []); // רץ רק פעם אחת בריענון

  return (
    <>
      <ToastContainer rtl={currentLang} />

      {addressPopup && (
        <MainModal modalOpen={addressPopup} setModalOpen={setAddressPopup}>
          <div className="px-3 sm:px-11 py-8 pt-10 max-w-xl">
            <UserAddressInitialize />
          </div>
        </MainModal>
      )}

      {showRegisterSuccess && (
        <MainModal modalOpen={showRegisterSuccess} setModalOpen={setShowRegisterSuccess}>
          <div className="px-3 sm:px-11 py-8 max-w-md">
            <RegisterSuccess />
          </div>
        </MainModal>
      )}

      {/* פופאפ דינאמי */}
      {!loading && !error && currentPopup && !addressPopup && !showRegisterSuccess &&
        //  !showBeforeStartPopup && 
        (
          <MainModal modalOpen={true} setModalOpen={() => setCurrentPopup(null)}>
            <div className="px-3 sm:px-11 py-7 max-w-md">
              <DynamicPopup popup={currentPopup} />
            </div>
          </MainModal>
        )}

      {/* פופאפ "לפני שמתחילים" */}
      {/* {showBeforeStartPopup && (
        <MainModal
          modalOpen={showBeforeStartPopup}
          setModalOpen={setShowBeforeStartPopup}
        >
          <BeforeStartPopup onClose={() => setShowBeforeStartPopup(false)} />
        </MainModal>
      )} */}

      {/* SEO tags דינמיים לעמוד - מקבל SEO מ-props (מ-getServerSideProps) */}
      <DefaultSeo title={title} description={description} seo={seo || defaultSeo} />

      <div className="font-sans">
        {/* <NavBarTop /> */}
        <Navbar cashierPage={cashierPage} />
        <div className="bg-mainColor-superLight min-h-[calc(100vh-127px)]">
          <StickyCart />
          {children}
        </div>
        {!cashierPage && <MobileFooter />}
        {!cashierPage &&
          <div className="w-full max-w-full overflow-hidden">
            <FooterTop />
            <div className="hidden relative lg:block mx-auto max-w-screen-2xl py-6 px-3 sm:px-10">
              <FeatureCard />
            </div>
            <hr className="hr-line"></hr>
            <div className="border-t border-gray-100 w-full">
              <Footer />
            </div>
          </div>
        }

        {/* כפתור וואטסאפ צף עם props דינאמיים */}
        <FloatingWhatsApp {...getWhatsAppProps()} />

        {/* Reward Offers Manager - מנהל את כל פופאפי המוצרי מתנה */}
        <RewardOffersManager
          addressPopup={addressPopup}
          showRegisterSuccess={showRegisterSuccess}
          currentPopup={currentPopup}
        />
      </div>
    </>
  );
};

export default Layout;