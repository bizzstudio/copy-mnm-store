// MissingProductsModal.jsx
import React from "react";
import useTranslation from "next-translate/useTranslation";
import sadOrange from 'public/sadOrange.svg'
import CartItemPreview from "@component/cart/CartItemPreview";

const MissingProductsModal = ({ missingProducts = [] }) => {
  const { t } = useTranslation();
  const count = missingProducts.length;

  return (
    <div className="flex flex-col w-fit justify-center items-center">
      <img src={sadOrange.src} alt="Missing Products image" className="w-20" />
      <h1 className="text-[22px] font-bold text-blackmt-4 mb-2 text-center">
        {t("common:missingProductsAre", { count })}
      </h1>
      <ul className="text-right">
        {missingProducts.map((product, index) => (
          <CartItemPreview key={index} item={product} />
        ))}
      </ul>
    </div>
  );
};

export default MissingProductsModal;
