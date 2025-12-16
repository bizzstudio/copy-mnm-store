// src/component/checkout/OrderCosts.jsx
import React from "react";
import { IoReceiptOutline } from "react-icons/io5";
import useTranslation from "next-translate/useTranslation";
import MainBT from "@component/button/MainBT";
import Calculating from "@component/cart/Calculating";
import useCart from "@hooks/useCart";
import CheckInput from "@component/form/checkInput";

const OrderCosts = ({
    storeCustomizationSetting,
    showingTranslateValue,
    currency,
    customCartTotal,
    minimumOrderAmount,
    shippingCost,
    discountAmount,
    total,
    couponInfo,
    couponRef,
    handleCouponCode,
    isDeliverable,
    city,
    guestChosenCity,
    newsletterOptIn,
    setNewsletterOptIn,
}) => {
    const { t } = useTranslation();
    const { thresholdDiscount, appliedOffers } = useCart();

    // מציאת מבצע THRESHOLD_DISCOUNT שחל
    const thresholdDiscountOffer = appliedOffers?.find(o => o.type === 'THRESHOLD_DISCOUNT');

    return (
        <div className="w-full flex flex-col h-full">
            <div className="border p-5 lg:px-8 lg:py-8 rounded-lg bg-white">
                <h2 className="font-semibold font-serif text-lg pb-4 flex items-center gap-2">
                    <IoReceiptOutline className="text-mainColor-dark text-xl" />
                    {showingTranslateValue(
                        storeCustomizationSetting?.checkout?.order_costs
                    ) || t("common:orderCosts")}
                </h2>

                {/* קוד קופון */}
                <div className="flex items-center pb-4 lg:pb-4 text-sm w-full font-semibold text-heading last:border-b-0 last:text-base last:pb-0">
                    {couponInfo.couponCode ? (
                        <span className="bg-mainColor-superLight px-4 py-3 leading-tight w-full rounded-md flex justify-between">
                            {" "}
                            <p className="text-mainColor-dark">{t("common:couponApplied")} </p>{" "}
                            <span className="text-red-500 text-right">
                                {couponInfo.couponCode}
                            </span>
                        </span>
                    ) : (
                        <div className="w-full flex flex-col xs:flex-row items-start xs:items-center justify-center gap-2">
                            <input
                                ref={couponRef}
                                type="text"
                                placeholder={t("common:couponCode")}
                                className="form-input py-2 px-3 md:px-4 w-full appearance-none transition ease-in-out border text-input text-sm rounded-md h-12 duration-200 bg-white border-gray-200 focus:ring-0 focus:outline-none focus:border-mainColor placeholder-gray-500 placeholder-opacity-75"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleCouponCode(e);
                                    }
                                }}
                            />
                            <MainBT
                                type="button"
                                onClick={handleCouponCode}
                                className="xs:!w-fit w-full whitespace-nowrap px-6 md:text-sm"
                            >
                                {showingTranslateValue(
                                    storeCustomizationSetting?.checkout?.apply_button
                                )}
                            </MainBT>
                        </div>
                    )}
                </div>

                {/* עלות ההזמנה */}
                <div className="flex items-center py-2 text-sm w-full font-semibold text-gray-500 last:border-b-0 last:text-base last:pb-0 gap-1.5">
                    {showingTranslateValue(
                        storeCustomizationSetting?.checkout?.sub_total
                    )}
                    <span className="flex-shrink-0 text-gray-800 font-bold">
                        {typeof customCartTotal === 'number' ?
                            <>
                                <small>{currency}</small>
                                {customCartTotal.toFixed(2)}
                            </>
                            : <Calculating />}
                    </span>
                    {customCartTotal < minimumOrderAmount && (
                        <span className="text-xs text-red-500 mb-[1px]">
                            ({t("common:minimumPurchaseAmount", { amount: minimumOrderAmount })})
                        </span>
                    )}
                </div>

                {/* מחיר משלוח - מוצג רק אם יש כתובת נבחרת וזמינה למשלוח */}
                {((city || guestChosenCity?.city_name_he) && isDeliverable === true) && (
                    <div className="flex items-center py-2 text-sm w-full font-semibold text-gray-500 last:border-b-0 last:text-base last:pb-0 gap-1.5">
                        {showingTranslateValue(
                            storeCustomizationSetting?.checkout?.shipping_cost
                        )}
                        <span className="flex-shrink-0 text-gray-800 font-bold">
                            {currency}
                            {shippingCost?.toFixed(2)}
                        </span>
                    </div>
                )}

                {/* הנחת קופון */}
                <div className="flex items-center py-2 text-sm w-full font-semibold text-gray-500 last:border-b-0 last:text-base last:pb-0 gap-1.5">
                    {showingTranslateValue(
                        storeCustomizationSetting?.checkout?.discount
                    )}
                    <span className="ml-auto flex-shrink-0 font-bold text-orange-400">
                        {currency}
                        {discountAmount?.toFixed(2)}
                    </span>
                </div>

                {/* הנחת מבצע קניה מעל סכום */}
                {thresholdDiscount > 0 && thresholdDiscountOffer && (
                    <div className="flex items-center py-2 text-sm w-full font-semibold text-gray-500 last:border-b-0 last:text-base last:pb-0 gap-1.5">
                        {t("common:thresholdDiscount")}
                        <span className="ml-auto flex-shrink-0 font-bold text-orange-400">
                            {currency}
                            {thresholdDiscount?.toFixed(2)}
                            <span className="text-xs ms-1 font-normal text-gray-500">
                                ({showingTranslateValue(thresholdDiscountOffer.name)})
                            </span>
                        </span>
                    </div>
                )}

                {/* סה"כ */}
                <div className="border-t mt-4">
                    <div className="flex items-center font-bold font-serif justify-between pt-5 text-sm uppercase">
                        {showingTranslateValue(
                            storeCustomizationSetting?.checkout?.total_cost
                        )}
                        <span className="font-serif font-extrabold text-lg">
                            {typeof customCartTotal === 'number' ?
                                <>
                                    {currency}
                                    {parseFloat(total).toFixed(2)}
                                </>
                                : <Calculating />}
                        </span>
                    </div>
                </div>

                {/* צ'קבוקס ניוזלטר */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                    <CheckInput
                        id="checkoutNewsletterOptIn"
                        type="checkbox"
                        checked={newsletterOptIn}
                        onChange={(e) => setNewsletterOptIn(e.target.checked)}
                    />
                    <label htmlFor="checkoutNewsletterOptIn" className="text-sm text-gray-700 cursor-pointer">
                        {t("common:newsletterOptInLabel")}
                    </label>
                </div>
            </div>
        </div>
    );
};

export default OrderCosts;