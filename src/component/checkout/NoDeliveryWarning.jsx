// src/component/checkout/NoDeliveryWarning.jsx
import React from "react";
import { IoWarningOutline } from "react-icons/io5";
import { useTranslations } from "next-intl";
import Cookies from "js-cookie";

const NoDeliveryWarning = ({
    isDeliverable,
    city,
    guestChosenCity,
    nextTime,
    availableDays,
    setDeliveriesPopupOpen,
}) => {
    const t = useTranslations();

    // אם יש משלוח זמין או אין עיר נבחרת, לא להציג כלום
    if (isDeliverable || (!city && !guestChosenCity)) return null;

    const lang = Cookies.get('_lang');
    const isHebrew = lang === 'he';

    return (
        <div className="mt-4">
            <div className="bg-mainColor/5 border border-mainColor-dark rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <div className="grow ">
                        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-stone-700 mb-2">
                            <IoWarningOutline className="text-[22px] mb-[1px] text-mainColor-dark" />
                            {t('noDeliveryToAddress')}
                        </h3>

                        {/* {nextTime && (
                            <p className="text-xs text-stone-700 mb-2">
                                {t('nextAvailable')}{" "}
                                {nextTime.toLocaleDateString(isHebrew ? "he-IL" : "en-US")}
                            </p>
                        )} */}

                        {/* {availableDays && availableDays.length > 0 && (
                            <p className="text-xs text-stone-700 mb-3">
                                {t('availableDays')}: {availableDays.join(", ")}
                            </p>
                        )} */}

                        <div className="flex flex-col sm:flex-row gap-2 text-xs">
                            <button
                                type="button"
                                onClick={() => setDeliveriesPopupOpen(true)}
                                className="text-stone-700 hover:text-mainColor-dark font-medium underline transition-colors"
                            >
                                {t('viewDeliveryAreas')}
                            </button>
                            <span className="hidden sm:inline text-orange-300">|</span>
                            <a
                                href={`https://wa.me/${process.env.NEXT_PUBLIC_CUSTOMER_SERVICE}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-stone-700 hover:text-mainColor-dark font-medium underline transition-colors"
                            >
                                {t('contactSupport')}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NoDeliveryWarning;