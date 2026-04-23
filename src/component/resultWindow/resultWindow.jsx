import React, { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
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
import { UserContext } from '@context/UserContext';
import { getUserPrice } from '@utils/priceUtils';
import {
    DEFAULT_WEIGHT_CART_KG,
    MIN_ORDER_KG,
    productSoldByWeight,
    cartDecrementQuantity,
    weightOptsFromAsPath,
    roundCartQty,
    formatWeightDisplayKg,
} from '@utils/productSoldByWeight';
import CartWeightQtyField from '@component/product/CartWeightQtyField';
import { LiaCartPlusSolid } from 'react-icons/lia';
import ImageWithFallback from '@component/common/ImageWithFallBack';

export default function ResultWindow({ products = [], clearInput, closeResultWindow, anchorRef, searchQuery = '' }) {
    const router = useRouter();
    const pathWeightOpts = useMemo(
        () => weightOptsFromAsPath(router.asPath),
        [router.asPath]
    );
    // console.log('products: ', products)
    const resultRef = useRef(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const { state: { userInfo } } = useContext(UserContext);
    const { items, addItem, updateItemQuantity, inCart, removeItem } = useCart();
    const { handleIncreaseQuantity } = useAddToCart();
    const { globalSetting } = useGetSetting();
    const { showingTranslateValue } = useUtilsFunction();
    const t = useTranslations();
    const { offers } = useContext(SidebarContext);

    const currency = globalSetting?.default_currency || "₪";

    const [mounted, setMounted] = useState(false);
    const [dropdownTop, setDropdownTop] = useState(72);
    /** כמות לפני הוספה ראשונה לעגלה (שורת חיפוש) */
    const [preAddQtyDraft, setPreAddQtyDraft] = useState({});

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

    const handleAddToCart = (product, rawQty) => {
        const stock = getProductStock(product);
        const byWeight = productSoldByWeight(product, pathWeightOpts);
        let qty;

        if (byWeight) {
            const s =
                rawQty != null && String(rawQty).trim() !== ""
                    ? String(rawQty).trim().replace(",", ".")
                    : String(DEFAULT_WEIGHT_CART_KG);
            qty = roundCartQty(parseFloat(s));
            if (!Number.isFinite(qty) || qty < MIN_ORDER_KG) {
                return notifyError(t("weightInvalidAmount"));
            }
        } else {
            const s =
                rawQty != null && String(rawQty).trim() !== ""
                    ? String(rawQty).trim()
                    : "1";
            qty = parseInt(s, 10);
            if (!Number.isFinite(qty) || qty < 1) {
                return notifyError(t("invalidQuantity"));
            }
        }

        if (stock + 1e-6 < qty) return notifyError(t("productStockOut"));

        const { slug, categories, description, ...updatedProduct } = product;
        const productPricing = getUserPrice(product, userInfo);
        const newItem = {
            ...updatedProduct,
            id: product._id,
            title: product.title,
            price: productPricing.salePrice || productPricing.price || 0,
            originalPrice: productPricing.price || 0,
            purchaseLimit: productPricing.purchaseLimit,
            image: product.image?.[0],
            slug: product.slug,
            soldByWeight: byWeight,
        };

        addItem(newItem, qty);
        setPreAddQtyDraft((prev) => {
            const next = { ...prev };
            delete next[product._id];
            return next;
        });
    };

    const preAddInputValue = (product) => {
        const id = product._id;
        if (preAddQtyDraft[id] !== undefined) return preAddQtyDraft[id];
        return productSoldByWeight(product, pathWeightOpts)
            ? formatWeightDisplayKg(DEFAULT_WEIGHT_CART_KG)
            : "1";
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
                                    <div
                                        className="flex items-center gap-1.5 shrink-0"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                    >
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
                                                                onClick={() => {
                                                                    const next = cartDecrementQuantity(item, pathWeightOpts);
                                                                    if (next <= 0) removeItem(item.id);
                                                                    else updateItemQuantity(item.id, next);
                                                                }}
                                                            >
                                                                <span className="text-dark text-base">
                                                                    <IoRemove />
                                                                </span>
                                                            </button>
                                                            <div className="px-1 flex items-center justify-center min-w-0">
                                                                <CartWeightQtyField
                                                                    item={item}
                                                                    getProductStock={getProductStock}
                                                                    updateItemQuantity={updateItemQuantity}
                                                                    variant="onPrimary"
                                                                    weightListOpts={pathWeightOpts}
                                                                    unitQuantityEditable={!productSoldByWeight(item, pathWeightOpts)}
                                                                />
                                                            </div>
                                                            <button
                                                                type='button'
                                                                className="sm:pr-1"
                                                                onClick={() => handleIncreaseQuantity(item, pathWeightOpts)}
                                                            >
                                                                <span className="text-dark text-base">
                                                                    <IoAdd />
                                                                </span>
                                                            </button>
                                                        </div>
                                                    )
                                            )
                                        ) : (
                                            <>
                                                <input
                                                    type="number"
                                                    inputMode={productSoldByWeight(product, pathWeightOpts) ? "decimal" : "numeric"}
                                                    min={productSoldByWeight(product, pathWeightOpts) ? MIN_ORDER_KG : 1}
                                                    step={productSoldByWeight(product, pathWeightOpts) ? "any" : 1}
                                                    lang="en"
                                                    disabled={getProductStock(product) <= 0}
                                                    value={preAddInputValue(product)}
                                                    onChange={(e) =>
                                                        setPreAddQtyDraft((prev) => ({
                                                            ...prev,
                                                            [product._id]: e.target.value,
                                                        }))
                                                    }
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="no-spinner w-11 sm:w-14 min-w-0 shrink-0 text-center text-sm font-semibold tabular-nums border border-gray-300 rounded py-1.5 px-0.5 text-heading outline-none focus:border-mainColor-dark disabled:bg-gray-100 disabled:text-gray-400"
                                                    style={{ MozAppearance: "textfield" }}
                                                    title={t("quantity")}
                                                    aria-label={t("quantity")}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleAddToCart(
                                                            product,
                                                            preAddQtyDraft[product._id]
                                                        )
                                                    }
                                                    aria-label="cart"
                                                    disabled={getProductStock(product) <= 0}
                                                    className={
                                                        getProductStock(product) <= 0
                                                            ? "h-9 px-2 flex items-center justify-center border border-gray-200 rounded text-gray-400 shrink-0"
                                                            : "h-9 px-2 flex items-center justify-center border border-gray-200 rounded text-mainColor-dark hover:bg-mainColor-dark hover:text-white transition-all shrink-0"
                                                    }
                                                >
                                                    <span className="text-2xl">
                                                        <LiaCartPlusSolid />
                                                    </span>
                                                </button>
                                            </>
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
