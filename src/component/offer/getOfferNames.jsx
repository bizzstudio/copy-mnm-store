// getOfferNames.jsx
/**
 * פונקציה שמחזירה את שמות המבצעים עבור מוצר מסוים.
 * @param {Array} offers - מערך המבצעים
 * @param {Object} product - אובייקט המוצר
 * @param {String} separator - מפריד בין שמות המבצעים (ברירת מחדל: " / ")
 * @returns {String|null} - מחרוזת שמות המבצעים מופרדים במפריד או null אם אין מבצעים
 */
const getOfferNames = (offers, product, separator = " / ") => {
    if (!Array.isArray(offers) || !product || !product._id) {
        return null;
    };

    const offerNames = offers
        .filter((offer) => {
            // BUNDLE_PRICE - אם המוצר נמצא ברשימת products
            if (offer.type === "BUNDLE_PRICE") {
                return offer.products && offer.products.some((prod) => {
                    // תמיכה גם אם prod הוא ObjectId או אובייקט מוצר
                    const prodId = typeof prod === 'object' && prod._id ? prod._id : prod;
                    return prodId === product._id;
                });
            }

            // BUY_X_GET_Y - אם המוצר הוא triggerProduct או rewardProduct
            if (offer.type === "BUY_X_GET_Y") {
                const triggerId = offer.triggerProduct?._id || offer.triggerProduct;
                const rewardId = offer.rewardProduct?._id || offer.rewardProduct;
                return triggerId === product._id || rewardId === product._id;
            }

            // THRESHOLD_GET_ITEM - אם המוצר הוא rewardProduct
            if (offer.type === "THRESHOLD_GET_ITEM") {
                const rewardId = offer.rewardProduct?._id || offer.rewardProduct;
                return rewardId === product._id;
            }

            return false;
        })
        .map((offer) => {
            // תמיכה ב-name שהוא אובייקט {he: "...", en: "..."} או string
            if (typeof offer.name === 'object' && offer.name !== null) {
                return offer.name.he || offer.name.en || '';
            }
            return offer.name || '';
        }); // מחלץ את שם המבצע (תמיכה גם ב-object וגם ב-string)

    if (offerNames.length === 0) {
        return null;
    };

    // יצירת אלמנט React עם מפריד דינמי
    return (
        <>
            {offerNames.map((name, index) => (
                <span key={index}>
                    {name}
                    {index < offerNames.length - 1 && separator}
                </span>
            ))}
        </>
    );
};

export default getOfferNames;