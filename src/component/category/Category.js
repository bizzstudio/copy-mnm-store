// src/component/category/Category.js
import { useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import { IoClose } from "react-icons/io5";
import { useTranslations } from "next-intl";

// Internal import
import { pages } from "@utils/data";
import { SidebarContext } from "@context/SidebarContext";
import Loading from "@component/preloader/Loading";
import CategoryCard from "./CategoryCard";
import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { UserContext } from "@context/UserContext";

const Category = ({ onLinkClick, onClose }) => {
  const {
    categoryDrawerOpen,
    categories,
    setIsLoading,
    isLoading
  } = useContext(SidebarContext);
  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();
  const t = useTranslations();

  const { state: { userInfo } } = useContext(UserContext);

  // console.log('categoies :>> ', categories);

  return (
    <div className="flex flex-col w-full h-full bg-mainColor-superLight overflow-y-auto">
      {categoryDrawerOpen && (
        <div className="w-full flex flex-col justify-center items-center">
          {/* לוגו וכפתור סגירה */}
          <div className="w-full flex justify-between items-center px-6 py-2 text-white bg-white">
            {/* <h2 className="font-semibold font-serif text-lg m-0 text-heading flex align-center">
              <Link
                href="/"
                className="ms-2"
                rel="noreferrer"
              >
                <Image
                  width={100}
                  height={10}
                  src={
                    storeCustomizationSetting?.footer?.block4_logo ||
                    "/logo/logo-color.svg"
                  }
                  alt="logo"
                  className="w-full"
                />
              </Link>
            </h2> */}
            <button
              onClick={onClose}
              className="absolute left-4 top-4 z-10 inline-flex justify-center px-2 py-2 text-base font-medium text-white bg-mainColor border-none rounded-full outline-offset-1 outline-8 outline-white"
              aria-label="close"
            >
              <IoClose />
            </button>
          </div>

          {/* כותרת קטגוריות */}
          <div className="w-full h-12 mb-3 flex gap-1.5 px-8 py-1 bg-white drop-shadow-lg overflow-visible">
            <Image
              width={60}
              height={60}
              src={storeCustomizationSetting?.navbar?.logo}
              alt="logo"
              className="object-contain h-[60px] w-[60px]"
            />
            <h2 className="font-semibold font-serif text-xl mt-3 text-heading">
              {showingTranslateValue(storeCustomizationSetting?.navbar?.categories)}
            </h2>
          </div>
        </div>
      )}

      <div className="w-full max-h-full">
        {/* קטגוריות */}
        {!categories ? (
          <Loading loading />
        ) : (
          <div className="relative grid gap-2 px-10 py-4">
            {/* הצגת כל הקטגוריות הראשיות */}
            {categories.map((category) => (
              <CategoryCard
                key={category._id}
                id={category._id}
                icon={null}
                nested={category.children} // תתי קטגוריות
                title={category.name}
                onLinkClick={onLinkClick}
                onClose={onClose}
              />
            ))}
          </div>
        )}

        {categoryDrawerOpen && (
          <div className="relative mt-5 border-t border-mainColor-light">
            {/* כותרת עמודים */}
            <div className="w-full h-12 mb-3 flex gap-1.5 px-8 py-1 bg-white drop-shadow-lg overflow-visible">
              <Image
                width={60}
                height={60}
                src={storeCustomizationSetting?.navbar?.logo}
                alt="logo"
                className="object-contain h-[60px] w-[60px]"
              />
              <h2 className="font-semibold font-serif text-xl mt-3 text-heading">
                {t('Pages')}
              </h2>
            </div>

            {/* עמודים */}
            <div className="relative grid gap-1 px-10 py-4">
              {pages.filter((item) => {
                if (!userInfo) {
                  return item.title !== "PersonalArea";
                } else {
                  return true;
                }
              }).map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  onClick={onClose} // סוגר את התפריט לפני הניווט
                  className="p-2 flex gap-1.5 font-serif items-center justify-center rounded-md hover:bg-mainColor-light w-full hover:text-mainColor-dark"
                >
                  <item.icon
                    className="shrink-0 h-4 w-4"
                    aria-hidden="true"
                  />
                  <p className="inline-flex items-center justify-between text-sm font-medium w-full mb-px">
                    {t(item.title)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Category;