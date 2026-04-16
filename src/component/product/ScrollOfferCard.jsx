// ScrollOfferCard.jsx
import dynamic from "next/dynamic";
import Image from "next/image";
import { useContext, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { UserContext } from "@context/UserContext";
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
import { useTranslations } from "next-intl";
import getOfferNames from "@component/offer/getOfferNames";
import useCart from "@hooks/useCart";
import { LiaCartPlusSolid } from "react-icons/lia";
import { getPrimaryProductImageUrl } from "@utils/productImage";
import { getUserPrice } from "@utils/priceUtils";
import {
  DEFAULT_WEIGHT_CART_KG,
  productSoldByWeight,
  cartDecrementQuantity,
  weightOptsFromAsPath,
} from "@utils/productSoldByWeight";
import CartWeightQtyField from "@component/product/CartWeightQtyField";

const ScrollOfferCard = ({ product, offers = [] }) => {
  const router = useRouter();
  const pathWeightOpts = useMemo(
    () => weightOptsFromAsPath(router.asPath),
    [router.asPath]
  );
  const [modalOpen, setModalOpen] = useState(false);
  const { toggleCartDrawer, closeCartDrawer } = useContext(SidebarContext)
  const { state: { userInfo } } = useContext(UserContext);
  const { items, addItem, updateItemQuantity, inCart, removeItem } = useCart();
  const { handleIncreaseQuantity } = useAddToCart();
  const { globalSetting } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();
  const t = useTranslations();

  const currency = globalSetting?.default_currency || "₪";

  // console.log('attributes in product cart',attributes)

  // חישוב מלאי המוצר
  const getProductStock = (p) => {
    if (p?.manageStock === false) {
      return 9999;
    }
    // המלאי הוא שדה stock פשוט
    return p?.stock || 0;
  };

  const productPricing = getUserPrice(product, userInfo);

  const handleAddItem = (p) => {
    const stock = getProductStock(p);
    const defaultQty = productSoldByWeight(p, pathWeightOpts)
      ? DEFAULT_WEIGHT_CART_KG
      : 1;
    if (stock + 1e-6 < defaultQty) return notifyError(t('productStockOut'));

    const { slug, categories, description, ...updatedProduct } = product;
    const newItem = {
      ...updatedProduct,
      title: p.title,
      id: p._id,
      price: productPricing.salePrice || productPricing.price,
      originalPrice: productPricing.price,
      purchaseLimit: productPricing.purchaseLimit,
      slug: p.slug,
      image: getPrimaryProductImageUrl(p),
      soldByWeight: productSoldByWeight(p, pathWeightOpts),
    };
    addItem(newItem, defaultQty);
  };

  const handleModalOpen = (event, id) => {
    setModalOpen(event);
  };

  // יצירת מחרוזת עם כל שמות המבצעים עבור המוצר
  const offerName = getOfferNames(offers, product);

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

      <div className="w-full group overflow-hidden flex justify-between rounded-md items-center bg-white relative">
        {/* image */}
        <div
          onClick={() => {
            handleModalOpen(!modalOpen, product._id);
            handleLogEvent(
              "product",
              `opened ${showingTranslateValue(product?.title)} product modal`
            );
          }}
          className="relative flex justify-center cursor-pointer h-full"
        >
          <div className="relative w-28 min-h-[5rem] shrink-0">
            <ImageWithFallback
              src={getPrimaryProductImageUrl(product)}
              outOfStock={getProductStock(product) <= 0}
              alt="product"
              noPadding={true}
              scroll
            />
          </div>
        </div>

        {/* content */}
        <div className="w-full px-3 overflow-hidden cursor-auto">
          <div className="flex justify-between items-center gap-2 text-heading text-sm sm:text-base space-s-2 md:text-base lg:text-xl">
            <div>
              <div className="relative">
                <span className="text-gray-400 font-medium text-xs d-block">
                  {product.unit}
                </span>
                <h2 className="text-heading lg:max-w-[150px] xl:max-w-[180px] 2xl:max-w-[300px] mb-0 block text-base font-medium text-gray-600" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {showingTranslateValue(product?.title)}
                </h2>
              </div>
              <Price
                card
                product={product}
                currency={currency}
                price={product?.prices?.[0]?.salePrice || product?.prices?.[0]?.price || 0}
                originalPrice={product?.prices?.[0]?.price || 0}
              />

              <div className="w-full mb-2">
                {/* אם אין מלאי למוצר מופיע אזל מהמלאי */}
                {/* {product.stock <= 0 && <Stock product={product} stock={product.stock} card right={"2"} top={"2"} />} */}
                <Discount product={product} title={offerName} noMargin={true} search />
              </div>
            </div>


            {inCart(product._id) ? (
              <div>
                {items.map(
                  (item) =>
                    item.id === product._id && (
                      <div
                        key={item.id}
                        className="h-9 w-auto flex items-center justify-evenly py-1 px-2 bg-mainColor-dark text-white rounded"
                      >
                        <button
                          className="pl-1"
                          onClick={() => {
                            const next = cartDecrementQuantity(item, pathWeightOpts);
                            if (next <= 0) removeItem(item.id);
                            else updateItemQuantity(item.id, next);
                          }}
                        >
                          <span className="text-dark text-base">
                            <IoRemove />
                          </span>
                        </button>
                        <div className="px-1 flex items-center justify-center min-w-0">
                          <CartWeightQtyField
                            item={item}
                            getProductStock={getProductStock}
                            updateItemQuantity={updateItemQuantity}
                            variant="onPrimary"
                            weightListOpts={pathWeightOpts}
                          />
                        </div>
                        <button
                          className="pr-1"
                          onClick={() =>
                            handleIncreaseQuantity(item, pathWeightOpts)
                          }
                        >
                          <span className="text-dark text-base">
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
                className={getProductStock(product) <= 0 ? "h-9 px-2 flex items-center justify-center border border-gray-200 rounded text-gray-400" : "h-9 px-2 flex items-center justify-center border border-gray-200 rounded text-mainColor-dark hover:bg-mainColor-dark hover:text-white transition-all"}
              >
                <span className="text-2xl">
                  <LiaCartPlusSolid />
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default dynamic(() => Promise.resolve(ScrollOfferCard), { ssr: false });
