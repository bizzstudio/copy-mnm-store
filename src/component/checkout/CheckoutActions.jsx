// src/component/checkout/CheckoutActions.jsx
import React from "react";
import Link from "next/link";
import { IoReturnUpBackOutline, IoArrowForward } from "react-icons/io5";
import { useTranslations } from "next-intl";
import Cookies from "js-cookie";
import MainBT from "@component/button/MainBT";
import Calculating from "@component/cart/Calculating";

const CheckoutActions = ({
    isEmpty,
    isCheckoutSubmit,
    customCartTotal,
    storeCustomizationSetting,
    showingTranslateValue,
    minimumOrderAmount,
}) => {
    const t = useTranslations();

    let currentLang = Cookies.get('_lang');
    switch (currentLang) {
        case 'he':
            currentLang = true;
            break;
        case 'en':
            currentLang = false;
            break;
        default:
            currentLang = false;
            break;
    };

    return (
        <div className="border rounded-lg bg-white px-5 lg:px-8 py-5 grid grid-cols-6 gap-4 lg:gap-6">
            <div className="col-span-6 sm:col-span-3 sm:block hidden">
                <Link href="/" passHref>
                    <MainBT type="button">
                        <div className={currentLang ? "flex justify-center items-center gap-2 font-serif w-full" : "flex flex-row-reverse justify-center items-center gap-2 font-serif w-full"}>
                            <span className="text-xl">
                                <IoReturnUpBackOutline
                                    className={currentLang ? "transform scale-x-[-1]" : ""}
                                />
                            </span>
                            {showingTranslateValue(
                                storeCustomizationSetting?.checkout?.continue_button
                            )}
                        </div>
                    </MainBT>
                </Link>
            </div>
            <div className="col-span-6 sm:col-span-3">
                <MainBT
                    type="submit"
                    disabled={isEmpty || isCheckoutSubmit || typeof customCartTotal !== 'number'}
                    className="text-sm font-serif font-medium flex justify-center w-full"
                >
                    {typeof customCartTotal !== 'number' ? (
                        <Calculating />
                    ) : isCheckoutSubmit ? (
                        <span className="flex flex-row-reverse justify-center text-center">
                            <span className="ms-1">
                                {t('processing')}
                            </span>
                            <img
                                src="/loader/spinner.gif"
                                alt="Loading"
                                width={20}
                                height={10}
                                className="saturate-0"
                            />
                        </span>
                    ) : (
                        <span className={currentLang ? "flex justify-center gap-1 text-center items-center" : "flex flex-row-reverse justify-center gap-1 text-center items-center"}>
                            {showingTranslateValue(
                                storeCustomizationSetting?.checkout
                                    ?.confirm_button
                            )}
                            <span className="text-xs text-gray-500 mb-px">
                                ({t('minimumPurchaseAmount', { amount: minimumOrderAmount })})
                            </span>
                            <span className="text-xl">
                                {" "}
                                <IoArrowForward
                                    className={currentLang ? "transform scale-x-[-1]" : ""}
                                />
                            </span>
                        </span>
                    )}
                </MainBT>
            </div>
        </div>
    );
};

export default CheckoutActions;