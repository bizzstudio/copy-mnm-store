// src/component/cart/Cart.js
import { useRouter } from "next/router";
import React, { useContext, useEffect, useRef, useState } from "react";
import { IoBagCheckOutline, IoClose, IoBagHandle, IoArrowBack } from "react-icons/io5";
import useTranslation from "next-translate/useTranslation";

// Internal import
import CartItem from "@component/cart/CartItem";
import LoginModal from "@component/modal/LoginModal";
import { UserContext } from "@context/UserContext";
import { SidebarContext } from "@context/SidebarContext";
import useUtilsFunction from "@hooks/useUtilsFunction";
import useCart from "@hooks/useCart";
import { trackViewCart } from "@services/googleAnalytics";
import { trackFbInitiateCheckout } from "@services/facebookPixel";
import Calculating from "./Calculating";
import ThresholdDiscountSlider from "./ThresholdDiscountSlider";

const Cart = () => {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const { isEmpty, items, customCartTotal } = useCart();
  const { toggleCartDrawer, closeCartDrawer } = useContext(SidebarContext);
  const { currency } = useUtilsFunction();
  const { t } = useTranslation();
  const buttonRef = useRef(null);

  const {
    state: { userInfo },
  } = useContext(UserContext);

  // Google Analytics - view_cart כשהעגלה נפתחת
  const { cartDrawerOpen } = useContext(SidebarContext);
  useEffect(() => {
    // רק כשהעגלה נפתחת (cartDrawerOpen משתנה ל-true) ויש פריטים
    if (cartDrawerOpen && !isEmpty && items.length > 0) {
      trackViewCart(items, customCartTotal);
    }
  }, [cartDrawerOpen]); // רק כשהעגלה נפתחת

  const handleOpenLogin = () => {
    router.push(
      { pathname: router.pathname, query: { redirect: '/checkout' } },
      router.asPath,
      { shallow: true }
    );
    toggleCartDrawer();
    setModalOpen(!modalOpen);
  };


  const handleCheckoutClick = (e) => {
    e.stopPropagation(); // Prevent event propagation

    // Meta Pixel - InitiateCheckout לפני הניווט
    if (!isEmpty && items.length > 0 && typeof customCartTotal === "number") {
      trackFbInitiateCheckout(items, customCartTotal);
    }

    closeCartDrawer(); // Call the closeCartDrawer function
    // אפשרות לרכוש כאורח - מעבר ישיר לעמוד התשלום
    if (userInfo && !userInfo?.address?.city) {
      localStorage.setItem("firstTime", true);
    } else {
      router.push("/checkout"); // Redirect to checkout page
    }
  };

  const checkoutClass = (
    <div className="w-full bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:ring-2 hover:ring-mainColor-leaf hover:ring-offset-2">
      {/* Summary Section */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white/50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            {t("common:totalToPay")}
          </span>
          <div className="flex items-baseline gap-1">
            {typeof customCartTotal === 'number' ? (
              <>
                <span className="text-xs text-gray-500 font-normal">{currency}</span>
                <span className="text-2xl font-bold font-serif text-gray-900">
                  {customCartTotal.toFixed(2)}
                </span>
              </>
            ) : (
              <Calculating />
            )}
          </div>
        </div>
      </div>

      {/* Button Section */}
      <button
        ref={buttonRef}
        onClick={handleCheckoutClick}
        className="w-full bg-mainColor hover:bg-mainColor-dark text-white font-semibold font-serif text-base py-4 px-6 flex items-center justify-center gap-2 transition-all duration-200 ease-out active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-mainColor-leaf focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        <span>{t("common:proceedToCheckoutBtn")}</span>
        <IoArrowBack className="text-xl transition-transform duration-200 group-hover:-translate-x-1" />
      </button>
    </div>
  );

  return (
    <>
      {modalOpen && (
        <LoginModal modalOpen={modalOpen} setModalOpen={setModalOpen} />
      )}
      <div className="flex flex-col w-full h-full justify-between items-middle bg-white rounded">
        <div className="w-full flex justify-between items-center relative px-6 py-5 bg-gradient-to-br from-white to-gray-50 border-b border-mainColor-light shadow-sm rounded-t-lg">
          <h2 className="font-semibold font-serif text-lg m-0 text-heading flex items-center gap-2">
            <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-mainColor/10 text-mainColor-dark">
              <IoBagCheckOutline className="text-xl" />
            </span>
            <span className="text-gray-900">{t("common:shoppingCartDrawerTitle")}</span>
          </h2>
          <button
            onClick={closeCartDrawer}
            className="flex items-center justify-center gap-1.5 text-gray-500 px-3 py-2 rounded-lg focus:outline-none transition-all duration-200 hover:bg-red-50 hover:text-red-500 focus:ring-2 focus:ring-red-200 focus:ring-offset-1 group"
          >
            <IoClose className="text-lg" />
            <span className="font-medium text-sm group-hover:text-red-500">
              {t("common:closeBtn")}
            </span>
          </button>
        </div>
        <div className="overflow-y-auto flex-grow scrollbar-hide w-full max-h-full">
          {isEmpty && (
            <div className="flex flex-col h-full justify-center">
              <div className="flex flex-col items-center">
                <div className="flex justify-center items-center w-20 h-20 rounded-full bg-mainColor-light">
                  <span className="text-mainColor-dark text-4xl block">
                    <IoBagHandle />
                  </span>
                </div>
                <h3 className="font-serif font-semibold text-gray-700 text-lg pt-5">
                  {t("common:cartEmptyTitle")}
                </h3>
                <p className="px-12 text-center text-sm text-gray-500 pt-2">
                  {t("common:cartEmptyText")}
                </p>
              </div>
            </div>
          )}

          {items.map((item, i) => (
            <CartItem key={i + 1} item={item} currency={currency} />
          ))}
        </div>
        <div className="mx-5 my-3">
          {/* סליידר הנחת קניה מעל סכום */}
          <ThresholdDiscountSlider />

          {items.length <= 0 ? (
            checkoutClass
          ) : (
            <span>
              {!userInfo ? (
                <div onClick={handleOpenLogin}>{checkoutClass}</div>
              ) : (
                // <Link href="/checkout">{
                checkoutClass
                // }</Link>
              )}
            </span>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;
