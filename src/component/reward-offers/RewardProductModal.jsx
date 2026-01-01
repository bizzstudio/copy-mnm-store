// src/component/modal/RewardProductModal.jsx
import React from "react";
import { FiGift, FiChevronRight, FiChevronLeft } from "react-icons/fi";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";
import useUtilsFunction from "@hooks/useUtilsFunction";

import MainBT from "@component/button/MainBT";
import MainModal from "@component/modal/MainModal";

const RewardProductModal = ({
    isOpen,
    onClose,
    rewardData,
    currentIndex = 0,
    onNext,
    onPrevious,
    totalRewards = 1,
    isAutoPopup = false,
}) => {
    const t = useTranslations();
    const router = useRouter();
    const { showingTranslateValue } = useUtilsFunction();

    if (!isOpen || !rewardData) return null;

    const { offer, rewardProduct, triggerProduct, offerName, offerType } = rewardData;

    // תמונת המבצע או תמונת המוצר
    const displayImage = offer?.image || rewardProduct?.image?.[0] || "/gift_silan.png";
    const offerTitle = showingTranslateValue(offerName) || showingTranslateValue(offer?.name) || '';
    const productTitle = showingTranslateValue(rewardProduct?.title) || '';
    const productDescription = showingTranslateValue(rewardProduct?.description) || '';

    // מעבר לעמוד המוצר המתנה
    const handleViewRewardProduct = () => {
        if (rewardProduct?.slug) {
            router.push(`/product/${rewardProduct.slug}`);
            onClose();
        }
    };

    // מעבר למוצר טריגר (אם יש)
    const handleViewTriggerProduct = () => {
        if (triggerProduct?.slug) {
            router.push(`/product/${triggerProduct.slug}`);
            onClose();
        }
    };

    // כותרת ותיאור לפי סוג המבצע
    const getOfferDescription = () => {
        if (offerType === 'BUY_X_GET_Y' && triggerProduct) {
            const triggerName = showingTranslateValue(triggerProduct?.title) || '';
            return t('buyXGetYDescription', { triggerName, rewardName: productTitle });
        } else if (offerType === 'THRESHOLD_GET_ITEM' && offer?.thresholdAmount) {
            return t('thresholdGetItemDescription', { threshold: offer.thresholdAmount, rewardName: productTitle });
        }
        return showingTranslateValue(offer?.description) || '';
    };

    return (
        <MainModal
            modalOpen={isOpen}
            setModalOpen={(open) => { if (!open) onClose(); }}
            onClose={onClose}
            z={50}
        >
            <div className="w-full max-w-lg mx-auto">
                <div className="bg-white border-4 border-white rounded-t-2xl lg:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto sm:max-h-screen sm:flex sm:flex-col pb-[env(safe-area-inset-bottom)] relative animate-[fadeIn_.50s_ease-out]">
                    <>
                        {/* תצוגת מספר מוצרים אם יש יותר מאחד */}
                        {totalRewards > 1 && (
                            <div className="absolute top-2 right-2 z-10 bg-mainColor text-white px-3 py-1 rounded-full text-xs font-semibold">
                                {currentIndex + 1} / {totalRewards}
                            </div>
                        )}

                        {/* Product Image - Large (Header) */}
                        <div className="relative w-full sm:shrink-0 sm:min-h-0">
                            <img
                                src={displayImage}
                                alt={productTitle}
                                className="w-full h-auto sm:max-h-[50vh] sm:h-auto object-contain block"
                            />
                            {/* Gift Badge */}
                            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 lg:top-6 lg:left-6 bg-mainColor text-white px-2.5 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 rounded-full shadow-lg flex items-center gap-1.5 sm:gap-2 animate-bounce">
                                <FiGift size={14} className="sm:w-4! sm:h-4! lg:w-5! lg:h-5!" />
                                <span className="font-bold text-[10px] sm:text-xs lg:text-sm">{t('free')}!</span>
                            </div>

                            {/* כפתורי ניווט אם יש יותר ממוצר אחד */}
                            {totalRewards > 1 && (
                                <>
                                    {currentIndex > 0 && (
                                        <button
                                            onClick={onPrevious}
                                            className="absolute top-1/2 left-2 sm:left-3 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                                        >
                                            <FiChevronLeft size={20} className="text-gray-700" />
                                        </button>
                                    )}
                                    {currentIndex < totalRewards - 1 && (
                                        <button
                                            onClick={onNext}
                                            className="absolute top-1/2 right-2 sm:right-3 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                                        >
                                            <FiChevronRight size={20} className="text-gray-700" />
                                        </button>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-3 sm:p-5 lg:p-8 w-full sm:shrink-0">
                            {/* Header - Compact */}
                            <div className="text-center mb-4 sm:mb-5 lg:mb-6">
                                {/* אם זה פופאפ אוטומטי - כותרת ראשית "יש! קיבלת מתנה!" */}
                                {isAutoPopup && (
                                    <h2 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-800 mb-1.5 sm:mb-2">
                                        {t('rewardReceivedTitle')}
                                    </h2>
                                )}
                                {/* כותרת משנה - שם המבצע */}
                                <h3 className={`text-sm sm:text-lg lg:text-xl font-semibold text-gray-700 ${isAutoPopup ? 'mb-1' : 'mb-1.5 sm:mb-2'}`}>
                                    {offerTitle}
                                </h3>
                                {/* כותרת משנה משנה - תיאור המבצע */}
                                <p className="text-[11px] sm:text-sm text-gray-500">
                                    {getOfferDescription()}
                                </p>
                            </div>

                            {/* Product Info */}
                            <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 mb-4 sm:mb-6">
                                <h3 className="text-xs sm:text-base font-semibold text-gray-800 text-center">
                                    {productTitle}
                                </h3>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2 sm:gap-3">
                                {/* כפתור צפה במוצר - תמיד מוצר טריגר אם יש, אחרת מוצר המתנה */}
                                <MainBT
                                    onClick={triggerProduct ? handleViewTriggerProduct : handleViewRewardProduct}
                                    className="w-full"
                                >
                                    <div className="flex items-center justify-center gap-1.5 sm:gap-2 !py-2 sm:!py-3 lg:!py-4 text-xs sm:text-base">
                                        <FiGift size={14} className="sm:w-5! sm:h-5!" />
                                        <span className="font-semibold">{t('viewProduct')}</span>
                                    </div>
                                </MainBT>
                            </div>
                        </div>
                    </>
                </div>
            </div>
        </MainModal>
    );
};

export default RewardProductModal;