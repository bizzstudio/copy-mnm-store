// src/component/cart/CartItemPreview.jsx
import React, { useContext } from "react";
import Cookies from "js-cookie";
import { UserContext } from "@context/UserContext";
import { getUserPrice } from "@utils/priceUtils";

const CartItemPreview = ({ item }) => {
  const { state: { userInfo } } = useContext(UserContext);

  // קבלת המחיר המדוייק ללקוח (אם יש salePrice, משתמש בו, אחרת price)
  const { price, salePrice } = getUserPrice(item, userInfo);
  const itemPrice = salePrice && salePrice > 0 ? salePrice : price;

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
    <div className="group w-full h-auto flex gap-4 justify-start items-center bg-white py-3 border-b border-gray-100 relative last:border-b-0">
      <div className="relative flex justify-between rounded-full border border-gray-100 shadow-sm overflow-hidden shrink-0"
      >
        <img
          key={item?.id}
          src={item?.image || "https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png"}
          width={60}
          height={60}
          alt={item?.title || 'מוצר מחוק'}
          style={{ aspectRatio: 1, objectFit: 'contain' }}
        />
      </div>
      <div className="flex flex-col">
        <div className="text-sm font-medium text-gray-700 text-heading">
          {(currentLang ? item?.title?.he : item.title?.en) || 'מוצר מחוק'}
        </div>
        <div className="flex items-center justify-between gap-1">
          <div className="font-bold text-sm md:text-base text-heading leading-5">
            <span>{itemPrice || "0"}₪</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItemPreview;
