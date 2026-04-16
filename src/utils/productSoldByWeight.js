/** מוצר שנמכר לפי משקל — quantity בעגלה ובהזמנה היא בק״ג (עשרונית). */

export const DEFAULT_WEIGHT_CART_KG = 0.5;
export const WEIGHT_STEP_KG = 0.05;
export const MIN_ORDER_KG = 0.001;
export const WEIGHT_QTY_DECIMALS = 3;

function categoryBlobs(p) {
  const list = [];
  if (Array.isArray(p?.categories)) list.push(...p.categories);
  else if (p?.category) list.push(p.category);
  return list;
}

/** קטגוריית פירות/ירקות (לפי שם או slug) */
function isProduceCategory(cat) {
  if (!cat) return false;
  const parts = [];
  if (typeof cat === "string") parts.push(cat);
  if (typeof cat?.slug === "string") parts.push(cat.slug);
  if (typeof cat?.name === "string") parts.push(cat.name);
  if (cat?.name && typeof cat.name === "object") {
    parts.push(cat.name.he || "", cat.name.en || "");
  }
  const hay = parts.join(" ").toLowerCase();
  return (
    hay.includes("fruit") ||
    hay.includes("vegetable") ||
    hay.includes("vegetables") ||
    hay.includes("produce") ||
    hay.includes("פירות") ||
    hay.includes("ירקות")
  );
}

/** בשר, עוף ודומים — כמו פירות/ירקות, כמות בעגלה בק״ג עם עשרוני (אלא אם מסומן מארז/יחידה). */
function isMeatPoultryCategory(cat) {
  if (!cat) return false;
  const parts = [];
  if (typeof cat === "string") parts.push(cat);
  if (typeof cat?.slug === "string") parts.push(cat.slug);
  if (typeof cat?.name === "string") parts.push(cat.name);
  if (cat?.name && typeof cat.name === "object") {
    parts.push(cat.name.he || "", cat.name.en || "");
  }
  const hay = parts.join(" ").toLowerCase();
  return (
    hay.includes("meat") ||
    hay.includes("beef") ||
    hay.includes("poultry") ||
    hay.includes("chicken") ||
    hay.includes("turkey") ||
    hay.includes("lamb") ||
    hay.includes("butcher") ||
    hay.includes("בשר") ||
    hay.includes("בשרים") ||
    hay.includes("עוף") ||
    hay.includes("עופות") ||
    hay.includes("הודו") ||
    hay.includes("טלה") ||
    hay.includes("כבש")
  );
}

/** מכירה לפי יחידה/מארז — לא לפי משקל, גם אם בקטגוריית פירות וירקות */
function explicitUnitOnly(p) {
  const raw = `${p?.unit || ""} ${p?.weightUnit || ""}`;
  if (!raw.trim()) return false;
  const hasKg = /ק[״"']?ג|קילו|לק[״"']?ג|\bkg\b/i.test(raw);
  const packOnly = /(יחידה|מארז|(^|\s)יח\.?\s)/i.test(raw);
  return packOnly && !hasKg;
}

/**
 * true אם המוצר נספר בק״ג (עם עשרוניים):
 * - soldByWeight=true מהשרת, או
 * - קטגוריית פירות וירקות / בשר ועוף ולא מסומן במפורש כמארז/יחידה בלבד.
 */
export function productSoldByWeight(p) {
  if (!p) return false;
  if (p.soldByWeight === true) return true;
  if (explicitUnitOnly(p)) return false;
  return categoryBlobs(p).some(
    (cat) => isProduceCategory(cat) || isMeatPoultryCategory(cat)
  );
}

export function roundCartQty(kg) {
  const n = Number(kg);
  if (!Number.isFinite(n)) return 0;
  const f = 10 ** WEIGHT_QTY_DECIMALS;
  return Math.round(n * f) / f;
}

export function parseWeightInputToKg(raw, unit) {
  const s = String(raw ?? "").trim().replace(",", ".");
  if (s === "") return NaN;
  const n = parseFloat(s);
  if (!Number.isFinite(n) || n <= 0) return NaN;
  if (unit === "g") return n / 1000;
  return n;
}

export function formatWeightDisplayKg(kg) {
  const r = roundCartQty(kg);
  if (!Number.isFinite(r) || r === 0) return "0";
  return String(parseFloat(r.toFixed(WEIGHT_QTY_DECIMALS)));
}

export function cartQtyStep(item) {
  return productSoldByWeight(item) ? WEIGHT_STEP_KG : 1;
}

/** כמות אחרי לחיצה על מינוס בעגלה; 0 = להסיר את השורה */
export function cartDecrementQuantity(item) {
  if (!item) return 0;
  const step = cartQtyStep(item);
  if (productSoldByWeight(item)) {
    const next = roundCartQty(item.quantity - step);
    if (next < MIN_ORDER_KG) return 0;
    return next;
  }
  const next = item.quantity - 1;
  return next < 1 ? 0 : next;
}
