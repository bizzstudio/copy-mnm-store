// src/layout/navbar/NavbarPromo.jsx
import { Fragment, useState, useEffect, useContext } from "react";
import Link from "next/link";
import { Transition } from "@headlessui/react";
import SettingServices from "@services/SettingServices";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

// Internal import
import useGetSetting from "@hooks/useGetSetting";
import { SidebarContext } from "@context/SidebarContext";
import useUtilsFunction from "@hooks/useUtilsFunction";
import Image from "next/image";

const NavbarPromo = () => {
  const router = useRouter();
  const [activePopover, setActivePopover] = useState(null);
  const { storeCustomizationSetting } = useGetSetting();
  const { categories, categoriesLoading } = useContext(SidebarContext);

  const { showingTranslateValue, getCategorySlug, findMainCategory } = useUtilsFunction();

  const handleLanguage = (lang) => {
    Cookies.set("_lang", lang?.iso_code, {
      sameSite: "None",
      secure: true,
    });
  };

  // get language – אם ה־API נכשל (404), משאירים עברית כברירת מחדל בלי להציף הודעות
  useEffect(() => {
    (async () => {
      try {
        const res = await SettingServices.getShowingLanguage();
        const result = res?.find((language) => language?.iso_code === "he");
        handleLanguage(result);
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.warn("error on getting lang", err);
        }
        // כברירת מחדל: עברית (handleLanguage עם undefined לא משנה כלום, אז נגדיר ידנית)
        if (!Cookies.get("_lang")) {
          handleLanguage({ iso_code: "he" });
        }
      }
    })();
  }, []);

  const [isHover, setIsHover] = useState(null);
  const categoriesLength = categories[0]?.children?.length;
  useEffect(() => {
    setIsHover(categoriesLength + 1)
  }, [categories])

  const [selectedCategory, setSelectedCategory] = useState(null);
  const { asPath } = router; // כאן נשתמש ב-asPath כדי לגשת לנתיב המלא

  // set selected category
  useEffect(() => {
    if (asPath.startsWith("/product-category/")) {
      const pathParts = asPath.split("/product-category/")[1].split("/");
      const categoryIdentifier = decodeURIComponent(pathParts[0]);

      // חיפוש הקטגוריה לפי slug או שם (fallback)
      const foundCategory = findMainCategory(categories, categoryIdentifier);

      if (foundCategory) {
        const index = categories[0]?.children?.indexOf(foundCategory);
        setSelectedCategory(index !== -1 ? index : null);
      }
    } else if (asPath === "/offers") {
      setSelectedCategory(categoriesLength);
    } else {
      setSelectedCategory(null);
    }
  }, [asPath, categories]);

  /**
   * גודל קטגוריות בשורת הניו העליונה (אייקון + טקסט + ריווח בין פריטים).
   * להגדלה/הקטנה: עדכן את המחרוזות כאן בלבד — אין צורך לחפש בכל הקובץ.
   */
  const categoryNavIconClass =
    "object-cover overflow-visible xl:w-[72px] xl:h-[72px] lg:w-[68px] lg:h-[68px] md:w-[60px] md:h-[60px] sm:w-[54px] sm:h-[54px] w-[48px] h-[48px] -mb-[5px]";
  const categoryNavLabelClass =
    "inline-flex items-center justify-center text-center xl:text-[17px] lg:text-[17px] md:text-[16px] sm:text-[15px] text-[14px] font-light w-full whitespace-nowrap pb-1";

  return (
    <>
      <div className={`${asPath === "/" ? "bg-mainColor-superLight" : "bg-white"} w-full relative`}>
        <div className="relative w-full px-2 sm:px-4 md:pe-3 md:pt-1.5 md:pb-1 flex justify-center items-start">
          {/* קטגוריות בשורה/שתיים עם wrap — בלי גלילה ובלי חצים */}
          <div className="w-full flex justify-center py-1.5">
            <div
              dir="ltr"
              className="flex flex-row-reverse flex-wrap justify-center content-start items-start w-full gap-x-2 gap-y-1.5 sm:gap-x-2.5 lg:gap-x-3 xl:gap-x-4"
            >
              {storeCustomizationSetting?.navbar?.categories_menu_status &&
                !categoriesLoading &&
                categories &&
                categories[0]?.children?.map((category, index) => {
                  const title = showingTranslateValue(category?.name);
                  const categorySlug = getCategorySlug(category);

                  return (
                    <div
                      key={category._id}
                      className="relative shrink-0"
                      onMouseEnter={() =>
                        category.children?.length > 0 &&
                        setActivePopover(category._id)
                      }
                      onMouseLeave={() => setActivePopover(null)}
                    >
                      <Link
                        onMouseEnter={() => setIsHover(index)}
                        onMouseLeave={() => setIsHover(null)}
                        href={"/product-category/" + categorySlug}
                        className={`px-1.5 flex flex-col items-center rounded-md transform transition duration-300 hover:scale-105 hover:text-mainColor-dark ${selectedCategory == index ? "scale-105" : ""
                          }`}
                        role="button"
                      >
                        {category.icon ? (
                          isHover == index || selectedCategory == index ? (
                            <Image
                              src={category.coloredIcon}
                              width={130}
                              height={130}
                              alt="Category"
                              className={categoryNavIconClass}
                            />
                          ) : (
                            <Image
                              src={category.icon}
                              width={130}
                              height={130}
                              alt="Category"
                              className={`${categoryNavIconClass} opacity-90`}
                            />
                          )
                        ) : (
                          <Image
                            src="https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png"
                            width={400}
                            height={400}
                            alt="category"
                            className={categoryNavIconClass}
                          />
                        )}

                        <div
                          className={`${categoryNavLabelClass} ${selectedCategory == index ? "text-mainColor-dark" : ""
                            }`}
                        >
                          {title}
                        </div>
                      </Link>

                      {/* Dropdown for subcategories */}
                      <Transition
                        show={
                          activePopover === category._id &&
                          category.children?.length > 0
                        }
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                      >
                        <div className="absolute top-full left-1/2 sm:left-auto sm:end-0 -translate-x-1/2 sm:translate-x-0 z-20 mt-1 min-w-[200px] bg-white shadow-lg rounded-md ring-1 ring-black ring-opacity-5"
                        >
                          <ul dir="rtl">
                            {category.children &&
                              category.children.map((subCategory) => {
                                const subCategorySlug =
                                  getCategorySlug(subCategory);
                                return (
                                  <li key={subCategory._id}>
                                    <Link
                                      href={`/product-category/${categorySlug}/${subCategorySlug}`}
                                      className="px-2 py-1 flex items-center gap-1 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-100 rounded-md transition-all duration-100"
                                    >
                                      <span className="text-lg text-gray-500 pe-1">
                                        •
                                      </span>
                                      <span className="whitespace-nowrap">
                                        {showingTranslateValue(
                                          subCategory.name
                                        )}
                                      </span>
                                    </Link>
                                  </li>
                                );
                              })}
                          </ul>
                        </div>
                      </Transition>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NavbarPromo;