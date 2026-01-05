// src/component/voice-search/VoiceSearchItem.jsx
import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { FiPlus, FiMinus, FiTrash2 } from "react-icons/fi";
import Cookies from "js-cookie";
import { UserContext } from "@context/UserContext";
import { getUserPrice } from "@utils/priceUtils";

const VoiceSearchItem = ({ item, currency, onQuantityChange, onRemove }) => {
    const router = useRouter();
    const { state: { userInfo } } = useContext(UserContext);

    // קבלת המחיר המדוייק ללקוח (אם יש salePrice, משתמש בו, אחרת price)
    const { price, salePrice } = getUserPrice(item, userInfo);
    const itemPrice = salePrice && salePrice > 0 ? salePrice : price;

    const [totalPrice, setTotalPrice] = useState(itemPrice * item.quantity);

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

    // עדכון מחיר המוצר בהתאם לכמות
    useEffect(() => {
        setTotalPrice(itemPrice * item.quantity);
    }, [item.quantity, itemPrice]);

    const handleQuantityChange = (newQuantity) => {
        if (newQuantity <= 0) {
            onRemove?.(item._id);
        } else {
            onQuantityChange?.(item._id, newQuantity);
        }
    };

    const handleRemove = () => {
        onRemove?.(item._id);
    };

    return (
        <div className="group w-full h-auto flex gap-4 justify-start items-center bg-white py-3 px-6 border-b hover:bg-mainColor-superLight transition-all border-gray-100 relative last:border-b-0">
            <div
                onClick={() => router.push(`/product/${item?.slug}`)}
                className="relative flex justify-between rounded-full border border-gray-100 shadow-sm overflow-hidden shrink-0 cursor-pointer"
            >
                <img
                    key={item._id}
                    src={item.image?.[0] || '/placeholder-image.jpg'}
                    width={60}
                    height={60}
                    alt={currentLang ? item.title?.he : item.title?.en}
                    style={{ aspectRatio: 1, objectFit: 'contain' }}
                />
            </div>

            <div className="flex flex-col w-full overflow-hidden">
                <div
                    onClick={() => router.push(`/product/${item?.slug}`)}
                    className="truncate text-sm font-medium text-gray-700 text-heading line-clamp-1 cursor-pointer hover:text-mainColor"
                >
                    {currentLang ? item.title?.he : item.title?.en}
                </div>

                <div className="flex items-center justify-between gap-1">
                    <div className="font-bold text-sm md:text-base text-heading leading-5">
                        <span>
                            {currency}
                            {totalPrice.toFixed(2)}
                        </span>
                    </div>

                    <div className="flex gap-2 flex-row-reverse mt-auto">
                        <div className="h-8 flex items-center p-1 border border-gray-100 bg-white text-gray-600 rounded-md">
                            <button
                                type="button"
                                className="px-1"
                                onClick={() => handleQuantityChange(item.quantity - 1)}
                            >
                                <span className="text-dark text-base">
                                    <FiMinus />
                                </span>
                            </button>
                            <p className="text-sm font-semibold text-dark px-2">
                                {item.quantity}
                            </p>
                            <button
                                type="button"
                                onClick={() => handleQuantityChange(item.quantity + 1)}
                                className="px-1"
                            >
                                <span className="text-dark text-base">
                                    <FiPlus />
                                </span>
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="hover:text-red-600 text-red-400 text-lg cursor-pointer"
                        >
                            <FiTrash2 />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoiceSearchItem; 