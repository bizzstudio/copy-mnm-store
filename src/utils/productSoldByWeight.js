/** מוצר שנמכר לפי משקל — quantity בעגלה ובהזמנה היא בק״ג (עשרונית). */

export const DEFAULT_WEIGHT_CART_KG = 0.5;
export const WEIGHT_STEP_KG = 0.05;
/** מינימום בהתאם ל־WEIGHT_QTY_DECIMALS (0.01 ק״ג) */
export const MIN_ORDER_KG = 0.01;
export const WEIGHT_QTY_DECIMALS = 2;

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
    hay.includes("frozen") ||
    hay.includes("freeze") ||
    hay.includes("פירות") ||
    hay.includes("ירקות") ||
    hay.includes("קפוא") ||
    hay.includes("קפואים")
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
  const hasKg =
    /ק[״"']?ג|קילו|לק[״"']?ג|\bkg\b|גרם|gram(s)?|\bg\b/i.test(raw);
  const packOnly = /(יחידה|מארז|(^|\s)יח\.?\s)/i.test(raw);
  return packOnly && !hasKg;
}

/**
 * בונה מחרוזת הקשר לעמוד קטגוריה (מוצרים מה-API לעיתים בלי categories מלא).
 * @param {object[]} categoryNodes קטגוריה ראשית / תת-קטגוריה מה-sidebar
 * @param {(string|undefined|null)[]} querySlugs ערכי query מה-router (slug או שם)
 */
export function weightContextFromCategoryTree(categoryNodes, querySlugs = []) {
  const chunks = [];
  for (const node of categoryNodes || []) {
    if (!node) continue;
    if (node.slug) chunks.push(node.slug);
    const n = node.name;
    if (typeof n === "string") chunks.push(n);
    else if (n && typeof n === "object") {
      if (n.he) chunks.push(n.he);
      if (n.en) chunks.push(n.en);
    }
  }
  for (const s of querySlugs) {
    if (s == null) continue;
    let t = String(s).trim();
    if (!t) continue;
    try {
      t = decodeURIComponent(t);
    } catch {
      /* נשאר המקור */
    }
    chunks.push(t);
  }
  return chunks.join(" ");
}

/**
 * מזהים קטגוריה מנתיב הדפדפן לפני ש-router.query מתמלא (הידרציה של Next.js).
 * דוגמה: /product-category/בשרים-ועופות או .../פירות-וירקות/עגבניות
 */
export function categoryPathHintsFromAsPath(asPath) {
  if (!asPath || typeof asPath !== "string") return [];
  try {
    const path = asPath.split("?")[0].split("#")[0];
    const segments = path.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
    const idx = segments.indexOf("product-category");
    if (idx === -1) return [];
    const hints = [];
    for (let j = 1; j <= 2; j += 1) {
      const seg = segments[idx + j];
      if (!seg) break;
      try {
        hints.push(decodeURIComponent(seg));
      } catch {
        hints.push(seg);
      }
    }
    return hints;
  } catch {
    return [];
  }
}

/** אופציות ל-productSoldByWeight מתוך נתיב נוכחי (למשל בעגלה כשאין prop מהעמוד) */
export function weightOptsFromAsPath(asPath) {
  const hints = categoryPathHintsFromAsPath(asPath);
  const ctx = weightContextFromCategoryTree([], hints).trim();
  return ctx ? { listCategoryContext: ctx } : undefined;
}

/**
 * הקשר משקל מעץ הקטגוריות ב-sidebar + product.category (כמו בדף product/[slug]).
 * כשאין קטגוריה על המוצר או שהמזהה לא נמצא בעץ — מחזיר מחרוזת ריקה.
 */
export function weightContextFromProductNavTree(product, categoriesData) {
  const current = product?.category;
  const catId =
    current && typeof current === "object" ? current._id : current;
  if (catId == null || catId === "" || !categoriesData?.[0]?.children) return "";
  const roots = categoriesData[0].children;
  const idStr = String(catId);

  const asMain = roots.find((cat) => String(cat._id) === idStr);
  if (asMain) {
    return weightContextFromCategoryTree([asMain], []);
  }
  for (const mainCat of roots) {
    if (!mainCat?.children?.length) continue;
    const sub = mainCat.children.find((s) => String(s._id) === idStr);
    if (sub) {
      return weightContextFromCategoryTree([mainCat, sub], []);
    }
  }
  return "";
}

/** התאמה לפי מחרוזת אחת (למשל slug מה-URL + שם תצוגה מהקטגוריה) */
function matchesWeightCategoryString(contextStr) {
  if (!contextStr || !String(contextStr).trim()) return false;
  const fake = { name: String(contextStr) };
  return isProduceCategory(fake) || isMeatPoultryCategory(fake);
}

function matchesMeatListContextOnly(contextStr) {
  if (!contextStr || !String(contextStr).trim()) return false;
  const fake = { name: String(contextStr) };
  return isMeatPoultryCategory(fake);
}

/**
 * true אם המוצר נספר בק״ג (עם עשרוניים):
 * - soldByWeight=true מהשרת, או
 * - קטגוריית פירות וירקות / בשר ועוף (מהמוצר או מהעמוד), ולא מארז/יחידה בלבד
 *   (בעמוד בשר/עוף מתעלמים מ"יחידה" בשדה unit אם זה חוסם — נתונים מהמערכת לעיתים לא מדויקים).
 *
 * @param {object} p
 * @param {{ listCategoryContext?: string } | undefined} opts
 */
export function productSoldByWeight(p, opts) {
  if (!p) return false;
  if (p.soldByWeight === true || p.soldByWeight === "true" || p.soldByWeight === 1)
    return true;

  const listCtxRaw =
    typeof opts === "string" ? opts : opts?.listCategoryContext;
  const listCtx = listCtxRaw && String(listCtxRaw).trim() ? String(listCtxRaw) : "";

  const fromMeatBlobs = categoryBlobs(p).some((cat) => isMeatPoultryCategory(cat));
  const fromProduceBlobs = categoryBlobs(p).some((cat) => isProduceCategory(cat));
  const fromBlobs = fromMeatBlobs || fromProduceBlobs;
  const fromList = listCtx && matchesWeightCategoryString(listCtx);
  const fromMeatList = listCtx && matchesMeatListContextOnly(listCtx);

  if (!fromBlobs && !fromList) return false;

  if (explicitUnitOnly(p)) {
    if (fromMeatList || fromMeatBlobs) return true;
    return false;
  }
  return true;
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

export function cartQtyStep(item, opts) {
  return productSoldByWeight(item, opts) ? WEIGHT_STEP_KG : 1;
}

/** כמות אחרי לחיצה על מינוס בעגלה; 0 = להסיר את השורה */
export function cartDecrementQuantity(item, opts) {
  if (!item) return 0;
  const step = cartQtyStep(item, opts);
  if (productSoldByWeight(item, opts)) {
    const next = roundCartQty(item.quantity - step);
    if (next < MIN_ORDER_KG) return 0;
    return next;
  }
  const next = item.quantity - 1;
  return next < 1 ? 0 : next;
}
