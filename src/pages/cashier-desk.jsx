// src/pages/cashier-desk.jsx
import React, { useContext, useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { IoBagHandle, IoWalletSharp } from "react-icons/io5";
import useTranslation from "next-translate/useTranslation";
import Image from "next/image";

// Internal import
import Layout from "@layout/Layout";
import Label from "@component/form/Label";
import Error from "@component/form/Error";
import CartItem from "@component/cart/CartItem";
import InputArea from "@component/form/InputArea";
import { UserContext } from "@context/UserContext";
import Loading from "@component/preloader/Loading";
import useCheckoutSubmit from "@hooks/useCheckoutSubmit";
import CashierVoicePanel from "@component/voice-search/CashierVoicePanel";
import CustomerNameVoiceInput from "@component/voice-search/CustomerNameVoiceInput";
import MissingProductsModal from "@component/modal/MissingProductsModal";
import PriceUpdatedModal from "@component/modal/PriceUpdatedModal";
import MainModal from "@component/modal/MainModal";
import useUtilsFunction from "@hooks/useUtilsFunction";
import useGetSetting from "@hooks/useGetSetting";
import MainBT from "@component/button/MainBT";

const CashierDesk = () => {
    const {
        handleSubmit,
        submitHandler,
        register,
        watch,
        setValue,
        errors,
        error,
        couponInfo,
        couponRef,
        handleCouponCode,
        discountAmount,
        total,
        isEmpty,
        items,
        customCartTotal,
        currency,
        isCheckoutSubmit,
        missingProductsModal,
        setMissingProductsModal,
        missingProducts,
        priceConflictsModal,
        setPriceConflictsModal,
        priceConflicts,
    } = useCheckoutSubmit(true); // true = מצב קופה
    const { showingTranslateValue } = useUtilsFunction();
    const { storeCustomizationSetting } = useGetSetting();

    const router = useRouter();
    const { t } = useTranslation();
    const { state: { userInfo } } = useContext(UserContext);

    const [customerName, setCustomerName] = useState("");
    const [loading, setLoading] = useState(true);
    const [missingProductsState, setMissingProductsState] = useState([]);
    const voicePanelRef = useRef(null);

    // בדיקת הרשאות קופאי
    useEffect(() => {
        if (!userInfo) {
            router.push("/");
            return;
        }

        if (!userInfo.isCashier) {
            router.push("/");
            return;
        }

        setLoading(false);
    }, [userInfo, router]);

    // עדכון השדה בטופס
    useEffect(() => {
        register("customerName"); // לא חובה
    }, [register]);

    // עדכון הטופס כשמשתנה שם הלקוח
    useEffect(() => {
        setValue("customerName", customerName);
    }, [customerName, setValue]);

    // פונקציה לעדכון שם הלקוח
    const handleCustomerNameChange = (newName) => {
        setCustomerName(newName);
        setValue("customerName", newName);
    };

    // פונקציה מותאמת לשליחת הטופס
    const handleCashierSubmit = async (data) => {
        const result = await submitHandler(data);

        // אם ההזמנה הצליחה, נקה את שם הלקוח
        if (result?.success && result?.clearCustomerName) {
            setCustomerName("");
        }
    };

    // טיפול במוצרים חסרים שנשמרו ב-localStorage (כמו בעמוד checkout)
    useEffect(() => {
        const missingProducts = localStorage.getItem("missingProducts");
        if (missingProducts) {
            try {
                const missingProductsArray = JSON.parse(missingProducts);

                if (missingProductsArray.length > 0) {
                    setMissingProductsModal(true);
                    setMissingProductsState(missingProductsArray);
                }

                // מחיקת הנתונים מה-localStorage לאחר הצגת ההודעה
                localStorage.removeItem("missingProducts");
            } catch (error) {
                console.error("Failed to parse missing products:", error);
            }
        }

        const offersError = localStorage.getItem("offerConflicts");
        if (offersError) {
            setTimeout(() => {
                // מחיקת הנתונים מה-localStorage לאחר הצגת ההודעה
                localStorage.removeItem("offerConflicts");
                notifyError(t("common:pleaseNote"));
            }, 300);
        }
    }, [isCheckoutSubmit]);

    // פונקציה לטיפול בלחיצה על זיהוי שם לקוח
    const handleCustomerVoiceStart = () => {
        // אם יש רכיב זיהוי מוצרים פעיל, נכבה אותו ונוסיף את המוצרים
        if (voicePanelRef.current?.stopAndAddProducts) {
            voicePanelRef.current.stopAndAddProducts();
        }
    };

    // אם עדיין טוען או לא קופאי
    if (loading) {
        return <Loading loading={loading} />;
    }

    return (
        <>
            {/* מודלים לקונפליקטים - בדיוק כמו בעמוד checkout */}
            {missingProductsModal && (
                <MainModal modalOpen={missingProductsModal} setModalOpen={setMissingProductsModal}>
                    <div className="px-11 py-8">
                        <MissingProductsModal
                            missingProducts={missingProductsState.length > 0 ? missingProductsState : missingProducts}
                        />
                    </div>
                </MainModal>
            )}

            {priceConflictsModal && (
                <MainModal modalOpen={priceConflictsModal} setModalOpen={setPriceConflictsModal}>
                    <div className="px-11 py-8">
                        <PriceUpdatedModal
                            priceUpdatedItems={priceConflicts}
                            closeModal={() => setPriceConflictsModal(false)}
                        />
                    </div>
                </MainModal>
            )}

            <Layout title={t("common:cashierDesk")} description={t("common:cashierPageDescription")} cashierPage={true}>
                <div className="mx-auto px-3 sm:px-6 lg:px-8 max-w-screen-2xl">
                    <div className="py-3 lg:py-6">
                        {/* כותרת העמוד */}
                        {/* <div className="flex flex-col items-center mb-6">
                            <Image
                            src={cashierPageTitle.src}
                            alt="Payment Title"
                            width={250}
                            height={60}
                            className="-mt-10 -mb-4 lg:hidden block"
                        />
                            <p className="text-gray-600 text-center">
                                {t("common:welcome")} <u>{userInfo?.name}</u>, {t("common:createOrderForCustomer")}
                            </p>
                        </div> */}

                        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16">
                            {/* עמודת שמאל - זיהוי קולי ופרטי לקוח */}
                            <div className="lg:col-span-7">
                                <div className="space-y-3 md:space-y-6">

                                    {/* זיהוי קולי למוצרים */}
                                    <CashierVoicePanel ref={voicePanelRef} />

                                    <div className="lg:col-span-5 mt-6 lg:mt-0 md:hidden block">
                                        <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-[150px]">
                                            <h2 className="text-xl font-semibold text-blackmb-4 flex items-center">
                                                <IoBagHandle className="ml-2" />
                                                {t("common:orderSummary")}
                                            </h2>

                                            {/* פריטים בעגלה */}
                                            <div className="space-y-3 max-h-80 overflow-y-auto">
                                                {isEmpty ? (
                                                    <div className="text-center py-8 text-gray-500">
                                                        <IoBagHandle className="mx-auto w-12 h-12 mb-3 text-gray-300" />
                                                        <p>{t("common:noProductsInCart")}</p>
                                                        <p className="text-sm mt-1">{t("common:useVoiceToAddProducts")}</p>
                                                    </div>
                                                ) : (
                                                    items.map((item) => (
                                                        <CartItem key={item.id} item={item} />
                                                    ))
                                                )}
                                            </div>

                                            {!isEmpty && (
                                                <>
                                                    {/* חישוב מחירים */}
                                                    <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span>{t("common:productsTotal")}:</span>
                                                            <span>{currency}{customCartTotal.toFixed(2)}</span>
                                                        </div>

                                                        <div className={`flex justify-between text-sm ${discountAmount > 0 ? "text-green-600" : ""}`}>
                                                            <span>{t("common:discount")}:</span>
                                                            <span>{currency}{discountAmount.toFixed(2)}</span>
                                                        </div>

                                                        <div className="border-t border-gray-200 pt-2">
                                                            <div className="flex justify-between font-bold text-lg">
                                                                <span>{t("common:totalPayment")}:</span>
                                                                <span>{currency}{total.toFixed(2)}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* כפתור יצירת הזמנה */}
                                                    <button
                                                        type="button"
                                                        onClick={handleSubmit(handleCashierSubmit)}
                                                        disabled={isCheckoutSubmit || isEmpty}
                                                        className="w-full mt-6 py-4 bg-mainColor text-white rounded-lg font-semibold text-lg hover:bg-mainColor-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                    >
                                                        {isCheckoutSubmit ? (
                                                            <>
                                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                                {t("common:creatingOrder")}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <IoWalletSharp />
                                                                {customerName.trim()
                                                                    ? t("common:createOrderFor", { customerName: customerName })
                                                                    : t("common:createOrder")}
                                                            </>
                                                        )}
                                                    </button>

                                                    {/* הודעת שגיאה */}
                                                    {error && (
                                                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                            <p className="text-red-700 text-sm text-center">{error}</p>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* פרטי הלקוח */}
                                    <div className="bg-white p-6 border border-gray-200 rounded-lg">
                                        <h2 className="text-xl font-semibold text-blackmb-4">
                                            {t("common:customerDetails")}
                                        </h2>

                                        <div className="space-y-4">
                                            <div>
                                                <Label label={t("common:customerNameLabel")} />
                                                <CustomerNameVoiceInput
                                                    value={customerName}
                                                    onChange={handleCustomerNameChange}
                                                    disabled={isCheckoutSubmit}
                                                    onVoiceStart={handleCustomerVoiceStart}
                                                />
                                                <Error errorName={errors.customerName} />
                                            </div>

                                            <div>
                                                <InputArea
                                                    register={register}
                                                    label={t("common:customerPhoneOptional")}
                                                    name="customerPhone"
                                                    type="tel"
                                                    placeholder={t("common:enterPhoneNumber")}
                                                    disabled={isCheckoutSubmit}
                                                    isRequired={false}
                                                />
                                                <Error errorName={errors.customerPhone} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* קופון הנחה */}
                                    {/* <div className="bg-white p-6 border border-gray-200 rounded-lg">
                                        <h2 className="text-xl font-semibold text-blackmb-4">
                                            {t("common:discountCoupon")}
                                        </h2>
                                        {couponInfo.couponCode ? (
                                            <span className="bg-mainColor-superLight px-4 py-3 leading-tight w-full rounded-md flex justify-between">
                                                {" "}
                                                <p className="text-mainColor-dark">{t("common:couponApplied")} </p>{" "}
                                                <span className="text-red-500 text-right">
                                                    {couponInfo.couponCode}
                                                </span>
                                            </span>
                                        ) : (
                                            <div className="w-full flex flex-col xs:flex-row items-start xs:items-center justify-center gap-2">
                                                <input
                                                    ref={couponRef}
                                                    type="text"
                                                    placeholder={t("common:couponCode")}
                                                    className="form-input py-2 px-3 md:px-4 w-full appearance-none transition ease-in-out border text-input text-sm rounded-md h-12 duration-200 bg-white border-gray-200 focus:ring-0 focus:outline-none focus:border-mainColor placeholder-gray-500 placeholder-opacity-75"
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault(); // מונע את שליחת הטופס הכללי
                                                            handleCouponCode(e); // מפעיל את פונקציית החלת הקופון
                                                        }
                                                    }}
                                                />
                                                <MainBT
                                                    type="button"
                                                    onClick={handleCouponCode}
                                                    className="xs:!w-fit w-full whitespace-nowrap px-6 md:text-sm"
                                                >
                                                    {showingTranslateValue(
                                                        storeCustomizationSetting?.checkout?.apply_button
                                                    )}
                                                </MainBT>
                                            </div>
                                        )}
                                    </div> */}
                                </div>
                            </div>

                            {/* עמודת ימין - סיכום ההזמנה */}
                            <div className="lg:col-span-5 mt-6 lg:mt-0 md:block hidden">
                                <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-[150px]">
                                    <h2 className="text-xl font-semibold text-blackmb-4 flex items-center">
                                        <IoBagHandle className="ml-2" />
                                        {t("common:orderSummary")}
                                    </h2>

                                    {/* פריטים בעגלה */}
                                    <div className="space-y-3 max-h-80 overflow-y-auto">
                                        {isEmpty ? (
                                            <div className="text-center py-8 text-gray-500">
                                                <IoBagHandle className="mx-auto w-12 h-12 mb-3 text-gray-300" />
                                                <p>{t("common:noProductsInCart")}</p>
                                                <p className="text-sm mt-1">{t("common:useVoiceToAddProducts")}</p>
                                            </div>
                                        ) : (
                                            items.map((item) => (
                                                <CartItem key={item.id} item={item} />
                                            ))
                                        )}
                                    </div>

                                    {!isEmpty && (
                                        <>
                                            {/* חישוב מחירים */}
                                            <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>{t("common:productsTotal")}:</span>
                                                    <span>{currency}{customCartTotal.toFixed(2)}</span>
                                                </div>

                                                <div className={`flex justify-between text-sm ${discountAmount > 0 ? "text-green-600" : ""}`}>
                                                    <span>{t("common:discount")}:</span>
                                                    <span>{currency}{discountAmount.toFixed(2)}</span>
                                                </div>

                                                <div className="border-t border-gray-200 pt-2">
                                                    <div className="flex justify-between font-bold text-lg">
                                                        <span>{t("common:totalPayment")}:</span>
                                                        <span>{currency}{total.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* כפתור יצירת הזמנה */}
                                            <button
                                                type="button"
                                                onClick={handleSubmit(handleCashierSubmit)}
                                                disabled={isCheckoutSubmit || isEmpty}
                                                className="w-full mt-6 py-4 bg-mainColor text-white rounded-lg font-semibold text-lg hover:bg-mainColor-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {isCheckoutSubmit ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                        {t("common:creatingOrder")}
                                                    </>
                                                ) : (
                                                    <>
                                                        <IoWalletSharp />
                                                        {customerName.trim()
                                                            ? t("common:createOrderFor", { customerName: customerName })
                                                            : t("common:createOrder")}
                                                    </>
                                                )}
                                            </button>

                                            {/* הודעת שגיאה */}
                                            {error && (
                                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                    <p className="text-red-700 text-sm text-center">{error}</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    );
};

export default CashierDesk; 