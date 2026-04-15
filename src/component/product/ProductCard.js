// src/component/product/ProductCard.jsx
import dynamic from "next/dynamic";
import { useContext, useState } from "react";
import { IoAdd, IoRemove } from "react-icons/io5";

// Internal import
import Price from "@component/common/Price";
import { notifyError } from "@utils/toast";
import useAddToCart from "@hooks/useAddToCart";
import useGetSetting from "@hooks/useGetSetting";
import Discount from "@component/common/Discount";
import useUtilsFunction from "@hooks/useUtilsFunction";
import ProductModal from "@component/modal/ProductModal";
import ComplementaryCartReminderModal from "@component/modal/ComplementaryCartReminderModal";
import ImageWithFallback from "@component/common/ImageWithFallBack";
import { handleLogEvent } from "@utils/analytics";
import { UserContext } from "@context/UserContext";
import { useTranslations } from "next-intl";
import getOfferNames from "@component/offer/getOfferNames";
import useCart from "@hooks/useCart";
import { LiaCartPlusSolid } from "react-icons/lia";
import { getUserPrice } from "@utils/priceUtils";
import { getPrimaryProductImageUrl } from "@utils/productImage";

const ProductCard = ({ product, offers = [] }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [complementaryReminderOpen, setComplementaryReminderOpen] = useState(false);
  const { state: { userInfo } } = useContext(UserContext);
  const { items, addItem, updateItemQuantity, inCart } = useCart();
  const { handleIncreaseQuantity } = useAddToCart();
  const { globalSetting } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();
  const t = useTranslations();

  const currency = globalSetting?.default_currency || "₪";

  // קבלת המחיר המדוייק ללקוח
  const productPricing = getUserPrice(product, userInfo);

  // חישוב מלאי המוצר
  const getProductStock = (p) => {
    if (p?.manageStock === false) {
      return 9999;
    }
    // המלאי הוא שדה stock פשוט
    return p?.stock || 0;
  };

  const handleAddItem = (p) => {
    const stock = getProductStock(p);
    if (stock < 1) return notifyError(t('productStockOut'));

    const { slug, categories, description, ...updatedProduct } = product;
    const newItem = {
      ...updatedProduct,
      title: p.title,
      id: p._id,
      price: productPricing.salePrice || productPricing.price,
      originalPrice: productPricing.originalPrice,
      purchaseLimit: productPricing.purchaseLimit,
      slug: p.slug,
      image: getPrimaryProductImageUrl(p),
    };
    const result = addItem(newItem);
    if (product?.isComplementaryProduct && result && result.added > 0) {
      setComplementaryReminderOpen(true);
    }
  };

  const handleModalOpen = (event, id) => {
    setModalOpen(event);
  };

  const offerName = getOfferNames(offers, product, <br />);

  return (
    <>
      {modalOpen && (
        <ProductModal
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
          product={product}
          currency={currency}
          title={offerName}
        />
      )}

      <ComplementaryCartReminderModal
        open={complementaryReminderOpen}
        onClose={() => setComplementaryReminderOpen(false)}
      />

      <div className="group box-border overflow-hidden flex justify-between rounded-md shadow-md pe-0 flex-col items-center bg-white relative">
        <div className="w-full flex justify-between">
          {/* אם אין מלאי למוצר מופיע אזל מהמלאי */}
          {/* {product.stock <= 0 && <Stock product={product} stock={product.stock} card right={"2"} top={"2"} />} */}
          <Discount product={product} title={offerName} card />
        </div>
        <div
          onClick={() => {
            handleModalOpen(!modalOpen, product._id);
            handleLogEvent(
              "product",
              `opened ${showingTranslateValue(product?.title)} product modal`
            );
          }}
          className="relative flex justify-center cursor-pointer pt-1 sm:pt-2 w-full h-32 sm:h-44"
        >
          <div className="relative w-full h-full p-1 sm:p-2">
            <ImageWithFallback
              src={getPrimaryProductImageUrl(product)}
              outOfStock={getProductStock(product) <= 0}
              alt="product"
              card={true}
            />
          </div>
        </div>
        <div className="w-full px-2 sm:px-3 lg:px-4 pb-2 sm:pb-4 overflow-hidden">
          <div className="relative mb-1.5 sm:mb-1">
            <span className="text-gray-400 font-medium text-[10px] sm:text-xs d-block mb-0.5 sm:mb-1">
              {product.unit}
            </span>
            <h2 className="text-heading mb-0 block text-sm sm:text-base font-medium text-gray-600">
              <span className="line-clamp-2">
                {showingTranslateValue(product?.title)}
              </span>
            </h2>
          </div>

          <div className="flex flex-row justify-between items-center gap-2 text-heading text-xs sm:text-base space-s-2 md:text-base lg:text-xl">
            <Price
              card
              product={product}
              currency={currency}
            />

            <div className="h-8 sm:h-9 ms-auto">
              {inCart(product._id) ? (
                <div>
                  {items.map(
                    (item) =>
                      item.id === product._id && (
                        <div
                          key={item.id}
                          className="h-8 sm:h-9 w-auto flex items-center justify-evenly py-0.5 sm:py-1 px-1.5 sm:px-2 bg-mainColor-dark text-white rounded"
                        >
                          <button
                            className="pl-0.5 sm:pl-1"
                            onClick={() =>
                              updateItemQuantity(item.id, item.quantity - 1)
                            }
                          >
                            <span className="text-dark text-sm sm:text-base">
                              <IoRemove />
                            </span>
                          </button>
                          <p className="text-xs sm:text-sm text-dark px-0.5 sm:px-1 font-serif font-semibold">
                            {item.quantity}
                          </p>
                          <button
                            className="pr-0.5 sm:pr-1"
                            onClick={() => handleIncreaseQuantity(item)}
                          >
                            <span className="text-dark text-sm sm:text-base">
                              <IoAdd />
                            </span>
                          </button>
                        </div>
                      )
                  )}{" "}
                </div>
              ) : (
                <button
                  disabled={getProductStock(product) <= 0}
                  onClick={() => handleAddItem(product)}
                  aria-label="cart"
                  className={getProductStock(product) <= 0 ? "h-8 sm:h-9 px-1.5 sm:px-2 flex items-center justify-center border border-gray-200 rounded text-gray-400" : "h-8 sm:h-9 px-1.5 sm:px-2 flex items-center justify-center border border-gray-200 rounded text-mainColor-dark hover:bg-mainColor-dark hover:text-white transition-all"}
                >
                  {" "}
                  <span className="text-xl sm:text-2xl">
                    <LiaCartPlusSolid />
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default dynamic(() => Promise.resolve(ProductCard), { ssr: false });
