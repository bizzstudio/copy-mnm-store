// src/component/checkout/CheckoutActions.jsx
import React from "react";
import Link from "next/link";
import { IoReturnUpBackOutline, IoCardOutline, IoReceiptOutline } from "react-icons/io5";
import { useTranslations } from "next-intl";
import Cookies from "js-cookie";
import MainBT from "@component/button/MainBT";
import Calculating from "@component/cart/Calculating";

// תשלום באשראי (כרטיס) מופעל. להגדיר ל־false כדי לכבות ולהותיר רק הזמנה בהקפה.
const CARD_PAYMENT_ENABLED = true;

const CheckoutActions = ({
    isEmpty,
    isCheckoutSubmit,
    customCartTotal,
    storeCustomizationSetting,
    showingTranslateValue,
    minimumOrderAmount,
    userInfo,
    submitCreditOrder,
    handleSubmit,
    total,
}) => {
    const t = useTranslations();

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

    // בדיקה האם להציג כפתור הזמנה בהקפה (כש־אשראי מופעל – רק למי שיש לו מסגרת)
    const showCreditOrderButton = CARD_PAYMENT_ENABLED && userInfo &&
        userInfo.customerType !== 'casual' &&
        userInfo.availableCredit > total;

    const isDisabled = isEmpty || isCheckoutSubmit || typeof customCartTotal !== 'number';
    const isLoading = isCheckoutSubmit;

    // כש־תשלום באשראי כבוי – הכפתור היחיד הוא "הזמנה בהקפה"
    const onlyCreditOrder = !CARD_PAYMENT_ENABLED;

    return (
        <div className="border rounded-xl bg-white shadow-sm px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                {/* כפתור חזרה - מוסתר במסך קטן */}
                <div className="hidden md:flex md:w-auto">
                    <Link href="/" passHref className="w-full md:w-auto">
                        <button
                            type="button"
                            className="relative inline-flex items-center justify-center px-6 py-3 min-h-[56px] text-base font-serif font-medium rounded-lg border-2 border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <div className={`flex items-center justify-center gap-2 ${currentLang ? 'flex-row' : 'flex-row-reverse'}`}>
                                <IoReturnUpBackOutline
                                    className={`text-xl ${currentLang ? 'transform scale-x-[-1]' : ''}`}
                                />
                                <span>
                                    {showingTranslateValue(
                                        storeCustomizationSetting?.checkout?.continue_button
                                    )}
                                </span>
                            </div>
                        </button>
                    </Link>
                </div>

                {/* כפתורי יצירת הזמנה */}
                <div className={`flex flex-col sm:flex-row gap-4 flex-1 ${showCreditOrderButton ? 'sm:grid sm:grid-cols-2' : ''}`}>
                    {/* כפתור תשלום באשראי – מוצג רק כש־CARD_PAYMENT_ENABLED */}
                    {CARD_PAYMENT_ENABLED && (
                        <MainBT
                            type="submit"
                            disabled={isDisabled}
                            className="flex-1 min-h-[56px] px-6 py-3 bg-mainColor hover:bg-mainColor-dark text-white font-serif font-semibold text-base shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {typeof customCartTotal !== 'number' ? (
                                <div className="flex items-center justify-center">
                                    <Calculating />
                                </div>
                            ) : isLoading ? (
                                <div className={`flex items-center justify-center gap-2 ${currentLang ? 'flex-row' : 'flex-row-reverse'}`}>
                                    <img
                                        src="/loader/spinner.gif"
                                        alt="Loading"
                                        width={20}
                                        height={20}
                                        className="saturate-0"
                                    />
                                    <span className="font-medium">{t('processing')}</span>
                                </div>
                            ) : (
                                <div className={`flex items-center justify-center gap-3 ${currentLang ? 'flex-row' : 'flex-row-reverse'}`}>
                                    <IoCardOutline className="text-xl" />
                                    <div className="flex flex-col items-center">
                                        <span className="text-base font-semibold">
                                            {showCreditOrderButton
                                                ? t('payNow')
                                                : showingTranslateValue(
                                                    storeCustomizationSetting?.checkout?.confirm_button
                                                )
                                        }
                                        </span>
                                        {minimumOrderAmount ? (
                                            <span className="text-xs opacity-90 mt-0.5">
                                                {t('minimumPurchaseAmount', { amount: minimumOrderAmount })}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            )}
                        </MainBT>
                    )}

                    {/* כפתור הזמנה בהקפה – תמיד כשרק הקפה, אחרת רק למי שיש מסגרת */}
                    {(onlyCreditOrder || showCreditOrderButton) && (
                        <MainBT
                            type="button"
                            onClick={handleSubmit(submitCreditOrder)}
                            disabled={isDisabled}
                            className="flex-1 min-h-[56px] px-6 py-3 bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-serif font-semibold text-base shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {typeof customCartTotal !== 'number' ? (
                                <div className="flex items-center justify-center">
                                    <Calculating />
                                </div>
                            ) : isLoading ? (
                                <div className={`flex items-center justify-center gap-2 ${currentLang ? 'flex-row' : 'flex-row-reverse'}`}>
                                    <img
                                        src="/loader/spinner.gif"
                                        alt="Loading"
                                        width={20}
                                        height={20}
                                        className="saturate-0"
                                    />
                                    <span className="font-medium">{t('processing')}</span>
                                </div>
                            ) : (
                                <div className={`flex items-center justify-center gap-3 ${currentLang ? 'flex-row' : 'flex-row-reverse'}`}>
                                    <IoReceiptOutline className="text-xl" />
                                    <span className="text-base font-semibold">{t('createCreditOrder')}</span>
                                </div>
                            )}
                        </MainBT>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckoutActions;