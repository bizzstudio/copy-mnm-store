// src/component/checkout/PersonalDetails.jsx
import React from "react";
import { CiUser } from "react-icons/ci";
import { useTranslations } from "next-intl";
import GuestAddressForm from "@component/guestAddress/GuestAddressForm";
import NoDeliveryWarning from "@component/checkout/NoDeliveryWarning";

const PersonalDetails = ({
    userInfo,
    city,
    setModalOpen,
    isDeliverable,
    nextTime,
    availableDays,
    setDeliveriesPopupOpen,
    guestAddressFormRef,
    register,
    setValue,
    errors,
    setFormError,
    clearErrors,
    watch,
    guestChosenCity,
    setGuestChosenCity,
    noShipping,
}) => {
    const t = useTranslations();

    return (
        <div className="w-full">
            {userInfo ? (
                // משתמש מחובר
                <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="p-4 sm:p-6">
                        <div className="flex items-start gap-4">
                            <div className="shrink-0">
                                <div className="w-12 h-12 bg-mainColor-light rounded-full flex items-center justify-center">
                                    <CiUser className="text-2xl text-mainColor-dark" />
                                </div>
                            </div>
                            <div className="grow min-w-0">
                                <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2">
                                    <h2 className="text-lg font-semibold text-gray-900 truncate">
                                        {userInfo?.name}

                                        {city && (
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                <span className="font-medium">{city}</span>
                                                {userInfo?.address?.street && (
                                                    <span>, {userInfo?.address?.street}</span>
                                                )}
                                                {userInfo?.address?.houseNumber && (
                                                    <span> {userInfo?.address?.houseNumber}</span>
                                                )}
                                                {userInfo?.address?.apartmentNumber && (
                                                    <span>/{userInfo?.address?.apartmentNumber}</span>
                                                )}
                                            </p>
                                        )}
                                    </h2>
                                    <button
                                        type="button"
                                        className="text-sm text-stone-700 hover:text-mainColor-dark font-medium underline shrink-0 transition-colors"
                                        onClick={() => setModalOpen(true)}
                                    >
                                        {t('changeAddress')}
                                    </button>
                                </div>

                                {/* הודעת אין משלוח - רק אם אין משלוח (לא רלוונטי ללקוח "ללא משלוח") */}
                                {!noShipping && (
                                    <NoDeliveryWarning
                                        isDeliverable={isDeliverable}
                                        city={city}
                                        guestChosenCity={guestChosenCity}
                                        nextTime={nextTime}
                                        availableDays={availableDays}
                                        setDeliveriesPopupOpen={setDeliveriesPopupOpen}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // טופס אורח
                <div ref={guestAddressFormRef}>
                    <GuestAddressForm
                        register={register}
                        setValue={setValue}
                        errors={errors}
                        setError={setFormError}
                        clearErrors={clearErrors}
                        watch={watch}
                        chosenCity={guestChosenCity}
                        setChosenCity={setGuestChosenCity}
                    />
                    {/* הודעת אין משלוח - רק אם אין משלוח */}
                    <NoDeliveryWarning
                        isDeliverable={isDeliverable}
                        city={city}
                        guestChosenCity={guestChosenCity}
                        nextTime={nextTime}
                        availableDays={availableDays}
                        setDeliveriesPopupOpen={setDeliveriesPopupOpen}
                    />
                </div>
            )}
        </div>
    );
};

export default PersonalDetails;