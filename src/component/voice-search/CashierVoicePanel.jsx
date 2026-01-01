// src/component/voice-search/CashierVoicePanel.jsx
import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useContext } from 'react';
import { useTranslations } from "next-intl";
import VoiceRecognition from './VoiceRecognition';
import RecognizedProducts from './RecognizedProducts';
import { notifyError, notifySuccess } from '@utils/toast';
import microphoneImage from 'public/microphone2.svg';
import ProductServices from '@services/ProductServices';
import notifyApiResponse from '@utils/notifyApiResponse';
import useCart from '@hooks/useCart';
import { HiStop } from 'react-icons/hi';
import { HiMicrophone } from 'react-icons/hi2';
import { UserContext } from '@context/UserContext';
import { getUserPrice } from '@utils/priceUtils';

const CashierVoicePanel = forwardRef((props, ref) => {
    const t = useTranslations();
    const { updateItemQuantity, inCart, addItem } = useCart();
    const { state: { userInfo } } = useContext(UserContext);

    // סטייטים לניהול התמלול והמוצרים
    const [transcript, setTranscript] = useState('');
    const [recognizedProducts, setRecognizedProducts] = useState([]);
    const [isListening, setIsListening] = useState(false);
    const [pendingRequests, setPendingRequests] = useState(0);
    const [isActive, setIsActive] = useState(false); // האם הפאנל פעיל

    // פונקציה לעיבוד הטקסט ושליחה לשרת - מעטפת ב-useCallback
    const processTranscript = useCallback(async (text) => {
        if (!text.trim()) return;

        setPendingRequests(prev => prev + 1);

        try {
            // console.log('Sending to server:', text);

            // קריאה אמיתית לשרת
            const data = await ProductServices.findProductByTranscript(text);
            // console.log('data :>> ', data);

            if (data?.product) {
                const product = data.product;
                const quantity = data.quantity || 1;

                // הכנת המוצר לפורמט הנדרש - הוספת id משדה _id
                const formattedProduct = {
                    ...product,
                    id: product._id,  // הוספת שדה id הנדרש לעגלה
                    quantity: quantity
                };

                // בדיקה אם המוצר כבר קיים ברשימה
                setRecognizedProducts(prev => {
                    const existingIndex = prev.findIndex(p => p._id === product._id);
                    if (existingIndex >= 0) {
                        // אם המוצר קיים מחק אותו והוסף אותו שוב
                        const updated = [...prev];
                        updated.splice(existingIndex, 1);
                        return [formattedProduct, ...updated];
                    } else {
                        // אם המוצר לא קיים, הוסף אותו
                        return [formattedProduct, ...prev];
                    }
                });
            }

        } catch (error) {
            console.error('Error processing transcript:', error);
            // הודעת שגיאה
            notifyApiResponse(error, false);
        } finally {
            setPendingRequests(prev => prev - 1);
        }
    }, []);

    // פונקציה להוספת כל המוצרים לעגלה
    const handleAddAllToCart = () => {
        if (recognizedProducts.length === 0) return;

        let addedCount = 0;

        recognizedProducts.forEach(product => {
            try {
                // בדיקת מלאי
                if (product.stock < 1) {
                    notifyError(t('productOutOfStock', { product: product.title?.he || product.title?.en }));
                    return;
                }
                if (product.quantity > product.stock) {
                    notifyError(t('maxQuantityExceeded', { stock: product.stock, product: product.title?.he || product.title?.en }));
                    return;
                }

                // עיבוד המוצר לפורמט הנכון לעגלה
                const { slug, variants, categories, description, ...updatedProduct } = product;

                // קבלת המחיר המדוייק ללקוח
                const productPricing = getUserPrice(product, userInfo);

                const newItem = {
                    ...updatedProduct,
                    title: product.title,
                    id: product._id,
                    variant: product.prices,
                    price: productPricing.salePrice || productPricing.price,
                    originalPrice: productPricing.originalPrice,
                    purchaseLimit: productPricing.purchaseLimit,
                    slug: product.slug,
                };

                // בדיקה אם המוצר כבר קיים בעגלה
                if (inCart(product._id)) {
                    // עדכון הכמות של המוצר הקיים
                    updateItemQuantity(product._id, product.quantity);
                } else {
                    // הוספת מוצר חדש
                    addItem(newItem, product.quantity);
                }

                addedCount++;
            } catch (error) {
                console.error('Error adding product to cart:', error);
            }
        });

        if (addedCount > 0) {
            notifySuccess(`${addedCount} ${t('productsAddedToCart')}!`);
            // ניקוי רשימת המוצרים שזוהו
            setRecognizedProducts([]);
            setTranscript('');
        }
    };

    // פונקציה לעדכון כמות מוצר
    const handleQuantityChange = (id, quantity) => {
        setRecognizedProducts(prev => prev.map(p => p._id === id ? { ...p, quantity } : p));
    };

    // פונקציה להסרת מוצר
    const handleRemoveProduct = (id) => {
        setRecognizedProducts(prev => prev.filter(p => p._id !== id));
    };

    // פונקציה להפעלה/כיבוי של הפאנל
    const togglePanel = () => {
        if (isActive) {
            setTranscript('');
            // אם מכבים את הפאנל ויש מוצרים זוהו - הוסף אותם לעגלה
            if (recognizedProducts.length > 0) {
                handleAddAllToCart();
            }
            setIsActive(false);
        } else {
            setIsActive(true);
            setTranscript('');
        }
    };

    // ניקוי כשהפאנל נסגר
    useEffect(() => {
        if (!isActive) {
            setTranscript('');
            // setRecognizedProducts([]);
            // setPendingRequests(0);
        }
    }, [isActive]);

    // חשיפת פונקציות לרכיב האב
    useImperativeHandle(ref, () => ({
        stopAndAddProducts: () => {
            if (isActive && recognizedProducts.length > 0) {
                handleAddAllToCart();
            }
            setIsActive(false);
        }
    }));

    return (
        <div className="bg-white py-[22px] px-6 border border-gray-200 rounded-lg">
            {/* כותרת ופאנל בקרה */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-5">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <img
                            src={microphoneImage.src}
                            alt="Voice Search"
                            className="w-8 h-8"
                        />
                        <h2 className="text-xl font-semibold text-mainColor">
                            {t('addProductsVoice')}
                        </h2>
                    </div>

                    {/* תיאור השימוש */}
                    {/* <p className="text-gray-600 text-right ms-2">
                        {isActive ?
                            t('voiceSearchInstructions') :
                            t('clickToActivateMicrophone')
                        }
                    </p> */}
                </div>

                {/* כפתור הפעלה/כיבוי */}
                <button
                    onClick={togglePanel}
                    className={`flex items-center justify-center gap-1 px-4 py-3 rounded-lg font-medium transition-colors whitespace-nowrap md:w-fit w-full ${isActive
                        ? 'bg-red-500 text-white hover:bg-red-600 h-fit'
                        : 'bg-mainColor text-white hover:bg-mainColor-dark'
                        }`}
                >
                    {isActive ? (
                        <>
                            <HiStop size={19} />
                            {t('turnOffMicrophone')}
                        </>
                    ) : (
                        <>
                            <HiMicrophone size={18} />
                            {t('turnOnMicrophone')}
                        </>
                    )}
                </button>
            </div>

            {/* רכיב הזיהוי הקולי - מוצג רק כשהפאנל פעיל */}
            {isActive && (
                <div className="mt-5">
                    <VoiceRecognition
                        transcript={transcript}
                        setTranscript={setTranscript}
                        onTranscriptComplete={processTranscript}
                        isListening={isListening}
                        setIsListening={setIsListening}
                    />

                    {/* הצגת המוצרים שזוהו */}
                    <div className="mt-4">
                        <RecognizedProducts
                            products={recognizedProducts}
                            isProcessing={pendingRequests > 0}
                            onQuantityChange={handleQuantityChange}
                            onRemoveProduct={handleRemoveProduct}
                        />
                    </div>

                    {/* כפתור הוספה לעגלה */}
                    {recognizedProducts.length > 0 && (
                        <div className="mt-4 flex justify-center">
                            <button
                                onClick={handleAddAllToCart}
                                className="py-3 px-6 bg-mainColor text-white rounded-lg hover:bg-mainColor-dark transition-colors font-medium"
                            >
                                {t('addProductsToCart', { count: recognizedProducts.length })}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

CashierVoicePanel.displayName = 'CashierVoicePanel';

export default CashierVoicePanel; 