// src/pages/product-category/[categoryName].jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
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
import {
  weightContextFromCategoryTree,
  categoryPathHintsFromAsPath,
} from "@utils/productSoldByWeight";

/** קבוצת מוצרים תחת תת-קטגוריה אחת */
const SubCategoryGroup = ({ sub, products, offers, listCategoryContext, showingTranslateValue }) => {
    const [visible, setVisible] = useState(24);
    const subName = sub ? showingTranslateValue(sub.name) : null;

    return (
        <div className="mb-8">
            {subName && (
                <div className="mb-3 px-1">
                    <h2 className="text-lg font-bold font-serif text-gray-700 border-b-2 border-mainColor pb-1 inline-block">
                        {subName}
                    </h2>
                </div>
            )}
            <div
                className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 gap-2 md:gap-3 lg:gap-3 ${products.length < 6 ? "justify-center" : ""}`}
                style={{
                    gridTemplateColumns:
                        typeof window !== "undefined" && window.innerWidth < 350
                            ? `repeat(1, minmax(150px, 1fr))`
                            : typeof window !== "undefined" && window.innerWidth < 640
                            ? `repeat(2, minmax(150px, 1fr))`
                            : products.length < 6
                            ? `repeat(${Math.min(products.length, 6)}, minmax(150px, 235px))`
                            : "",
                }}
            >
                {products.slice(0, visible).map((product, i) => (
                    <ProductCard
                        key={i + 1}
                        product={product}
                        offers={offers}
                        listCategoryContext={listCategoryContext}
                    />
                ))}
            </div>
            {products.length > visible && (
                <div className="w-full flex justify-center mt-4">
                    <MainBT
                        onClick={() => setVisible((prev) => prev + 24)}
                        className="w-auto! px-6"
                    >
                        הצג עוד
                    </MainBT>
                </div>
            )}
        </div>
    );
};

const CategoryPage = ({ products }) => {
    const t = useTranslations();
    const { isLoading, setIsLoading, offers, categories, categoriesLoading } = useContext(SidebarContext);
    const router = useRouter();
    const { categoryName } = router.query;
    const { showingTranslateValue, findMainCategory } = useUtilsFunction();

    const currentCategory = findMainCategory(categories, categoryName);

    const displayCategoryName = currentCategory
        ? showingTranslateValue(currentCategory.name)
        : categoryName;

    useEffect(() => {
        setIsLoading(false);
    }, [products]);

    const { setSortedField, productData, sortedField } = useFilter(products);

    const categorySlugParam = Array.isArray(categoryName) ? categoryName[0] : categoryName;
    const displayNameStr =
        displayCategoryName != null && String(displayCategoryName).trim() !== ""
            ? String(displayCategoryName)
            : "";
    const pathHints = useMemo(
        () => categoryPathHintsFromAsPath(router.asPath),
        [router.asPath]
    );
    const listCategoryContext = useMemo(
        () =>
            weightContextFromCategoryTree(
                [currentCategory],
                [categorySlugParam, displayNameStr, ...pathHints]
            ).trim(),
        [currentCategory, categorySlugParam, displayNameStr, pathHints]
    );

    // חלוקת המוצרים לפי תת-קטגוריות
    const subcategories = useMemo(
        () => currentCategory?.children || [],
        [currentCategory]
    );

    const groupedProducts = useMemo(() => {
        if (!productData?.length || !subcategories.length) return [];

        const assignedIds = new Set();
        const groups = [];

        for (const sub of subcategories) {
            const subId = String(sub._id);
            const subProducts = productData.filter((p) => {
                // בדיקה ב-category יחיד
                if (p.category) {
                    const catId =
                        typeof p.category === "object"
                            ? String(p.category._id)
                            : String(p.category);
                    if (catId === subId) return true;
                }
                // בדיקה ב-categories (מערך)
                if (Array.isArray(p.categories)) {
                    return p.categories.some((cat) => {
                        const catId =
                            cat && typeof cat === "object"
                                ? String(cat._id)
                                : cat
                                ? String(cat)
                                : null;
                        return catId === subId;
                    });
                }
                return false;
            });
            if (subProducts.length > 0) {
                subProducts.forEach((p) => assignedIds.add(p._id));
                groups.push({ sub, products: subProducts });
            }
        }

        // מוצרים שלא שויכו לאף תת-קטגוריה — מוצגים תחת כותרת "כלל המוצרים"
        const unassigned = productData.filter((p) => !assignedIds.has(p._id));
        if (unassigned.length > 0) {
            groups.push({ sub: { _id: "__unassigned__", name: { he: "כלל המוצרים", en: "All Products" } }, products: unassigned });
        }

        return groups;
    }, [productData, subcategories]);

    // אם אין תת-קטגוריות — מוצגים כל המוצרים ב-grid אחד (התנהגות מקורית)
    const hasSubGroups = groupedProducts.some((g) => g.sub !== null);
    // ממתינים לטעינת הקטגוריות לפני שמחליטים על מצב תצוגה
    const groupingReady = !categoriesLoading;

    return (
        <Layout
            title={displayCategoryName}
            description={`גלו את מגוון המוצרים בקטגוריית ${displayCategoryName}. איכות מובטחת, מחירים מעולים ומשלוח מהיר.`}
        >
            <div className="mx-auto max-w-screen-2xl px-3 sm:px-10">
                <div className="flex py-5">
                    <div className="flex w-full">
                        <div className="w-full">
                            <div className="my-3 bg-white shadow-md rounded-xl p-3 border-s-4 border-b-4 border-mainColor">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                                    <MinimalTitle title={displayCategoryName} />
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                        <h6 className="text-sm font-serif text-right">
                                            {t("totalI")}{" "}
                                            <span className="font-bold">{productData?.length}</span>{" "}
                                            {t("itemsFound")}
                                        </h6>

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
                                        {t("sorryText")}
                                    </h2>
                                </div>
                            )}

                            {isLoading ? (
                                <Loading loading={isLoading} />
                            ) : !groupingReady ? (
                                <Loading loading={true} />
                            ) : hasSubGroups ? (
                                // תצוגה מחולקת לפי תת-קטגוריות
                                groupedProducts.map((group, groupIdx) => (
                                    <SubCategoryGroup
                                        key={groupIdx}
                                        sub={group.sub}
                                        products={group.products}
                                        offers={offers}
                                        listCategoryContext={listCategoryContext}
                                        showingTranslateValue={showingTranslateValue}
                                    />
                                ))
                            ) : (
                                // תצוגה רגילה ללא תת-קטגוריות
                                <FlatProductGrid
                                    products={productData}
                                    offers={offers}
                                    listCategoryContext={listCategoryContext}
                                    loadMoreLabel={t("loadMoreBtn")}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

/** grid רגיל ללא חלוקה לתת-קטגוריות */
const FlatProductGrid = ({ products, offers, listCategoryContext, loadMoreLabel }) => {
    const [visibleProduct, setVisibleProduct] = useState(24);

    return (
        <>
            <div
                className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 gap-2 md:gap-3 lg:gap-3 ${products?.length < 6 ? "justify-center" : ""}`}
                style={{
                    gridTemplateColumns:
                        typeof window !== "undefined" && window.innerWidth < 350
                            ? `repeat(1, minmax(150px, 1fr))`
                            : typeof window !== "undefined" && window.innerWidth < 640
                            ? `repeat(2, minmax(150px, 1fr))`
                            : products?.length < 6
                            ? `repeat(${Math.min(products?.length, 6)}, minmax(150px, 235px))`
                            : "",
                }}
            >
                {products?.slice(0, visibleProduct).map((product, i) => (
                    <ProductCard
                        key={i + 1}
                        product={product}
                        offers={offers}
                        listCategoryContext={listCategoryContext}
                    />
                ))}
            </div>

            {products?.length > visibleProduct && (
                <div className="w-full flex justify-center mt-5">
                    <MainBT
                        onClick={() => setVisibleProduct((pre) => pre + 36)}
                        className="w-auto! px-6"
                    >
                        {loadMoreLabel}
                    </MainBT>
                </div>
            )}
        </>
    );
};

export default CategoryPage;

export const getServerSideProps = async (context) => {
    const { cookies } = context.req;
    const { categoryName } = context.query;
    const userToken = getUserTokenFromCookies(cookies);

    const data = await ProductServices.getShowingStoreProducts({
        category: categoryName,
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
