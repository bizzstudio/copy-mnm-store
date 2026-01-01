// src/component/checkout/CheckoutItems.jsx
import React from "react";
import { IoBagHandle } from "react-icons/io5";
import { useTranslations } from "next-intl";
import CartItem from "@component/cart/CartItem";

const CheckoutItems = ({
    storeCustomizationSetting,
    showingTranslateValue,
    items,
    isEmpty,
    currency,
}) => {
    const t = useTranslations();

    return (
        <div className="w-full flex flex-col h-full">
            <div className="border p-5 lg:px-8 lg:py-8 rounded-lg bg-white">
                <h2 className="font-semibold font-serif text-lg pb-4 flex items-center gap-2">
                    <IoBagHandle className="text-mainColor-dark text-xl" />
                    {showingTranslateValue(
                        storeCustomizationSetting?.checkout?.order_items
                    ) || t('orderItems')}
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
            </div>
        </div>
    );
};

export default CheckoutItems;