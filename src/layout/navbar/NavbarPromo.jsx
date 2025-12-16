// src/layout/navbar/NavbarPromo.jsx
import { Fragment, useState, useEffect, useContext, useRef } from "react";
import Link from "next/link";
import { Transition, Popover } from "@headlessui/react";
import SettingServices from "@services/SettingServices";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { FaAnglesLeft, FaAnglesRight } from "react-icons/fa6";

// Internal import
import { notifyError } from "@utils/toast";
import useGetSetting from "@hooks/useGetSetting";
import { SidebarContext } from "@context/SidebarContext";
import useUtilsFunction from "@hooks/useUtilsFunction";
import Image from "next/image";
import LoginModal from "@component/modal/LoginModal";

const NavbarPromo = ({ logoHeight }) => {
  const [LoginModalOpen, setLoginModalOpen] = useState(false);
  const [activePopover, setActivePopover] = useState(null);
  const { storeCustomizationSetting } = useGetSetting();
  const { categories, categoriesLoading } = useContext(SidebarContext);

  const { showingTranslateValue, getCategorySlug, findMainCategory } = useUtilsFunction();

  const router = useRouter();

  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const handleLanguage = (lang) => {
    Cookies.set("_lang", lang?.iso_code, {
      sameSite: "None",
      secure: true,
    });
  };

  // get language
  useEffect(() => {
    (async () => {
      {
        try {
          const res = await SettingServices.getShowingLanguage();
          // console.log("res", res);
          const result = res?.find((language) => language?.iso_code === "he");
          handleLanguage(result);
        } catch (err) {
          notifyError(err);
          console.log("error on getting lang", err);
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

  const updateScrollArrows = () => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const children = el.children;
    if (!children || children.length === 0) {
      setShowLeftArrow(false);
      setShowRightArrow(false);
      return;
    }

    const containerRect = el.getBoundingClientRect();

    let minLeft = Infinity;
    let maxRight = -Infinity;

    Array.from(children).forEach((child) => {
      const rect = child.getBoundingClientRect();
      minLeft = Math.min(minLeft, rect.left);
      maxRight = Math.max(maxRight, rect.right);
    });

    const threshold = 4;

    // אם יש תוכן שמתחיל לפני תחילת הקונטיינר → יש מה לגלול לשמאל
    setShowLeftArrow(minLeft < containerRect.left - threshold);

    // אם יש תוכן שממשיך אחרי סוף הקונטיינר → יש מה לגלול לימין
    setShowRightArrow(maxRight > containerRect.right + threshold);
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    // בדיקה ראשונית
    updateScrollArrows();

    el.addEventListener("scroll", updateScrollArrows);
    window.addEventListener("resize", updateScrollArrows);

    // לעזור אחרי רנדר / שינוי קטגוריות
    const t1 = setTimeout(updateScrollArrows, 100);
    const t2 = setTimeout(updateScrollArrows, 400);

    return () => {
      el.removeEventListener("scroll", updateScrollArrows);
      window.removeEventListener("resize", updateScrollArrows);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [categories, categoriesLoading]);

  const SCROLL_AMOUNT = 200;

  const scrollRight = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollBy({ left: SCROLL_AMOUNT, behavior: "smooth" });
  };

  const scrollLeft = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollBy({ left: -SCROLL_AMOUNT, behavior: "smooth" });
  };

  return (
    <>
      {LoginModalOpen && (
        <LoginModal modalOpen={LoginModalOpen} setModalOpen={setLoginModalOpen} />
      )}

      <div className={`${asPath === "/" ? "bg-mainColor-superLight" : "bg-white"} 2xl:bg-transparent w-full relative`}>
        <div className="relative w-full sm:ps-20 2xl:!ps-0 md:pe-3 md:pt-2 2xl:pt-0 md:pb-1 2xl:pb-0 flex justify-center lg:justify-between items-center"
        style={{ paddingRight: logoHeight > 0 ? `${logoHeight}px` : '180px' }}>
          {/* קונטיינר גלילה אמיתי */}
          <div className="w-full relative md:pt-2 pt-3 pb-1">
            {/* חץ שמאלה (צד שמאל של המסך) – גולל שמאלה */}
            {showLeftArrow && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-full p-2 transition-all duration-200 drop-shadow-md"
              aria-label="גלול שמאלה"
            >
              <FaAnglesLeft className="w-3 h-3 text-gray-600 left-right-animation" />
            </button>
            )}

            {/* חץ ימינה (צד ימין של המסך) – גולל ימינה */}
            {showRightArrow && (
              <button
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-full p-2 transition-all duration-200 drop-shadow-md"
                aria-label="גלול ימינה"
              >
                <FaAnglesRight className="w-3 h-3 text-gray-600 right-left-animation" />
              </button>
            )}

            <div
              dir="ltr"
              ref={scrollContainerRef}
              className="flex flex-row-reverse justify-between lg:justify-center w-full scrollbar-hide 2xl:gap-8 xl:gap-6 lg:gap-4 gap-3 sm:overflow-visible overflow-x-auto"
              style={{
                scrollbarWidth: "none", // Firefox
                msOverflowStyle: "none", // IE/Edge
              }}
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
                      className="relative"
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
                        className={`px-2 flex flex-col items-center xl:gap-2 md:gap-1 gap-0 rounded-md transform transition duration-300 hover:scale-105 hover:text-mainColor-dark ${selectedCategory == index ? "scale-105" : ""
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
                              className="object-cover overflow-visible 2xl:w-[67px] 2xl:h-[67px] xl:w-[50px] xl:h-[50px] lg:w-[45px] lg:h-[45px] md:w-[40px] md:h-[40px] sm:w-[35px] sm:h-[35px] w-[35px] h-[35px]"
                            />
                          ) : (
                            <Image
                              src={category.icon}
                              width={130}
                              height={130}
                              alt="Category"
                              className="object-cover overflow-visible 2xl:w-[67px] 2xl:h-[67px] xl:w-[50px] xl:h-[50px] lg:w-[45px] lg:h-[45px] md:w-[40px] md:h-[40px] sm:w-[35px] sm:h-[35px] w-[35px] h-[35px] opacity-90"
                            />
                          )
                        ) : (
                          <Image
                            src="https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png"
                            width={400}
                            height={400}
                            alt="category"
                            className="object-cover overflow-visible 2xl:w-[67px] 2xl:h-[67px] xl:w-[50px] xl:h-[50px] lg:w-[45px] lg:h-[45px] md:w-[40px] md:h-[40px] sm:w-[35px] sm:h-[35px] w-[35px] h-[35px]"
                          />
                        )}

                        <div
                          className={`inline-flex items-center justify-center text-center 2xl:text-[20px] xl:text-[18px] lg:text-[18px] md:text-[16px] sm:text-[16px] text-[15px] font-light w-full whitespace-nowrap ${selectedCategory == index ? "text-mainColor-dark" : ""
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
                        <div className="fixed sm:absolute top-[137px] sm:top-[105%] left-1/2 sm:left-auto sm:end-0 -translate-x-1/2 sm:translate-x-0 z-20 min-w-[200px] bg-white shadow-lg rounded-md ring-1 ring-black ring-opacity-5"  
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
