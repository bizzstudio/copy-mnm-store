// useAddToCart.js
import { useState } from "react";
import Cookies from "js-cookie";

import { notifyError, notifySuccess } from "@utils/toast";
import { useTranslations } from "next-intl";
import useCart from "./useCart";
import {
  productSoldByWeight,
  roundCartQty,
  formatWeightDisplayKg,
  MIN_ORDER_KG,
  WEIGHT_STEP_KG,
} from "@utils/productSoldByWeight";

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
    }
    // המלאי הוא שדה stock פשוט
    return product?.stock || 0;
  };

  const handleAddItem = (product, quantity) => {
    const result = items.find((i) => i.id === product.id);
    const { categories, description, ...updatedProduct } = product;
    const productStock = getProductStock(product);
    const byWeight = productSoldByWeight(product);

    let qtyToAdd =
      quantity !== undefined && quantity !== null && quantity !== ""
        ? Number(quantity)
        : Number(item);
    if (!Number.isFinite(qtyToAdd) || qtyToAdd <= 0) {
      notifyError(byWeight ? t("weightInvalidAmount") : t("invalidQuantity"));
      return { added: 0 };
    }
    if (byWeight) {
      qtyToAdd = roundCartQty(qtyToAdd);
      if (qtyToAdd < MIN_ORDER_KG) {
        notifyError(t("weightInvalidAmount"));
        return { added: 0 };
      }
    } else {
      qtyToAdd = Math.floor(qtyToAdd);
      if (qtyToAdd < 1) {
        notifyError(t("invalidQuantity"));
        return { added: 0 };
      }
    }

    const qtyLabel = byWeight
      ? `${formatWeightDisplayKg(qtyToAdd)} ${t("weightKgSuffix")}`
      : String(qtyToAdd);
    const titleShown = currentLang ? product.title?.he : product.title?.en;

    // הוספה של מוצר קיים
    if (result !== undefined) {
      const sumQty = roundCartQty((result?.quantity || 0) + qtyToAdd);
      if (sumQty <= productStock + (byWeight ? 1e-6 : 0)) {
        const addResult = addItem(updatedProduct, qtyToAdd);
        if (addResult?.added > 0) {
          notifySuccess(`${qtyLabel} ${titleShown} ${t("addedToCart!")}`);
        }
        return addResult || { added: 0 };
      }
      notifyError(t("productStockOut"));
      return { added: 0 };
    }
    // הוספה של מוצר חדש
    if (qtyToAdd <= productStock + (byWeight ? 1e-6 : 0)) {
      const addResult = addItem(updatedProduct, qtyToAdd);
      if (addResult?.added > 0) {
        notifySuccess(`${qtyLabel} ${titleShown} ${t("addedToCart!")}`);
      }
      return addResult || { added: 0 };
    }
    notifyError(t("productStockOut"));
    return { added: 0 };
  };

  const handleIncreaseQuantity = (product) => {
    const result = items?.find((p) => p.id === product.id);
    const productStock = getProductStock(product);
    const step = productSoldByWeight(product) ? WEIGHT_STEP_KG : 1;

    if (result) {
      const newQty = roundCartQty(product.quantity + step);
      if (newQty <= productStock + (productSoldByWeight(product) ? 1e-6 : 0)) {
        updateItemQuantity(product.id, newQty);
      } else {
        notifyError(t("productStockOut"));
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