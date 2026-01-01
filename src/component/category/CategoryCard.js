// src/component/category/CategoryCard.js
import Image from "next/image";
import Link from "next/link";
import { useContext, useState } from "react";
import { useRouter } from "next/router";
import {
  IoChevronDownOutline,
  IoChevronBackOutline,
  IoRemoveSharp,
} from "react-icons/io5";

import { SidebarContext } from "@context/SidebarContext";
import useUtilsFunction from "@hooks/useUtilsFunction";

// פונקציה להחזיר אייקונים לפי קטגוריה (זמנית - צריך להגיע מהשרת)
const getCategoryIconByCode = (category) => {
  return {
    bw: category.icon || "https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png",
    color: category.coloredIcon || category.icon || "https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png"
  };
};

const CategoryCard = ({ title, nested, id, onLinkClick, onClose }) => {
  const router = useRouter();
  const { query, pathname, asPath } = router;
  const { showingTranslateValue, getCategorySlug } = useUtilsFunction();
  const { setIsLoading } = useContext(SidebarContext);

  // אם אין nested או זה ריק, לא מציגים כלום
  if (!nested || nested.length === 0) {
    return null;
  }

  const handleCategoryClick = (category) => {
    const categorySlug = getCategorySlug(category);
    const targetPath = `/product-category/${categorySlug}`;

    // בדיקה אם כבר נמצאים באותו מקום
    if (asPath === targetPath) {
      onClose();
      if (onLinkClick) setTimeout(() => onLinkClick(), 100);
      return;
    }

    onClose();
    if (onLinkClick) setTimeout(() => onLinkClick(), 100);
    router.push(targetPath);
  };

  const handleSubCategoryClick = (category, subCategory) => {
    const categorySlug = getCategorySlug(category);
    const subCategorySlug = getCategorySlug(subCategory);
    const targetPath = `/product-category/${categorySlug}/${subCategorySlug}`;

    // בדיקה אם כבר נמצאים באותו מקום
    if (asPath === targetPath) {
      onClose();
      if (onLinkClick) setTimeout(() => onLinkClick(), 100);
      return;
    }

    // אחרת – מתחילים טעינה ומעבירים
    onClose();
    if (onLinkClick) setTimeout(() => onLinkClick(), 100);
    router.push(targetPath);
  };

  return (
    <div className="space-y-1">
      {nested.map((category) => (
        <CategoryItem
          key={category._id}
          category={category}
          showingTranslateValue={showingTranslateValue}
          onCategoryClick={() => handleCategoryClick(category)}
          onSubCategoryClick={(subCategory) => handleSubCategoryClick(category, subCategory)}
        />
      ))}
    </div>
  );
};

// קומפוננטה נפרדת לכל קטגוריה
const CategoryItem = ({ category, showingTranslateValue, onCategoryClick, onSubCategoryClick }) => {
  const [show, setShow] = useState(false);
  const toggleShow = () => setShow(!show);
  const { getCategorySlug } = useUtilsFunction();

  const categoryTitle = showingTranslateValue(category.name);
  const categorySlug = getCategorySlug(category);
  const icon = getCategoryIconByCode(category);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <>
      <div className="flex items-center rounded-md hover:bg-mainColor-light w-full hover:text-mainColor-dark cursor-pointer select-none">
        <Link
          href={`/product-category/${categorySlug}`}
          onMouseDown={onCategoryClick}
          className="p-2 flex items-center w-full gap-3 group"
        >
          <div className="relative w-[40px] h-[40px]">
            <Image
              src={icon.bw}
              width={40}
              height={40}
              alt="Category BW"
              className="absolute top-0 left-0 object-contain transition-opacity duration-200 group-hover:opacity-0"
            />
            <Image
              src={icon.color}
              width={40}
              height={40}
              alt="Category Color"
              className="absolute top-0 left-0 object-contain opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            />
          </div>
          <div className="inline-flex items-center justify-between text-lg font-medium w-full hover:text-mainColor-dark">
            {categoryTitle}
          </div>
        </Link>

        {hasChildren && (
          <span
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleShow();
            }}
            className="p-2 text-gray-400 hover:text-mainColor-dark"
          >
            {show ? <IoChevronDownOutline /> : <IoChevronBackOutline />}
          </span>
        )}
      </div>

      {show && hasChildren && (
        <ul className="ps-10 pb-3">
          {category.children.map((child, ci) => {
            const childTitle = showingTranslateValue(child.name);
            const childSlug = getCategorySlug(child);
            return (
              <li key={child._id}>
                <Link
                  href={`/product-category/${categorySlug}/${childSlug}`}
                  onMouseDown={() => onSubCategoryClick(child)}
                  className="flex items-center gap-1 font-serif py-1 text-sm text-gray-600 hover:text-mainColor-dark"
                >
                  <span className="text-lg text-gray-500 pe-1">
                    {/* <IoRemoveSharp /> */}
                    •
                  </span>
                  <span className="truncate max-w-[150px]" title={childTitle}>
                    {childTitle}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
};

export default CategoryCard;