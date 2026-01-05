// src/component/modal/ProductModal.js
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { FiMinus, FiPlus } from "react-icons/fi";

// Internal import
import Price from "@component/common/Price";
import Stock from "@component/common/Stock";
import Tags from "@component/common/Tags";
import { notifyError } from "@utils/toast";
import useAddToCart from "@hooks/useAddToCart";
import MainModal from "@component/modal/MainModal";
import Discount from "@component/common/Discount";
import { SidebarContext } from "@context/SidebarContext";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { handleLogEvent } from "@utils/analytics";
import MainBT from "@component/button/MainBT";
import ImageWithFallback from "@component/common/ImageWithFallBack";
import ProductDescription from "@component/product/ProductDescription";
import ImageCarousel from "@component/carousel/ImageCarousel";
import { trackProductModalView } from "@services/flashy";
import { trackFbViewContent } from "@services/facebookPixel";
import { UserContext } from "@context/UserContext";
import { getUserPrice } from "@utils/priceUtils";

const ProductModal = ({
  modalOpen,
  setModalOpen,
  product,
  currency = '₪',
  clearInput = () => { },
  title = ''
}) => {
  console.log('ProductModal product: ', product);
  const router = useRouter();
  const { setIsLoading, isLoading } = useContext(SidebarContext);
  const { state: { userInfo } } = useContext(UserContext);
  const t = useTranslations();

  const { handleAddItem, setItem, item } = useAddToCart();
  const { showingTranslateValue, getNumber } = useUtilsFunction();

  // react hook
  const [price, setPrice] = useState(0);
  const [img, setImg] = useState("");
  const [originalPrice, setOriginalPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [discount, setDiscount] = useState(0);

  // סגירת הפופאפ באנימצייה
  const [isClosing, setIsClosing] = useState(false);
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setModalOpen(false);
    }, 300); // תואם למשך זמן האנימציה (duration-200)
  };

  useEffect(() => {
    if (!product) return;

    // הגדרת תמונה
    setImg(product?.image?.[0] || "");

    // הגדרת מלאי - אם manageStock הוא false, נחשב שיש מלאי
    if (product?.manageStock === false) {
      setStock(9999); // מלאי בלתי מוגבל
    } else {
      // המלאי הוא שדה stock פשוט
      setStock(product?.stock || 0);
    }

    // הגדרת מחירים - לוקח את המחיר הראשון מהמערך prices
    const productPrice = product?.prices?.[0];
    if (productPrice) {
      // אם יש salePrice, זה המחיר המחוק, אחרת price הוא המחיר הרגיל
      const currentPrice = getNumber(productPrice?.salePrice || productPrice?.price);
      const originalPriceValue = productPrice?.salePrice
        ? getNumber(productPrice?.price)
        : getNumber(productPrice?.price);

      setPrice(currentPrice);
      setOriginalPrice(originalPriceValue);

      // חישוב הנחה
      if (productPrice?.salePrice && productPrice?.salePrice < productPrice?.price) {
        const discountPercentage = getNumber(
          ((originalPriceValue - currentPrice) / originalPriceValue) * 100
        );
        setDiscount(discountPercentage);
      } else {
        setDiscount(0);
      }
    } else {
      setPrice(0);
      setOriginalPrice(0);
      setDiscount(0);
    }
  }, [
    product,
    product?.prices,
    product?.stock,
    product?.manageStock,
    product?.image,
  ]);


  // Flashy Product Modal View Tracking
  useEffect(() => {
    if (modalOpen && product?._id) {
      trackProductModalView(product._id);

      // Meta Pixel ViewContent גם לפופאפ
      trackFbViewContent({
        ...product,
        price: product?.prices?.[0]?.price || product?.prices?.[0]?.salePrice || 0,
      });
    }
  }, [modalOpen, product?._id]);

  const handleAddToCart = (p) => {
    if (stock <= 0) return notifyError(t('productStockOut'));

    // קבלת המחיר והגבלת רכישה לפי המחירון של המשתמש
    const productPricing = getUserPrice(p, userInfo);
    const purchaseLimit = productPricing.purchaseLimit;

    // בדיקת הגבלת רכישה
    if (purchaseLimit && purchaseLimit > 0 && item > purchaseLimit) {
      notifyError(t('maxQuantityReached') || `לא ניתן לרכוש יותר מ-${purchaseLimit} יחידות`);
      return;
    }

    // בדיקת מלאי
    if (item > stock) {
      notifyError(t('productStockOut') || `אין מספיק מלאי. במלאי: ${stock} יחידות`);
      return;
    }

    const { categories, description, ...updatedProduct } = product;

    const newItem = {
      ...updatedProduct,
      id: p._id,
      title: p.title,
      image: img || p?.image?.[0],
      price: getNumber(productPricing.salePrice || productPricing.price || 0),
      originalPrice: getNumber(productPricing.price || 0),
      purchaseLimit: purchaseLimit,
    };

    handleAddItem(newItem);
    handleClose();
  };

  const handleMoreInfo = (slug) => {
    handleClose();

    router.push(`/product/${slug}`);
    setIsLoading(!isLoading);
    handleLogEvent("product", `opened ${slug} product details`);
  };

  const { getCategorySlug } = useUtilsFunction();
  const category_slug = getCategorySlug(product?.category);

  // הוספת פונקציה לטיפול בשינוי תמונות
  const handleChangeImage = (img) => {
    setImg(img);
  };

  return (
    <>
      <MainModal modalOpen={modalOpen && !isClosing} setModalOpen={setModalOpen}>
        <div className="inline-block w-full overflow-y-auto h-full align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex flex-col items-center justify-center lg:flex-row md:flex-row w-full max-w-4xl overflow-hidden">
            <div className="w-fit max-w-full flex flex-col items-center justify-center h-auto p-5 md:pl-0 sm:pb-5 pb-0">
              <div className="w-full relative flex flex-col items-center justify-center">
                {/* <Discount
                  product={product}
                  modal
                /> */}

                {/* התמונה הראשית - קליקה לניווט לדף מוצר */}
                <Link href={`/product/${product.slug}`} passHref className="border-none outline-none w-full h-[220px] max-w-[400px] flex items-center justify-center select-none">
                  <div
                    onClick={() => handleClose()}
                    className="cursor-pointer w-full h-full flex flex-col items-center justify-center"
                  >
                    <div className="relative w-full h-full sm:min-w-[300px] min-w-[280px] max-h-[220px]">
                      <ImageWithFallback
                        src={img || product.image[0]}
                        alt="product"
                        noPadding={true}
                        outOfStock={stock <= 0}
                        modal
                      />
                    </div>
                  </div>
                </Link>
              </div>

              {/* קרוסלת תמונות - רק להחלפת התמונה הראשית */}
              {product?.image?.length > 1 && (
                <div className="w-full max-w-full flex flex-row flex-wrap mt-4 border-t">
                  <ImageCarousel
                    images={product.image}
                    handleChangeImage={handleChangeImage}
                  />
                </div>
              )}
            </div>

            <div className="w-full flex flex-col p-5 pt-0 md:p-8 text-left">
              <div className="flex flex-col gap-0.5 mb-1 -mt-1.5">
                <Discount
                  product={product}
                  discount={discount}
                  modal
                  title={title}
                // title={product.isCombination ? (selectVariant?.offers?.length > 0 ? (
                //   selectVariant.offers.reduce((title, obj) => (
                //     <>
                //       {title}
                //       {title && <br />}
                //       {obj.name}
                //     </>
                //   ), null)
                // ) : '') : (product?.prices?.offers?.length > 0 ? (
                //   product?.prices?.offers.reduce((title, obj) => (
                //     <>
                //       {title}
                //       {title && <br />}
                //       {obj.name}
                //     </>
                //   ), null)
                // ) : '')}
                />
                <Link href={`/product/${product.slug}`} passHref>
                  <h1
                    onClick={() => handleClose()}
                    className="text-heading text-lg md:text-xl lg:text-2xl font-semibold font-serif hover:text-black cursor-pointer text-right mb-1 hover:underline"
                  >
                    {showingTranslateValue(product?.title)}
                  </h1>
                </Link>
                <div
                  className={`${stock <= 0 ? "relative py-1 mb-2 text-right" : "relative text-right"
                    }`}
                >
                  <Stock stock={stock} />
                </div>
              </div>
              {/* {showingTranslateValue(product?.description)} */}
              {product?.description && (
                <ProductDescription description={product.description} />
              )}

              {/* מחיר */}
              <div className="flex items-center my-1">
                <Price
                  product={product}
                  price={price}
                  currency={currency}
                  originalPrice={originalPrice}
                />
              </div>


              {/* בחירת כמות והוספה */}
              <div className="flex items-center mt-4">
                <div className="flex sm:flex-row flex-col items-center gap-3 justify-between space-s-3 sm:space-s-4 w-full">
                  <div className="group flex items-center justify-between rounded-md overflow-hidden shrink-0 border h-11 md:h-12 border-gray-300 w-full sm:w-auto">
                    <button
                      onClick={() => setItem(item - 1)}
                      disabled={item === 1}
                      className="flex items-center justify-center shrink-0 h-full transition ease-in-out duration-300 focus:outline-none w-8 md:w-12 text-heading border-e border-gray-300 hover:text-gray-500"
                    >
                      <span className="text-dark text-base">
                        <FiMinus />
                      </span>
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={9999}
                      value={item === 0 ? "" : item}
                      onChange={e => {
                        // אם המשתמש מוחק הכל, תן לערך להיות ריק
                        if (e.target.value === "") {
                          setItem(0);
                          return;
                        }
                        let val = Number(e.target.value);
                        if (isNaN(val)) val = 1;
                        // לא מגביל כאן, כדי לאפשר למשתמש להקליד מספרים גדולים ואז לתקן
                        setItem(val);
                      }}
                      onBlur={e => {
                        // אם נשאר ריק או לא חוקי, מחזיר ל-1
                        let val = Number(e.target.value);
                        if (isNaN(val) || val < 1) val = 1;
                        if (val > 9999) val = 9999;
                        setItem(val);
                      }}
                      className="no-spinner font-semibold flex items-center justify-center h-full transition-colors duration-250 ease-in-out cursor-text shrink-0 text-base text-heading w-8 md:w-20 xl:w-24 text-center outline-none"
                      style={{ MozAppearance: 'textfield' }}
                    />
                    <button
                      onClick={() => {
                        // קבלת המחיר והגבלת רכישה לפי המחירון של המשתמש
                        const productPricing = getUserPrice(product, userInfo);
                        const purchaseLimit = productPricing.purchaseLimit;
                        // בדיקת הגבלת רכישה ומלאי
                        if ((purchaseLimit && purchaseLimit > 0 && item + 1 > purchaseLimit) || item + 1 > stock) {
                          return;
                        }
                        setItem(item + 1);
                      }}
                      disabled={
                        stock < item || stock === item || stock === 0 || (() => {
                          const productPricing = getUserPrice(product, userInfo);
                          const purchaseLimit = productPricing.purchaseLimit;
                          return purchaseLimit && purchaseLimit > 0 && item >= purchaseLimit;
                        })()
                      }
                      className="flex items-center justify-center h-full shrink-0 transition ease-in-out duration-300 focus:outline-none w-8 md:w-12 text-heading border-s border-gray-300 hover:text-gray-500"
                    >
                      <span className="text-dark text-base">
                        <FiPlus />
                      </span>
                    </button>
                  </div>
                  <MainBT
                    onClick={() => handleAddToCart(product)}
                    disabled={stock < 1}
                    className="w-full px-6"
                  >
                    {t('addToCart')}
                  </MainBT>
                </div>
              </div>

              <div className="flex items-center mt-4">
                <div className="flex flex-col sm:flex-row sm:justify-between items-center space-s-3 gap-3 w-full">
                  {/* קטגוריה */}
                  <div className="flex flex-col items-start gap-2">
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      <span className="font-serif font-semibold">
                        {t('category')}:
                      </span>{" "}
                      <Link
                        href={`/product-category/${category_slug}`}
                      >
                        <button
                          type="button"
                          className="text-gray-600 font-serif font-medium underline ml-2 hover:text-mainColor-dark"
                          onClick={() => {
                            setIsLoading(!isLoading);
                            handleClose();
                            clearInput();
                          }}
                        >
                          {showingTranslateValue(product?.category?.name)}
                        </button>
                      </Link>
                    </div>

                    <Tags product={product} />
                  </div>

                  <div>
                    <button
                      onClick={() => handleMoreInfo(product.slug)}
                      className="font-sans font-medium text-sm text-customRed hover:underline whitespace-nowrap"
                    >
                      {t('moreInfo')}
                    </button>
                  </div>
                </div>
              </div>
              {/* <div className="flex justify-end mt-2">
                <p className="text-xs sm:text-sm text-gray-600">
                  Call Us To Order By Mobile Number :{" "}
                  <span className="text-mainColor-dark font-semibold">
                    +0044235234
                  </span>{" "}
                </p>
              </div> */}
            </div>
          </div>
        </div>
      </MainModal>
    </>
  );
};

export default ProductModal;