import React, { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IoAdd, IoRemove } from 'react-icons/io5';
import { notifyError } from "@utils/toast";
import useAddToCart from "@hooks/useAddToCart";
import useGetSetting from "@hooks/useGetSetting";
import ProductModal from "@component/modal/ProductModal";
import { useTranslations } from "next-intl";
import useUtilsFunction from "@hooks/useUtilsFunction";
import Link from 'next/link';
import Price from '@component/common/Price';
import Discount from '@component/common/Discount';
import useCart from '@hooks/useCart';
import getOfferNames from '@component/offer/getOfferNames';
import { SidebarContext } from '@context/SidebarContext';
import { LiaCartPlusSolid } from 'react-icons/lia';
import ImageWithFallback from '@component/common/ImageWithFallBack';

export default function ResultWindow({ products = [], clearInput, closeResultWindow, anchorRef, searchQuery = '' }) {
    // console.log('products: ', products)
    const resultRef = useRef(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const { items, addItem, updateItemQuantity, inCart } = useCart();
    const { handleIncreaseQuantity } = useAddToCart();
    const { globalSetting } = useGetSetting();
    const { showingTranslateValue } = useUtilsFunction();
    const t = useTranslations();
    const { offers } = useContext(SidebarContext);

    const currency = globalSetting?.default_currency || "₪";

    const [mounted, setMounted] = useState(false);
    const [dropdownTop, setDropdownTop] = useState(72);

    useEffect(() => {
        setMounted(true);
    }, []);

    const updateDropdownPosition = useCallback(() => {
        const el = anchorRef?.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        setDropdownTop(rect.bottom + 8);
    }, [anchorRef]);

    useLayoutEffect(() => {
        updateDropdownPosition();
        window.addEventListener('resize', updateDropdownPosition);
        window.addEventListener('scroll', updateDropdownPosition, true);
        return () => {
            window.removeEventListener('resize', updateDropdownPosition);
            window.removeEventListener('scroll', updateDropdownPosition, true);
        };
    }, [updateDropdownPosition, products]);

    // בלחיצה מחוץ לחלון התוצאות (ולא על שדה החיפוש) – סגירה. הפורטל ב-body לכן בודקים גם anchorRef
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalOpen) return;
            const inPanel = resultRef.current?.contains(event.target);
            const inSearch = anchorRef?.current?.contains(event.target);
            if (!inPanel && !inSearch) {
                closeResultWindow();
            }
        };

        window.addEventListener("mousedown", handleClickOutside);

        return () => {
            window.removeEventListener("mousedown", handleClickOutside);
        };
    }, [products, clearInput, closeResultWindow, modalOpen, anchorRef]);

    // חישוב מלאי המוצר
    const getProductStock = (product) => {
        if (product?.manageStock === false) {
            return 9999;
        }
        // המלאי הוא שדה stock פשוט
        return product?.stock || 0;
    };

    const handleAddToCart = (product) => {
        const stock = getProductStock(product);
        if (stock < 1) return notifyError(t('productStockOut'));

        const { slug, categories, description, ...updatedProduct } = product;
        const productPrice = product?.prices?.[0];
        const newItem = {
            ...updatedProduct,
            id: product._id,
            title: product.title,
            price: productPrice?.salePrice || productPrice?.price || 0,
            originalPrice: productPrice?.price || 0,
            image: product.image?.[0],
            slug: product.slug,
        };

        addItem(newItem);
    };

    const handleModalOpen = (product) => {
        setSelectedProduct(product);
        setModalOpen(true);
    };

    // console.log('search Product: ', selectedProduct);

    const isProductWithDiscount = (product) => {
        const offerName = getOfferNames(offers, product);
        return <Discount search product={product} title={offerName} />
    }

    const panel = (
            <div
                ref={resultRef}
                style={{ top: dropdownTop }}
                className="fixed left-1/2 -translate-x-1/2 w-[min(92vw,40rem)] max-h-[min(85vh,720px)] bg-white shadow-2xl overflow-hidden rounded-xl z-[100] border border-gray-100"
            >
                <div className="p-1">
                    <h2 className="text-right text-xl p-4 border-b border-gray-100">{products.length} {t('itemsFound')}</h2>
                    <div className="overflow-y-auto max-h-[min(70vh,570px)]">
                        {products.slice(0, 10).map((product) => (
                            <Link
                                href={`/product/${product.slug}`} onClick={() => clearInput()}
                                key={product._id}>
                                <div className="flex items-center justify-between border-t px-4 py-3 hover:bg-gray-100">
                                    {/* תמונה כותרת ומחיר */}
                                    <div className="flex items-center gap-2">
                                        <div className="relative w-16 h-16 min-w-[64px] min-h-[64px]">
                                            <ImageWithFallback
                                                src={product.image[0]}
                                                alt="product"
                                                outOfStock={getProductStock(product) <= 0}
                                                noPadding={true}
                                                search
                                            />
                                        </div>
                                        <div className="text-right ml-4">
                                            <h3 className="font-bold">{showingTranslateValue(product?.title)}</h3>
                                            <Price
                                                product={product}
                                                price={product?.prices?.[0]?.salePrice || product?.prices?.[0]?.price || 0}
                                                originalPrice={product?.prices?.[0]?.price || 0}
                                                currency={currency}
                                                card={true}
                                            />
                                            {isProductWithDiscount(product)}
                                        </div>
                                    </div>
                                    {/* ProductCard-כפתורים דינאמיים כמו ב */}
                                    <div className="flex items-center"
                                        onClick={e => { e.preventDefault(), e.stopPropagation() }}>
                                        {inCart(product._id) ? (
                                            items.map(
                                                (item) =>
                                                    // כפתורי פלוס ומינוס
                                                    item.id === product._id && (
                                                        <div
                                                            key={item.id}
                                                            className="sm:h-9 w-auto flex flex-col sm:flex-row items-center sm:justify-evenly justify-center py-1 px-2 bg-mainColor-dark text-white rounded gap-1 sm:gap-0"
                                                        >
                                                            <button
                                                                type='button'
                                                                className="sm:pl-1"
                                                                onClick={() =>
                                                                    updateItemQuantity(item.id, item.quantity - 1)
                                                                }
                                                            >
                                                                <span className="text-dark text-base">
                                                                    <IoRemove />
                                                                </span>
                                                            </button>
                                                            <p className="text-sm text-dark px-1 font-serif font-semibold">
                                                                {item.quantity}
                                                            </p>
                                                            <button
                                                                type='button'
                                                                className="sm:pr-1"
                                                                onClick={() => handleIncreaseQuantity(item)}
                                                            >
                                                                <span className="text-dark text-base">
                                                                    <IoAdd />
                                                                </span>
                                                            </button>
                                                        </div>
                                                    )
                                            )
                                        ) : (
                                            <button
                                                type='button'
                                                onClick={() => handleAddToCart(product)}
                                                aria-label="cart"
                                                disabled={getProductStock(product) <= 0}
                                                className={getProductStock(product) <= 0 ? "h-9 px-2 flex items-center justify-center border border-gray-200 rounded text-gray-400" : "h-9 px-2 flex items-center justify-center border border-gray-200 rounded text-mainColor-dark hover:bg-mainColor-dark hover:text-white transition-all"}
                                            >
                                                <span className="text-2xl">
                                                    <LiaCartPlusSolid />
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                    {/* כפתור צפייה בכל התוצאות */}
                    {products.length > 10 && (
                        <div className="text-center py-3 border-t border-gray-100">
                            <Link
                                href={searchQuery.trim() ? `/search?query=${encodeURIComponent(searchQuery.trim())}` : '/search'}
                                onClick={() => clearInput()}
                                className="text-mainColor-dark font-semibold hover:underline"
                            >
                                {t('showAll')} ({products.length})
                            </Link>
                        </div>
                    )}
                </div>
            </div>
    );

    return (
        <>
            {modalOpen && selectedProduct && (
                <ProductModal
                    modalOpen={modalOpen}
                    setModalOpen={setModalOpen}
                    product={selectedProduct}
                    currency={currency}
                    clearInput={clearInput}
                />
            )}

            {mounted && typeof document !== 'undefined'
                ? createPortal(panel, document.body)
                : null}
        </>
    );
}
