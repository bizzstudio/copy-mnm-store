// src/services/flashy.js
// Flashy Marketing Automation Integration Service

/**
 * Flashy Service - פונקציות עזר לאינטגרציה עם Flashy
 * כולל tracking של אירועים, זיהוי משתמשים ועדכון עגלה
 */

// רשימות Flashy
const NEWSLETTER_LIST_ID = process.env.NEXT_PUBLIC_FLASHY_LIST_WELCOME;
const BUYERS_LIST_ID = process.env.NEXT_PUBLIC_FLASHY_LIST_BUYERS;

// בדיקה אם Flashy זמין
const isFlashyAvailable = () => {
    return typeof window !== 'undefined' && window.flashy;
};

// פונקציה כללית לשליחת אירועים ל-Flashy
const trackEvent = (eventName, eventData = {}) => {
    if (!isFlashyAvailable()) {
        console.warn('Flashy is not available');
        return;
    }

    try {
        window.flashy(eventName, eventData);
        // console.log(`Flashy event tracked: ${eventName}`, eventData);
    } catch (error) {
        console.error('Error tracking Flashy event:', error);
    }
};

// הוספת קונטקט לרשימה ספציפית
const addContactToList = (email, listId, extraFields = {}) => {
    if (!email || !listId) return;
    if (!isFlashyAvailable() || !window.flashy?.contacts) return;

    try {
        const payload = {
            email,
            lists: {
                [listId]: true,   // Opt-in לרשימה הספציפית
            },
            ...extraFields,
        };

        window.flashy.contacts.createOrUpdate(payload);
    } catch (err) {
        console.error('Error adding contact to Flashy list:', err);
    }
};

// Page View Tracking
export const trackPageView = (url = window.location.pathname) => {
    if (!isFlashyAvailable()) return;

    // בדיקה אם זה עמוד מוצר
    if (url.includes('/product/')) {
        const slug = url.split('/product/')[1];
        trackEvent('ViewContent', { content_ids: [slug] });
    }
    // בדיקה אם זה עמוד קטגוריה
    else if (url.includes('/product-category/')) {
        const category = url.split('/product-category/')[1];
        trackEvent('CustomEvent', {
            event_name: 'ViewCategory',
            category
        });
    }
    // בדיקה אם זה עמוד מבצעים
    else if (url.includes('/offers')) {
        trackEvent('CustomEvent', { event_name: 'ViewOffersPage' });
    }
    // בדיקה אם זה עמוד blogs
    else if (url.includes('/blogs')) {
        trackEvent('CustomEvent', { event_name: 'ViewBlogList' });
    }
    // עמוד רגיל
    else {
        trackEvent('PageView');
    }
};

// Product View in Modal
export const trackProductModalView = (productId) => {
    if (!productId) return;

    trackEvent('ViewContent', { content_ids: [productId] });
    trackEvent('CustomEvent', {
        event_name: 'OpenedProductModal',
        product_id: productId
    });
};

// Cart Update Tracking
export const trackCartUpdate = (cartItems, total, currency = 'ILS') => {
    if (!cartItems || cartItems.length === 0) return;

    const contentIds = cartItems.map(item => item.id || item._id);

    trackEvent('UpdateCart', {
        content_ids: contentIds,
        value: total,
        currency: currency
    });
};

// Purchase Tracking
export const trackPurchase = (order) => {
    if (!order || !order.cart) return;

    const contentIds = order.cart.map(item => item.sku || item.product_id || item._id);

    const email = order?.user_info?.email || '';

    trackEvent('Purchase', {
        order_id: order.invoice || order._id || order.id,
        content_ids: contentIds,
        value: order.total || order.totalAmount,
        currency: 'ILS',
        email: email || undefined,
    });

    // מוסיף את הלקוח לרשימת "רוכשים באתר"
    if (email) {
        addContactToList(email, BUYERS_LIST_ID, {
            first_name: order?.user_info?.name || '',
            last_name: order?.user_info?.lastName || '',
            phone: order?.user_info?.contact || '',
        });
    }
};

// User Identification
export const identifyUser = (user) => {
    if (!user?.email) return;

    // מזהה את המשתמש לאירועים
    trackEvent('setCustomer', { email: user.email });

    if (!isFlashyAvailable() || !window.flashy.contacts) return;

    try {
        // אם אין lastName בכלל - ננסה לחלץ מהמחרוזת name (אם היא מורכבת)
        let firstName = user.name?.trim() || '';
        let lastName = user.lastName?.trim() || '';

        if (!lastName && firstName.includes(' ')) {
            const parts = firstName.split(/\s+/);
            firstName = parts[0];
            lastName = parts.slice(1).join(' ');
        }

        // בונים payload נקי
        const payload = { email: user.email };
        if (firstName) payload.first_name = firstName;
        if (lastName) payload.last_name = lastName;

        window.flashy.contacts.createOrUpdate(payload);
    } catch (err) {
        console.error('Error creating/updating Flashy contact:', err);
    }
};

// Newsletter Signup
export const trackNewsletterSignup = (email, firstName = '', lastName = '', phone = '') => {
    if (!email) return;

    const extraFields = {
        first_name: firstName,
        last_name: lastName,
    };

    // מוסיף טלפון רק אם הוא קיים
    if (phone) {
        extraFields.phone = phone;
    }

    // מוסיף לרשימת "פופאפ ברוכים הבאים" (ה־NEWSLETTER_LIST_ID)
    addContactToList(email, NEWSLETTER_LIST_ID, extraFields);

    // אופציונלי: אירוע מותאם
    trackEvent('CustomEvent', {
        event_name: 'NewsletterSignup',
        email,
        phone: phone || undefined,
    });
};

// Purchase Status Update (for webhooks)
export const trackPurchaseUpdate = (orderId, status, value = null) => {
    trackEvent('PurchaseUpdated', {
        order_id: orderId,
        status: status,
        value: value,
        currency: 'ILS'
    });
};

// Custom Event Tracking
export const trackCustomEvent = (eventName, eventData = {}) => {
    trackEvent('CustomEvent', {
        event_name: eventName,
        ...eventData
    });
};

// Debounced Cart Update (למניעת שליחות מרובות)
let cartUpdateTimeout;
export const debouncedCartUpdate = (cartItems, total, currency = 'ILS') => {
    clearTimeout(cartUpdateTimeout);
    cartUpdateTimeout = setTimeout(() => {
        trackCartUpdate(cartItems, total, currency);
    }, 500); // חצי שנייה
};

export default {
    trackPageView,
    trackProductModalView,
    trackCartUpdate,
    trackPurchase,
    identifyUser,
    trackNewsletterSignup,
    trackPurchaseUpdate,
    trackCustomEvent,
    debouncedCartUpdate,
    isFlashyAvailable
};