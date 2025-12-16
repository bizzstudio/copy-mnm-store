// src/services/facebookPixel.js
// Meta (Facebook) Pixel Integration Service

/**
 * Meta Pixel Service - פונקציות עזר לאינטגרציה עם Meta Pixel
 * כולל tracking של אירועי ecommerce: ViewContent, AddToCart, InitiateCheckout, Purchase
 */

// בדיקה אם fbq זמין
const isFbqAvailable = () => {
    return typeof window !== "undefined" && typeof window.fbq === "function";
};

// מיפוי ID של מוצר – חשוב שיתאים ל-ID שבפיד של Meta Commerce
const getProductId = (item = {}) => {
    return (
        item.sku ||
        item.productId ||
        item.id ||
        item._id ||
        item.slug ||
        null
    );
};

// מיפוי פריט לפורמט contents של Meta
const mapItemToFb = (item) => {
    const unitPrice =
        item.rewardPrice ??
        item.discountedPrice ??
        item.price ??
        item.prices?.price ??
        0;
    const id = getProductId(item);

    return {
        id: id ? String(id) : "",
        quantity: item.quantity || 1,
        item_price: unitPrice,
    };
};

// Helper לחילוץ content_ids ישירות מה-items המקוריים
const getContentIds = (items = []) =>
    items
        .map((item) => getProductId(item))
        .filter(Boolean)
        .map(String);

// PageView (לניווטי SPA)
export const trackFbPageView = () => {
    if (!isFbqAvailable()) return;
    try {
        window.fbq("track", "PageView");
    } catch (err) {
        console.error("FB Pixel PageView error:", err);
    }
};

// ViewContent – צפייה במוצר
export const trackFbViewContent = (item) => {
    if (!isFbqAvailable() || !item) return;

    const id = getProductId(item);
    const unitPrice =
        item.rewardPrice ??
        item.discountedPrice ??
        item.price ??
        item.prices?.price ??
        0;

    if (!id) return;

    try {
        window.fbq("track", "ViewContent", {
            content_ids: [String(id)],
            content_type: "product",
            value: unitPrice,
            currency: "ILS",
        });
    } catch (err) {
        console.error("FB Pixel ViewContent error:", err);
    }
};

// AddToCart
export const trackFbAddToCart = (item, total = null) => {
    if (!isFbqAvailable() || !item) return;

    const mapped = mapItemToFb(item);
    const id = mapped.id;
    if (!id) return;

    const value =
        total !== null
            ? total
            : (item.price || item.prices?.price || 0) * (item.quantity || 1);

    try {
        window.fbq("track", "AddToCart", {
            content_ids: [id],
            content_type: "product",
            contents: [mapped],
            value,
            currency: "ILS",
        });
    } catch (err) {
        console.error("FB Pixel AddToCart error:", err);
    }
};

// InitiateCheckout – כשעוברים לצ'קאאוט
export const trackFbInitiateCheckout = (cartItems = [], total = 0) => {
    if (!isFbqAvailable() || !cartItems.length) return;

    const contents = cartItems.map(mapItemToFb);
    const content_ids = getContentIds(cartItems);

    try {
        window.fbq("track", "InitiateCheckout", {
            contents,
            content_ids,
            content_type: "product",
            value: total,
            currency: "ILS",
            num_items: cartItems.length,
        });
    } catch (err) {
        console.error("FB Pixel InitiateCheckout error:", err);
    }
};

// Purchase – בעמוד success
export const trackFbPurchase = (order) => {
    if (!isFbqAvailable() || !order || !order.cart) return;

    const contents = order.cart.map(mapItemToFb);
    const content_ids = getContentIds(order.cart);

    try {
        window.fbq("track", "Purchase", {
            contents,
            content_ids,
            content_type: "product",
            value: order.total || order.totalAmount || 0,
            currency: "ILS",
            num_items: order.cart.length,
            order_id: order.invoice || order._id || order.id,
        });
    } catch (err) {
        console.error("FB Pixel Purchase error:", err);
    }
};

// Custom Event – לשימוש כללי אם תצטרך
export const trackFbCustomEvent = (eventName, data = {}) => {
    if (!isFbqAvailable()) return;
    try {
        window.fbq("trackCustom", eventName, data);
    } catch (err) {
        console.error(`FB Pixel CustomEvent ${eventName} error:`, err);
    }
};

export default {
    isFbqAvailable,
    trackFbPageView,
    trackFbViewContent,
    trackFbAddToCart,
    trackFbInitiateCheckout,
    trackFbPurchase,
    trackFbCustomEvent,
};