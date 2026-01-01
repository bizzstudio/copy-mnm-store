// useAddToCart.js
import { useState } from "react";
import Cookies from "js-cookie";

import { notifyError, notifySuccess } from "@utils/toast";
import { useTranslations } from "next-intl";
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
  const t = useTranslations();

  const [item, setItem] = useState(1);
  const { addItem, items, updateItemQuantity } = useCart();
  // console.log('products',products)
  // console.log("items", items);

  // חישוב מלאי המוצר
  const getProductStock = (product) => {
    if (product?.manageStock === false) {
      return 9999;
    } else if (product?.stocks && Array.isArray(product.stocks) && product.stocks.length > 0) {
      return product.stocks.reduce((sum, stockItem) => sum + (stockItem?.quantity || 0), 0);
    }
    return product?.stock || 0;
  };

  const handleAddItem = (product, quantity) => {
    const result = items.find((i) => i.id === product.id);
    const { categories, description, ...updatedProduct } = product;
    const productStock = getProductStock(product);

    // הוספה של מוצר קיים
    if (result !== undefined) {
      if (result?.quantity + item <= productStock) {
        const addResult = addItem(updatedProduct, item);
        // רק אם נוספו מוצרים בפועל - הצגת התראה
        if (addResult?.added > 0) {
          notifySuccess(`${addResult.added} ${currentLang ? product.title?.he : product.title?.en} ${t('addedToCart!')}`);
        }
      } else {
        notifyError(t('productStockOut'));
      }
    }
    // הוספה של מוצר חדש
    else {
      if (item <= productStock) {
        const itemToPass = quantity ? quantity : item;
        const addResult = addItem(updatedProduct, itemToPass);
        // רק אם נוספו מוצרים בפועל - הצגת התראה
        if (!quantity && addResult?.added > 0) {
          const actualAdded = addResult.requested ? addResult.added : addResult.added;
          notifySuccess(`${actualAdded} ${currentLang ? product.title?.he : product.title?.en} ${t('addedToCart!')}`);
        }
      } else {
        notifyError(t('productStockOut'));
      }
    }
  };

  const handleIncreaseQuantity = (product) => {
    const result = items?.find((p) => p.id === product.id);
    const productStock = getProductStock(product);

    if (result) {
      if (result?.quantity + item <= productStock) {
        updateItemQuantity(product.id, product.quantity + 1);
      } else {
        notifyError(t('productStockOut'));
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