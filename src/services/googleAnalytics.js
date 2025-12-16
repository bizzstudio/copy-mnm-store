// src/services/googleAnalytics.js
// Google Tag Manager (GTM) Integration Service - דרך dataLayer
// כל אירועי ecommerce נשלחים במבנה GA4 תקני תחת ecommerce{}


// ------------- Utils -------------

// בדיקה אם dataLayer זמין
const isDataLayerAvailable = () => {
    return (
        typeof window !== "undefined" &&
        Array.isArray(window.dataLayer)
    );
};

// פונקציית עזר לדחיפת אירוע "רגיל" (לא ecommerce)
const pushGAEvent = (eventName, params = {}) => {
    if (!isDataLayerAvailable()) return;

    window.dataLayer.push({
        event: eventName,
        ...params,
    });
};

// פונקציית עזר לדחיפת אירועי ecommerce במבנה GA4
const pushEcommerceEvent = (eventName, ecommercePayload = {}) => {
    if (!isDataLayerAvailable()) return;

    window.dataLayer.push({
        event: eventName,
        ecommerce: ecommercePayload,
    });
};

// ------------- Mapping Item to GA4 -------------

const mapItemToGA4 = (item, includeCurrency = false) => {
    // מחיר ליחידה
    const unitPrice = item.price || item.prices?.price || 0;

    // אם יש מחיר מבצע, נחשב את דיסקאונט
    const fullPriceTotal = unitPrice * item.quantity;
    const discountedTotal = item.discountedPrice ?? fullPriceTotal;
    const discountAmount = fullPriceTotal - discountedTotal;

    // שם מוצר - תומך בשפות
    const itemName = item.title?.he || item.title?.en || item.title || "";

    const mappedItem = {
        item_id: item.sku || item.id || item._id || item.productId, // מזהה מוצר
        item_name: itemName,   // שם מוצר
        price: unitPrice,
        quantity: item.quantity,
        discount: discountAmount > 0 ? discountAmount : 0,
        // אם נרצה בהמשך:
        // item_category: item.categoryName || "",
        // item_variant: item.variant || "",
    };

    // הוספת currency ברמת ה-item (לפי הדוגמה של add_to_cart ו-remove_from_cart)
    if (includeCurrency) {
        mappedItem.currency = "ILS";
    }

    return mappedItem;
};


// ------------- Ecommerce Events -------------

// Add to Cart - כשמוסיפים פריט/כמות לעגלה
export const trackAddToCart = (item, total = null) => {
    if (!item) return;

    try {
        // מיפוי item עם currency ברמת ה-item (לפי הדוגמה)
        const gaItem = mapItemToGA4(item, true);

        const ecommercePayload = {
            items: [gaItem],
        };

        // הוספת affiliation (אופציונלי)
        ecommercePayload.affiliation = "Online Store";

        pushEcommerceEvent("add_to_cart", ecommercePayload);
    } catch (error) {
        console.error("Error tracking add_to_cart:", error);
    }
};

// Remove from Cart - כשמסירים פריט או מורידים כמות
export const trackRemoveFromCart = (item, total = null) => {
    if (!item) return;

    try {
        // מיפוי item עם currency ברמת ה-item (לפי הדוגמה)
        const gaItem = mapItemToGA4(item, true);

        pushEcommerceEvent("remove_from_cart", {
            items: [gaItem],
        });
    } catch (error) {
        console.error("Error tracking remove_from_cart:", error);
    }
};

// View Cart - כשצופים בעגלה (פתיחת drawer או עמוד עגלה)
export const trackViewCart = (cartItems, total = null) => {
    if (!cartItems || cartItems.length === 0) return;

    try {
        const gaItems = cartItems.map((item) => mapItemToGA4(item));

        const value =
            total !== null
                ? total
                : cartItems.reduce((sum, item) => {
                    const itemTotal = item.discountedPrice ??
                        ((item.price || item.prices?.price || 0) * item.quantity);
                    return sum + itemTotal;
                }, 0);

        pushEcommerceEvent("view_cart", {
            currency: "ILS",
            value,
            items: gaItems,
        });
    } catch (error) {
        console.error("Error tracking view_cart:", error);
    }
};

// Purchase - כשמבצעים רכישה
export const trackPurchase = (order) => {
    if (!order || !order.cart) return;

    try {
        // מיפוי items ללא currency ברמת ה-item (לפי הדוגמה של purchase)
        const gaItems = (order.cart || []).map((item) => mapItemToGA4(item, false));

        const value = order.total || order.totalAmount || 0;

        const ecommercePayload = {
            transaction_id: order.invoice || order._id || order.id,
            affiliation: "Online Store",
            value,
            tax: 0, // אם אין מע"מ נפרד
            shipping: order.shippingCost || 0,
            currency: "ILS",
            items: gaItems,
        };

        pushEcommerceEvent("purchase", ecommercePayload);
    } catch (error) {
        console.error("Error tracking purchase:", error);
    }
};


// ------------- Page View -------------

// Page View - כשמשתנה דף (route change ב-Next.js)
export const trackPageView = (url) => {
    if (!url) return;

    try {
        const pageLocation = typeof window !== "undefined" ? window.location.href : null;

        pushGAEvent("page_view", {
            page_location: pageLocation,
            page_path: url,
        });
    } catch (error) {
        console.error("Error tracking page_view:", error);
    }
};

export default {
    trackAddToCart,
    trackRemoveFromCart,
    trackViewCart,
    trackPurchase,
    trackPageView,
    isDataLayerAvailable,
};