// src/component/modal/WelcomeGiftModal.jsx
import { useState, useEffect, useContext } from "react";
import { FiGift } from "react-icons/fi";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";
import Image from "next/image";

import MainBT from "@component/button/MainBT";
import ProductServices from "@services/ProductServices";
import useAddToCart from "@hooks/useAddToCart";
import { UserContext } from "@context/UserContext";
import { notifySuccess } from "@utils/toast";
import MainModal from "@component/modal/MainModal";

const WelcomeGiftModal = ({ isOpen, onClose }) => {
    const t = useTranslations();
    const router = useRouter();
    const { handleAddItem } = useAddToCart();
    const { state: { userInfo } } = useContext(UserContext);

    const [giftProduct, setGiftProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    // שליפת פרטי המוצר מהשרת
    useEffect(() => {
        const fetchGiftProduct = async () => {
            if (!userInfo?.welcomeGift?.sku) return;

            try {
                const sku = userInfo.welcomeGift.sku;
                const response = await ProductServices.getShowingStoreProducts({ sku });

                if (response?.products?.[0]) {
                    setGiftProduct(response.products[0]);
                }
            } catch (error) {
                console.error("Error fetching gift product:", error);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchGiftProduct();
        }
    }, [isOpen, userInfo]);

    // הוספת המתנה לעגלה
    const handleAddGiftToCart = () => {
        if (!giftProduct) return;

        // הכנת המוצר בפורמט הנכון כמו בשאר המקומות
        const { slug, variants, categories, description, ...updatedProduct } = giftProduct;

        const giftProductWithFlag = {
            ...updatedProduct,
            id: giftProduct._id,
            title: giftProduct.title,
            price: giftProduct.prices.price,
            originalPrice: giftProduct.prices?.originalPrice,
            image: giftProduct.image?.[0] || giftProduct.image,
            slug: giftProduct.slug,
            variant: giftProduct.prices,
            isWelcomeGift: true, // flag מיוחד שמסמן שזו מתנה
        };

        handleAddItem(giftProductWithFlag, 1);
        notifySuccess(t('welcomeGiftAdded'));
        onClose();
    };

    // מעבר לעמוד המוצר
    const handleViewProduct = () => {
        if (giftProduct?.slug) {
            router.push(`/product/${giftProduct.slug}`);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <MainModal
            modalOpen={isOpen}
            setModalOpen={(open) => { if (!open) onClose(); }}
            onClose={onClose}
            z={50}
        >
            <div className="w-full max-w-lg mx-auto">
                <div className="bg-white border-4 border-white rounded-t-2xl lg:rounded-2xl shadow-2xl w-full max-h-[92vh] overflow-y-auto lg:max-h-none lg:h-auto pb-[env(safe-area-inset-bottom)] relative animate-[fadeIn_.50s_ease-out]">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mainColor"></div>
                        </div>
                    ) : giftProduct ? (
                        <>
                            {/* Close handled by MainModal */}

                            {/* Product Image - Large (Header) */}
                            <div className="relative w-full h-36 md:h-44 lg:h-72">
                                <img
                                    src="/gift_silan.png"
                                    alt={giftProduct.title?.he}
                                    className="w-full h-full object-cover"
                                />
                                {/* Gift Badge */}
                                <div className="absolute top-2 left-2 md:top-3 md:left-3 lg:top-6 lg:left-6 bg-mainColor text-white px-2.5 py-1 md:px-3 md:py-1.5 lg:px-4 lg:py-2 rounded-full shadow-lg flex items-center gap-1.5 md:gap-2 animate-bounce">
                                    <FiGift size={14} className="md:!w-4 md:!h-4 lg:!w-5 lg:!h-5" />
                                    <span className="font-bold text-[10px] md:text-xs lg:text-sm">{t('free')}!</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-3 md:p-5 lg:p-8">
                                {/* Header - Compact */}
                                <div className="text-center mb-4 md:mb-5 lg:mb-6">
                                    <h2 className="text-base md:text-xl lg:text-2xl font-bold text-gray-800 mb-1.5 md:mb-2">
                                        {t('welcomeGiftTitle')}
                                    </h2>
                                    <p className="text-[11px] md:text-sm text-gray-500">
                                        {t('welcomeGiftSubtitle')}
                                    </p>
                                </div>

                                {/* Product Info */}
                                <div className="bg-gray-50 rounded-xl md:rounded-2xl p-2.5 md:p-4 mb-4 md:mb-6">
                                    <h3 className="text-xs md:text-base font-semibold text-gray-800 text-center">
                                        {giftProduct.title?.he}
                                    </h3>
                                    <p className="text-[11px] md:text-sm text-gray-600 text-center leading-relaxed">
                                        {giftProduct.description?.he?.substring(0, 120)}
                                        {giftProduct.description?.he?.length > 120 ? '...' : ''}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2 md:gap-3">
                                    <MainBT
                                        onClick={handleAddGiftToCart}
                                        className="w-full"
                                    >
                                        <div className="flex items-center justify-center gap-1.5 md:gap-2 !py-2 md:!py-3 lg:!py-4 text-xs md:text-base">
                                            <FiGift size={14} className="md:!w-5 md:!h-5" />
                                            <span className="font-semibold">{t('addGiftToCart')}</span>
                                        </div>
                                    </MainBT>

                                    <div className="flex gap-2 md:gap-3">
                                        <button
                                            onClick={handleViewProduct}
                                            className="flex-1 py-2 px-2.5 md:py-2.5 md:px-4 border border-gray-200 text-gray-600 text-xs md:text-sm font-medium rounded-lg md:rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
                                        >
                                            {t('viewProduct')}
                                        </button>

                                        <button
                                            onClick={onClose}
                                            className="flex-1 py-2 px-2.5 md:py-2.5 md:px-4 border border-gray-200 text-gray-600 text-xs md:text-sm font-medium rounded-lg md:rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
                                        >
                                            {t('maybeLater')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8 md:py-10 lg:py-12 px-4 md:px-6 lg:px-8">
                            <p className="text-gray-600 mb-4">{t('giftProductNotFound')}</p>
                            <MainBT onClick={onClose}>
                                {t('close')}
                            </MainBT>
                        </div>
                    )}
                </div>
            </div>
        </MainModal>
    );
};

export default WelcomeGiftModal;