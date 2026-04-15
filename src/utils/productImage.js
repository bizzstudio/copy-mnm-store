/** תמונת ברירת מחדל למוצר (בהתאם לבאקאנד / אדמין) */
export const DEFAULT_PRODUCT_IMAGE =
  "https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png";

/**
 * כתובת התמונה הראשונה — תומך ב-image כמערך או כמחרוזת (מונע באג image[0] = תו אחד).
 */
export function getPrimaryProductImageUrl(product) {
  const img = product?.image;
  if (!img) return null;
  if (Array.isArray(img)) {
    const first = img.find((u) => typeof u === "string" && u.trim().length > 0);
    return first ? first.trim() : null;
  }
  if (typeof img === "string" && img.trim()) return img.trim();
  return null;
}
