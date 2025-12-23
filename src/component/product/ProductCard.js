// src/component/product/ProductCard.jsx
import dynamic from "next/dynamic";
import Image from "next/image";
import { useContext, useState } from "react";
import { IoAdd, IoBagAddSharp, IoRemove } from "react-icons/io5";

// Internal import
import Price from "@component/common/Price";
import Stock from "@component/common/Stock";
import { notifyError } from "@utils/toast";
import useAddToCart from "@hooks/useAddToCart";
import useGetSetting from "@hooks/useGetSetting";
import Discount from "@component/common/Discount";
import useUtilsFunction from "@hooks/useUtilsFunction";
import ProductModal from "@component/modal/ProductModal";
import ImageWithFallback from "@component/common/ImageWithFallBack";
import { handleLogEvent } from "@utils/analytics";
import { SidebarContext } from "@context/SidebarContext";
import useTranslation from "next-translate/useTranslation";
import getOfferNames from "@component/offer/getOfferNames";
import useCart from "@hooks/useCart";
import { LiaCartPlusSolid } from "react-icons/lia";

const ProductCard = ({ product, offers = [] }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { toggleCartDrawer, closeCartDrawer } = useContext(SidebarContext)
  const { items, addItem, updateItemQuantity, inCart } = useCart();
  const { handleIncreaseQuantity } = useAddToCart();
  const { globalSetting } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();
  const { t } = useTranslation();

  const currency = globalSetting?.default_currency || "₪";

  // חישוב מלאי המוצר
  const getProductStock = (p) => {
    if (p?.manageStock === false) {
      return 9999;
    } else if (p?.stocks && Array.isArray(p.stocks) && p.stocks.length > 0) {
      return p.stocks.reduce((sum, stockItem) => sum + (stockItem?.quantity || 0), 0);
    }
    return 0;
  };

  const handleAddItem = (p) => {
    const stock = getProductStock(p);
    if (stock < 1) return notifyError(t("common:productStockOut"));

    const { slug, categories, description, ...updatedProduct } = product;
    const productPrice = p?.prices?.[0];
    const newItem = {
      ...updatedProduct,
      title: p.title,
      id: p._id,
      price: productPrice?.salePrice || productPrice?.price || 0,
      originalPrice: productPrice?.price || 0,
      slug: p.slug,
      image: p?.image?.[0],
    };
    addItem(newItem);
  };

  const handleModalOpen = (event, id) => {
    setModalOpen(event);
  };

  const offerName = getOfferNames(offers, product, <br />);
  // פונקציות מבצעים ישנים
  // const getOfferName = (product) => {
  //   if (product.isCombination) {
  //     return getFirstOfferName(product?.variants);
  //   } else {
  //     return product?.prices?.offers[0]?.name;
  //   }
  // }

  // const getFirstOfferName = (variants) => {
  //   for (let variant of variants) {
  //     let offer = variant.offers?.find(offer => offer.name);
  //     if (offer) {
  //       return offer.name;
  //     }
  //   }
  //   return null; // במקרה שאין אף offer עם שם
  // };

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
              src={product.image[0]}
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
              price={product?.prices?.[0]?.salePrice || product?.prices?.[0]?.price || 0}
              originalPrice={product?.prices?.[0]?.price || 0}
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
