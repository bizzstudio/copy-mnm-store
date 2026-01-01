// src/component/cart/CartItem.js
import { useContext } from "react";
import Link from "next/link";
import { FiPlus, FiMinus, FiTrash2, FiGift } from "react-icons/fi";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";

// Internal import
import useAddToCart from "@hooks/useAddToCart";
import { SidebarContext } from "@context/SidebarContext";
import useCart from "@hooks/useCart";
import useUtilsFunction from "@hooks/useUtilsFunction";

const CartItem = ({ item, currency, updateTotalPrice }) => {
  const { updateItemQuantity, removeItem, updateItem, items } = useCart();
  const { closeCartDrawer } = useContext(SidebarContext);
  const { handleIncreaseQuantity } = useAddToCart();
  const { showingTranslateValue } = useUtilsFunction();
  const router = useRouter();
  const t = useTranslations();

  const [totalPrice, setTotalPrice] = useState(item.prices?.price * item.quantity);
  const [offerTitle, setOfferTitle] = useState('');
  const [offerDetails, setOfferDetails] = useState([]);

  // בדיקה אם זה מוצר מתנה (rewardProduct במחיר 0)
  const isRewardGift = item.isRewardProduct && item.rewardPrice === 0;
  const isRewardDiscount = item.isRewardProduct && item.rewardPrice > 0;

  // עדכון מחיר המוצר על סמך המבצעים שלו
  useEffect(() => {
    const thisItem = items.find((i) => i.id === item.id);

    if (!thisItem) {
      setTotalPrice(item.prices?.price * item.quantity);
      setOfferTitle('');
      setOfferDetails([]);
      return;
    }

    // אם זה מוצר פרס
    if (thisItem.isRewardProduct) {
      const newPrice = (thisItem.rewardPrice || 0) * thisItem.quantity;
      const newOfferTitle = showingTranslateValue(thisItem.rewardOfferName) || '';
      const newOfferDetails = [{
        type: thisItem.rewardOfferType,
        name: showingTranslateValue(thisItem.rewardOfferName),
        quantity: thisItem.quantity,
        price: thisItem.rewardPrice
      }];
      
      setTotalPrice(newPrice);
      setOfferTitle(newOfferTitle);
      setOfferDetails(newOfferDetails);
    }
    // אם יש מחיר מוזל עקב מבצע
    else if (thisItem.discountedPrice) {
      const newPrice = thisItem.discountedPrice;
      const newOfferTitle = showingTranslateValue(thisItem.offerTitle) || '';

      // פירוט המבצעים שחלו
      if (thisItem.appliedOffers && thisItem.appliedOffers.length > 0) {
        // חישוב סך הכמות במבצעים
        const totalQuantityInOffers = thisItem.appliedOffers.reduce(
          (sum, offer) => sum + (offer.quantityInOffer || 0),
          0
        );
        // חישוב הכמות במחיר רגיל
        const regularQuantity = thisItem.quantity - totalQuantityInOffers;
        const regularUnitPrice = thisItem.prices?.price;

        const newOfferDetails = thisItem.appliedOffers.map(offer => ({
          type: offer.type,
          name: showingTranslateValue(offer.name),
          quantityInOffer: offer.quantityInOffer,
          unitPrice: offer.unitPrice,
          regularQuantity: regularQuantity, // הכמות הכוללת במחיר רגיל
          regularUnitPrice: regularUnitPrice
        }));
        
        setTotalPrice(newPrice);
        setOfferTitle(newOfferTitle);
        setOfferDetails(newOfferDetails);
      } else {
        setTotalPrice(newPrice);
        setOfferTitle(newOfferTitle);
        setOfferDetails([]);
      }
    }
    // מחיר רגיל
    else {
      const newPrice = item.prices?.price * item.quantity;
      setTotalPrice(newPrice);
      setOfferTitle('');
      setOfferDetails([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, item.id, item.prices?.price, item.quantity]);

  // console.log('item :>> ', item);

  const placeholderImage = "https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png";
  const imageSrc = Array.isArray(item?.image)
    ? (item.image.length > 0 ? item.image[0] : placeholderImage)
    : (item?.image || placeholderImage);

  return (
    <div className={`group w-full h-auto flex gap-4 justify-start items-center py-3 px-6 border-b hover:bg-mainColor-superLight transition-all border-gray-100 relative last:border-b-0 ${isRewardGift ? 'bg-gradient-to-l from-mainColor/60 to-white' : 'bg-white'}`}>
      <div onClick={() => router.push(`/product/${item?.slug}`)} className="relative flex justify-between rounded-full border border-gray-100 shadow-sm overflow-hidden shrink-0 cursor-pointer w-[60px] h-[60px]"
      >
        <img
          key={item.id}
          src={imageSrc}
          width={60}
          height={60}
          alt={item.title}
          className="object-cover w-[60px] h-[60px]"
        />
      </div>
      <div className="flex flex-col w-full overflow-hidden">
        <Link
          href={`/product/${item?.slug}`}
          onClick={closeCartDrawer}
          className="truncate text-sm font-medium text-gray-700 text-heading line-clamp-1"
        >
          {showingTranslateValue(item.title)}
        </Link>
        {/* <span className="text-xs text-gray-400 mb-1">
          Item Price ${item.price}
        </span> */}
        <div className="flex items-center justify-between gap-1">
          <div className="font-bold text-sm md:text-base text-heading leading-5">
            {/* מוצר מתנה (rewardGift) */}
            {isRewardGift ? (
              <div>
                {item.quantity === 1 ? (
                  // יחידה אחת - הכל חינם
                  <div className="flex items-center gap-2">
                    <del className="text-xs font-normal text-gray-400">
                      {currency}{item.prices?.price.toFixed(2)}
                    </del>
                  </div>
                ) : (
                  // יותר מיחידה - כל הכמות בחינם
                  <div className="flex items-center gap-2">
                    <del className="text-xs font-normal text-gray-400">
                      {currency}{(item.prices?.price * item.quantity).toFixed(2)}
                    </del>
                    <span className="text-xs text-gray-500">{item.quantity}x</span>
                  </div>
                )}
                <div className="text-xs text-mainColor-dark mt-1 font-normal">
                  {offerTitle}
                </div>
              </div>
            ) : ( // מוצר רגיל או מוצר עם הנחה
              <div>
                <span>
                  {/* אם יש הנחה מופיע בקטן המחיר המקורי */}
                  {totalPrice < item.prices?.price * item.quantity &&
                    <del className="text-xs font-normal text-gray-400 mr-1">
                      {(item.prices?.price * item.quantity).toFixed(2)}
                    </del>}
                  {currency}
                  {totalPrice.toFixed(2)}
                </span>

                {/* פירוט המבצעים שחלו על המוצר */}
                {offerTitle && (
                  <div className="mt-0.5">
                    {/* פירוט מפורט של כל מבצע */}
                    {offerDetails.length > 0 && (
                      <div className="text-xs text-gray-400 mt-0.5">
                        {/* מציגים כל מבצע עם הכמות שלו */}
                        {offerDetails.map((detail, idx) => {
                          if (detail.quantityInOffer > 0) {
                            return (
                              <div key={idx} className="flex flex-col gap-0.5">
                                {/* שם המבצע */}
                                <div className="font-bold text-gray-500">
                                  {detail.name}
                                </div>
                                {/* כמות במבצע */}
                                <div className="flex items-center gap-1 font-light">
                                  x{detail.quantityInOffer} {showingTranslateValue(item.title)} {currency}{detail.unitPrice.toFixed(2)}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })}
                        {/* אם יש כמות במחיר רגיל - מציגים אותה פעם אחת */}
                        {offerDetails.length > 0 && offerDetails[0]?.regularQuantity > 0 && (
                          <div className="flex items-center gap-1 mt-0.5 font-light">
                            <span>
                              x{offerDetails[0].regularQuantity} {showingTranslateValue(item.title)} {currency}{(offerDetails[0].regularUnitPrice || item.prices?.price || 0).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* צד ימין - כפתורי עדכון והסרה */}
          {!isRewardGift && (
            <div className="flex gap-2 flex-row-reverse mt-auto">
              <div className="h-8 flex items-center p-1 border border-gray-100 bg-white text-gray-600 rounded-md">
                <button
                  type="button"
                  className="px-1"
                  onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                >
                  <span className="text-dark text-base">
                    <FiMinus />
                  </span>
                </button>
                <p className="text-sm font-semibold text-dark px-2">
                  {item.quantity}
                </p>
                <button type="button" onClick={() => handleIncreaseQuantity(item)} className="px-1">
                  <span className="text-dark text-base">
                    <FiPlus />
                  </span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="hover:text-red-600 text-red-400 text-lg cursor-pointer"
              >
                <FiTrash2 />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* צד ימין - כיתוב "חינם" בולט למוצרי מתנה */}
      {isRewardGift && (
        <div className="flex flex-col items-center">
          <FiGift size={22} className="text-red-500 mt-1" />
          {/* 🎁 */}
          <span className="text-stone-600 font-bold text-sm md:text-base">
            {t('free')}!
          </span>
        </div>
      )}
    </div>
  );
};

export default CartItem;
