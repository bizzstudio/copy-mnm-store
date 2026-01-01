// PriceUpdatedModal.jsx
import React from "react";
import { useTranslations } from "next-intl";
// אפשר להחליף בתמונה אחרת לבחירתך
import newPriceImage from "public/update product.svg";
import CartItemPreview from "@component/cart/CartItemPreview";
import MainBT from "@component/button/MainBT";

const PriceUpdatedModal = ({ priceUpdatedItems = [], closeModal = () => { } }) => {
    const t = useTranslations();
    const count = priceUpdatedItems.length;

    return (
        <div className="flex flex-col w-fit justify-center items-center">
            <img src={newPriceImage.src} alt="Price Updated image" className="w-[85px]" />
            <h1 className="text-[22px] font-bold text-blackmt-4 mb-2 text-center">
                {/* "למוצרים הבאים עודכן המחיר" עם משתנה count */}
                {t('priceUpdatedForProducts', { count })}
            </h1>
            <ul className="text-right">
                {priceUpdatedItems.map((conflictItem, index) => (
                    /* שים לב שהוספנו כאן .product כי במערך הקונפליקטים 
                       אנחנו שומרים: { product, clientPrice, serverPrice } */
                    <CartItemPreview key={index} item={conflictItem.product} />
                ))}
            </ul>
            <MainBT onClick={closeModal}>
                {t('ok')}
            </MainBT>
        </div>
    );
};

export default PriceUpdatedModal;
