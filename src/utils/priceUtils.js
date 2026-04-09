// src/utils/priceUtils.js
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
            priceList: null
        };
    }

    // אם המשתמש מחובר ויש לו מחירון
    if (userInfo && userInfo.priceList) {
        const userPriceListId = String(userInfo.priceList); // המרה למחרוזת להשוואה

        // חיפוש המחיר המתאים למחירון של המשתמש
        const userPrice = product.prices.find(p => {
            if (!p.priceList) return false;

            // תומך גם ב-populated object וגם ב-ObjectId/string
            const priceListId =
                typeof p.priceList === 'object' && p.priceList._id
                    ? p.priceList._id
                    : p.priceList;

            return String(priceListId) === userPriceListId;
        });

        if (userPrice) {
            return {
                price: userPrice.price || 0,
                salePrice: userPrice.salePrice || null,
                originalPrice: userPrice.price || 0,
                warehousePrice: userPrice.warehousePrice || null,
                purchaseLimit: userPrice.purchaseLimit || null,
                priceList: userPrice.priceList
            };
        }
    }

    // אם אין משתמש מחובר או לא נמצא מחירון מתאים - נחפש מחירון ברירת מחדל
    const defaultPrice = product.prices.find(p =>
        p.priceList &&
        typeof p.priceList === 'object' &&
        p.priceList.isDefault === true
    );

    if (defaultPrice) {
        return {
            price: defaultPrice.price || 0,
            salePrice: defaultPrice.salePrice || null,
            originalPrice: defaultPrice.price || 0,
            warehousePrice: defaultPrice.warehousePrice || null,
            purchaseLimit: defaultPrice.purchaseLimit || null,
            priceList: defaultPrice.priceList
        };
    }

    // אם גם לא נמצא מחירון ברירת מחדל - נחזיר את המחיר הראשון
    const firstPrice = product.prices[0];
    return {
        price: firstPrice.price || 0,
        salePrice: firstPrice.salePrice || null,
        originalPrice: firstPrice.price || 0,
        warehousePrice: firstPrice.warehousePrice || null,
        purchaseLimit: firstPrice.purchaseLimit || null,
        priceList: firstPrice.priceList
    };
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