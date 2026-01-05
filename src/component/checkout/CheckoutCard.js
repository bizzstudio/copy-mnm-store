// src/component/checkout/CheckoutCard.js
import Image from "next/image";
import { FiPlus, FiMinus } from "react-icons/fi";
import { useContext } from "react";
import SettingServices from "@services/SettingServices";
import useAsync from "@hooks/useAsync";
import useCart from "@hooks/useCart";
import { UserContext } from "@context/UserContext";
import { getUserPrice } from "@utils/priceUtils";

const CheckoutCard = ({ item }) => {
  const { updateItemQuantity } = useCart();
  const { state: { userInfo } } = useContext(UserContext);
  const { data: globalSetting } = useAsync(SettingServices.getGlobalSetting);

  const currency = globalSetting?.default_currency || "₪";

  // קבלת המחיר המדוייק ללקוח (אם יש salePrice, משתמש בו, אחרת price)
  const { price, salePrice } = getUserPrice(item, userInfo);
  const itemPrice = salePrice && salePrice > 0 ? salePrice : price;

  return (
    <div
      key={item.id}
      className="group w-full h-auto flex justify-start items-center py-2 px-5 border-b hover:bg-white transition-all border-gray-100 relative last:border-b-0"
    >
      <div className="relative flex rounded-md overflow-hidden shrink-0 cursor-pointer mr-4">
        <Image src={item.image} width={50} height={50} alt={item?.title?.he} />
      </div>
      <div className="flex flex-col w-full overflow-hidden">
        <div className="flex items-center justify-between gap-1">
          <p className="mb-0">
            <span className="text-sm font-medium text-gray-700 text-heading line-clamp-1">
              {item?.title?.substring(0, 5)}
            </span>
            <span className="text-xs text-gray-400 mb-2">
              Item Price{currency}
              {itemPrice.toFixed(2)}
            </span>
          </p>
          <div className="h-8 w-20 flex flex-wrap items-center justify-evenly p-1 border border-gray-100 bg-white text-gray-600 rounded-md">
            <div
              className="cursor-pointer"
              onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
            >
              <span className="text-dark text-base">
                <FiMinus />
              </span>
            </div>
            <p className="text-sm font-semibold text-dark px-1">
              {item.quantity}
            </p>
            <div
              className="cursor-pointer"
              onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
            >
              <span className="text-dark text-base">
                <FiPlus />
              </span>
            </div>
          </div>

          <div className="font-bold text-sm text-heading leading-5">
            <span>{currency}{(itemPrice * item.quantity).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutCard;
