// src/pages/product/[slug].jsx
import { useTranslations } from "next-intl";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment, useContext, useEffect, useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiMinus, FiPlus } from "react-icons/fi";
import {
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  RedditIcon,
  RedditShareButton,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "react-share";

// Internal import
import Price from "@component/common/Price";
import Stock from "@component/common/Stock";
import Tags from "@component/common/Tags";
import Layout from "@layout/Layout";
import { notifyError } from "@utils/toast";
import useAddToCart from "@hooks/useAddToCart";
import Loading from "@component/preloader/Loading";
import ProductCard from "@component/product/ProductCard";
import { SidebarContext } from "@context/SidebarContext";
import ProductServices from "@services/ProductServices";
import useUtilsFunction from "@hooks/useUtilsFunction";
import Discount from "@component/common/Discount";
import ImageCarousel from "@component/carousel/ImageCarousel";
import useCart from "@hooks/useCart";
import getOfferNames from "@component/offer/getOfferNames";
import MainBT from "@component/button/MainBT";
import MinimalTitle from "@component/common/MinimalTitle";
import ComplementaryCartReminderModal from "@component/modal/ComplementaryCartReminderModal";
import ImageWithFallback from "@component/common/ImageWithFallBack";
import { trackFbViewContent } from "@services/facebookPixel";
import { getI18nProps } from "@utils/i18n";
import { UserContext } from "@context/UserContext";
import { getUserPrice, getCatalogSeoPricing, getFinalPrice } from "@utils/priceUtils";
import { getUserTokenFromCookies } from "@utils/getUserTokenFromCookies";
import SoldByWeightQtyInput from "@component/product/SoldByWeightQtyInput";
import {
  MIN_ORDER_KG,
  parseWeightInputToKg,
  productSoldByWeight,
  roundCartQty,
  weightContextFromProductNavTree,
} from "@utils/productSoldByWeight";

const ProductScreen = ({ product, relatedProducts }) => {
  const { showingTranslateValue, getNumber, currency, lang } = useUtilsFunction();

  const { isLoading, setIsLoading, offers, categories } = useContext(SidebarContext);
  const { state: { userInfo } } = useContext(UserContext);
  const { handleAddItem, item, setItem } = useAddToCart();

  const weightOpts = useMemo(() => {
    const ctx = weightContextFromProductNavTree(product, categories).trim();
    return ctx ? { listCategoryContext: ctx } : undefined;
  }, [product?._id, product?.category, categories]);

  const [price, setPrice] = useState(0);
  const [img, setImg] = useState("");
  const [originalPrice, setOriginalPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [stockLoaded, setStockLoaded] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [isReadMore, setIsReadMore] = useState(true);
  const [complementaryReminderOpen, setComplementaryReminderOpen] = useState(false);
  const [weightUnit, setWeightUnit] = useState("kg");
  const [weightStr, setWeightStr] = useState("0.5");

  const { items } = useCart();
  const [offerTitle, setOfferTitle] = useState();

  // עדכון מחיר המוצר על סמך המבצע שלו
  useEffect(() => {
    const offerName = getOfferNames(offers, product);
    if (offerName) {
      setOfferTitle(offerName);
    } else {
      setOfferTitle('');
    }
  }, [offers]);

  // Meta Pixel - ViewContent עבור עמוד מוצר
  useEffect(() => {
    if (product?._id) {
      const fbPrice = userInfo?.token
        ? getFinalPrice(product, userInfo)
        : getCatalogSeoPricing(product).current;
      trackFbViewContent({
        ...product,
        price: fbPrice,
      });
    }
  }, [product?._id, userInfo]);

  useEffect(() => {
    if (!product) return;

    // הגדרת תמונה
    setImg(product?.image?.[0] || "");

    // הגדרת מלאי - אם manageStock הוא false, נחשב שיש מלאי
    if (product?.manageStock === false) {
      setStock(9999); // מלאי בלתי מוגבל
      setStockLoaded(true);
    } else {
      // המלאי הוא שדה stock פשוט
      setStock(product?.stock || 0);
      setStockLoaded(true);
    }

    // מחירים: למשתמש מחובר — לפי מחירון + מע״מ על קטלוג; לאורח — מחירון ברירת מחדל + מע״מ (ל־SEO / מטא)
    if (userInfo?.token) {
      const p = getUserPrice(product, userInfo);
      const currentPrice = getNumber(p.salePrice || p.price);
      const originalPriceValue = getNumber(p.price);
      setPrice(currentPrice);
      setOriginalPrice(originalPriceValue);
      if (p.salePrice && p.salePrice > 0 && p.salePrice < p.price) {
        setDiscount(
          getNumber(((originalPriceValue - currentPrice) / originalPriceValue) * 100)
        );
      } else {
        setDiscount(0);
      }
    } else {
      const seo = getCatalogSeoPricing(product);
      setPrice(getNumber(seo.current));
      setOriginalPrice(getNumber(seo.original));
      setDiscount(getNumber(seo.discount));
    }
  }, [
    product,
    product?.prices,
    product?.stock,
    product?.manageStock,
    product?.image,
    userInfo,
  ]);

  useEffect(() => {
    if (!product?._id) return;
    if (productSoldByWeight(product, weightOpts)) {
      setWeightUnit("kg");
      setWeightStr("0.5");
    } else {
      setItem(1);
    }
  }, [product, setItem, weightOpts]);

  useEffect(() => {
    setIsLoading(false);
    setStockLoaded(false);
  }, [product]);

  const handleAddToCart = (p) => {
    if (stock <= 0) return notifyError(t('productStockOut'));

    // קבלת המחיר והגבלת רכישה לפי המחירון של המשתמש
    const productPricing = getUserPrice(p, userInfo);
    const purchaseLimit = productPricing.purchaseLimit;
    const byWeight = productSoldByWeight(p, weightOpts);
    const qtyKg = byWeight
      ? roundCartQty(parseWeightInputToKg(weightStr, weightUnit))
      : item;

    if (byWeight) {
      if (!Number.isFinite(qtyKg) || qtyKg < MIN_ORDER_KG) {
        notifyError(t('weightInvalidAmount'));
        return;
      }
    }

    // בדיקת הגבלת רכישה (למוצרי משקל — המגבלה בק״ג)
    if (purchaseLimit && purchaseLimit > 0 && qtyKg > purchaseLimit + 1e-6) {
      notifyError(t('maxQuantityReached') || `לא ניתן לרכוש יותר מ-${purchaseLimit} יחידות`);
      return;
    }

    // בדיקת מלאי (מלאי בק״ג למוצרי משקל)
    if (qtyKg > stock + 1e-6) {
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
      soldByWeight: byWeight,
    };

    const addResult = byWeight ? handleAddItem(newItem, qtyKg) : handleAddItem(newItem);
    if (product?.isComplementaryProduct && addResult?.added > 0) {
      setComplementaryReminderOpen(true);
    }
  };

  const handleChangeImage = (img) => {
    setImg(img);
  };

  const t = useTranslations();
  const { getCategorySlug, findMainCategory, findSubCategory } = useUtilsFunction();

  // זיהוי אם הקטגוריה היא קטגוריה ראשית או תת-קטגוריה
  const currentCategory = product?.category;

  // חיפוש הקטגוריה במבנה הקטגוריות מה-SidebarContext
  let foundCategory = null;
  let parentCategory = null;

  // חיפוש בקטגוריות הראשיות
  if (categories?.[0]?.children) {
    foundCategory = categories[0].children.find(cat => cat._id === currentCategory?._id);
    if (foundCategory) {
      // זה קטגוריה ראשית
      parentCategory = null;
    } else {
      // חיפוש בתת-קטגוריות
      for (const mainCat of categories[0].children) {
        if (mainCat.children) {
          const subCat = mainCat.children.find(sub => sub._id === currentCategory?._id);
          if (subCat) {
            foundCategory = subCat;
            parentCategory = mainCat;
            break;
          }
        }
      }
    }
  }

  // יצירת פירורי הלחם הנכונים
  const breadcrumbItems = [];

  // תמיד מתחילים מהבית
  breadcrumbItems.push({
    name: t('HOME'),
    href: "/",
    isActive: false
  });

  // אם יש קטגוריה ראשית - נוסיף אותה
  if (parentCategory) {
    const parentSlug = getCategorySlug(parentCategory);
    breadcrumbItems.push({
      name: showingTranslateValue(parentCategory.name),
      href: `/product-category/${parentSlug}`,
      isActive: false
    });
  }

  // נוסיף את הקטגוריה הנוכחית (ראשית או תת-קטגוריה)
  if (foundCategory) {
    const categorySlug = getCategorySlug(foundCategory);
    breadcrumbItems.push({
      name: showingTranslateValue(foundCategory.name),
      href: parentCategory ? `/product-category/${getCategorySlug(parentCategory)}/${categorySlug}` : `/product-category/${categorySlug}`,
      isActive: false
    });
  }

  // נוסיף את שם המוצר
  breadcrumbItems.push({
    name: showingTranslateValue(product?.title),
    href: null,
    isActive: true
  });

  // ---- SEO / Microdata for Meta ----
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const productUrl = `${siteUrl}/product/${product.slug}`;
  const productImage = product?.image?.[0] || "https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png";
  const basePrice = userInfo?.token
    ? getFinalPrice(product, userInfo) || price
    : getCatalogSeoPricing(product).current || price;
  const availability =
    stock > 0
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": productUrl,
    name: showingTranslateValue(product.title),
    description: showingTranslateValue(product.description),
    image: [productImage],
    sku: product.sku,
    offers: {
      "@type": "Offer",
      priceCurrency: "ILS",
      price: basePrice,
      availability,
      url: productUrl,
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  // console.log("discount", discount);

  return (
    <>
      <Head>
        {/* Open Graph בסיסי למוצר */}
        <meta
          property="og:title"
          content={showingTranslateValue(product.title)}
        />
        <meta
          property="og:description"
          content={showingTranslateValue(product.description)}
        />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={productUrl} />
        <meta property="og:image" content={productImage} />
        <meta property="og:locale" content="he_IL" />

        {/* זה ה-id שמטה מחפשת לקטלוג */}
        <meta
          property="product:retailer_item_id"
          content={product.sku || product._id}
        />

        {/* JSON-LD – Schema.org Product */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productJsonLd),
          }}
        />
      </Head>

      <ComplementaryCartReminderModal
        open={complementaryReminderOpen}
        onClose={() => setComplementaryReminderOpen(false)}
      />

      {isLoading ? (
        <Loading loading={isLoading} />
      ) : (
        <Layout
          title={showingTranslateValue(product?.title)}
          description={showingTranslateValue(product.description)}
        >
          <div className="px-0 py-4 lg:py-10">
            <div className="mx-auto px-3 lg:px-10 max-w-screen-2xl">
              <div className="flex items-center pb-4">
                <ol className="flex items-center w-full min-w-0 overflow-hidden font-serif">
                  {breadcrumbItems.map((item, index) => (
                    <Fragment key={index}>
                      {index > 0 && (
                        <li className="text-xs sm:text-sm mt-px shrink-0">
                          <FiChevronLeft />
                        </li>
                      )}
                      <li className={`text-xs sm:text-sm ${index === breadcrumbItems.length - 1 ? 'min-w-0 flex-1 overflow-hidden' : 'shrink-0'} ${index === 0 ? 'pr-1' : index === breadcrumbItems.length - 1 ? 'px-1' : 'pl-1'} transition duration-200 ease-in ${item.isActive ? '' : 'cursor-pointer hover:text-black font-semibold'}`}>
                        {item.href ? (
                          <Link href={item.href} className={index === breadcrumbItems.length - 1 ? 'block truncate' : 'block'}>
                            <button
                              type="button"
                              onClick={() => setIsLoading(!isLoading)}
                              className={index === breadcrumbItems.length - 1 ? 'truncate w-full text-left' : ''}
                            >
                              {item.name}
                            </button>
                          </Link>
                        ) : (
                          <span className={index === breadcrumbItems.length - 1 ? 'block truncate' : 'block'}>{item.name}</span>
                        )}
                      </li>
                    </Fragment>
                  ))}
                </ol>
              </div>
              {/* <div className="rounded-lg p-3 lg:p-12 bg-white"> */}
              <div className="w-full flex flex-col items-center justify-center lg:flex-row rounded-lg p-3 lg:p-12 bg-white">
                <div className="max-w-lg shrink-0 lg:block md:w-6/12">
                  <Discount slug product={product} discount={discount} title={offerTitle}
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

                  <div className="relative lg:w-[500px] lg:h-[500px] lg:max-h-[300px] md:w-[300px] md:h-[300px] w-[250px] h-[250px]">
                    <ImageWithFallback
                      src={img || product.image[0]}
                      alt="product"
                      noPadding={true}
                      outOfStock={stockLoaded && stock <= 0}
                      slug
                      enableZoom
                    />
                  </div>

                  {product?.image?.length > 1 && (
                    <div className="flex flex-row flex-wrap mt-4 border-t">
                      <ImageCarousel
                        images={product.image}
                        handleChangeImage={handleChangeImage}
                      />
                    </div>
                  )}
                </div>

                {/* <div className="w-full"> */}
                <div className="flex flex-col md:flex-row md:w-1/2 lg:flex-row lg:w-1/2 xl:flex-row xl:w-1/2">
                  <div className="xl:pr-6 md:pr-6 w-full">
                    <div className="mb-3">
                      <h1 className="leading-7 text-lg md:text-xl lg:text-2xl mb-1 font-semibold font-serif text-gray-800">
                        {showingTranslateValue(product?.title)}
                      </h1>

                      <p className="uppercase font-serif font-medium text-gray-500 text-sm">
                        {t('SKU')} :{" "}
                        <span className="font-bold text-gray-600">
                          {product.sku}
                        </span>
                      </p>

                      {/* <div className="relative h-5">
                        <Stock stock={stock} top={1} />
                      </div> */}
                    </div>
                    <Price
                      price={price}
                      product={product}
                      currency={currency}
                      originalPrice={originalPrice}
                    />


                    <div>
                      {showingTranslateValue(product?.description) &&
                        <div className="text-base leading-6 text-gray-600 md:leading-7">
                          {isReadMore
                            ? <>{showingTranslateValue(
                              product?.description
                            )?.slice(0, 220)}{product?.description[lang]?.length > 220 && '...'}</>
                            : showingTranslateValue(product?.description)}
                          <br />
                          {Object?.keys(product?.description)?.includes(lang)
                            ? product?.description[lang]?.length > 230 && (
                              <span
                                onClick={() => setIsReadMore(!isReadMore)}
                                className="read-or-hide"
                              >
                                {isReadMore
                                  ? t('moreInfo')
                                  : t('showLess')}
                              </span>
                            )
                            : product?.description?.en?.length > 230 && (
                              <span
                                onClick={() => setIsReadMore(!isReadMore)}
                                className="read-or-hide"
                              >
                                {isReadMore
                                  ? t('moreInfo')
                                  : t('showLess')}
                              </span>
                            )}
                        </div>}

                      <div className="flex items-center mt-4">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start space-s-3 sm:space-s-4 w-full gap-3">
                          {productSoldByWeight(product, weightOpts) ? (
                            <SoldByWeightQtyInput
                              weightUnit={weightUnit}
                              setWeightUnit={setWeightUnit}
                              weightStr={weightStr}
                              setWeightStr={setWeightStr}
                              className="w-full sm:max-w-md"
                            />
                          ) : (
                            <div className="group flex items-center justify-between rounded-md overflow-hidden shrink-0 border h-11 md:h-12 border-gray-300">
                              <button
                                onClick={() => setItem(item - 1)}
                                disabled={item === 1}
                                className="flex items-center justify-center shrink-0 h-full transition ease-in-out duration-300 focus:outline-none w-8 md:w-12 text-heading border-e border-gray-300 hover:text-gray-500"
                              >
                                <span className="text-dark text-base">
                                  <FiMinus />
                                </span>
                              </button>
                              <p className="font-semibold flex items-center justify-center h-full  transition-colors duration-250 ease-in-out cursor-default shrink-0 text-base text-heading w-8  md:w-20 xl:w-24">
                                {item}
                              </p>
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
                                disabled={(() => {
                                  const productPricing = getUserPrice(product, userInfo);
                                  const purchaseLimit = productPricing.purchaseLimit;
                                  return stock <= item || stock === 0 || (purchaseLimit && purchaseLimit > 0 && item >= purchaseLimit);
                                })()}
                                className="flex items-center justify-center h-full shrink-0 transition ease-in-out duration-300 focus:outline-none w-8 md:w-12 text-heading border-s border-gray-300 hover:text-gray-500"
                              >
                                <span className="text-dark text-base">
                                  <FiPlus />
                                </span>
                              </button>
                            </div>
                          )}
                          <MainBT
                            onClick={() => handleAddToCart(product)}
                            className="text-sm w-full h-12 px-6"
                          >
                            {t('addToCart')}
                          </MainBT>
                        </div>
                      </div>

                      <div className="flex flex-col mt-4">
                        <span className="font-serif font-semibold py-1 text-sm d-block">
                          <span className="text-gray-800">
                            {t('category')}:
                          </span>{" "}
                          <Link
                            href={parentCategory ? `/product-category/${getCategorySlug(parentCategory)}/${getCategorySlug(foundCategory)}` : `/product-category/${getCategorySlug(foundCategory)}`}
                          >
                            <button
                              type="button"
                              className="text-gray-600 font-serif font-medium underline ml-2 hover:text-mainColor-dark"
                              onClick={() => setIsLoading(!isLoading)}
                            >
                              {showingTranslateValue(product?.category?.name)}
                            </button>
                          </Link>
                        </span>
                        <Tags product={product} />
                      </div>

                      {/* <div className="mt-8">
                        <p className="text-xs sm:text-sm text-gray-700 font-medium">
                          Call Us To Order By Mobile Number :{" "}
                          <span className="text-mainColor-dark font-semibold">
                            +0044235234
                          </span>{" "}
                        </p>
                      </div> */}

                      {/* social share */}
                      <div className="mt-2">
                        {/* <h3 className="text-base font-semibold mb-1 font-serif">
                          {t('shareYourSocial')}
                        </h3> */}
                        {/* <p className="font-sans text-sm text-gray-500">
                          {t('shareYourSocialText')}
                        </p> */}
                        {/* <ul className="flex gap-2 mt-4">
                          <li className="flex items-center text-center border border-gray-100 rounded-full hover:bg-mainColor transition ease-in-out duration-500">
                            <FacebookShareButton
                              url={`https://MNM יבוא שיווק והפצה-store-nine.vercel.app/product/${router.query.slug}`}
                              quote=""
                            >
                              <FacebookIcon size={32} round />
                            </FacebookShareButton>
                          </li>
                          <li className="flex items-center text-center border border-gray-100 rounded-full hover:bg-mainColor transition ease-in-out duration-500">
                            <TwitterShareButton
                              url={`https://MNM יבוא שיווק והפצה-store-nine.vercel.app/product/${router.query.slug}`}
                              quote=""
                            >
                              <TwitterIcon size={32} round />
                            </TwitterShareButton>
                          </li>
                          <li className="flex items-center text-center border border-gray-100 rounded-full hover:bg-mainColor transition ease-in-out duration-500">
                            <RedditShareButton
                              url={`https://MNM יבוא שיווק והפצה-store-nine.vercel.app/product/${router.query.slug}`}
                              quote=""
                            >
                              <RedditIcon size={32} round />
                            </RedditShareButton>
                          </li>
                          <li className="flex items-center text-center border border-gray-100 rounded-full hover:bg-mainColor transition ease-in-out duration-500">
                            <WhatsappShareButton
                              url={`https://MNM יבוא שיווק והפצה-store-nine.vercel.app/product/${router.query.slug}`}
                              quote=""
                            >
                              <WhatsappIcon size={32} round />
                            </WhatsappShareButton>
                          </li>
                          <li className="flex items-center text-center border border-gray-100 rounded-full hover:bg-mainColor transition ease-in-out duration-500">
                            <LinkedinShareButton
                              url={`https://MNM יבוא שיווק והפצה-store-nine.vercel.app/product/${router.query.slug}`}
                              quote=""
                            >
                              <LinkedinIcon size={32} round />
                            </LinkedinShareButton>
                          </li>
                        </ul> */}
                      </div>
                    </div>
                  </div>

                  {/* shipping description card */}

                  {/* <div className="w-full xl:w-5/12 lg:w-6/12 md:w-5/12">
                        <div className="mt-6 md:mt-0 lg:mt-0 bg-mainColor-superLight border border-gray-100 p-4 lg:p-8 rounded-lg">
                          <Card />
                        </div>
                      </div> */}
                </div>
                {/* </div> */}
                {/* </div> */}
              </div>

              {/* related products */}
              {relatedProducts?.length >= 2 && (
                <div className="pt-10 lg:pt-10 lg:pb-10">
                  <div className="flex justify-between items-center mt-5 mb-4 bg-white rounded-xl p-3 border-s-4 border-b-4 border-mainColor">
                    <MinimalTitle title={t('relatedProductsTitle')} />
                  </div>
                  <div className="flex">
                    <div className="w-full">
                      <div className="grid grid-cols-1 xss:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 md:gap-3 lg:gap-3">
                        {relatedProducts?.slice(1, 13).map((relatedProduct) => (
                          <ProductCard
                            key={relatedProduct._id}
                            product={relatedProduct}
                            offers={offers}
                            listCategoryContext={weightOpts?.listCategoryContext}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Layout>
      )}
    </>
  );
};

export const getServerSideProps = async (context) => {
  const { slug } = context.params;
  const { cookies } = context.req;
  const userToken = getUserTokenFromCookies(cookies);

  const data = await ProductServices.getShowingStoreProducts({
    category: "",
    slug: slug,
    token: userToken,
  });

  let product = {};

  if (slug) {
    // ה-slug מה-URL הוא כבר decoded, אבל ה-slug בבסיס הנתונים יכול להיות encoded
    // ננסה למצוא את המוצר גם עם slug decoded וגם עם slug encoded
    product = data?.products?.find((p) => {
      // נפענח את ה-slug מהבסיס נתונים אם הוא מקודד
      const decodedSlug = decodeURIComponent(p.slug);
      // נשווה גם עם ה-slug המקורי וגם עם ה-slug המפוענח
      return p.slug === slug || decodedSlug === slug;
    });
  }

  // מעבר לדף 404 אם המוצר לא נמצא
  if (!product) {
    return {
      notFound: true,
    };
  }

  const i18nProps = await getI18nProps(context);

  return {
    props: {
      product,
      relatedProducts: data?.relatedProducts,
      ...i18nProps,
    },
  };
  // const { slug } = context.params;

  // // Encode the slug to handle special characters
  // const encodedSlug = encodeURIComponent(slug);

  // try {
  //   const product = await ProductServices.getProductBySlug(encodedSlug);

  //   // Ensure no undefined values are serialized
  //   if (product === undefined) {
  //     return {
  //       notFound: true,
  //     };
  //   }

  //   // Handle undefined values in the product object
  //   const serializedProduct = JSON.parse(JSON.stringify(product, (key, value) => {
  //     return value === undefined ? null : value;
  //   }));

  //   return {
  //     props: {
  //       product: serializedProduct,
  //     },
  //   };
  // } catch (error) {
  //   console.error(error);
  //   return {
  //     notFound: true,
  //   };
  // }
};

export default ProductScreen;
