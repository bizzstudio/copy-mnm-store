// shapira-store/src/component/category/FeatureCategory.js
import Image from "next/image";
import { useContext, useState, Fragment } from "react";
import { IoChevronBackSharp } from "react-icons/io5";
import { IoRemoveSharp } from "react-icons/io5";
import { ChevronDownIcon } from "@heroicons/react/outline";
import Router from "next/router";
import Link from "next/link";
import { Transition } from "@headlessui/react";
import { useTranslations } from "next-intl";

// Internal import
import CMSkeleton from "@component/preloader/CMSkeleton";
import { SidebarContext } from "@context/SidebarContext";
import useUtilsFunction from "@hooks/useUtilsFunction";

const FeatureCategory = () => {
  const { categories } = useContext(SidebarContext);
  const [activePopover, setActivePopover] = useState(null);
  const t = useTranslations();
  const { showingTranslateValue, getCategorySlug } = useUtilsFunction();

  // פונקציה להחזיר אייקונים לפי קטגוריה
  const getCategoryIcon = (category) => {
    return {
      bw: category.icon || "https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png",
      color: category.coloredIcon || category.icon || "https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png"
    };
  };

  // הקטגוריות האמיתיות נמצאות ב-children של הקטגוריה הראשונה (Home)
  const actualCategories = categories?.[0]?.children || [];

  return (
    <div className="container mx-auto">
      {!actualCategories?.length ? (
        <CMSkeleton count={10} height={20} />
      ) : (
        <ul className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {actualCategories?.map((category, i) => {
            const icon = getCategoryIcon(category);
            const title = showingTranslateValue(category?.name);
            const categorySlug = getCategorySlug(category);
            return (
              <li
                onClick={() => Router.push(`/product-category/${categorySlug}`)}
                className="group relative"
                key={category?._id + i}
                title={title}
                onMouseEnter={() => category.children?.length > 0 && setActivePopover(category?._id)}
                onMouseLeave={() => setActivePopover(null)}
              >
                <div className="flex justify-center md:justify-start w-full h-full border border-gray-100 shadow-sm bg-white p-4 cursor-pointer transition duration-200 ease-linear transform group-hover:shadow-lg">
                  <div className="flex sm:flex-row flex-col gap-2 items-center justify-center w-full">
                    <div className="p-2 flex items-center gap-2 group">
                      <div className="relative w-[55px] h-[55px]">
                        <Image
                          src={icon.bw}
                          width={55}
                          height={55}
                          alt="Category BW"
                          className="absolute top-0 left-0 object-contain transition-opacity duration-200 sm:group-hover:opacity-0 sm:block hidden filter-custom-blue"
                        />
                        <Image
                          src={icon.color}
                          width={55}
                          height={55}
                          alt="Category Color"
                          className="absolute top-0 left-0 object-contain opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100"
                        />
                      </div>
                    </div>

                    <div className="sm:pl-4 w-full">
                      <div>
                        <h3 className="text-customBlue font-serif font-medium leading-tight line-clamp-1 group-hover group-hover:text-customRed sm:text-start text-center">
                          {title}
                        </h3>
                      </div>

                      {/* כפתור הצג הכל במקום רשימת תתי קטגוריות */}
                      {category?.children?.length > 0 && (
                        <div className="pt-1 mt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePopover(activePopover === category?._id ? null : category?._id);
                            }}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-customRed-light transition-all duration-150 font-serif"
                          >
                            <span className="text-sm">
                              <ChevronDownIcon
                                className={`w-3 h-3 transition-transform duration-200 ${activePopover === category?._id ? 'rotate-180' : ''
                                  }`}
                              />
                            </span>
                            <span>{t('showAllSubCategories')} ({category.children.length})</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* תפריט נפתח של תתי קטגוריות */}
                <Transition
                  show={activePopover === category?._id && category.children?.length > 0}
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1"
                >
                  <div className="absolute top-full start-0 sm:end-0 z-20 bg-white shadow-lg rounded-b-md ring-1 ring-black ring-opacity-5 w-fit sm:w-auto min-w-full sm:min-w-0">
                    <div className="p-2">
                      <ul className="w-fit sm:w-full">
                        {category.children && category.children.map((child) => {
                          const childSlug = getCategorySlug(child);
                          return (
                            <li key={child._id}>
                              <Link
                                href={`/product-category/${categorySlug}/${childSlug}`}
                                className="p-2 flex items-center gap-1 text-base font-medium text-gray-700 hover:text-customRed hover:bg-gray-100 rounded-md transition-all duration-100"
                                onClick={(e) => e.stopPropagation()}
                              >
                              <span className="text-lg text-gray-500 pe-1">
                                {/* <IoRemoveSharp /> */}
                                •
                              </span>
                              <span className="whitespace-nowrap truncate" title={showingTranslateValue(child?.name)}>
                                {showingTranslateValue(child?.name)}
                              </span>
                            </Link>
                          </li>
                        )})}
                      </ul>
                    </div>
                  </div>
                </Transition>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  );
};

export default FeatureCategory;