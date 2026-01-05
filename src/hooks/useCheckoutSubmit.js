// src/hooks/useCheckoutSubmit.js
import Cookies from "js-cookie";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

// Internal import
import useAsync from "@hooks/useAsync";
import { UserContext } from "@context/UserContext";
import OrderServices from "@services/OrderServices";
import CouponServices from "@services/CouponServices";
import { notifyError, notifySuccess } from "@utils/toast";
import SettingServices from "@services/SettingServices";
import NotificationServices from "@services/NotificaitonServices";
import { useTranslations } from "next-intl";
import useCart from "./useCart";
import useAddToCart from "./useAddToCart";
import { SidebarContext } from "@context/SidebarContext";
import notifyApiResponse from "@utils/notifyApiResponse";
import { identifyUser, trackNewsletterSignup } from "@services/flashy";

const useCheckoutSubmit = (isCashierMode = false, newsletterOptIn = false) => {
  const {
    state: { userInfo, shippingAddress },
    dispatch,
  } = useContext(UserContext);
  const { refreshOffers } = useContext(SidebarContext);
  const t = useTranslations();

  const [error, setError] = useState("");
  const [total, setTotal] = useState("");
  const [couponInfo, setCouponInfo] = useState({});
  const [minimumAmount, setMinimumAmount] = useState(0);
  const [showCard, setShowCard] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [isDeliveryMetod, setIsDeliveryMetod] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState({});
  const [isCheckoutSubmit, setIsCheckoutSubmit] = useState(false);
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [paymentSrc, setPaymentSrc] = useState(null);
  const [shippingPercentageIncrease, setShippingPercentageIncrease] = useState(0);
  const [readyToSubmit, setReadyToSubmit] = useState(null);

  // סטייטים לקונפליקטים
  const [missingProductsModal, setMissingProductsModal] = useState(false);
  const [missingProducts, setMissingProducts] = useState([]);
  const [priceConflictsModal, setPriceConflictsModal] = useState(false);
  const [priceConflicts, setPriceConflicts] = useState([]);
  const [offerConflictsModal, setOfferConflictsModal] = useState(false);
  const [offerConflicts, setOfferConflicts] = useState([]);
  const [addUpdatedProducts, setAddUpdatedProducts] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // סטייטים לוולידציה - מנוהלים בהוק
  const [guestChosenCity, setGuestChosenCity] = useState(null);
  const [isDeliverable, setIsDeliverable] = useState(null);
  const [minimumOrderAmount] = useState(0);
  const guestAddressFormRef = useRef(null);

  const router = useRouter();
  const couponRef = useRef("");
  const {
    isEmpty,
    emptyCart,
    items,
    customCartTotal,
    removeItem,
    addItem,
    inCart,
    thresholdDiscount,
  } = useCart();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    setError: setFormError,
    clearErrors,
  } = useForm({
    defaultValues: {
      callOnArrival: true, // ברירת מחדל שהשליח ייצור קשר
    },
  });

  const { data: globalSetting } = useAsync(SettingServices.getGlobalSetting);
  const currency = globalSetting?.default_currency || "₪";

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

  useEffect(() => {
    if (Cookies.get("couponInfo")) {
      const coupon = JSON.parse(Cookies.get("couponInfo"));
      // console.log('coupon information',coupon)
      setCouponInfo(coupon);
      setDiscountPercentage(coupon.discountType);
      setMinimumAmount(coupon.minimumAmount);
    }
  }, [isCouponApplied]);

  //remove coupon if total value less then minimum amount of coupon
  useEffect(() => {
    if (minimumAmount - discountAmount > total || isEmpty) {
      setDiscountPercentage(0);
      setDiscountAmount(0);
      setCouponInfo({});
      Cookies.remove("couponInfo");
    }
  }, [minimumAmount, total]);

  // remove coupon if discount amount is greater than total value
  useEffect(() => {
    if (discountAmount >= customCartTotal && discountPercentage?.type === "fixed") {
      setDiscountPercentage(0); // מאפסים את ההנחה
      setDiscountAmount(0); // מאפסים את סכום ההנחה
      setCouponInfo({});
      Cookies.remove("couponInfo"); // מסירים את המידע על הקופון מ-Cookies
      dispatch({ type: "SAVE_COUPON", payload: {} }); // מסירים את המידע על הקופון מ-Context

      // רק אם לא במצב קופה - מציגים הודעה
      if (!isCashierMode) {
        notifyError(t('couponRemovedDueToHighDiscount'));
      }
    }
  }, [customCartTotal, discountAmount, isCashierMode]);

  // calculate total and discount value
  useEffect(() => {
    let totalValue = "";
    let subTotal = parseFloat(customCartTotal + Number(shippingCost)).toFixed(2);
    const discountAmount = discountPercentage?.type === "fixed" ?
      discountPercentage?.value : customCartTotal * (discountPercentage?.value / 100);

    const discountAmountTotal = discountAmount ? discountAmount : 0;

    // הפחתת הנחת קניה מעל סכום (THRESHOLD_DISCOUNT) וקופון
    totalValue = Number(subTotal) - discountAmountTotal - (thresholdDiscount || 0);

    setDiscountAmount(discountAmountTotal);

    setTotal(totalValue);
  }, [customCartTotal, shippingCost, discountPercentage, isCashierMode, thresholdDiscount]);

  // מילוי נתוני משלוח רק אם המשתמש מחובר
  useEffect(() => {
    // רק במצב רגיל (לא קופה) - מילוי נתוני משלוח
    if (!isCashierMode && userInfo) {
      setValue("firstName", shippingAddress.firstName);
      setValue("lastName", shippingAddress.lastName);
      setValue("address", shippingAddress.address);
      setValue("contact", shippingAddress.contact);
      setValue("email", shippingAddress.email);
      setValue("city", shippingAddress.city);
      setValue("country", shippingAddress.country);
      setValue("zipCode", shippingAddress.zipCode);
    }
  }, [isCashierMode, userInfo]);

  // פונקציה חדשה: ריענון מבצעים + שליחה לשרת
  const submitWithRefreshOffers = async (data) => {
    try {
      // 1) רענון המבצעים
      await refreshOffers();
      // עכשיו הסטייט של offers ב-SidebarContext יתעדכן

      // 2) לחכות טיפה שהעגלת useCart תעשה applyOffers (אסינכרוני):
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 3) רק עכשיו שולחים את ההזמנה
      setReadyToSubmit(data)
    } catch (err) {
      console.error("submitWithRefreshOffers error:", err);
    }
  };

  // useEffect(() => {
  //   if (readyToSubmit) {
  //     submitHandler(readyToSubmit)
  //   };
  // }, [readyToSubmit])

  // שליחת ההזמנה לשרת
  const submitHandler = async (data) => {
    try {
      // console.log('items :>> ', items);

      // וולידציות לפני שליחת ההזמנה
      // וולידציה לאורחים
      if (!userInfo) {
        const phoneRegex = /^05\d{8}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let hasError = false;

        // בדיקת כל השדות בבת אחת
        if (!data.guestName?.trim()) {
          setFormError("guestName", {
            type: "manual",
            message: t('invalidName'),
          });
          hasError = true;
        }

        if (!data.guestLastName?.trim()) {
          setFormError("guestLastName", {
            type: "manual",
            message: t('invalidLastName'),
          });
          hasError = true;
        }

        if (!data.guestPhone || !phoneRegex.test(data.guestPhone)) {
          setFormError("guestPhone", {
            type: "manual",
            message: t('invalidPhone'),
          });
          hasError = true;
        }

        if (!data.guestEmail || !emailRegex.test(data.guestEmail)) {
          setFormError("guestEmail", {
            type: "manual",
            message: t('invalidEmail'),
          });
          hasError = true;
        }

        if (!guestChosenCity) {
          setFormError("guestCity", {
            type: "manual",
            message: t('invalidCity'),
          });
          hasError = true;
        }

        if (!data.guestStreet?.trim()) {
          setFormError("guestStreet", {
            type: "manual",
            message: t('invalidStreet'),
          });
          hasError = true;
        }

        if (!data.guestHouseNumber?.trim()) {
          setFormError("guestHouseNumber", {
            type: "manual",
            message: t('invalidHouseNumber'),
          });
          hasError = true;
        }

        if (!data.guestApartmentNumber?.trim()) {
          setFormError("guestApartmentNumber", {
            type: "manual",
            message: t('invalidApartmentNumber'),
          });
          hasError = true;
        }

        // אם יש שגיאות, גלול לטופס ועצור את השליחה
        if (hasError) {
          if (guestAddressFormRef?.current) {
            const element = guestAddressFormRef.current;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - 160;

            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth"
            });
          }
          return; // עצור את הביצוע
        }

        // עדכון הערך של העיר בטופס
        if (guestChosenCity) {
          setValue("guestCity", guestChosenCity);
          setValue("chosenCity", guestChosenCity);
        }
      }

      // וולידציות כלליות (לכל המשתמשים)
      if (isDeliverable !== undefined && !isDeliverable) {
        notifyError(t('noDeliveryToAddress'));
        window.scrollTo({ top: 0, behavior: "smooth" });
        return; // עצור את הביצוע
      }

      if (isDeliveryMetod !== undefined && !isDeliveryMetod) {
        notifyError(t('selectDeliveryMethod'));
        window.scrollTo({ top: 0, behavior: "smooth" });
        return; // עצור את הביצוע
      }

      if (minimumOrderAmount !== undefined && customCartTotal < minimumOrderAmount) {
        notifyError(t('minimumOrderAmount', { amount: minimumOrderAmount }));
        window.scrollTo({ top: 0, behavior: "smooth" });
        return; // עצור את הביצוע
      }

      dispatch({ type: "SAVE_SHIPPING_ADDRESS", payload: data });
      Cookies.set("shippingAddress", JSON.stringify(data));
      setIsCheckoutSubmit(true);
      setError("");

      let userDetails;
      let orderInfo;

      if (isCashierMode) {
        // במצב קופה - פרטי הלקוח מהטופס
        userDetails = {
          name: data.customerName || null,
          phone: data.customerPhone || null,
        };

        orderInfo = {
          user_info: userDetails,
          cart: items.sort((a, b) => a.barcode - b.barcode) || items,
          subTotal: Number(customCartTotal.toFixed(2)),
          discount: discountAmount,
          total: total,
          coupon: couponInfo._id || null,
        };

        // יצירת הזמנת קופה
        const result = await OrderServices.addCashierOrder(orderInfo);

        notifyApiResponse(result, true);

        // ניקוי העגלה והקופון
        emptyCart();
        Cookies.remove("couponInfo");
        setCouponInfo({});
        setDiscountAmount(0);

        // איפוס הטופס
        setValue("customerName", "");
        setValue("customerPhone", "");

        setIsCheckoutSubmit(false);

        // החזרת פונקציה לניקוי שם הלקוח בקומפוננטה
        return { success: true, clearCustomerName: true };

      } else {
        // במצב רגיל - הזמנת אתר רגילה
        let orderInfo;
        let orderService;

        if (userInfo) { // משתמש מחובר - הזמנה רגילה
          userDetails = {
            name: userInfo.name,
            lastName: userInfo.lastName || '',
            contact: userInfo.phone,
            email: userInfo.email,
            address: userInfo.address,
            country: 'Isral',
            zipCode: userInfo?.address?.postalCode,
          };

          orderInfo = {
            user_info: userDetails,
            shippingOption: data.shippingOption,
            callOnArrival: data.callOnArrival,
            customer_note: data.customer_note,
            paymentMethod: "creditCard",
            status: "Pending",
            cart: items.sort((a, b) => a.barcode - b.barcode) || items,
            subTotal: Number(customCartTotal.toFixed(2)),
            shippingCost: shippingCost,
            discount: discountAmount,
            total: total,
            coupon: couponInfo._id || null,
          };

          orderService = OrderServices.addOrder(orderInfo);
        } else { // משתמש אורח - הזמנה כאורח
          // איסוף פרטי האורח מהטופס
          const guestCity = data.guestCity || data.chosenCity;

          orderInfo = {
            // פרטי היוזר האורח
            name: data.guestName,
            lastName: data.guestLastName,
            email: data.guestEmail,
            phone: data.guestPhone,
            city: guestCity,
            street: data.guestStreet,
            houseNumber: data.guestHouseNumber,
            apartmentNumber: data.guestApartmentNumber,
            floor: data.guestFloor || '',
            entryCode: data.guestEntryCode || '',
            postalCode: data.guestPostalCode || '',

            // פרטי ההזמנה
            shippingOption: data.shippingOption || "2",
            callOnArrival: data.callOnArrival,
            customer_note: data.customer_note || '',
            paymentMethod: "creditCard",
            status: "Pending",
            cart: items.sort((a, b) => a.barcode - b.barcode) || items,
            subTotal: Number(customCartTotal.toFixed(2)),
            shippingCost: shippingCost,
            discount: discountAmount,
            total: total,
            coupon: couponInfo._id || null,
          };

          orderService = OrderServices.addGuestOrder(orderInfo);
        }

        // יצירת ההזמנה בדטאבייס עם סטטוס Pending
        await orderService
          .then((res) => {
            setPaymentSrc(res.paymentUrl);

            // רישום לפלאשי - גם לאורחים וגם למשתמשים רשומים
            if (userInfo) {
              // משתמש מחובר - עדכון/זיהוי בפלאשי
              const loggedInUser = {
                email: userInfo.email,
                name: userInfo.name,
                lastName: userInfo.lastName || '',
                phone: userInfo.phone || userInfo.contact || '',
              };

              // זיהוי המשתמש בפלאשי
              identifyUser(loggedInUser);

              // אם המשתמש בחר להירשם לניוזלטר
              if (newsletterOptIn) {
                trackNewsletterSignup(
                  userInfo.email,
                  userInfo.name,
                  userInfo.lastName || '',
                  userInfo.phone || userInfo.contact || ''
                );
              }
            } else if (orderInfo.email) {
              // אורח - יצירת אובייקט משתמש מהפרטים של האורח
              const guestUser = {
                email: orderInfo.email,
                name: orderInfo.name,
                lastName: orderInfo.lastName,
                phone: orderInfo.phone,
              };

              // זיהוי המשתמש בפלאשי
              identifyUser(guestUser);

              // אם המשתמש בחר להירשם לניוזלטר
              if (newsletterOptIn) {
                trackNewsletterSignup(
                  orderInfo.email,
                  orderInfo.name,
                  orderInfo.lastName,
                  orderInfo.phone || ''
                );
              }
            }
          }).catch((error) => {
            // בדיקת שגיאות מיוחדות
            if (error?.response?.status === 409) {
              const errorData = error?.response?.data;
              handleConflicts(errorData);
              return;
            } else {
              notifyError(error?.response?.data?.message || "שגיאה ביצירת ההזמנה. מומלץ לרוקן את העגלה ולנסות שוב.");
            }
          }).finally(() => {
            setIsCheckoutSubmit(false);
          })
      }
    } catch (err) {
      console.error("Error in submitHandler:", err);

      // טיפול בקונפליקטים
      if (err?.response?.status === 409) {
        const errorData = err?.response?.data;
        handleConflicts(errorData);
        return;
      } else {
        notifyError(err?.response?.data?.message || "שגיאה ביצירת ההזמנה. אנא נסה שוב.");
      }
      setIsCheckoutSubmit(false);
    }
  };

  // עדכון המוצרים ששונה להם המחיר
  useEffect(() => {
    if (addUpdatedProducts) {
      priceConflicts.forEach((conflict) => {
        const { product, serverPrice, clientPrice } = conflict;

        const oldQuantity = product.oldQuantity;

        // חישוב מלאי המוצר
        let stock = 0;
        if (product?.manageStock === false) {
          stock = 9999;
        } else {
          // המלאי הוא שדה stock פשוט
          stock = product?.stock || 0;
        }

        const productPrice = product?.prices?.[0];
        const price = productPrice?.salePrice || productPrice?.price || 0;
        const originalPrice = productPrice?.price || 0;
        const img = product.image?.[0];

        const { categories, description, ...updatedProduct } = product;
        const newItem = {
          ...updatedProduct,
          id: product._id,
          title: product.title,
          image: img,
          price: price,
          originalPrice: originalPrice,
        };

        addItem(newItem, oldQuantity);
      });

      localStorage.removeItem("priceConflicts");
      setAddUpdatedProducts(false);
    }
  }, [addUpdatedProducts]);

  // פונקציית התמודדות עם קונפליקטים מהשרת
  const handleConflicts = async (errorData) => {
    if (!errorData || !errorData.keyWord) return;

    switch (errorData.keyWord) {
      case "missingProducts": {
        // מוצרים חסרים
        const missingProducts = errorData.missingProducts || [];

        // שמירה ב-localStorage אם רוצים לשחזר אחרי רענון
        localStorage.setItem("missingProducts", JSON.stringify(missingProducts));

        // אפשר, אם רוצים, להסיר אותם מייד מהעגלה:
        missingProducts.forEach((p) => removeItem(p._id));

        // הצגת המודאל עם המוצרים החסרים
        setMissingProducts(missingProducts);
        setMissingProductsModal(true);
        break;
      }

      case "priceConflicts": {
        // קונפליקט מחירים
        const priceConflicts = errorData.priceConflicts || [];

        // שמירה ב-localStorage
        localStorage.setItem("priceConflicts", JSON.stringify(priceConflicts));

        // **עדכון מיידי של מחיר המוצרים בעגלה**:
        // הרעיון: להסיר את המוצר הישן ולהוסיף אותו מחדש עם המחיר החדש מהשרת
        let productsWithQ = priceConflicts;
        priceConflicts.forEach((conflict) => {
          const { product } = conflict;

          // 1) מוצאים את הפריט כפי שהוא בעגלה
          const cartItem = items.find((cartI) => cartI._id === product._id);

          if (cartItem) {
            const oldQuantity = cartItem.quantity;

            productsWithQ = productsWithQ.map(p => {
              if (p.product._id === cartItem.id) {
                return { ...p, product: { ...product, oldQuantity } }
              }
              return p;
            });

            // 2) הסרת הפריט הישן
            removeItem(cartItem.id);

            setAddUpdatedProducts(true);
          };
        });

        // פתיחת מודאל ייעודי
        setPriceConflicts(productsWithQ);
        setPriceConflictsModal(true);
        break;
      }

      case "offerConflicts": {
        // קונפליקט מבצעים
        const offerConflicts = errorData.offerConflicts || [];

        // שמירה ב-localStorage
        localStorage.setItem("offerConflicts", JSON.stringify(offerConflicts));
        // window.location.reload();
        await refreshOffers();
        break;
      }

      case "customerAlreadyRegistered": {
        // לקוח רשום שמנסה לקנות כאורח
        setShowLoginModal(true);
        notifyError(errorData.message || t('customerAlreadyRegistered') || "האימייל כבר רשום במערכת. יש להתחבר לפני הרכישה.");
        break;
      }

      default:
        // במקרה שאין keyWord מוכר, או שאין צורך בטיפול מיוחד
        console.warn("No specific conflict handling for keyWord:", errorData.keyWord);
        notifyError("שגיאה ביצירת ההזמנה. מומלץ לרוקן את העגלה ולנסות שוב.");
        break;
    }
  };

  const handleShippingCost = (value) => {
    setShippingCost(value);
    setIsDeliveryMetod(true);
  };

  // ווידוא שהאחוזים מתעדכנים כל פעם שהמחיר משתנה
  useEffect(() => {
    if (shippingCost != 0) {
      const originalValue = ((customCartTotal / 11) * 10);
      if (originalValue) {
        if (originalValue > 0) {
          setShippingPercentageIncrease(shippingCost / originalValue * 100);
        } else {
          setShippingPercentageIncrease(0);
          setShippingCost(0);
          setIsDeliveryMetod(false);
        }
      }
    } else {
      setShippingPercentageIncrease(0);
    }
  }, [customCartTotal, shippingCost, isDeliveryMetod]);

  const handleCouponCode = async (e) => {
    e.preventDefault();

    const value = couponRef.current.value ? couponRef.current.value.trim() : '';

    if (!value) {
      notifyError(t('enterCouponCode'));
      return;
    }

    try {
      const { data } = await CouponServices.useCoupon({ couponCode: value });

      // בדיקה אם ההנחה היא סכום קבוע וגבוהה מהסכום הכולל של העגלה
      if (data.discountType.type === "fixed" && data.discountType.value >= customCartTotal) {
        notifyError(t('couponTooHighForTotal'));
        return; // מסיימים את הפונקציה מבלי להחיל את הקופון
      }

      notifySuccess(
        currentLang
          ? `הקופון ${data.couponCode} הוחל בהצלחה`
          : `Your Coupon ${data.couponCode} is applied successfully!`
      );

      setIsCouponApplied(!isCouponApplied);
      setMinimumAmount(0); // עדכון ערך מינימום אם יש צורך
      setDiscountPercentage(data.discountType.value);

      // שמירת המידע על הקופון ב-Context וב-Cookies
      dispatch({ type: "SAVE_COUPON", payload: data });
      Cookies.set("couponInfo", JSON.stringify(data));

    } catch (error) {
      console.log('error: ', error);
      notifyError(error?.response?.data?.message || t('errorOccurred'));
    }
  };

  return {
    handleSubmit,
    submitHandler,
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
    discountPercentage,
    discountAmount,
    shippingCost,
    total,
    isEmpty,
    items,
    customCartTotal,
    currency,
    isCheckoutSubmit,
    isCouponApplied,
    isDeliveryMetod,
    paymentSrc,
    setPaymentSrc,
    shippingPercentageIncrease,

    // הנחת מבצע THRESHOLD_DISCOUNT (משמש לחישוב ה-total)
    thresholdDiscount,

    missingProductsModal,
    setMissingProductsModal,
    missingProducts,
    setMissingProducts,
    priceConflictsModal,
    setPriceConflictsModal,
    priceConflicts,
    setPriceConflicts,
    offerConflictsModal,
    setOfferConflictsModal,
    offerConflicts,
    setOfferConflicts,
    showLoginModal,
    setShowLoginModal,
    setError: setFormError,
    clearErrors,

    // סטייטים לוולידציה
    guestChosenCity,
    setGuestChosenCity,
    isDeliverable,
    setIsDeliverable,
    minimumOrderAmount,
    guestAddressFormRef,
  };
};

export default useCheckoutSubmit;