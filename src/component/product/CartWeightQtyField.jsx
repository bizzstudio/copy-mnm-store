import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { notifyError } from "@utils/toast";
import {
  productSoldByWeight,
  formatWeightDisplayKg,
  roundCartQty,
  MIN_ORDER_KG,
} from "@utils/productSoldByWeight";

/**
 * הצגת כמות בשורת כרטיס/עגלה: מוצר רגיל — מספר שלם;
 * מוצר לפי משקל — שדה עריכה עם עשרוניים (ק״ג).
 */
export default function CartWeightQtyField({
  item,
  getProductStock,
  updateItemQuantity,
  variant = "onPrimary",
  /** הקשר מהעמוד (קטגוריה) — מאפשר משקל גם כשבשורת העגלה אין soldByWeight */
  weightListOpts,
  /** כש-true — מוצר לפי יחידה מקבל שדה הקלדה (למשל בשורת חיפוש) */
  unitQuantityEditable = false,
}) {
  const t = useTranslations();
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    setDraft(null);
  }, [item.id, item.quantity]);

  const commit = useCallback(() => {
    if (draft === null) return;
    const raw = String(draft).trim().replace(",", ".");
    if (raw === "") {
      setDraft(null);
      return;
    }
    let v = parseFloat(raw);
    if (!Number.isFinite(v) || v < MIN_ORDER_KG) {
      notifyError(t("weightInvalidAmount"));
      setDraft(null);
      return;
    }
    v = roundCartQty(v);
    const stock = getProductStock(item);
    if (item.purchaseLimit && item.purchaseLimit > 0 && v > item.purchaseLimit + 1e-6) {
      v = roundCartQty(Math.min(v, item.purchaseLimit));
      notifyError(t("maxQuantityReached"));
    }
    if (v > stock + 1e-6) {
      v = roundCartQty(stock);
      notifyError(t("productStockOut"));
    }
    updateItemQuantity(item.id, v);
    setDraft(null);
  }, [draft, item, getProductStock, updateItemQuantity, t]);

  const commitUnit = useCallback(() => {
    if (draft === null) return;
    const raw = String(draft).trim();
    if (raw === "") {
      setDraft(null);
      return;
    }
    let v = parseInt(raw, 10);
    if (!Number.isFinite(v) || v < 1) {
      notifyError(t("invalidQuantity"));
      setDraft(null);
      return;
    }
    const stock = getProductStock(item);
    if (item.purchaseLimit && item.purchaseLimit > 0 && v > item.purchaseLimit + 1e-6) {
      v = Math.min(v, item.purchaseLimit);
      notifyError(t("maxQuantityReached"));
    }
    if (v > stock + 1e-6) {
      if (stock < 1) {
        notifyError(t("productStockOut"));
        setDraft(null);
        return;
      }
      v = Math.floor(stock);
      notifyError(t("productStockOut"));
    }
    updateItemQuantity(item.id, v);
    setDraft(null);
  }, [draft, item, getProductStock, updateItemQuantity, t]);

  if (!productSoldByWeight(item, weightListOpts)) {
    if (!unitQuantityEditable) {
      return (
        <span className="text-xs sm:text-sm text-dark px-0.5 sm:px-1 font-serif font-semibold tabular-nums">
          {item.quantity}
        </span>
      );
    }

    const displayUnit =
      draft !== null ? draft : String(Math.max(1, Math.floor(Number(item.quantity)) || 1));

    const inputClassUnit =
      variant === "onLight"
        ? "no-spinner w-[2.75rem] sm:w-12 min-w-0 text-center bg-white text-heading text-xs sm:text-sm font-serif font-semibold tabular-nums outline-none border border-gray-300 rounded px-0.5 py-0.5"
        : "no-spinner w-[2.75rem] sm:w-12 min-w-0 text-center bg-transparent text-white text-xs sm:text-sm font-serif font-semibold tabular-nums outline-none border border-white/50 rounded px-0.5 py-0.5";

    return (
      <input
        type="number"
        inputMode="numeric"
        min={1}
        step={1}
        lang="en"
        value={displayUnit}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commitUnit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
        className={inputClassUnit}
        style={{ MozAppearance: "textfield" }}
        aria-label={t("quantity")}
      />
    );
  }

  const displayValue =
    draft !== null ? draft : formatWeightDisplayKg(item.quantity);

  const inputClass =
    variant === "onLight"
      ? "no-spinner w-[3.5rem] sm:w-[4.25rem] min-w-0 text-center bg-white text-heading text-xs sm:text-sm font-serif font-semibold tabular-nums outline-none border border-gray-300 rounded px-0.5 py-0.5"
      : "no-spinner w-[3.5rem] sm:w-[4.25rem] min-w-0 text-center bg-transparent text-white text-xs sm:text-sm font-serif font-semibold tabular-nums outline-none border border-white/50 rounded px-0.5 py-0.5";

  return (
    <input
      type="number"
      inputMode="decimal"
      min={MIN_ORDER_KG}
      step="any"
      lang="en"
      value={displayValue}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      className={inputClass}
      style={{ MozAppearance: "textfield" }}
      title={`${t("weightAmountLabel")} (${t("weightKgSuffix")})`}
      aria-label={`${t("weightAmountLabel")} ${t("weightKgSuffix")}`}
    />
  );
}
