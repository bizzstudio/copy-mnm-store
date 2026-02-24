// src/pages/search.jsx
import React, { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

// Internal import
import Layout from "@layout/Layout";
import useFilter from "@hooks/useFilter";
import Card from "@component/cta-card/Card";
import ProductServices from "@services/ProductServices";
import ProductCard from "@component/product/ProductCard";
import CategoryCarousel from "@component/carousel/CategoryCarousel";
import { SidebarContext } from "@context/SidebarContext";
import Loading from "@component/preloader/Loading";
import { useRouter } from "next/router";
import { getI18nProps } from "@utils/i18n";

const Search = ({ products }) => {
  const t = useTranslations();
  const { isLoading, setIsLoading, offers } = useContext(SidebarContext);
  const [visibleProduct, setVisibleProduct] = useState(24);
  const [isCategory, setIsCategory] = useState(false);
  const [category, setCategory] = useState('');
  const router = useRouter();
  const { query } = router;

  useEffect(() => {
    setIsLoading(false);
  }, [products]);

  const { productData } = useFilter(products);

  return (
    <Layout
      title={query?.query ? `${t('search')}: ${query.query}` : t('search')}
      description={t('searchDescription')}
    >
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-10">
        <div className="flex py-5">
          <div className="flex w-full">
            <div className="w-full">
              {/* <div className="w-full grid grid-col gap-4 grid-cols-1 2xl:gap-6 xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-2">
                <Card />
              </div> */}
              {/* <div className="relative">
                <CategoryCarousel />
              </div> */}
              {productData?.length === 0 ? (
                <div className="flex flex-col items-center text-center align-middle mx-auto p-5 my-5">
                  <Image
                    className="my-4"
                    src="/no-result.svg"
                    alt="no-result"
                    width={400}
                    height={380}
                  />
                  <h2 className="text-lg md:text-xl lg:text-2xl xl:text-2xl text-center mt-2 font-medium font-serif text-gray-600">
                    {t('sorryText')}
                  </h2>
                </div>
              ) : (
                isCategory ?
                  <img src={category} alt={query?.category || ''} className="h-24 mx-auto animate-fadeIn" /> :
                  <div className="flex justify-between my-3 bg-mainColor-light border border-gray-100 rounded p-3">
                    <h6 className="text-sm font-serif">
                      {t('totalI')}{" "}
                      <span className="font-bold">{productData?.length}</span>{" "}
                      {t('itemsFound')}
                    </h6>
                    {/* מיון על פי מחיר, כרגע בהערה */}
                    {/* <span className="text-sm font-serif">
                    <select
                      onChange={(e) => setSortedField(e.target.value)}
                      className="py-0 text-sm font-serif font-medium block w-full rounded border-0 bg-white pr-10 cursor-pointer focus:ring-0"
                    >
                      <option className="px-3" value="All" defaultValue hidden>
                        {t('sortByPrice')}
                      </option>
                      <option className="px-3" value="Low">
                        {t('lowToHigh')}
                      </option>
                      <option className="px-3" value="High">
                        {t('highToLow')}
                      </option>
                    </select>
                  </span> */}
                  </div>
              )}

              {isLoading ? (
                <Loading loading={isLoading} />
              ) : (
                <>
                  <div
                    // className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 gap-2 md:gap-3 lg:gap-3"
                    className={`grid grid-cols-1 xss:grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 gap-2 md:gap-3 lg:gap-3 ${productData?.length < 6 ? 'justify-center' : ''
                      }`}
                    style={{
                      gridTemplateColumns: window.innerWidth < 350 ?
                        `repeat(1, minmax(150px, 1fr))`
                        : window.innerWidth < 640
                          ? `repeat(2, minmax(150px, 1fr))` // למסכים קטנים תמיד יהיה repeat של 2
                          : productData?.length < 6
                            ? `repeat(${Math.min(productData?.length, 6)}, minmax(150px, 235px))`
                            : '',
                    }}
                  >

                    {productData?.slice(0, visibleProduct).map((product, i) => (
                      <ProductCard
                        key={i + 1}
                        product={product}
                        offers={offers}
                      />
                    ))}
                  </div>

                  {productData?.length > visibleProduct && (
                    <button
                      onClick={() => setVisibleProduct((pre) => pre + 36)}
                      // className="w-auto mx-auto md:text-sm leading-5 flex items-center transition ease-in-out duration-300 font-medium text-center justify-center border-0 border-transparent rounded-md focus-visible:outline-none focus:outline-none bg-indigo-100 text-gray-700 px-5 md:px-6 lg:px-8 py-2 md:py-3 lg:py-3 hover:text-white hover:bg-mainColor-dark h-12 mt-6 text-sm lg:text-sm "
                      className="w-auto mx-auto mt-6 flex items-center gap-2 font-semibold cursor-pointer transition-all bg-mainColor text-white px-6 py-1.5 h-11 rounded-lg border-mainColor-dark border-b-4 hover:brightness-110 hover:-translate-y-px hover:border-b-[6px] active:border-b-2 active:brightness-90 active:translate-y-[2px]"
                    >
                      {t('loadMoreBtn')}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Search;

export const getServerSideProps = async (context) => {
  const { query, _id } = context.query;

  const data = await ProductServices.getShowingStoreProducts({
    category: _id ? _id : "",
    title: query ? query : "",
  });

  const i18nProps = await getI18nProps(context);

  return {
    props: {
      products: data?.products,
      ...i18nProps,
    },
  };
};

// export const getServerSideProps = async (context) => {
//   const { query } = context.query;
//   const { Category } = context.query;
//   const { category } = context.query;
//   const data = await ProductServices.getShowingProducts();

//   let products = [];
//   //service filter with parent category
//   if (Category) {
//     products = data.filter(
//       (product) => product.parent.toLowerCase().replace("&", "").split(" ").join("-") === Category
//     );
//   }
//   //service filter with child category
//   if (category) {
//     products = data.filter(
//       (product) => product.children.toLowerCase().replace("&", "").split(" ").join("-") === category
//     );
//   }

//   //search result
//   if (query) {
//     products = data.filter((product) => product.title.toLowerCase().includes(query.toLowerCase()));
//   }

//   return {
//     props: {
//       products,
//     },
//   };
// };