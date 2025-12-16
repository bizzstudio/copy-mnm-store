import dayjs from "dayjs";
import Cookies from "js-cookie";
import useGetSetting from "./useGetSetting";

const useUtilsFunction = () => {
  const lang = Cookies.get("_lang") || "he";

  const { globalSetting } = useGetSetting();

  const currency = globalSetting?.default_currency || "₪";

  //for date and time format
  const showTimeFormat = (data, timeFormat) => {
    return dayjs(data).format(timeFormat);
  };

  const showDateFormat = (data) => {
    return dayjs(data).format(globalSetting?.default_date_format);
  };

  const showDateTimeFormat = (data, date, time) => {
    return dayjs(data).format(`${date} ${time}`);
  };

  //for formatting number

  const getNumber = (value = 0) => {
    return Number(parseFloat(value || 0).toFixed(1));
  };

  const getNumberTwo = (value = 0) => {
    return parseFloat(value || 0).toFixed(globalSetting?.floating_number || 2);
  };

  //for translation
  const showingTranslateValue = (data) => {
    return data !== undefined && Object?.keys(data).includes(lang)
      ? data[lang]
      : data?.en;
  };

  const showingImage = (data) => {
    return data !== undefined && data;
  };

  const showingUrl = (data) => {
    return data !== undefined ? data : "!#";
  };

  // פונקציה להחזרת slug של קטגוריה, עם name כ-fallback
  const getCategorySlug = (category) => {
    if (!category) return "";
    // אם יש slug - נשתמש בו
    if (category.slug) {
      return category.slug;
    }
    // אם אין slug - נשתמש בשם המתורגם כ-fallback
    return showingTranslateValue(category.name);
  };

  // פונקציה למציאת קטגוריה לפי slug או שם
  const findCategoryByIdentifier = (categories, identifier) => {
    if (!categories || !identifier) return null;
    
    return categories.find(
      (category) =>
        category.slug === identifier ||
        category.name?.he === identifier || 
        category.name?.en === identifier
    );
  };

  // פונקציה למציאת קטגוריה ראשית לפי slug או שם
  const findMainCategory = (categoriesData, identifier) => {
    if (!categoriesData?.[0]?.children || !identifier) return null;
    return findCategoryByIdentifier(categoriesData[0].children, identifier);
  };

  // פונקציה למציאת תת-קטגוריה לפי slug או שם
  const findSubCategory = (parentCategory, identifier) => {
    if (!parentCategory?.children || !identifier) return null;
    return findCategoryByIdentifier(parentCategory.children, identifier);
  };

  return {
    lang,
    currency,
    getNumber,
    getNumberTwo,
    showTimeFormat,
    showDateFormat,
    showingImage,
    showingUrl,
    showDateTimeFormat,
    showingTranslateValue,
    getCategorySlug,
    findCategoryByIdentifier,
    findMainCategory,
    findSubCategory,
  };
};

export default useUtilsFunction;
