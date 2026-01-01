// src/component/common/Price.js
import { useContext } from "react";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { UserContext } from "@context/UserContext";
import { getUserPrice } from "@utils/priceUtils";

const Price = ({ product, card, currency }) => {
  const { getNumberTwo } = useUtilsFunction();
  const { state: { userInfo } } = useContext(UserContext);

  // קבלת המחיר המדוייק ללקוח
  const { price, salePrice, originalPrice } = getUserPrice(product, userInfo);

  // המחיר הסופי להצגה (אם יש מחיר מבצע, מציגים אותו, אחרת המחיר הרגיל)
  const finalPrice = salePrice && salePrice > 0 ? salePrice : price;
  const shouldShowOriginal = salePrice && salePrice > 0 && salePrice < originalPrice;

  return (
    <div className="flex flex-wrap gap-x-2 items-center font-serif product-price font-bold me-auto">
      <span
        className={
          card
            ? "inline-block text-sm sm:text-lg font-semibold text-gray-800"
            : "inline-block text-2xl"
        }
      >
        {currency}
        {getNumberTwo(finalPrice)}
      </span>
      {shouldShowOriginal && (
        <del
          className={
            card
              ? "text-xs sm:text-sm font-normal text-gray-400 ml-1"
              : "text-lg font-normal text-gray-400 ml-1"
          }
        >
          {currency}
          {getNumberTwo(originalPrice)}
        </del>
      )}
    </div>
  );
};

export default Price;