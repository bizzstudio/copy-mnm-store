// src/component/cart/ThresholdDiscountSlider.jsx
import React, { useContext, useState, useEffect, useMemo, useRef } from "react";
import Confetti from "react-confetti";
import { useTranslations } from "next-intl";
import { SidebarContext } from "@context/SidebarContext";
import useCart from "@hooks/useCart";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { IoSparkles, IoGift } from "react-icons/io5";
import { AiFillFire } from "react-icons/ai";

const ThresholdDiscountSlider = () => {
    const t = useTranslations();
    const { offers } = useContext(SidebarContext);
    const { customCartTotal, thresholdDiscount } = useCart();
    const { currency, showingTranslateValue } = useUtilsFunction();

    const [showConfetti, setShowConfetti] = useState(false);
    const [celebratedThresholds, setCelebratedThresholds] = useState(new Set());
    const containerRef = useRef(null);
    const [containerRect, setContainerRect] = useState(null);

    // מיון כל מבצעי THRESHOLD_DISCOUNT לפי thresholdAmount (מהנמוך לגבוה)
    const thresholdDiscountOffers = useMemo(() => {
        if (!offers || !Array.isArray(offers)) return [];
        return offers
            .filter(o => o.type === 'THRESHOLD_DISCOUNT')
            .sort((a, b) => (a.thresholdAmount || 0) - (b.thresholdAmount || 0));
    }, [offers]);

    // מציאת המבצע הבא להשגה (או הנוכחי אם הושג)
    const { currentOffer, nextOffer, progress, amountRemaining, isAchieved } = useMemo(() => {
        if (!thresholdDiscountOffers.length || typeof customCartTotal !== 'number') {
            return { currentOffer: null, nextOffer: null, progress: 0, amountRemaining: 0, isAchieved: false };
        }

        // מצא את ההנחה הגבוהה ביותר שהושגה
        let achievedOffer = null;
        let nextOfferToReach = null;

        for (let i = thresholdDiscountOffers.length - 1; i >= 0; i--) {
            const offer = thresholdDiscountOffers[i];
            if (customCartTotal >= offer.thresholdAmount) {
                achievedOffer = offer;
                // המבצע הבא הוא זה שאחרי
                if (i < thresholdDiscountOffers.length - 1) {
                    nextOfferToReach = thresholdDiscountOffers[i + 1];
                }
                break;
            }
        }

        // אם לא הושג שום מבצע, המבצע הבא הוא הראשון
        if (!achievedOffer) {
            nextOfferToReach = thresholdDiscountOffers[0];
        }

        // חישוב ההתקדמות
        let progressValue = 0;
        let remaining = 0;

        if (nextOfferToReach) {
            // יש מבצע בא - חשב התקדמות אליו
            const startPoint = achievedOffer ? achievedOffer.thresholdAmount : 0;
            const endPoint = nextOfferToReach.thresholdAmount;
            const currentProgress = customCartTotal - startPoint;
            const totalNeeded = endPoint - startPoint;
            progressValue = Math.min((currentProgress / totalNeeded) * 100, 100);
            remaining = Math.max(endPoint - customCartTotal, 0);
        } else if (achievedOffer) {
            // הושג המבצע הגבוה ביותר
            progressValue = 100;
            remaining = 0;
        }

        return {
            currentOffer: achievedOffer,
            nextOffer: nextOfferToReach,
            progress: progressValue,
            amountRemaining: remaining,
            isAchieved: !!achievedOffer && !nextOfferToReach
        };
    }, [thresholdDiscountOffers, customCartTotal]);

    // עדכון מיקום הקונטיינר עבור הקונפטי
    useEffect(() => {
        if (containerRef.current && showConfetti) {
            const rect = containerRef.current.getBoundingClientRect();
            setContainerRect(rect);
        }
    }, [showConfetti]);
    
    // עדכון ראשוני של מיקום הקונטיינר
    useEffect(() => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setContainerRect(rect);
        }
    }, []);

    // אפקט קונפטי כשמגיעים לטרשהולד חדש
    useEffect(() => {
        // יצירת מזהה ייחודי למבצע
        const offerId = currentOffer?._id || currentOffer?.thresholdAmount;
        
        if (currentOffer && offerId && !celebratedThresholds.has(offerId)) {
            // עדכון מיקום הקונטיינר לפני הצגת הקונפטי
            if (containerRef.current) {
                setContainerRect(containerRef.current.getBoundingClientRect());
            }
            
            setShowConfetti(true);
            setCelebratedThresholds(prev => new Set([...prev, offerId]));

            // כבה את הקונפטי אחרי 3 שניות
            const timer = setTimeout(() => {
                setShowConfetti(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [currentOffer, celebratedThresholds]);

    // חישוב צבע הגרדיאנט לסליידר
    const getGradientStyle = () => {
        if (progress >= 100) {
            return {
                background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
            };
        }

        return {
            background: `linear-gradient(90deg, 
                #ef4444 0%, 
                #f97316 25%, 
                #eab308 50%, 
                #84cc16 75%, 
                #22c55e 100%)`,
            backgroundSize: '200% 100%',
            backgroundPosition: `${progress}% 0%`,
        };
    };

    // קביעת ההודעה המתאימה לפי הכמות שנשארה
    const getEncouragementMessage = () => {
        if (!nextOffer || amountRemaining <= 0) {
            return t('almostThere');
        }

        if (amountRemaining > 100) {
            return t('moreThan100Left', {
                amount: amountRemaining.toFixed(0),
                currency,
            });
        } else if (amountRemaining >= 50) {
            return t('onlyXLeft', {
                amount: amountRemaining.toFixed(0),
                currency,
            });
        } else if (amountRemaining >= 20) {
            return t('littleMoreLeft');
        } else {
            return t('almostThere');
        }
    };

    // אם אין מבצעי THRESHOLD_DISCOUNT, לא מציגים כלום
    if (!thresholdDiscountOffers.length) {
        return null;
    }

    // אם הסכום בעגלה הוא 0, מציגים רק את המבצע הראשון
    if (typeof customCartTotal !== 'number' || customCartTotal === 0) {
        const firstOffer = thresholdDiscountOffers[0];
        if (!firstOffer) return null;

        return (
            <div className="mb-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="flex items-center gap-2">
                    <AiFillFire className="text-orange-500" />
                    <span className="text-sm font-medium text-gray-700">
                        {showingTranslateValue(firstOffer.name)}
                    </span>
                </div>
            </div>
        );
    }

    const targetOffer = nextOffer || currentOffer;

    return (
        <div className="mb-3 relative" ref={containerRef}>
            {/* קונפטי - יוצא מהפינות התחתונות */}
            {showConfetti && typeof window !== 'undefined' && containerRect && (
                <div className="fixed inset-0 pointer-events-none z-50">
                    {/* קונפטי מהפינה השמאלית התחתונה */}
                    <Confetti
                        width={window.innerWidth}
                        height={window.innerHeight}
                        recycle={false}
                        numberOfPieces={100}
                        gravity={0.3}
                        initialVelocityX={{ min: 2, max: 8 }}
                        initialVelocityY={{ min: -20, max: -10 }}
                        confettiSource={{
                            x: containerRect.left,
                            y: containerRect.bottom,
                            w: 5,
                            h: 0
                        }}
                        tweenDuration={1000}
                    />
                    {/* קונפטי מהפינה הימנית התחתונה */}
                    <Confetti
                        width={window.innerWidth}
                        height={window.innerHeight}
                        recycle={false}
                        numberOfPieces={100}
                        gravity={0.3}
                        initialVelocityX={{ min: -8, max: -2 }}
                        initialVelocityY={{ min: -20, max: -10 }}
                        confettiSource={{
                            x: containerRect.right,
                            y: containerRect.bottom,
                            w: 5,
                            h: 0
                        }}
                        tweenDuration={1000}
                    />
                </div>
            )}

            {/* הסליידר */}
            <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                {/* כותרת - שם ההנחה */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        {isAchieved ? (
                            <IoGift className="text-green-500 text-lg" />
                        ) : (
                            <AiFillFire className="text-orange-500 text-lg" />
                        )}
                        <span className={`text-sm font-medium ${isAchieved ? 'text-green-700' : 'text-gray-700'}`}>
                            {isAchieved
                                ? t('discountUnlocked')
                                : showingTranslateValue(targetOffer?.name)}
                        </span>
                    </div>
                </div>

                {/* בר התקדמות */}
                <div className="relative h-3 mb-2" dir="ltr">
                    <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                        {/* בר ההתקדמות */}
                        <div
                            className="h-full rounded-full"
                            style={{
                                width: `${Math.max(progress, 3)}%`,
                                ...getGradientStyle(),
                                transition: 'width 0.5s ease-out',
                            }}
                        />
                    </div>

                    {/* אייקון בסוף הבר - רק אם לא הגענו ל-100% של ההנחה הגבוהה ביותר */}
                    {!isAchieved && (
                        <div
                            className="absolute top-1/2 z-10"
                            style={{
                                left: `calc(${Math.max(progress, 3)}% - 14px)`,
                                transform: 'translateY(-50%)',
                                transition: 'left 0.5s ease-out',
                            }}
                        >
                            <AiFillFire className="text-orange-500 text-lg drop-shadow-md" />
                        </div>
                    )}
                </div>

                {/* מידע על המבצע - הודעות עידוד */}
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                        {currency}{customCartTotal?.toFixed(0) || 0} / {currency}{targetOffer?.thresholdAmount}
                    </span>
                    <span className={`font-medium ${isAchieved ? 'text-green-600' : 'text-orange-600'}`}>
                        {isAchieved
                            ? `${targetOffer?.discountType === 'percentage'
                                ? `${targetOffer?.discountValue}%`
                                : `${currency}${targetOffer?.discountValue}`}`
                            : getEncouragementMessage()}
                    </span>
                </div>

                {/* הודעה על ההנחה שהושגה */}
                {currentOffer && (
                    <div className={`mt-2 p-2 rounded-lg ${isAchieved
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-green-50/50 border border-green-100'
                        }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <IoSparkles className="text-green-600 text-sm" />
                                <span className="text-xs font-medium text-green-700">
                                    {showingTranslateValue(currentOffer.name)}
                                </span>
                            </div>
                            <span className="text-xs font-bold text-green-700">
                                -{currency}{thresholdDiscount?.toFixed(2)}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ThresholdDiscountSlider;