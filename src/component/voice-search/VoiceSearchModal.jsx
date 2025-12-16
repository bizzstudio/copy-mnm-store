// src/component/voice-search/VoiceSearchModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import useTranslation from 'next-translate/useTranslation';
import MainModal from '@component/modal/MainModal';
import VoiceRecognition from './VoiceRecognition';
import RecognizedProducts from './RecognizedProducts';
import { notifyError, notifySuccess } from '@utils/toast';
import useAddToCart from '@hooks/useAddToCart';
import microphoneImage from 'public/microphone2.svg';
import ProductServices from '@services/ProductServices';
import notifyApiResponse from '@utils/notifyApiResponse';
import useCart from '@hooks/useCart';

const VoiceSearchModal = ({ modalOpen, setModalOpen, titleMessage }) => {
    const { t } = useTranslation();
    const { handleAddItem } = useAddToCart();
    const { updateItemQuantity, inCart, addItem } = useCart();

    // סטייטים לניהול התמלול והמוצרים
    const [transcript, setTranscript] = useState('');
    const [recognizedProducts, setRecognizedProducts] = useState([]);
    const [isListening, setIsListening] = useState(false);
    const [pendingRequests, setPendingRequests] = useState(0);

    // פונקציה לעיבוד הטקסט ושליחה לשרת - מעטפת ב-useCallback
    const processTranscript = useCallback(async (text) => {
        if (!text.trim()) return;

        setPendingRequests(prev => prev + 1);

        try {
            console.log('Sending to server:', text);

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
                    notifyError(t('common:productOutOfStock', { product: product.title?.he || product.title?.en }));
                    return;
                }
                if (product.quantity > product.stock) {
                    notifyError(t('common:maxQuantityExceeded', { stock: product.stock, product: product.title?.he || product.title?.en }));
                    return;
                }

                // עיבוד המוצר לפורמט הנכון לעגלה
                const { slug, variants, categories, description, ...updatedProduct } = product;

                const newItem = {
                    ...updatedProduct,
                    title: product.title,
                    id: product._id,
                    variant: product.prices,
                    price: product.prices.price,
                    originalPrice: product.prices?.originalPrice,
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
            notifySuccess(`${addedCount} ${t('common:productsAddedToCart')}!`);
            setModalOpen(false);
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

    // סגירת המודל
    const handleClose = () => {
        setModalOpen(false);
        // ניקוי הסטייטים יקרה במאזין של modalOpen
    };

    // ניקוי כשהמודל נסגר
    useEffect(() => {
        if (!modalOpen) {
            setTranscript('');
            setRecognizedProducts([]);
            setPendingRequests(0);
        }
    }, [modalOpen]);

    return (
        <MainModal modalOpen={modalOpen} setModalOpen={setModalOpen} onClose={handleClose}>
            <div className="flex flex-col w-full max-w-lg h-[80vh] p-6 overflow-y-auto">
                {/* תמונה וכותרת */}
                <div className="flex flex-col items-center mb-3 flex-shrink-0">
                    <img
                        src={microphoneImage.src}
                        alt="Voice Search"
                        className="w-20 h-20 mb-4"
                    />
                    <h2 className="text-2xl font-bold text-blacktext-center whitespace-pre-wrap">
                        {titleMessage}
                    </h2>
                </div>

                {/* הסבר איך להשתמש */}
                <div className="mb-5 p-4 bg-mainColor-superLight rounded-lg flex-shrink-0">
                    <p className="text-gray-700 text-center leading-relaxed">
                        {t('common:voiceSearchInstructions')}
                    </p>
                </div>

                <div className="flex flex-col gap-4 flex-1 min-h-fit">
                    {/* קומפוננטת הזיהוי הקולי */}
                    <div className="flex-shrink-0">
                        <VoiceRecognition
                            transcript={transcript}
                            setTranscript={setTranscript}
                            onTranscriptComplete={processTranscript}
                            isListening={isListening}
                            setIsListening={setIsListening}
                        />
                    </div>

                    {/* הצגת המוצרים שזוהו */}
                    <div className="flex-1 min-h-0">
                        <RecognizedProducts
                            products={recognizedProducts}
                            isProcessing={pendingRequests > 0}
                            onQuantityChange={handleQuantityChange}
                            onRemoveProduct={handleRemoveProduct}
                        />
                    </div>
                </div>

                {/* כפתורים */}
                <div className="flex justify-between mt-6 gap-4 flex-shrink-0">
                    <button
                        onClick={handleClose}
                        className="flex-1 py-3 px-6 border border-gray-300 rounded-lg text-gray-700 hover:bg-mainColor-superLight transition-colors"
                    >
                        {t('common:closeBtn')}
                    </button>

                    {recognizedProducts.length > 0 && (
                        <button
                            onClick={handleAddAllToCart}
                            className="flex-1 py-3 px-6 bg-mainColor text-white rounded-lg hover:bg-mainColor-dark transition-colors font-medium"
                        >
                            {t('common:voiceSearchFinished')} ({recognizedProducts.length} {t('common:products')})
                        </button>
                    )}
                </div>
            </div>
        </MainModal>
    );
};

export default VoiceSearchModal;