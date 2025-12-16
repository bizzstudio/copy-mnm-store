// useAddToCart.js
import { useState } from "react";
import Cookies from "js-cookie";

import { notifyError, notifySuccess } from "@utils/toast";
import useTranslation from "next-translate/useTranslation";
import useCart from "./useCart";

const useAddToCart = () => {
  let currentLang = Cookies.get('_lang');

  switch (currentLang) {
    case 'he':
      currentLang = true;
      break;
    case 'en':
      currentLang = false;
      break;
    default:
      currentLang = false;
      break;
  }
  const { t } = useTranslation();

  const [item, setItem] = useState(1);
  const { addItem, items, updateItemQuantity } = useCart();
  // console.log('products',products)
  // console.log("items", items);

  const handleAddItem = (product, quantity) => {

    const result = items.find((i) => i.id === product.id);
    const { variants, categories, description, ...updatedProduct } = product;

    // הוספה של מוצר קיים
    if (result !== undefined) {
      if (
        result?.quantity + item <=
        (product?.variants?.length > 0
          ? product?.variant?.quantity
          : product?.stock)
      ) {
        const addResult = addItem(updatedProduct, item);
        // רק אם נוספו מוצרים בפועל - הצגת התראה
        if (addResult?.added > 0) {
          notifySuccess(`${addResult.added} ${currentLang ? product.title?.he : product.title?.en} ${t("common:addedToCart!")}`);
        }
      } else {
        notifyError(t("common:productStockOut"));
      }
    } 
    // הוספה של מוצר חדש
    else {
      if (
        item <=
        (product?.variants?.length > 0
          ? product?.variant?.quantity
          : product?.stock)
      ) {
        const itemToPass = quantity ? quantity : item;
        const addResult = addItem(updatedProduct, itemToPass);
        // רק אם נוספו מוצרים בפועל - הצגת התראה
        if (!quantity && addResult?.added > 0) {
          const actualAdded = addResult.requested ? addResult.added : addResult.added;
          notifySuccess(`${actualAdded} ${currentLang ? product.title?.he : product.title?.en} ${t("common:addedToCart!")}`);
        }
      } else {
        notifyError(t("common:productStockOut"));
      }
    }
  };

  const handleIncreaseQuantity = (product) => {
    const result = items?.find((p) => p.id === product.id);
    // console.log(
    //   "handleIncreaseQuantity",
    //   product,
    //   result?.quantity + item,
    //   product?.variants?.length > 0
    //     ? product?.variant?.quantity
    //     : product?.stock
    // );
    if (result) {
      if (
        result?.quantity + item <=
        (product?.variants?.length > 0
          ? product?.variant?.quantity
          : product?.stock)
      ) {
        updateItemQuantity(product.id, product.quantity + 1);
      } else {
        notifyError(t("common:productStockOut"));
      }
    }
  };

  return {
    setItem,
    item,
    handleAddItem,
    handleIncreaseQuantity,
  };
};

export default useAddToCart;
