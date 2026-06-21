// src/pages/checkout.jsx
import React, { useContext, useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import Image from "next/image";

// Internal import
import Layout from "@layout/Layout";
import useAsync from "@hooks/useAsync";
import useGetSetting from "@hooks/useGetSetting";
import useCheckoutSubmit from "@hooks/useCheckoutSubmit";
import useUtilsFunction from "@hooks/useUtilsFunction";
import SettingServices from "@services/SettingServices";
import { UserContext } from "@context/UserContext";
import Loading from "@component/preloader/Loading";
import DeliveryServices from "@services/DeliveryServices";
import MainModal from "@component/modal/MainModal";
import UserAddressUpdate from "@component/userAddressUpdate/UserAddressUpdate";
import MissingProductsModal from "@component/modal/MissingProductsModal";
import websiteClose from 'public/websiteClose2.svg'
import PriceUpdatedModal from "@component/modal/PriceUpdatedModal";
import { SidebarContext } from "@context/SidebarContext";
import AutoDeliveriesPopup from "@component/deliveriesPopup/AutoDeliveriesPopup";
import { notifyError } from "@utils/toast";
import { getI18nProps } from "@utils/i18n";

// Checkout Components
import CheckoutItems from "@component/checkout/CheckoutItems";
import OrderCosts from "@component/checkout/OrderCosts";
import PersonalDetails from "@component/checkout/PersonalDetails";
import DeliveryOptions from "@component/checkout/DeliveryOptions";
import CustomerNotes from "@component/checkout/CustomerNotes";
import CheckoutActions from "@component/checkout/CheckoutActions";

const Checkout = () => {
  const router = useRouter();
  const t = useTranslations();
  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();
  const { data: storeSetting } = useAsync(SettingServices.getStoreSetting);

  const { state: { userInfo } } = useContext(UserContext);
  const city = userInfo?.address?.city?.city_name_he;
  const [availableDays, setAvailableDays] = useState([]);
  const [nextTime, setNextTime] = useState(null);
  const [deliveryPrice, setDeliveryPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(true);
  const [isNoteOpen, setIsNoteOpen] = useState(true);
  const [missingProductsState, setMissingProductsState] = useState([]);
  const [keySequence, setKeySequence] = useState([]);
  const [deliveriesPopupOpen, setDeliveriesPopupOpen] = useState(false);
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [amountWarnOpen, setAmountWarnOpen] = useState(false);
  const [amountWarnSeen, setAmountWarnSeen] = useState(false);

  const {
    handleSubmit,
    submitHandler,
    submitCreditOrder,
    submitWithRefreshOffers,
    handleShippingCost,
    register,
    watch,
    setValue,
    errors,
    showCard,
    setShowCard,
    error,
    couponInfo,
    couponRef,
    handleCouponCode,
    discountAmount,
    shippingCost,
    total,
    isEmpty,
    items,
    customCartTotal,
    thresholdDiscount,
    currency,
    isCheckoutSubmit,
    isDeliveryMetod,
    noShipping,
    paymentSrc,
    shippingPercentageIncrease,

    missingProductsModal,
    setMissingProductsModal,
    missingProducts,
    priceConflictsModal,
    setPriceConflictsModal,
    priceConflicts,
    setError: setFormError,
    clearErrors,

    // סטייטים לוולידציה מהוק
    guestChosenCity,
    setGuestChosenCity,
    isDeliverable,
    setIsDeliverable,
    minimumOrderAmount,
    guestAddressFormRef,
  } = useCheckoutSubmit(false, newsletterOptIn);

  // מצב מגבלת סכום לפי הגדרת הלקוח (מ-/me): שבועי = התראה (פופאפ), חודשי = חסימה.
  // alertAmount הוא הסכום היחיד שבודקים מולו; periodTotal הוא הסכום שכבר נצבר בתקופה.
  const amountLimitInfo = (() => {
    const alertAmount = Number(userInfo?.alertAmount) || 0;
    const alertPeriod = userInfo?.alertPeriod;
    if (!userInfo || !alertAmount || (alertPeriod !== "weekly" && alertPeriod !== "monthly")) {
      return { blocked: false, warn: false, alertAmount: 0, periodTotal: 0, prospective: 0, period: null };
    }
    const periodTotal = Number(userInfo?.periodTotal) || 0;
    const prospective = periodTotal + Number(total || 0);
    const exceeded = prospective > alertAmount;
    return {
      blocked: exceeded && alertPeriod === "monthly",
      warn: exceeded && alertPeriod === "weekly",
      alertAmount,
      periodTotal,
      prospective,
      period: alertPeriod,
    };
  })();

  // פתיחת פופאפ אזהרה פעם אחת כשמתגלה חריגה שבועית
  useEffect(() => {
    if (amountLimitInfo.warn && !amountWarnSeen) {
      setAmountWarnOpen(true);
      setAmountWarnSeen(true);
    }
  }, [amountLimitInfo.warn, amountWarnSeen]);

  const selectedShippingOption = watch("shippingOption"); // עוקב אחרי הבחירה
  const selectedCallOnArrival = watch("callOnArrival"); // עוקב אחרי בחירת אופן המשלוח
  const customerNote = watch("customer_note"); // עוקב אחרי ההערות

  // מעקב אחרי כל שדות האורח
  const guestName = watch("guestName");
  const guestLastName = watch("guestLastName");
  const guestPhone = watch("guestPhone");
  const guestEmail = watch("guestEmail");
  const guestStreet = watch("guestStreet");
  const guestHouseNumber = watch("guestHouseNumber");
  const guestApartmentNumber = watch("guestApartmentNumber");
  const guestFloor = watch("guestFloor");
  const guestEntryCode = watch("guestEntryCode");
  const guestPostalCode = watch("guestPostalCode");
  const guestCityFromForm = watch("guestCity");
  const chosenCityFromForm = watch("chosenCity");

  // רענון המבצעים בכניסה לעמוד התשלום
  const { refreshOffers } = useContext(SidebarContext);
  useEffect(() => {
    refreshOffers();
  }, []);

  // טעינת כל השדות מ-localStorage בעת טעינת העמוד
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // טעינת העדפות משלוח (לכל המשתמשים)
    const savedDeliveryPrefs = localStorage.getItem('checkoutDeliveryPrefs');
    if (savedDeliveryPrefs) {
      try {
        const prefs = JSON.parse(savedDeliveryPrefs);
        if (prefs.callOnArrival !== undefined) {
          setValue("callOnArrival", prefs.callOnArrival);
        }
        if (prefs.shippingOption) {
          setValue("shippingOption", prefs.shippingOption);
        }
      } catch (error) {
        console.error("Error loading delivery preferences from localStorage:", error);
      }
    }

    // טעינת הערות (לכל המשתמשים)
    const savedNote = localStorage.getItem('checkoutCustomerNote');
    if (savedNote) {
      setValue("customer_note", savedNote);
    }

    // טעינת פרטי אורח (רק אם המשתמש לא מחובר)
    if (!userInfo) {
      const savedGuestData = localStorage.getItem('checkoutGuestData');
      if (savedGuestData) {
        try {
          const data = JSON.parse(savedGuestData);
          if (data.guestName) setValue("guestName", data.guestName);
          if (data.guestLastName) setValue("guestLastName", data.guestLastName);
          if (data.guestPhone) setValue("guestPhone", data.guestPhone);
          if (data.guestEmail) setValue("guestEmail", data.guestEmail);
          if (data.guestStreet) setValue("guestStreet", data.guestStreet);
          if (data.guestHouseNumber) setValue("guestHouseNumber", data.guestHouseNumber);
          if (data.guestApartmentNumber) setValue("guestApartmentNumber", data.guestApartmentNumber);
          if (data.guestFloor) setValue("guestFloor", data.guestFloor);
          if (data.guestEntryCode) setValue("guestEntryCode", data.guestEntryCode);
          if (data.guestPostalCode) setValue("guestPostalCode", data.guestPostalCode);
          if (data.guestCity) {
            try {
              const cityData = typeof data.guestCity === 'string' ? JSON.parse(data.guestCity) : data.guestCity;
              setGuestChosenCity(cityData);
              // עדכון הערך בטופס מיד כשטוענים את העיר
              setValue("guestCity", cityData);
              setValue("chosenCity", cityData);
            } catch (e) {
              console.error("Error parsing guestCity:", e);
            }
          }
        } catch (error) {
          console.error("Error loading guest data from localStorage:", error);
        }
      }
    }
  }, [setValue, userInfo, setGuestChosenCity]);

  // שמירת פרטי אורח ב-localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && !userInfo) {
      const guestData = {
        guestName,
        guestLastName,
        guestPhone,
        guestEmail,
        guestStreet,
        guestHouseNumber,
        guestApartmentNumber,
        guestFloor,
        guestEntryCode,
        guestPostalCode,
        guestCity: guestChosenCity ? JSON.stringify(guestChosenCity) : null,
      };

      // שמירה רק אם יש לפחות שדה אחד עם ערך
      const hasData = Object.values(guestData).some(value => value !== null && value !== undefined && value !== '');
      if (hasData) {
        localStorage.setItem('checkoutGuestData', JSON.stringify(guestData));
      }
    }
  }, [guestName, guestLastName, guestPhone, guestEmail, guestStreet, guestHouseNumber, guestApartmentNumber, guestFloor, guestEntryCode, guestPostalCode, guestChosenCity, userInfo]);

  // שמירת העדפות משלוח ב-localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const deliveryPrefs = {
        callOnArrival: selectedCallOnArrival,
        shippingOption: selectedShippingOption,
      };
      localStorage.setItem('checkoutDeliveryPrefs', JSON.stringify(deliveryPrefs));
    }
  }, [selectedCallOnArrival, selectedShippingOption]);

  // שמירת הערות ב-localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (customerNote) {
        localStorage.setItem('checkoutCustomerNote', customerNote);
      } else {
        localStorage.removeItem('checkoutCustomerNote');
      }
    }
  }, [customerNote]);

  // בעת שחזור הזמנה הודעה על מוצרים לא זמינים
  useEffect(() => {
    const missingProducts = localStorage.getItem("missingProducts");
    if (missingProducts) {
      try {
        const missingProductsArray = JSON.parse(missingProducts);

        if (missingProductsArray.length > 0) {
          setMissingProductsModal(true);
          setMissingProductsState(missingProductsArray);
        }

        // מחיקת הנתונים מה-localStorage לאחר הצגת ההודעה
        localStorage.removeItem("missingProducts");
      } catch (error) {
        console.error("Failed to parse missing products:", error);
      }
    };

    const offersError = localStorage.getItem("offerConflicts");
    if (offersError) {
      setTimeout(() => {
        // מחיקת הנתונים מה-localStorage לאחר הצגת ההודעה
        localStorage.removeItem("offerConflicts");
        notifyError(t('pleaseNote'))
      }, 300);
    };
  }, [isCheckoutSubmit]);

  // משיכת ההגדרות של המשלוחים וההזמנות ובדיקה אם זה מאופשר או לא
  useEffect(() => {
    if (storeSetting.delivery_status !== undefined) {
      setIsDeliveryOpen(storeSetting.delivery_status);
    }
    if (storeSetting.optionToOrder_status !== undefined) {
      setIsCheckoutOpen(storeSetting.optionToOrder_status);
    }
  }, [storeSetting]);

  // בדיקה אם צריך להציג טופס אורח או פרטי משתמש מחובר
  useEffect(() => {
    if (userInfo) {
      // משתמש מחובר - בדיקה אם יש כתובת
      if (!userInfo?.address?.city) {
        localStorage.setItem("firstTime", true);
        router.push("/");
      } else {
        setLoading(false);
      }
    } else {
      // אורח - אפשר להמשיך לעמוד התשלום
      setLoading(false);
    }
  }, [userInfo]);

  // פונקציה לבדיקת כתובת. orderTotalAfterDiscounts: אופציונלי – סכום אחרי הנחות; כשנשלח, השרת מחזיר shippingCost לפי כללי האזור.
  const isAddressDeliverable = async (address, orderTotalAfterDiscounts) => {
    const response = await DeliveryServices.getByCityName(address, orderTotalAfterDiscounts);
    return response ? response : null;
  };

  // פונקציית בדיקה האם יש משלוח היום או מחר ואם לא מתי המשלוח הבא
  const canOrderToday = (daysArray) => {
    const now = new Date();
    const currentHour = now.getHours();
    const todayIndex = now.getDay() + 1; // תרגום ל-1 עד 7 במקום 0 עד 6
    const nextDayIndex = (todayIndex % 7) + 1; // היום הבא עם תרגום ל-1 עד 7

    let isTodayDeliverable;
    if (currentHour < 13) {
      // אם השעה היא לפני 13:00
      isTodayDeliverable = daysArray.some(day => parseInt(day.value) === todayIndex);
    } else {
      // אם השעה היא אחרי 13:00
      isTodayDeliverable = daysArray.some(day => parseInt(day.value) === nextDayIndex);
    }

    let nextDeliverableDate = null;
    if (!isTodayDeliverable) {
      // חיפוש היום הבא שבו ניתן לבצע משלוח
      for (let i = 1; i < 8; i++) {
        const futureDayIndex = ((todayIndex + i - 1) % 7) + 1; // תרגום ל-1 עד 7
        if (daysArray.some(day => Number(day.value) === futureDayIndex)) {
          nextDeliverableDate = new Date();
          nextDeliverableDate.setDate(now.getDate() + i - 1);
          nextDeliverableDate.setHours(13, 0, 0, 0); // הגדרת השעה ל-13:00
          break;
        }
      }
    }

    return { isTodayDeliverable, nextDeliverableDate };
  };

  // פונקציה לחילוץ שם עיר מאובייקט או מחרוזת JSON
  const getCityName = (val) => {
    if (!val) return null;
    if (typeof val === 'object' && val?.city_name_he) return val.city_name_he;
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        return parsed?.city_name_he || null;
      } catch (_) { return null; }
    }
    return null;
  };

  // בדיקת משלוח לפי כתובת - משתמש מחובר או אורח. מתעדכן גם כשסכום העגלה/הנחות משתנה (דמי משלוח לפי כללי אזור).
  const orderTotalAfterDiscounts = Number(customCartTotal || 0) - Number(discountAmount || 0) - Number(thresholdDiscount || 0);
  useEffect(() => {
    // לקוח "ללא משלוח": איסוף עצמי – לא מבצעים בדיקת/חישוב משלוח כלל
    if (noShipping) return;
    const fetchData = async () => {
      try {
        const addressToCheck =
          userInfo?.address?.city?.city_name_he ||
          guestChosenCity?.city_name_he ||
          getCityName(guestCityFromForm) ||
          getCityName(chosenCityFromForm);
        if (!addressToCheck) {
          if (process.env.NODE_ENV === 'development') {
            console.log('[Checkout] משלוח: לא נשלחה בקשה – אין עיר (בחר עיר או וודא כתובת עם עיר)');
          }
          return;
        }
        if (process.env.NODE_ENV === 'development') {
          console.log('[Checkout] משלוח: שולח בקשה לעיר', addressToCheck, 'orderTotal=', orderTotalAfterDiscounts);
        }
        const check = await isAddressDeliverable(addressToCheck, orderTotalAfterDiscounts);
        const { isTodayDeliverable, nextDeliverableDate } = canOrderToday(check.days || []);

        // השרת מחזיר תמיד shippingCost (מחושב לפי כללי אזור); נשתמש בו או ב-price כ-fallback
        const cost = Number(check.shippingCost ?? check.price ?? 0);
        if (check?.days?.length > 0) {
          setIsDeliverable(true);
          setAvailableDays(check.days.map(d => d.value));
          setValue("shippingOption", "2");
          handleShippingCost(cost);
        } else {
          setIsDeliverable(false);
          setAvailableDays([]);
          setNextTime(nextDeliverableDate);
        }
        setDeliveryPrice(cost);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setIsDeliverable(false);
        } else {
          console.error(error);
        }
      }
    };

    fetchData();
  }, [city, guestChosenCity, guestCityFromForm, chosenCityFromForm, orderTotalAfterDiscounts, customCartTotal, noShipping]);

  const navToPaymentPage = () => {
    router.push(paymentSrc)
  }

  // קריאה ישירה מחישוב המשלוח מסיכום העלויות – מבטיחה שבקשה עם orderTotal תישלח כשהמשתמש רואה את הסיכום.
  const onFetchShippingFromSummary = useCallback(async (cityName, orderTotal) => {
    if (!cityName) return;
    try {
      const res = await DeliveryServices.getByCityName(cityName, orderTotal);
      const cost = Number(res?.shippingCost ?? res?.price ?? 0);
      handleShippingCost(cost);
    } catch (e) {
      if (process.env.NODE_ENV === 'development') console.warn('[Checkout] onFetchShippingFromSummary', e);
    }
  }, [handleShippingCost]);

  // סתם משהו נחמד
  useEffect(() => {
    // רק אם החנות סגורה
    if (isCheckoutOpen === false) {
      const handleKeyPress = (e) => {
        // המרת אותיות לאותיות קטנות (case insensitive)
        let key = e.code.toLowerCase();

        const newSequence = [...keySequence, key];
        setKeySequence(newSequence);

        // שמירה על 12 תווים אחרונים
        if (newSequence.length > 12) {
          setKeySequence(newSequence.slice(-12));
        }

        // בדיקת התאמה לרצף "1 8 0 0 4 0 0 4 0 0 a i g"
        const secretCode = [
          "digit1", "numpad1",
          "digit8", "numpad8",
          "digit0", "numpad0",
          "digit0", "numpad0",
          "digit4", "numpad4",
          "digit0", "numpad0",
          "digit0", "numpad0",
          "digit4", "numpad4",
          "digit0", "numpad0",
          "digit0", "numpad0",
          "keya", "keyi", "keyg"
        ];
        const lastChars = newSequence.slice(-13); // Changed to match longest possible sequence

        if (lastChars.length === 13) {
          let matches = true;
          let j = 0;
          for (let i = 0; i < lastChars.length; i++) {
            // Check if current char matches either regular digit or numpad
            if (j < secretCode.length - 3) { // For number keys
              if (lastChars[i] !== secretCode[j] && lastChars[i] !== secretCode[j + 1]) {
                matches = false;
                break;
              }
              j += 2;
            } else { // For letter keys
              if (lastChars[i] !== secretCode[j]) {
                matches = false;
                break;
              }
              j++;
            }
          }

          if (matches) {
            setIsCheckoutOpen(true);
            setKeySequence([]); // איפוס הרצף לאחר הצלחה
          }
        }
      };

      window.addEventListener("keydown", handleKeyPress);
      return () => window.removeEventListener("keydown", handleKeyPress);
    }

    // אם החנות פתוחה, אין צורך להאזין למקשים
    return () => { };
  }, [keySequence, isCheckoutOpen]);


  if (loading) {
    return <Loading loading={loading} />;
  }

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
  };

  return (
    <>
      {/* modals */}
      {missingProductsModal && (
        <MainModal modalOpen={missingProductsModal} setModalOpen={setMissingProductsModal}>
          <div className="px-11 py-8">
            <MissingProductsModal missingProducts={missingProductsState.length > 0 ? missingProductsState : missingProducts} />
          </div>
        </MainModal>
      )}
      {priceConflictsModal && (
        <MainModal modalOpen={priceConflictsModal} setModalOpen={setPriceConflictsModal}>
          <div className="px-11 py-8">
            <PriceUpdatedModal priceUpdatedItems={priceConflicts} closeModal={() => setPriceConflictsModal(false)} />
          </div>
        </MainModal>
      )}
      {/* {deliveryMsg && (
        <MainModal modalOpen={deliveryMsg} setModalOpen={setDeliveryMsg}>
          <div className="px-11 py-8">
            <DeliveryMsgModal closeModal={() => setDeliveryMsg(false)} cityName={city?.trim()}
              shippingDays={availableDays}
            // shippingDays={["1", "2", "3", "4", "5", "6", "7"]}
            />
          </div>
        </MainModal>
      )}
      {pickupMsg && (
        <MainModal modalOpen={pickupMsg} setModalOpen={setPickupMsg}>
          <div className="px-11 py-8">
            <PickupMsgModal closeModal={() => setPickupMsg(false)} />
          </div>
        </MainModal>
      )} */}
      {modalOpen && (
        <MainModal modalOpen={modalOpen} setModalOpen={setModalOpen}>
          <div className="px-3 sm:px-11 py-8 pt-10 max-w-xl">
            <UserAddressUpdate />
          </div>
        </MainModal>
      )}
      {deliveriesPopupOpen && (
        <MainModal modalOpen={deliveriesPopupOpen} setModalOpen={setDeliveriesPopupOpen}>
          <div className="px-3 sm:px-6 md:px-8 lg:px-11 py-4 sm:py-6 md:py-8 pt-10">
            <AutoDeliveriesPopup closeCategoryDrawer={() => setDeliveriesPopupOpen(false)} />
          </div>
        </MainModal>
      )}
      {/* פופאפ אזהרת חריגה מסכום ההתראה השבועי — ההזמנה עדיין מותרת */}
      {amountWarnOpen && (
        <MainModal modalOpen={amountWarnOpen} setModalOpen={setAmountWarnOpen}>
          <div className="px-6 sm:px-10 py-8 max-w-md text-center" dir={currentLang ? "rtl" : "ltr"}>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-3xl">⚠️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {currentLang ? "חריגה מהסכום השבועי" : "Weekly amount exceeded"}
            </h3>
            <p className="text-gray-600 mb-1">
              {currentLang
                ? `הזמנה זו תעבור את סכום ההתראה השבועי שהוגדר (${amountLimitInfo.alertAmount.toLocaleString("he-IL")} ₪).`
                : `This order will exceed the configured weekly alert amount (${amountLimitInfo.alertAmount.toLocaleString("en-US")} ₪).`}
            </p>
            <p className="text-gray-500 text-sm mb-6">
              {currentLang
                ? `סכום ההזמנות השבועי עד כה: ${Math.round(amountLimitInfo.periodTotal).toLocaleString("he-IL")} ₪. ניתן להמשיך בהזמנה.`
                : `Weekly orders total so far: ${Math.round(amountLimitInfo.periodTotal).toLocaleString("en-US")} ₪. You may continue.`}
            </p>
            <button
              type="button"
              onClick={() => setAmountWarnOpen(false)}
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-mainColor hover:bg-mainColor-dark text-white font-semibold transition-colors"
            >
              {currentLang ? "הבנתי, להמשיך" : "Got it, continue"}
            </button>
          </div>
        </MainModal>
      )}
      <Layout title={t('checkout')} description={t('checkoutDescription')}>
        <div className="mx-auto max-w-screen-2xl px-3 sm:px-10">
          <div className="py-0 md:py-10 lg:py-12 px-0 2xl:max-w-screen-2xl w-full xl:max-w-screen-xl flex flex-col items-center gap-8">
            <div className="w-full flex h-full flex-col order-2 sm:order-1 lg:order-1">
              {isCheckoutOpen ? (
                paymentSrc ?

                  // redirect option
                  navToPaymentPage()

                  // iframe option
                  // <div className="flex flex-col gap-3 items-center justify-center">
                  //   {scrollUp()}
                  //   <iframe
                  //     src={paymentSrc}
                  //     id='cardcomiframe'
                  //     className="max-w-[800px] w-3/4 h-[550px] flex items-center justify-center"
                  //   />
                  // </div>
                  : <div className="mt-5 md:mt-0 md:col-span-2">
                    <form onSubmit={handleSubmit(submitHandler)}>
                      <div className="w-full flex flex-col gap-4 pb-6">
                        {/* סדר שונה למשתמש מחובר ולאורח */}
                        {userInfo ? (
                          // משתמש מחובר - סדר רגיל
                          <>
                            {/* 1. פרטים אישיים */}
                            <PersonalDetails
                              userInfo={userInfo}
                              city={city}
                              setModalOpen={setModalOpen}
                              isDeliverable={isDeliverable}
                              nextTime={nextTime}
                              availableDays={availableDays}
                              setDeliveriesPopupOpen={setDeliveriesPopupOpen}
                              guestAddressFormRef={guestAddressFormRef}
                              register={register}
                              setValue={setValue}
                              errors={errors}
                              setFormError={setFormError}
                              clearErrors={clearErrors}
                              watch={watch}
                              guestChosenCity={guestChosenCity}
                              setGuestChosenCity={setGuestChosenCity}
                              noShipping={noShipping}
                            />

                            {/* 2. בחירת אופן המשלוח */}
                            <DeliveryOptions
                              register={register}
                              selectedCallOnArrival={selectedCallOnArrival}
                              isDeliverable={isDeliverable}
                              noShipping={noShipping}
                            />

                            {/* 3. מוצרים בהזמנה */}
                            <CheckoutItems
                              storeCustomizationSetting={storeCustomizationSetting}
                              showingTranslateValue={showingTranslateValue}
                              items={items}
                              isEmpty={isEmpty}
                              currency={currency}
                            />

                            {/* 4. הערות לקוח */}
                            <CustomerNotes
                              register={register}
                              watch={watch}
                              isNoteOpen={isNoteOpen}
                              setIsNoteOpen={setIsNoteOpen}
                            />

                            {/* 5. סיכום עלויות */}
                            <OrderCosts
                              storeCustomizationSetting={storeCustomizationSetting}
                              showingTranslateValue={showingTranslateValue}
                              currency={currency}
                              customCartTotal={customCartTotal}
                              minimumOrderAmount={minimumOrderAmount}
                              shippingCost={shippingCost}
                              discountAmount={discountAmount}
                              total={total}
                              couponInfo={couponInfo}
                              couponRef={couponRef}
                              handleCouponCode={handleCouponCode}
                              isDeliverable={isDeliverable}
                              city={city}
                              guestChosenCity={guestChosenCity}
                              newsletterOptIn={newsletterOptIn}
                              setNewsletterOptIn={setNewsletterOptIn}
                              onFetchShipping={onFetchShippingFromSummary}
                              noShipping={noShipping}
                            />

                            {/* באנר חסימה — חריגה מהסכום החודשי המותר */}
                            {amountLimitInfo.blocked && (
                              <div
                                className="border border-red-300 bg-red-50 rounded-xl px-4 sm:px-6 py-4 flex items-start gap-3"
                                dir={currentLang ? "rtl" : "ltr"}
                              >
                                <span className="text-2xl leading-none">🚫</span>
                                <div>
                                  <p className="font-bold text-red-700">
                                    {currentLang ? "ההזמנה חורגת מהסכום החודשי המותר" : "Order exceeds the allowed monthly amount"}
                                  </p>
                                  <p className="text-sm text-red-600 mt-0.5">
                                    {currentLang
                                      ? `הסכום המותר: ${amountLimitInfo.alertAmount.toLocaleString("he-IL")} ₪ · נצבר החודש עד כה: ${Math.round(amountLimitInfo.periodTotal).toLocaleString("he-IL")} ₪. לא ניתן להשלים את ההזמנה.`
                                      : `Allowed: ${amountLimitInfo.alertAmount.toLocaleString("en-US")} ₪ · accrued this month: ${Math.round(amountLimitInfo.periodTotal).toLocaleString("en-US")} ₪. The order cannot be completed.`}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* 6. כפתורי אישור וחזרה */}
                            <CheckoutActions
                              isEmpty={isEmpty}
                              isCheckoutSubmit={isCheckoutSubmit}
                              customCartTotal={customCartTotal}
                              storeCustomizationSetting={storeCustomizationSetting}
                              showingTranslateValue={showingTranslateValue}
                              minimumOrderAmount={minimumOrderAmount}
                              userInfo={userInfo}
                              submitCreditOrder={submitCreditOrder}
                              handleSubmit={handleSubmit}
                              total={total}
                              amountBlocked={amountLimitInfo.blocked}
                            />
                          </>
                        ) : (
                          // אורח - סדר מיוחד
                          <>
                            {/* 1. מוצרים בהזמנה */}
                            <CheckoutItems
                              storeCustomizationSetting={storeCustomizationSetting}
                              showingTranslateValue={showingTranslateValue}
                              items={items}
                              isEmpty={isEmpty}
                              currency={currency}
                            />

                            {/* 2. פרטים אישיים */}
                            <PersonalDetails
                              userInfo={userInfo}
                              city={city}
                              setModalOpen={setModalOpen}
                              isDeliverable={isDeliverable}
                              nextTime={nextTime}
                              availableDays={availableDays}
                              setDeliveriesPopupOpen={setDeliveriesPopupOpen}
                              guestAddressFormRef={guestAddressFormRef}
                              register={register}
                              setValue={setValue}
                              errors={errors}
                              setFormError={setFormError}
                              clearErrors={clearErrors}
                              watch={watch}
                              guestChosenCity={guestChosenCity}
                              setGuestChosenCity={setGuestChosenCity}
                              noShipping={noShipping}
                            />

                            {/* 3. בחירת אופן המשלוח */}
                            <DeliveryOptions
                              register={register}
                              selectedCallOnArrival={selectedCallOnArrival}
                              isDeliverable={isDeliverable}
                              noShipping={noShipping}
                            />

                            {/* 4. הערות לקוח */}
                            <CustomerNotes
                              register={register}
                              watch={watch}
                              isNoteOpen={isNoteOpen}
                              setIsNoteOpen={setIsNoteOpen}
                            />

                            {/* 5. סיכום עלויות */}
                            <OrderCosts
                              storeCustomizationSetting={storeCustomizationSetting}
                              showingTranslateValue={showingTranslateValue}
                              currency={currency}
                              customCartTotal={customCartTotal}
                              minimumOrderAmount={minimumOrderAmount}
                              shippingCost={shippingCost}
                              discountAmount={discountAmount}
                              total={total}
                              couponInfo={couponInfo}
                              couponRef={couponRef}
                              handleCouponCode={handleCouponCode}
                              isDeliverable={isDeliverable}
                              city={city}
                              guestChosenCity={guestChosenCity}
                              newsletterOptIn={newsletterOptIn}
                              setNewsletterOptIn={setNewsletterOptIn}
                              onFetchShipping={onFetchShippingFromSummary}
                              noShipping={noShipping}
                            />

                            {/* 6. כפתורי אישור וחזרה */}
                            <CheckoutActions
                              isEmpty={isEmpty}
                              isCheckoutSubmit={isCheckoutSubmit}
                              customCartTotal={customCartTotal}
                              storeCustomizationSetting={storeCustomizationSetting}
                              showingTranslateValue={showingTranslateValue}
                              minimumOrderAmount={minimumOrderAmount}
                              userInfo={userInfo}
                              submitCreditOrder={submitCreditOrder}
                              handleSubmit={handleSubmit}
                            />
                          </>
                        )}
                      </div>
                    </form>
                  </div>
              ) : (
                <div className="mx-auto my-11 flex flex-col items-center justify-center gap-2 p-5">
                  <Image
                    src={websiteClose.src}
                    width={440}
                    height={440}
                    alt="websiteClose"
                  />
                  <h2 className="text-4xl font-bold mt-5 text-center">{t('storeClose')}</h2>
                  <p className="text-gray-400 text-center">{t('storeCloseMessage')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export const getServerSideProps = async (context) => {
  const i18nProps = await getI18nProps(context);

  return {
    props: {
      ...i18nProps,
    },
  };
};

export default dynamic(() => Promise.resolve(Checkout), { ssr: false });