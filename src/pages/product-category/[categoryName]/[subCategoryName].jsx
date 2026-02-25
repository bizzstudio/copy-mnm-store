// src/pages/product-category/[categoryName]/[subCategoryName].jsx
import React, { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

// Internal import
import Layout from "@layout/Layout";
import useFilter from "@hooks/useFilter";
import ProductServices from "@services/ProductServices";
import ProductCard from "@component/product/ProductCard";
import { SidebarContext } from "@context/SidebarContext";
import Loading from "@component/preloader/Loading";
import { useRouter } from "next/router";
import MinimalTitle from "@component/common/MinimalTitle";
import MainBT from "@component/button/MainBT";
import SortDropdown from "@component/common/SortDropdown";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { getI18nProps } from "@utils/i18n";
import { getUserTokenFromCookies } from "@utils/getUserTokenFromCookies";

const SubCategoryPage = ({ products }) => {
    const t = useTranslations();
    const { isLoading, setIsLoading, offers, categories } = useContext(SidebarContext);
    const [visibleProduct, setVisibleProduct] = useState(24);
    const router = useRouter();
    const { categoryName, subCategoryName } = router.query; // אלו יכולים להיות slugs או שמות
    const { showingTranslateValue, findMainCategory, findSubCategory } = useUtilsFunction();

    // מציאת הקטגוריה הראשית לפי slug או שם
    const currentCategory = findMainCategory(categories, categoryName);

    // מציאת תת-הקטגוריה לפי slug או שם
    const currentSubCategory = findSubCategory(currentCategory, subCategoryName);

    // שמות להצגה
    const displayCategoryName = currentCategory
        ? showingTranslateValue(currentCategory.name)
        : categoryName;

    const displaySubCategoryName = currentSubCategory
        ? showingTranslateValue(currentSubCategory.name)
        : subCategoryName;

    useEffect(() => {
        setIsLoading(false);
    }, [products]);

    const { setSortedField, productData, sortedField } = useFilter(products);

    return (
        <Layout title={`${displayCategoryName} - ${displaySubCategoryName}`}
            description={`גלו את מגוון המוצרים בקטגוריה ${displayCategoryName} - ${displaySubCategoryName}. איכות מובטחת, מחירים מעולים ומשלוח מהיר.`}>
            <div className="mx-auto max-w-screen-2xl px-3 sm:px-10">
                <div className="flex py-5">
                    <div className="flex w-full">
                        <div className="w-full">
                            <div className="my-3 bg-white shadow-md rounded-xl p-3 border-s-4 border-b-4 border-mainColor">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                                    <MinimalTitle title={displayCategoryName} subtitle={displaySubCategoryName} />
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                        <h6 className="text-sm font-serif text-right">
                                            {t('totalI')}{" "}
                                            <span className="font-bold">{productData?.length}</span>{" "}
                                            {t('itemsFound')}
                                        </h6>

                                        {/* הוספת רכיב המיון */}
                                        {productData?.length > 0 && (
                                            <div className="flex justify-center sm:justify-end">
                                                <SortDropdown
                                                    sortedField={sortedField}
                                                    setSortedField={setSortedField}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {productData?.length === 0 && (
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
                            )}

                            {isLoading ? (
                                <Loading loading={isLoading} />
                            ) : (
                                <>
                                    <div
                                        className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 gap-2 md:gap-3 lg:gap-3 ${productData?.length < 6 ? 'justify-center' : ''}`}
                                        style={{
                                            gridTemplateColumns:
                                                window.innerWidth < 350 ?
                                                    `repeat(1, minmax(150px, 1fr))`
                                                    : window.innerWidth < 640
                                                        ? `repeat(2, minmax(150px, 1fr))`
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
                                        <div className="w-full flex justify-center mt-5">
                                            <MainBT
                                                onClick={() => setVisibleProduct((pre) => pre + 36)}
                                                className="w-auto! px-6"
                                            >
                                                {t('loadMoreBtn')}
                                            </MainBT>
                                        </div>
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

export default SubCategoryPage;

export const getServerSideProps = async (context) => {
    const { cookies } = context.req;
    const { subCategoryName } = context.query;
    const userToken = getUserTokenFromCookies(cookies);

    const data = await ProductServices.getShowingStoreProducts({
        category: subCategoryName,
        token: userToken,
    });

    const i18nProps = await getI18nProps(context);

    return {
        props: {
            products: data?.products,
            ...i18nProps,
        },
    };
};
