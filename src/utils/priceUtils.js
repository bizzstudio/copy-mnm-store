// src/utils/priceUtils.js
/**
 * אחוז מע״מ להצגת מחירי קטלוג בחנות (מסנכרן עם VAT_PERCENTAGE בבקאנד).
 * רק כש־isVatFree === false המחיר בקטלוג נחשב לפני מע״מ ומוכפל כאן.
 */
const getCatalogVatPercent = () => {
    const raw =
        typeof process !== "undefined" && process.env.NEXT_PUBLIC_VAT_PERCENTAGE != null
            ? Number(process.env.NEXT_PUBLIC_VAT_PERCENTAGE)
            : 18;
    return Number.isFinite(raw) && raw > 0 ? raw : 18;
};

const getCatalogVatMultiplier = (product) => {
    if (!product || product.isVatFree !== false) return 1;
    return 1 + getCatalogVatPercent() / 100;
};

const roundMoney = (n) => Math.round(Number(n) * 100) / 100;

/** שורת מחיר ברירת מחדל או ראשונה (בלי התחברות) — ל־SEO / מעקב */
const getDefaultOrFirstPriceRow = (product) => {
    if (!product?.prices || !Array.isArray(product.prices) || product.prices.length === 0) {
        return null;
    }
    const defaultPrice = product.prices.find(
        (p) =>
            p.priceList &&
            typeof p.priceList === "object" &&
            p.priceList.isDefault === true
    );
    return defaultPrice || product.prices[0];
};

/**
 * מחירי קטלוג להצגה ציבורית (מחירון ברירת מחדל) כולל מע״מ כשהמוצר חייב במע״מ.
 * לשימוש ב־JSON-LD / פיקסל כשאין משתמש מחובר.
 */
export const getCatalogSeoPricing = (product) => {
    const row = getDefaultOrFirstPriceRow(product);
    if (!row) {
        return { current: 0, original: 0, discount: 0 };
    }
    const mult = getCatalogVatMultiplier(product);
    const list = roundMoney((Number(row.price) || 0) * mult);
    const rawSale = row.salePrice;
    const saleNum =
        rawSale != null && rawSale !== "" && Number.isFinite(Number(rawSale))
            ? Number(rawSale)
            : null;
    const hasSale =
        saleNum != null && saleNum > 0 && saleNum < (Number(row.price) || 0);
    const sale = hasSale ? roundMoney(saleNum * mult) : null;
    const current = sale != null ? sale : list;
    const original = list;
    let discount = 0;
    if (sale != null && sale > 0 && sale < list) {
        discount = ((list - sale) / list) * 100;
    }
    return { current, original, discount };
};

const buildPricingFromRow = (product, row) => {
    if (!row) {
        return {
            price: 0,
            salePrice: null,
            originalPrice: 0,
            warehousePrice: null,
            purchaseLimit: null,
            priceList: null,
        };
    }
    const mult = getCatalogVatMultiplier(product);
    const list = roundMoney((Number(row.price) || 0) * mult);
    const rawSale = row.salePrice;
    const saleNum =
        rawSale != null && rawSale !== "" && Number.isFinite(Number(rawSale))
            ? Number(rawSale)
            : null;
    const hasSale =
        saleNum != null && saleNum > 0 && saleNum < (Number(row.price) || 0);
    const sale = hasSale ? roundMoney(saleNum * mult) : null;
    return {
        price: list,
        salePrice: sale,
        originalPrice: list,
        warehousePrice:
            row.warehousePrice != null && row.warehousePrice !== ""
                ? roundMoney(Number(row.warehousePrice) * mult)
                : null,
        purchaseLimit: row.purchaseLimit ?? null,
        priceList: row.priceList,
    };
};

/**
 * פונקציה טהורה לחישוב המחיר הנכון למשתמש על סמך המחירון שלו
 * @param {Object} product - אובייקט המוצר עם מערך prices
 * @param {Object} userInfo - אובייקט המשתמש המחובר (או null)
 * @returns {Object} - { price, salePrice, originalPrice, warehousePrice, purchaseLimit, priceList }
 */
export const getUserPrice = (product, userInfo = null) => {
    const loggedIn = !!(userInfo && userInfo.token);
    if (!loggedIn) {
        return {
            price: null,
            salePrice: null,
            originalPrice: null,
            warehousePrice: null,
            purchaseLimit: null,
            priceList: null,
            pricesHidden: true,
        };
    }

    // אם אין מוצר או אין מחירים
    if (!product || !product.prices || !Array.isArray(product.prices) || product.prices.length === 0) {
        return {
            price: 0,
            salePrice: null,
            originalPrice: 0,
            warehousePrice: null,
            purchaseLimit: null,
            priceList: null,
        };
    }

    // אם המשתמש מחובר ויש לו מחירון
    if (userInfo && userInfo.priceList) {
        const userPriceListId = String(userInfo.priceList); // המרה למחרוזת להשוואה

        // חיפוש המחיר המתאים למחירון של המשתמש
        const userPrice = product.prices.find((p) => {
            if (!p.priceList) return false;

            // תומך גם ב-populated object וגם ב-ObjectId/string
            const priceListId =
                typeof p.priceList === "object" && p.priceList._id
                    ? p.priceList._id
                    : p.priceList;

            return String(priceListId) === userPriceListId;
        });

        if (userPrice) {
            return buildPricingFromRow(product, userPrice);
        }
    }

    // אם אין משתמש מחובר או לא נמצא מחירון מתאים - נחפש מחירון ברירת מחדל
    const defaultPrice = product.prices.find(
        (p) =>
            p.priceList &&
            typeof p.priceList === "object" &&
            p.priceList.isDefault === true
    );

    if (defaultPrice) {
        return buildPricingFromRow(product, defaultPrice);
    }

    // אם גם לא נמצא מחירון ברירת מחדל - נחזיר את המחיר הראשון
    const firstPrice = product.prices[0];
    return buildPricingFromRow(product, firstPrice);
};

/**
 * פונקציה לקבלת המחיר הסופי להצגה (אם יש salePrice, מחזיר אותו, אחרת מחזיר price)
 * @param {Object} product - אובייקט המוצר
 * @param {Object} userInfo - אובייקט המשתמש המחובר (או null)
 * @returns {Number} - המחיר הסופי
 */
export const getFinalPrice = (product, userInfo = null) => {
    const { price, salePrice, pricesHidden } = getUserPrice(product, userInfo);
    if (pricesHidden) return 0;
    return salePrice && salePrice > 0 ? salePrice : price;
};

/**
 * פונקציה לבדיקה אם יש מחיר מבצע
 * @param {Object} product - אובייקט המוצר
 * @param {Object} userInfo - אובייקט המשתמש המחובר (או null)
 * @returns {Boolean} - true אם יש מחיר מבצע
 */
export const hasSalePrice = (product, userInfo = null) => {
    const { salePrice, price, pricesHidden } = getUserPrice(product, userInfo);
    if (pricesHidden) return false;
    return salePrice && salePrice > 0 && salePrice < price;
};
