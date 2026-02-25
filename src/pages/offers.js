// src/pages/offers.js
import { SidebarContext } from "@context/SidebarContext";
import { useContext, useEffect } from "react";

// Internal import
import Layout from "@layout/Layout";
import useGetSetting from "@hooks/useGetSetting";
import Loading from "@component/preloader/Loading";
import ProductServices from "@services/ProductServices";
import ProductCard from "@component/product/ProductCard";
import AttributeServices from "@services/AttributeServices";
import CMSkeleton from "@component/preloader/CMSkeleton";
import { getI18nProps } from "@utils/i18n";
import { getUserTokenFromCookies } from "@utils/getUserTokenFromCookies";

const Offers = ({ discountProducts, attributes }) => {
  const { isLoading, setIsLoading, offers } = useContext(SidebarContext);
  const { loading, error, storeCustomizationSetting } = useGetSetting();

  useEffect(() => {
    setIsLoading(false);
  }, [discountProducts]);

  return (
    <>
      {isLoading ? (
        <Loading loading={isLoading} />
      ) : (
        <Layout title="מבצעים והנחות - MNM יבוא שיווק והפצה" description="גלו את המבצעים וההנחות המיוחדות שלנו על תמרים ומוצרי טבע. מחירים מוזלים, הצעות מיוחדות ואיכות מובטחת.">
          <div className="min-h-screen">
            {/* discounted products */}
            {storeCustomizationSetting?.home?.discount_product_status &&
              discountProducts?.length > 0 && (
                <div
                  id="discount"
                  className="bg-mainColor-superLight lg:py-10 py-10 mx-auto max-w-screen-2xl px-3 sm:px-10"
                >
                  <div className="mb-10 flex justify-center">
                    <div className="text-center w-full lg:w-2/5">
                      <h2 className="text-xl lg:text-2xl mb-2 font-serif font-semibold">
                        {/* <CMSkeleton
                          count={1}
                          height={30}
                          // error={error}
                          loading={loading}
                          // data={
                          //   storeCustomizationSetting?.home
                          //     ?.latest_discount_title
                          // }
                          data={ourOffers.src}
                          isImage={true}
                        /> */}
                      </h2>
                      <div className="text-base font-sans text-gray-600 leading-6">
                        <CMSkeleton
                          count={5}
                          height={20}
                          // error={error}
                          loading={loading}
                          data={
                            storeCustomizationSetting?.home
                              ?.latest_discount_description
                          }
                        />
                      </div>
                    </div>
                  </div>
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
                        <div className="grid grid-cols-1 xss:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 md:gap-3 lg:gap-3">
                          {discountProducts.map((product) => (
                            <ProductCard
                              key={product._id}
                              product={product}
                              attributes={attributes}
                              offers={offers}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
          </div>
        </Layout>
      )}
    </>
  );
};

export const getServerSideProps = async (context) => {
  // return {
  //   notFound: true,
  // };

  const { cookies } = context.req;
  const { query, _id } = context.query;
  const userToken = getUserTokenFromCookies(cookies);

  const [i18nProps, data, attributes] = await Promise.all([
    getI18nProps(context),
    ProductServices.getShowingStoreProducts({
      category: _id ? _id : "",
      title: query ? query : "",
      token: userToken,
    }),
    AttributeServices.getShowingAttributes(),
  ]);

  // שינוי המוצרים במבצע למוצרים עם מבצעי הצעות במקום מבצעים של סתם מחיר זול יותר
  const sortedDiscountProducts = data.productsWithOffers;
  // const sortedDiscountProducts = sortProducts(data.productsWithOffers);
  // const sortedDiscountProducts = sortProducts(data.discountedProducts);

  return {
    props: {
      discountProducts: sortedDiscountProducts,
      cookies: cookies,
      attributes,
      ...i18nProps,
    },
  };
};

export default Offers;
