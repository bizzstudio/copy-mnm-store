// src/component/reward-offers/rewardOffersUtils.js
// פונקציות עזר לזיהוי מוצרי מתנה זמינים מהמבצעים

import { findOptimalOfferCombination } from '../../utils/offerCalculations';

/**
 * מציאת מוצרי מתנה זמינים מהמבצעים (BUY_X_GET_Y ו-THRESHOLD_GET_ITEM)
 * משתמש ב-findOptimalOfferCombination כמקור אמת יחיד לחישוב המבצעים
 * @param {Array} cartItems - פריטי העגלה
 * @param {Array} offers - כל המבצעים הזמינים
 * @returns {Array} - רשימת מוצרי מתנה זמינים עם פרטי המבצע: [{offer, rewardProduct, rewardPrice, offerType, triggerProduct?}]
 */
export const findAvailableRewardProducts = (cartItems, offers = []) => {
    if (!Array.isArray(offers) || offers.length === 0 || !Array.isArray(cartItems) || cartItems.length === 0) {
        return [];
    }

    // שימוש ב-findOptimalOfferCombination כמקור אמת יחיד - היא כבר מחשבת את כל המבצעים בצורה נכונה
    const { appliedOffers } = findOptimalOfferCombination(cartItems, offers);

    const availableRewards = [];
    
    // סינון רק מבצעי BUY_X_GET_Y ו-THRESHOLD_GET_ITEM שחלו
    const appliedRewardOffers = appliedOffers.filter(appliedOffer => 
        (appliedOffer.type === 'BUY_X_GET_Y' || appliedOffer.type === 'THRESHOLD_GET_ITEM') &&
        appliedOffer.timesApplied > 0
    );

    // מציאת המבצעים המקוריים לפי type ו-name
    appliedRewardOffers.forEach(appliedOffer => {
        // מציאת המבצע המקורי - נחפש לפי type ו-name
        // אם יש כמה מבצעים מאותו type, נבדוק את ה-name
        const matchingOffers = offers.filter(offer => 
            offer.type === appliedOffer.type &&
            offer.rewardPrice === 0 && // רק מתנות חינם
            offer.rewardProduct // יש מוצר מתנה
        );

        // אם יש רק אחד, זה פשוט
        if (matchingOffers.length === 1) {
            const offer = matchingOffers[0];
            
            if (appliedOffer.type === 'BUY_X_GET_Y' && offer.triggerProduct) {
                availableRewards.push({
                    offer,
                    rewardProduct: offer.rewardProduct,
                    rewardPrice: offer.rewardPrice,
                    offerType: 'BUY_X_GET_Y',
                    triggerProduct: offer.triggerProduct,
                    offerName: offer.name || {},
                    offerId: offer._id
                });
            } else if (appliedOffer.type === 'THRESHOLD_GET_ITEM') {
                availableRewards.push({
                    offer,
                    rewardProduct: offer.rewardProduct,
                    rewardPrice: offer.rewardPrice,
                    offerType: 'THRESHOLD_GET_ITEM',
                    triggerProduct: null,
                    offerName: offer.name || {},
                    offerId: offer._id
                });
            }
        } else if (matchingOffers.length > 1) {
            // אם יש כמה, נבדוק לפי name
            const offerNameStr = typeof appliedOffer.name === 'string' 
                ? appliedOffer.name 
                : JSON.stringify(appliedOffer.name);
            
            const matchingOffer = matchingOffers.find(offer => {
                const offerNameStr2 = typeof offer.name === 'string'
                    ? offer.name
                    : JSON.stringify(offer.name || {});
                return offerNameStr === offerNameStr2;
            });

            if (matchingOffer) {
                if (appliedOffer.type === 'BUY_X_GET_Y' && matchingOffer.triggerProduct) {
                    availableRewards.push({
                        offer: matchingOffer,
                        rewardProduct: matchingOffer.rewardProduct,
                        rewardPrice: matchingOffer.rewardPrice,
                        offerType: 'BUY_X_GET_Y',
                        triggerProduct: matchingOffer.triggerProduct,
                        offerName: matchingOffer.name || {},
                        offerId: matchingOffer._id
                    });
                } else if (appliedOffer.type === 'THRESHOLD_GET_ITEM') {
                    availableRewards.push({
                        offer: matchingOffer,
                        rewardProduct: matchingOffer.rewardProduct,
                        rewardPrice: matchingOffer.rewardPrice,
                        offerType: 'THRESHOLD_GET_ITEM',
                        triggerProduct: null,
                        offerName: matchingOffer.name || {},
                        offerId: matchingOffer._id
                    });
                }
            }
        }
    });

    return availableRewards;
};

/**
 * בדיקה אם מוצר מתנה כבר קיים בעגלה
 * @param {Array} cartItems - פריטי העגלה
 * @param {String} rewardProductId - ID של מוצר המתנה
 * @param {String} offerId - ID של המבצע
 * @returns {Boolean} - true אם המוצר כבר בעגלה
 */
export const isRewardProductInCart = (cartItems, rewardProductId, offerId) => {
    if (!Array.isArray(cartItems)) return false;

    return cartItems.some(item =>
        item.isRewardProduct &&
        item._id === rewardProductId &&
        item.rewardOfferId === offerId
    );
};

/**
 * סינון מוצרי מתנה זמינים שלא בעגלה
 * @param {Array} availableRewards - רשימת מוצרי מתנה זמינים
 * @param {Array} cartItems - פריטי העגלה
 * @returns {Array} - רשימת מוצרי מתנה זמינים שלא בעגלה
 */
export const filterRewardsNotInCart = (availableRewards, cartItems) => {
    return availableRewards.filter(reward =>
        !isRewardProductInCart(cartItems, reward.rewardProduct._id, reward.offerId)
    );
};

