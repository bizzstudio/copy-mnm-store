import { useTranslations } from "next-intl";

/** בחירת כמות למוצר שנמכר לפי משקל — ק״ג או גרם עם עשרוני */
export default function SoldByWeightQtyInput({
  weightUnit,
  setWeightUnit,
  weightStr,
  setWeightStr,
  className = "",
}) {
  const t = useTranslations();

  return (
    <div className={`flex flex-col gap-2 min-w-0 ${className}`}>
      <p className="text-xs text-gray-500 leading-snug">{t("weightHintLine")}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={weightUnit}
          onChange={(e) => setWeightUnit(e.target.value)}
          className="border border-gray-300 rounded-md px-2 py-2 text-sm h-11 md:h-12 bg-white shrink-0"
          aria-label={t("weightAmountLabel")}
        >
          <option value="kg">{t("weightUnitKg")}</option>
          <option value="g">{t("weightUnitGram")}</option>
        </select>
        <input
          type="number"
          inputMode="decimal"
          min="0.001"
          step={weightUnit === "kg" ? "0.001" : "0.1"}
          value={weightStr}
          onChange={(e) => setWeightStr(e.target.value)}
          className="no-spinner border border-gray-300 rounded-md px-2 py-2 text-base font-semibold min-w-0 flex-1 sm:flex-none sm:w-28 h-11 md:h-12 text-center"
          style={{ MozAppearance: "textfield" }}
          aria-label={t("weightAmountLabel")}
        />
      </div>
    </div>
  );
}
