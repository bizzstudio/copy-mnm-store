// pages/index.js
import { SidebarContext } from "@context/SidebarContext";
import { useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from "swiper/modules";

// Internal import
import Layout from "@layout/Layout";
import Banner from "@component/banner/Banner";
import useGetSetting from "@hooks/useGetSetting";
import CardTwo from "@component/cta-card/CardTwo";
import OfferCard from "@component/offer/OfferCard";
import StickyCart from "@component/cart/StickyCart";
import Loading from "@component/preloader/Loading";
import ProductServices from "@services/ProductServices";
import ProductCard from "@component/product/ProductCard";
import MainCarousel from "@component/carousel/MainCarousel";
import FeatureCategory from "@component/category/FeatureCategory";
import BlogServices from "@services/BlogServices";
import BlogCard from "@component/blog/BlogCard";
import MainBT from "@component/button/MainBT";
import CMSkeleton from "@component/preloader/CMSkeleton";
import logoGif from "public/logoGif.gif";
import { MdKeyboardDoubleArrowLeft } from "react-icons/md";
import { useTranslations } from "next-intl";
import MinimalTitle from "@component/common/MinimalTitle";
import useUtilsFunction from "@hooks/useUtilsFunction";
import useFilter from "@hooks/useFilter";
import { getI18nProps } from "@utils/i18n";

const Home = ({ popularProducts, discountProducts, blogs, totalBlogs }) => {
  const router = useRouter();
  const { isLoading, setIsLoading, offers } = useContext(SidebarContext);
  const { loading, error, storeCustomizationSetting } = useGetSetting();
  const t = useTranslations();
  const [fakeLoading, setFakeLoading] = useState(false)

  const { showingTranslateValue } = useUtilsFunction();

  // מיון מוצרים פופולריים
  const { productData: sortedPopularProducts } = useFilter(popularProducts);

  // מיון מוצרים בהנחה
  const { productData: sortedDiscountProducts } = useFilter(discountProducts);

  useEffect(() => {
    const fakeLoadingSession = sessionStorage.getItem('fakeLoading');
    if (fakeLoadingSession === 'true') {
      setFakeLoading(true);
    } else {
      // שתי שניות של טעינה מזויפת בפעם הראשונה
      setTimeout(() => {
        setFakeLoading(true);
        sessionStorage.setItem('fakeLoading', 'true');
      }, 100);
    }
  }, []);

  useEffect(() => {
    if (router.asPath === "/") {
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [router]);

  // האזנה לגודל הקרוסלה וקביעת גובה הקונטיינר של המבצעים לאחר מכן
  const carouselRef = useRef(null);
  const [carouselHeight, setCarouselHeight] = useState(0);
  useEffect(() => {
    const updateCarouselHeight = () => {
      if (carouselRef.current) {
        setCarouselHeight(carouselRef.current.offsetHeight);
      }
    };

    if (fakeLoading) {
      updateCarouselHeight();

      const resizeObserver = new ResizeObserver(() => {
        updateCarouselHeight();
      });

      if (carouselRef.current) {
        resizeObserver.observe(carouselRef.current);
      }

      return () => {
        if (carouselRef.current) {
          resizeObserver.unobserve(carouselRef.current);
        }
      };
    }
  }, [fakeLoading, carouselRef.current]);

  if (storeCustomizationSetting?.home?.popular_products_status && popularProducts && discountProducts && Array.isArray(offers) && fakeLoading) {
    return (
      <>
        {isLoading ? (
          <Loading loading={isLoading} />
        ) : (
          <Layout>
            <div className="min-h-screen w-full max-w-full overflow-hidden">
              <div className="3xl:bg-mainColor-superLight bg-white">
                <div className="mx-auto sm:py-5 max-w-screen-2x1 px-3 sm:px-10">
                  <div className="flex flex-col lg:flex-row gap-6 mx-auto py-5 max-w-screen-2xl px-3 sm:px-10">
                    <div ref={carouselRef} className="shrink-0 lg:block w-full lg:w-3/5 h-fit">
                      <MainCarousel />
                    </div>
                    <div className="w-full hidden lg:flex">
                      <OfferCard
                        discountProducts={discountProducts}
                        // קבלת הגובה של הבאנר המתחלף (קרוסלה)
                        height={carouselHeight}
                      />
                    </div>
                  </div>
                  {storeCustomizationSetting?.home?.promotion_banner_status && (
                    <div className="bg-gray-100 px-10 py-6 mt-6">
                      <Banner />
                    </div>
                  )}
                </div>
              </div>

              {/* feature category's */}
              {storeCustomizationSetting?.home?.featured_status && (
                <div className="hidden md:block bg-gray-100 lg:py-12 py-10">
                  <div className="mx-auto max-w-screen-2x1 px-3 sm:px-10">
                    {/* כותרת ותיאור */}
                    {(showingTranslateValue(storeCustomizationSetting?.home?.feature_title) || showingTranslateValue(storeCustomizationSetting?.home?.feature_description)) && (
                      <div className="mb-10 flex justify-center">
                        <div className="text-center w-full lg:w-2/5">
                          <h2 className="text-xl lg:text-2xl mb-2 font-serif font-semibold">
                            <CMSkeleton
                              count={1}
                              height={30}
                              // error={error}
                              loading={loading}
                              data={storeCustomizationSetting?.home?.feature_title}
                            />
                          </h2>
                          <div className="text-base font-sans text-gray-600 leading-6">
                            <CMSkeleton
                              count={4}
                              height={10}
                              error={error}
                              loading={loading}
                              data={
                                storeCustomizationSetting?.home?.feature_description
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <FeatureCategory />
                  </div>
                </div>
              )}

              {/* logos_carousel */}
              {storeCustomizationSetting?.home?.logos_carousel_status && (
                <div className="bg-white lg:py-10 py-3 select-none border-y border-mainColor/20">
                  <div className="mx-auto px-3 sm:px-24">
                    <Swiper
                      modules={[Autoplay]}
                      spaceBetween={30}
                      slidesPerView="auto"
                      loop={true}
                      speed={4000}
                      autoplay={{
                        delay: 0,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                        waitForTransition: false,
                      }}
                      allowTouchMove={false}
                      className="flex items-center"
                    >
                      {storeCustomizationSetting?.home?.logos_carousel?.map((logo, index) => (
                        <SwiperSlide
                          key={index}
                          className="w-auto flex items-center justify-center"
                          style={{ width: "clamp(80px, 10vw, 180px)" }}
                        >
                          <img
                            src={logo}
                            alt={`Logo ${index}`}
                            className="object-contain transition duration-300 select-none"
                            style={{ height: "clamp(40px, 7vw, 70px)" }}
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                </div>
              )}

              {/* popular products */}
              {storeCustomizationSetting?.home?.popular_products_status && (
                <div className="bg-mainColor-superLight lg:pt-10 lg:pb-4 py-4 mx-auto max-w-screen-2xl px-3 sm:px-10">
                  <div className="w-full sm:mb-9 mb-5 bg-white shadow-md rounded-xl p-3 border-s-4 border-b-4 border-mainColor">
                    <CMSkeleton
                      count={1}
                      height={30}
                      error={error}
                      loading={loading}
                      title={storeCustomizationSetting?.home?.popular_title}
                      subTitle={storeCustomizationSetting?.home?.popular_description}
                    // data={popolarTitle.src}
                    // isImage={true}
                    />
                  </div>

                  {/* כרטיסי המוצרים הפופולריים */}
                  <div className="flex">
                    <div className="w-full">
                      {loading ? (
                        <CMSkeleton
                          count={20}
                          height={20}
                          error={error}
                          loading={loading}
                        />
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 md:gap-3 lg:gap-3">
                          {sortedPopularProducts
                            ?.slice(
                              0,
                              storeCustomizationSetting?.home
                                ?.popular_product_limit
                            )
                            .map((product) => (
                              <ProductCard
                                key={product._id}
                                product={product}
                                offers={offers}
                              />
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* promotional banner card */}
              {storeCustomizationSetting?.home?.delivery_status && (
                // <div className="block mx-auto max-w-screen-2xl">
                <div className="w-full">
                  {/* <div className="lg:p-16 p-6 bg-mainColor shadow-sm border rounded-lg"> */}
                  <CardTwo />
                  {/* </div> */}
                </div>
                // </div>
              )}

              {/* discounted products */}
              {storeCustomizationSetting?.home?.discount_product_status &&
                discountProducts?.length > 0 && (
                  <div
                    id="discount"
                    className="bg-mainColor-superLight lg:py-10 py-4 mx-auto max-w-screen-2xl px-3 sm:px-10"
                  >
                    <div className="w-full sm:mb-9 mb-5 bg-white shadow-md rounded-xl p-3 border-s-4 border-b-4 border-mainColor">
                      <CMSkeleton
                        count={1}
                        height={30}
                        error={error}
                        loading={loading}
                        title={storeCustomizationSetting?.home?.latest_discount_title}
                        subTitle={storeCustomizationSetting?.home?.latest_discount_description}
                      // data={popolarTitle.src}
                      // isImage={true}
                      />
                    </div>

                    {/* כרטיסי המוצרים שבמבצע */}
                    <div className="flex">
                      <div className="w-full">
                        {loading ? (
                          <CMSkeleton
                            count={20}
                            height={20}
                            error={error}
                            loading={loading}
                          />
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 md:gap-3 lg:gap-3">
                            {sortedDiscountProducts
                              ?.slice(
                                0,
                                storeCustomizationSetting?.home
                                  ?.latest_discount_product_limit
                              )
                              .map((product, index) => (
                                <ProductCard
                                  key={product._id + index}
                                  product={product}
                                  offers={offers}
                                />
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              {/* Blog Section */}
              {blogs && blogs.length > 0 && (
                <div className="bg-mainColor-light px-3 sm:px-10 md:px-14 lg:px-20 2xl:px-40 py-5">
                  <div className="w-full sm:mb-9 mb-5 bg-white shadow-md rounded-xl p-3 border-s-4 border-b-4 border-mainColor">
                    <MinimalTitle title={t('blogsTitle')} subtitle={t('blogsSubtitle')} />
                  </div>

                  {/* Blog Cards */}
                  <div className="flex overflow-x-auto gap-4 md:gap-6 mb-2 pb-4 scrollbar-hide">
                    <div className="flex gap-4 md:gap-6 min-w-full sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:min-w-0">
                      {blogs.map((blog) => (
                        <div key={blog._id} className="w-80 sm:w-auto shrink-0 sm:shrink flex">
                          <BlogCard blog={blog} isHome={true} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* View All Blogs Button */}
                  {totalBlogs > 3 && (
                    <div className="flex justify-center">
                      <Link href="/blogs">
                        <MainBT className="w-auto! px-6 py-3 text-base">
                          <div className="flex justify-center items-center gap-2">
                            {t('allBlogs')}
                            <MdKeyboardDoubleArrowLeft size={24} className="mt-[3px]" />
                          </div>
                        </MainBT>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Layout>
        )}
      </>
    );
  } else {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {/* <img src={logoGif.src} alt="loading" className="m-auto" /> */}
        <Loading loading={true} />
      </div>
    );
  }
};

export const getServerSideProps = async (context) => {
  const { cookies } = context.req;
  const { query, _id } = context.query;

  const [data, blogsData, i18nProps] = await Promise.all([
    ProductServices.getShowingStoreProducts({
      category: _id ? _id : "",
      title: query ? query : "",
    }),

    BlogServices.getPublishedBlogs({
      page: 1,
      limit: 3,
      category: "",
      tag: ""
    }),

    getI18nProps(context),
  ]);

  const sortedPopularProducts = data.popularProducts;

  // מוצרים עם מבצעי הצעות
  // const sortedDiscountProducts = data.productsWithOffers;

  // מוצרים עם מבצע סתם מחיר זול יותר
  const sortedDiscountProducts = data.discountedProducts;

  return {
    props: {
      popularProducts: sortedPopularProducts,
      discountProducts: sortedDiscountProducts,
      cookies: cookies,
      blogs: blogsData?.blogs || [],
      totalBlogs: blogsData?.totalBlogs || 0,
      ...i18nProps,
    },
  };
};

export default Home;