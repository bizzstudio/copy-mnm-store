// src/component/reward-offers/RewardOffersManager.jsx
import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { SidebarContext } from "@context/SidebarContext";
import useCart from "@hooks/useCart";
import RewardProductModal from "@component/reward-offers/RewardProductModal";
import RewardOffersBadge from "@component/reward-offers/RewardOffersBadge";
import { findAvailableRewardProducts, filterRewardsNotInCart } from "@component/reward-offers/rewardOffersUtils";

const RewardOffersManager = ({
    addressPopup,
    showRegisterSuccess,
    currentPopup,
}) => {
    const router = useRouter();
    const { pathname } = router;
    const { items } = useCart();
    const { offers } = useContext(SidebarContext);

    // State לניהול פופאפ מוצרי מתנה
    const [showRewardModal, setShowRewardModal] = useState(false);
    const [currentRewardIndex, setCurrentRewardIndex] = useState(0);
    const [availableRewards, setAvailableRewards] = useState([]);
    const [rewardsToShow, setRewardsToShow] = useState([]); // רשימת מוצרי מתנה להצגה בפופאפ
    const [isAutoPopup, setIsAutoPopup] = useState(false); // האם זה פופאפ אוטומטי כשמוצר נכנס לעגלה

    // חישוב מוצרי מתנה זמינים שלא בעגלה
    useEffect(() => {
        if (!Array.isArray(items) || !Array.isArray(offers)) return;

        const available = findAvailableRewardProducts(items, offers);
        const notInCart = filterRewardsNotInCart(available, items);
        setAvailableRewards(notInCart);
    }, [items, offers]);

    // 1. פופאפ אוטומטי - כשמוצר מתנה נוסף לעגלה
    useEffect(() => {
        if (!Array.isArray(items) || !Array.isArray(offers)) return;
        if (addressPopup || showRegisterSuccess || currentPopup || showRewardModal) return;

        // מציאת מוצרי מתנה חדשים שנוספו לעגלה
        const rewardItemsInCart = items.filter(item =>
            item.isRewardProduct && item.rewardPrice === 0 && item.rewardOfferId
        );

        if (rewardItemsInCart.length === 0) return;

        // מציאת מוצר מתנה הראשון שלא הוצג עליו פופאפ
        for (const rewardItem of rewardItemsInCart) {
            const storageKey = `rewardModalShown_${rewardItem.rewardOfferId}_${rewardItem._id}`;
            const hasShown = sessionStorage.getItem(storageKey);

            if (!hasShown) {
                // מציאת המבצע המתאים
                const matchingOffer = offers.find(o => o._id === rewardItem.rewardOfferId);
                if (matchingOffer) {
                    const rewardData = {
                        offer: matchingOffer,
                        rewardProduct: rewardItem,
                        rewardPrice: rewardItem.rewardPrice,
                        offerType: rewardItem.rewardOfferType,
                        triggerProduct: matchingOffer.triggerProduct || null,
                        offerName: rewardItem.rewardOfferName || matchingOffer.name || {},
                        offerId: matchingOffer._id
                    };

                    setRewardsToShow([rewardData]);
                    setCurrentRewardIndex(0);
                    setIsAutoPopup(true); // זה פופאפ אוטומטי
                    setShowRewardModal(true);
                    sessionStorage.setItem(storageKey, 'true');
                }
            }
        }
    }, [items, offers, addressPopup, showRegisterSuccess, currentPopup, showRewardModal, pathname]);

    // 2. פופאפ תקופתי - כל 10 דקות
    useEffect(() => {
        if (!Array.isArray(availableRewards) || availableRewards.length === 0) return;
        if (addressPopup || showRegisterSuccess || currentPopup || showRewardModal) return;
        if (pathname === '/checkout') return; // לא בעמוד תשלום

        const checkPeriodicRewards = () => {
            // מציאת מוצרי מתנה שלא הוצג עליהם פופאפ
            const unrevealedRewards = availableRewards.filter(reward => {
                const storageKey = `rewardModalShown_${reward.offerId}_${reward.rewardProduct._id}`;
                return !sessionStorage.getItem(storageKey);
            });

            if (unrevealedRewards.length > 0) {
                // מציג את הראשון שלא הוצג
                setRewardsToShow([unrevealedRewards[0]]);
                setCurrentRewardIndex(0);
                setIsAutoPopup(false); // זה פופאפ תקופתי, לא אוטומטי
                setShowRewardModal(true);
                const storageKey = `rewardModalShown_${unrevealedRewards[0].offerId}_${unrevealedRewards[0].rewardProduct._id}`;
                sessionStorage.setItem(storageKey, 'true');
            }
        };

        // בדיקה ראשונית אחרי 10 דקות
        const initialTimer = setTimeout(checkPeriodicRewards, 10 * 60 * 1000);

        // בדיקה תקופתית כל 10 דקות
        const interval = setInterval(checkPeriodicRewards, 10 * 60 * 1000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, [availableRewards, addressPopup, showRegisterSuccess, currentPopup, showRewardModal, pathname]);

    // פונקציות לניווט בין מוצרי מתנה בפופאפ
    const handleNextReward = () => {
        if (currentRewardIndex < rewardsToShow.length - 1) {
            setCurrentRewardIndex(currentRewardIndex + 1);
        }
    };

    const handlePreviousReward = () => {
        if (currentRewardIndex > 0) {
            setCurrentRewardIndex(currentRewardIndex - 1);
        }
    };

    // סגירת פופאפ מוצרי מתנה
    const handleCloseRewardModal = () => {
        setShowRewardModal(false);
        setRewardsToShow([]);
        setCurrentRewardIndex(0);
        setIsAutoPopup(false);
    };

    // פתיחת פופאפ מוצרי מתנה מהבאדג'
    const handleOpenRewardModalFromBadge = () => {
        if (availableRewards.length > 0) {
            setRewardsToShow(availableRewards);
            setCurrentRewardIndex(0);
            setIsAutoPopup(false); // זה לא פופאפ אוטומטי
            setShowRewardModal(true);
        }
    };

    return (
        <>
            {/* Reward Product Modal - לא מוצג אם יש פופאפ דינאמי */}
            {showRewardModal && rewardsToShow.length > 0 && !currentPopup && (
                <RewardProductModal
                    isOpen={showRewardModal}
                    onClose={handleCloseRewardModal}
                    rewardData={rewardsToShow[currentRewardIndex]}
                    currentIndex={currentRewardIndex}
                    onNext={handleNextReward}
                    onPrevious={handlePreviousReward}
                    totalRewards={rewardsToShow.length}
                    isAutoPopup={isAutoPopup}
                />
            )}

            {/* Reward Offers Badge - מוצג בפינת המסך, לא מוצג אם יש פופאפ דינאמי */}
            {availableRewards.length > 0 && !showRewardModal && !currentPopup && (
                <div className="fixed bottom-24 left-3 z-40">
                    <RewardOffersBadge
                        onClick={handleOpenRewardModalFromBadge}
                        count={availableRewards.length}
                    />
                </div>
            )}
        </>
    );
};

export default RewardOffersManager;