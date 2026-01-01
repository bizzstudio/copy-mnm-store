// src/hooks/useCart.jsx
import { useCart as useOriginalCart } from 'react-use-cart';
import { useContext, useEffect, useState, useRef } from 'react';
import { SidebarContext } from '@context/SidebarContext';
import { UserContext } from '@context/UserContext';
import { debouncedCartUpdate } from '@services/flashy';
import { trackAddToCart, trackRemoveFromCart } from '@services/googleAnalytics';
import { trackFbAddToCart, trackFbCustomEvent } from '@services/facebookPixel';
import { notifyError } from '@utils/toast';
import { useTranslations } from "next-intl";
import { findOptimalOfferCombination } from '@utils/offerCalculations';
import { getUserPrice } from '@utils/priceUtils';

const useCart = () => {
    const cart = useOriginalCart();
    const { offers } = useContext(SidebarContext);
    const { state: { userInfo } } = useContext(UserContext);
    const t = useTranslations();

    // Ref לשמירת מצב קודם של העגלה למעקב שינויים
    const prevCartItemsRef = useRef([]);

    // Wrapper ל-addItem עם בדיקת purchaseLimit
    const addItemWithLimitCheck = (product, quantity = 1) => {
        // בדיקת purchaseLimit
        if (product?.purchaseLimit && product?.purchaseLimit > 0) {
            const existingItem = cart.items.find((item) => item.id === product.id);

            if (existingItem) {
                // המוצר כבר קיים - בדיקה אם הכמות החדשה תעבור את המגבלה
                // משתמשים ב-purchaseLimit של המוצר הקיים או החדש
                const itemPurchaseLimit = existingItem.purchaseLimit || product.purchaseLimit;
                if (existingItem.quantity + quantity > itemPurchaseLimit) {
                    notifyError(t('maxQuantityReached'));
                    return { added: 0, limit: itemPurchaseLimit, current: existingItem.quantity };
                }
                // הכל תקין - מוסיף את הכמות המלאה
                // שומרים את purchaseLimit אם יש
                const itemToAdd = itemPurchaseLimit ? { ...product, purchaseLimit: itemPurchaseLimit } : product;
                cart.addItem(itemToAdd, quantity);

                // Google Analytics - add_to_cart (כשמוסיפים כמות למוצר קיים)
                const itemForTracking = { ...itemToAdd, quantity };
                trackAddToCart(itemForTracking);
                trackFbAddToCart(itemForTracking);

                return { added: quantity, limit: itemPurchaseLimit, current: existingItem.quantity + quantity };
            } else {
                // המוצר לא קיים - בדיקה אם הכמות הראשונית עולה על המגבלה
                if (quantity > product.purchaseLimit) {
                    notifyError(t('exceedingMaxQuantity', { limit: product.purchaseLimit }));
                    // מוסיף רק עד המגבלה עם שמירת purchaseLimit
                    const itemToAdd = product.purchaseLimit ? { ...product, purchaseLimit: product.purchaseLimit } : product;
                    cart.addItem(itemToAdd, product.purchaseLimit);

                    // Google Analytics - add_to_cart (מוצר חדש עם מגבלה)
                    const itemForTracking = { ...itemToAdd, quantity: product.purchaseLimit };
                    trackAddToCart(itemForTracking);
                    trackFbAddToCart(itemForTracking);

                    return { added: product.purchaseLimit, limit: product.purchaseLimit, requested: quantity };
                }
                // הכל תקין - מוסיף את הכמות המלאה
                cart.addItem(product, quantity);

                // Google Analytics - add_to_cart (מוצר חדש)
                const itemForTracking = { ...product, quantity };
                trackAddToCart(itemForTracking);
                trackFbAddToCart(itemForTracking);

                return { added: quantity, limit: product.purchaseLimit, current: quantity };
            }
        }

        // הוספה רגילה אם אין מגבלה או אם הכל תקין
        cart.addItem(product, quantity);

        // Google Analytics - add_to_cart
        const itemForTracking = { ...product, quantity };
        trackAddToCart(itemForTracking);
        trackFbAddToCart(itemForTracking);

        return { added: quantity };
    };

    // Wrapper ל-updateItemQuantity עם בדיקת purchaseLimit
    const updateItemQuantityWithLimitCheck = (id, quantity) => {
        const existingItem = cart.items.find((item) => item.id === id);

        if (existingItem && existingItem.purchaseLimit && existingItem.purchaseLimit > 0) {
            // בדיקה אם הכמות החדשה תעבור את המגבלה
            if (quantity > existingItem.purchaseLimit) {
                notifyError(t('maxQuantityReached'));
                return;
            }
        }

        // בדיקה אם זה הוספה או הסרה למעקב GA4
        if (existingItem) {
            const oldQuantity = existingItem.quantity;
            const newQuantity = quantity;

            if (newQuantity > oldQuantity) {
                // הוספת כמות - add_to_cart
                const quantityAdded = newQuantity - oldQuantity;
                const itemForTracking = { ...existingItem, quantity: quantityAdded };
                trackAddToCart(itemForTracking);
                trackFbAddToCart(itemForTracking);
            } else if (newQuantity < oldQuantity && newQuantity > 0) {
                // הורדת כמות - remove_from_cart
                const quantityRemoved = oldQuantity - newQuantity;
                const itemForTracking = { ...existingItem, quantity: quantityRemoved };
                trackRemoveFromCart(itemForTracking);
                trackFbCustomEvent("RemoveFromCart", {
                    content_ids: [String(itemForTracking.sku || itemForTracking.id || itemForTracking._id)],
                    quantity: quantityRemoved,
                });
            }
            // אם newQuantity === 0, זה יוסר ב-removeItem
        }

        // עדכון רגיל אם אין מגבלה או אם הכל תקין
        cart.updateItemQuantity(id, quantity);
    };

    // Wrapper ל-removeItem עם Google Analytics
    const removeItemWithTracking = (id) => {
        const itemToRemove = cart.items.find((item) => item.id === id);

        if (itemToRemove) {
            // Google Analytics - remove_from_cart
            trackRemoveFromCart(itemToRemove);
            trackFbCustomEvent("RemoveFromCart", {
                content_ids: [String(itemToRemove.sku || itemToRemove.id || itemToRemove._id)],
                quantity: itemToRemove.quantity || 1,
            });
        }

        cart.removeItem(id);
    };

    const [customCart, setCustomCart] = useState({
        customCartTotal: 0,
        updatedCartItems: [],
        thresholdDiscount: 0,
        appliedOffers: []
    });

    useEffect(() => {
        if (cart.totalItems === 0) {
            // אם אין פריטים בעגלה, אין צורך לבצע חישוב
            setCustomCart({
                customCartTotal: 0,
                updatedCartItems: cart.items,
                thresholdDiscount: 0,
                appliedOffers: []
            });
            return;
        }

        // 1. החלת מבצעים על העגלה באמצעות האלגוריתם החדש
        const {
            updatedCartItems,
            totalDiscount,
            appliedOffers,
            thresholdDiscount
        } = findOptimalOfferCombination(cart.items, offers, userInfo);

        // 2. חישוב הסכום הכולל
        let localTotal = 0;

        // חישוב מחירים לאחר מבצעים
        updatedCartItems.forEach(item => {
            // קבלת המחיר המדוייק ללקוח (אם המוצר לא כבר עם מחיר מוגדר מהעגלה)
            const itemPrice = item.price || getUserPrice(item, userInfo).price;

            if (item.isRewardProduct) {
                // מוצר פרס - מחיר לפי rewardPrice
                localTotal += (item.rewardPrice || 0) * item.quantity;
            } else if (item.discountedPrice) {
                // מוצר עם הנחת מבצע
                localTotal += item.discountedPrice;
            } else {
                // מוצר במחיר רגיל - משתמש במחיר המדוייק ללקוח
                localTotal += itemPrice * item.quantity;
            }
        });

        // 3. שמירה ב-state
        setCustomCart({
            customCartTotal: localTotal,
            updatedCartItems,
            thresholdDiscount: thresholdDiscount || 0,
            appliedOffers: appliedOffers || []
        });

        // 4. Flashy Cart Tracking
        debouncedCartUpdate(updatedCartItems, localTotal, 'ILS');

        // עדכון ref למצב הקודם
        prevCartItemsRef.current = updatedCartItems;
    }, [cart, offers]);

    return {
        ...cart,
        customCartTotal: customCart.customCartTotal,
        items: customCart.updatedCartItems,
        thresholdDiscount: customCart.thresholdDiscount,
        appliedOffers: customCart.appliedOffers,
        addItem: addItemWithLimitCheck, // משתמש ב-wrapper עם בדיקת purchaseLimit
        updateItemQuantity: updateItemQuantityWithLimitCheck, // משתמש ב-wrapper עם בדיקת purchaseLimit
        removeItem: removeItemWithTracking, // משתמש ב-wrapper עם Google Analytics tracking
    };
};

export default useCart;