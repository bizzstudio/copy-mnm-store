// src/layout/footer/FooterTop.js
import React, { useContext, useState, useEffect } from "react";
import Image from "next/image";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useRouter } from "next/router";

// Internal import
import useGetSetting from "@hooks/useGetSetting";
import CMSkeleton from "@component/preloader/CMSkeleton";
import { SidebarContext } from "@context/SidebarContext";
import useUtilsFunction from "@hooks/useUtilsFunction";

const FooterTop = () => {
  const { storeCustomizationSetting, loading: settingLoading } = useGetSetting();
  const { categories, categoriesLoading } = useContext(SidebarContext);
  const { showingTranslateValue, findMainCategory, findSubCategory } = useUtilsFunction();
  const { asPath } = useRouter();

  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentSubCategory, setCurrentSubCategory] = useState(null);

  // זיהוי הקטגוריה הנוכחית לפי הנתיב
  useEffect(() => {
    if (!categoriesLoading && categories && categories[0]?.children) {
      if (asPath.startsWith("/product-category/")) {
        const pathParts = asPath.split("/product-category/")[1].split("/");
        const categoryIdentifier = decodeURIComponent(pathParts[0]);
        const subCategoryIdentifier = pathParts[1] ? decodeURIComponent(pathParts[1]) : null;

        // חיפוש הקטגוריה הראשית לפי slug או שם (fallback)
        const foundCategory = findMainCategory(categories, categoryIdentifier);

        if (foundCategory) {
          setCurrentCategory(foundCategory);

          // אם יש תת-קטגוריה
          if (subCategoryIdentifier) {
            const foundSubCategory = findSubCategory(foundCategory, subCategoryIdentifier);
            setCurrentSubCategory(foundSubCategory);
          } else {
            setCurrentSubCategory(null);
          }
        } else {
          setCurrentCategory(null);
          setCurrentSubCategory(null);
        }
      } else {
        setCurrentCategory(null);
        setCurrentSubCategory(null);
      }
    }
  }, [asPath, categories, categoriesLoading]);

  // בדיקה אם אנחנו בעמוד הבית - אם כן, לא נציג את הקומפוננטה
  if (asPath === "/") {
    return null;
  }

  // הצגת הקטגוריה הנוכחית (תת-קטגוריה אם קיימת, אחרת הקטגוריה הראשית)
  const displayCategory = currentSubCategory || currentCategory;

  // פונקציה לקבלת האייקון המתאים
  const getCategoryIcon = () => {
    if (currentSubCategory) {
      // אם יש תת-קטגוריה, ננסה את האייקון שלה
      if (currentSubCategory.coloredIcon || currentSubCategory.icon) {
        return currentSubCategory.coloredIcon || currentSubCategory.icon;
      }
      // אם אין, נחזיר את האייקון של הקטגוריה הראשית
      if (currentCategory && (currentCategory.coloredIcon || currentCategory.icon)) {
        return currentCategory.coloredIcon || currentCategory.icon;
      }
    } else if (currentCategory) {
      // אם זו קטגוריה ראשית
      if (currentCategory.coloredIcon || currentCategory.icon) {
        return currentCategory.coloredIcon || currentCategory.icon;
      }
    }

    // אם אין אייקון בכלל, נחזיר את הלוגו מה-footer
    return storeCustomizationSetting?.footer?.block4_logo;
  };

  // אם אנחנו לא בעמוד קטגוריה או שאין מידע על הקטגוריה, נציג את התוכן הרגיל
  if (!displayCategory) {
    return null;
    return (
      <div
        id="downloadApp"
        className="bg-mainColor-light py-10 lg:py-16 bg-repeat bg-center overflow-hidden"
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-2 md:gap-3 lg:gap-3 items-center">
            <div className="grow hidden lg:flex md:flex md:justify-items-center lg:justify-start">
              <Image
                src={
                  storeCustomizationSetting?.home?.daily_need_img_left ||
                  "/app-download-img-left.png"
                }
                alt="app download"
                width={270}
                height={270}
              // className="block w-auto"
              />
            </div>
            <div className="text-center">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold font-serif mb-3">
                <CMSkeleton
                  count={1}
                  height={30}
                  loading={settingLoading}
                  data={storeCustomizationSetting?.home?.daily_need_title}
                />
              </h3>
              <p className="text-base opacity-90 leading-7">
                <CMSkeleton
                  count={5}
                  height={10}
                  loading={settingLoading}
                  data={storeCustomizationSetting?.home?.daily_need_description}
                />
              </p>
            </div>
            <div className="md:hidden lg:block">
              <div className="grow hidden lg:flex md:flex lg:justify-end">
                <Image
                  src={
                    storeCustomizationSetting?.home?.daily_need_img_right ||
                    "/app-download-img.png"
                  }
                  width={270}
                  height={270}
                  alt="app download"
                // className="block w-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // אם אין תיאור לקטגוריה – אל תחזיר כלום מהקומפוננטה
  if (
    !categoriesLoading &&
    displayCategory &&
    (!displayCategory.description ||
      !showingTranslateValue(displayCategory.description))
  ) {
    return null;
  }

  // הצגת מידע על הקטגוריה הנוכחית
  return (
    <div
      id="categoryInfo"
      className="bg-mainColor-light py-10 lg:py-16 bg-repeat bg-center overflow-hidden"
    >
      <div className="max-w-screen-2xl mx-auto px-10 sm:px-24">
        <div className="flex flex-col md:flex-row gap-8 md:gap-8 lg:gap-12 xl:gap-16 items-center">
          {/* אייקון הקטגוריה */}
          <div className="flex justify-center md:justify-end">
            {categoriesLoading ? (
              <Skeleton height={200} width={200} className="rounded-full" />
            ) : (
              <div className="relative">
                <Image
                  src={getCategoryIcon() || "/placeholder.png"}
                  alt={showingTranslateValue(displayCategory.name)}
                  width={250}
                  height={250}
                  className="w-full h-full md:max-w-[500px] max-w-[120px] lg:min-w-[300px] md:min-w-[200px] object-contain drop-shadow-xl"
                />
              </div>
            )}
          </div>

          {/* תיאור הקטגוריה */}
          <div className="text-center md:text-start">
            <h2 className="text-3xl lg:text-4xl font-bold font-serif mb-4 text-mainColor-dark">
              {categoriesLoading ? (
                <Skeleton height={40} width="80%" />
              ) : (
                showingTranslateValue(displayCategory.name)
              )}
            </h2>

            <div className="text-base md:text-lg leading-7 opacity-90">
              {categoriesLoading ? (
                <Skeleton count={6} height={20} />
              ) : (
                <p className="whitespace-pre-line">
                  {showingTranslateValue(displayCategory.description)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterTop;
