// src/component/checkout/OrderSummary.jsx
import React from "react";
import { IoBagHandle, IoDocumentTextOutline } from "react-icons/io5";
import { useTranslations } from "next-intl";
import CartItem from "@component/cart/CartItem";
import MainBT from "@component/button/MainBT";
import Calculating from "@component/cart/Calculating";

const OrderSummary = ({
    storeCustomizationSetting,
    showingTranslateValue,
    items,
    isEmpty,
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
}) => {
    const t = useTranslations();

    return (
        <div className="w-full flex flex-col h-full">
            <div className="border p-5 lg:px-8 lg:py-8 rounded-lg bg-white">
                <h2 className="font-semibold font-serif text-lg pb-4 flex items-center gap-2">
                    <IoDocumentTextOutline className="text-mainColor-dark text-xl" />
                    {showingTranslateValue(
                        storeCustomizationSetting?.checkout?.order_summary
                    )}
                </h2>

                {/* רשימת מוצרים */}
                <div className="overflow-y-auto grow scrollbar-hide w-full max-h-64 bg-mainColor-superLight block">
                    {items.map((item) => (
                        <CartItem key={item.id} item={item} currency={currency} />
                    ))}

                    {isEmpty && (
                        <div className="text-center py-10">
                            <span className="flex justify-center my-auto text-gray-500 font-semibold text-4xl">
                                <IoBagHandle />
                            </span>
                            <h2 className="font-medium font-serif text-sm pt-2 text-gray-600">
                                {t('noItemAdded')}
                            </h2>
                        </div>
                    )}
                </div>

                {/* קוד קופון */}
                <div className="flex items-center mt-4 py-4 lg:py-4 text-sm w-full font-semibold text-heading last:border-b-0 last:text-base last:pb-0">
                    {couponInfo.couponCode ? (
                        <span className="bg-mainColor-superLight px-4 py-3 leading-tight w-full rounded-md flex justify-between">
                            {" "}
                            <p className="text-mainColor-dark">{t('couponApplied')} </p>{" "}
                            <span className="text-red-500 text-right">
                                {couponInfo.couponCode}
                            </span>
                        </span>
                    ) : (
                        <div className="w-full flex flex-col xs:flex-row items-start xs:items-center justify-center gap-2">
                            <input
                                ref={couponRef}
                                type="text"
                                placeholder={t('couponCode')}
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
                                className="xs:w-fit! w-full whitespace-nowrap px-6 md:text-sm"
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
                    <span className="shrink-0 text-gray-800 font-bold">
                        {typeof customCartTotal === 'number' ?
                            <>
                                <small>{currency}</small>
                                {customCartTotal.toFixed(2)}
                            </>
                            : <Calculating />}
                    </span>
                    {customCartTotal < minimumOrderAmount && (
                        <span className="text-xs text-red-500 mb-px">
                            ({t('minimumPurchaseAmount', { amount: minimumOrderAmount })})
                        </span>
                    )}
                </div>

                {/* מחיר משלוח - מוצג רק אם יש כתובת נבחרת וזמינה למשלוח */}
                {((city || guestChosenCity?.city_name_he) && isDeliverable === true) && (
                    <div className="flex items-center py-2 text-sm w-full font-semibold text-gray-500 last:border-b-0 last:text-base last:pb-0 gap-1.5">
                        {showingTranslateValue(
                            storeCustomizationSetting?.checkout?.shipping_cost
                        )}
                        <span className="shrink-0 text-gray-800 font-bold">
                            {currency}
                            {shippingCost?.toFixed(2)}
                        </span>
                    </div>
                )}

                {/* הנחה */}
                <div className="flex items-center py-2 text-sm w-full font-semibold text-gray-500 last:border-b-0 last:text-base last:pb-0 gap-1.5">
                    {showingTranslateValue(
                        storeCustomizationSetting?.checkout?.discount
                    )}
                    <span className="ml-auto shrink-0 font-bold text-orange-400">
                        {currency}
                        {discountAmount?.toFixed(2)}
                    </span>
                </div>

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
            </div>
        </div>
    );
};

export default OrderSummary;

