// src/component/guestAddress/GuestAddressForm.jsx
import React, { useEffect } from "react";
import { IoLocationOutline } from "react-icons/io5";
import { useTranslations } from "next-intl";

// Internal import
import Label from "@component/form/Label";
import Error from "@component/form/Error";
import InputArea from "@component/form/InputArea";
import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";
import City from "@component/select/City";

const GuestAddressForm = ({ register, errors, setError, clearErrors, watch, chosenCity, setChosenCity }) => {
    const { storeCustomizationSetting } = useGetSetting();
    const { showingTranslateValue } = useUtilsFunction();
    const t = useTranslations();

    const validateInput = (data) => {
        const { name, lastName, phone, street, houseNumber, apartmentNumber } = data;

        // בדיקת רווחים בשדות שם פרטי ושם משפחה
        if (!name?.trim()) {
            setError('name', { type: 'manual', message: t('invalidName') });
            return false;
        }

        if (!lastName?.trim()) {
            setError('lastName', { type: 'manual', message: t('invalidLastName') });
            return false;
        }

        // בדיקת רווחים בשדות כתובת
        if (!street?.trim()) {
            setError('street', { type: 'manual', message: t('invalidStreet') });
            return false;
        }

        if (!houseNumber?.trim()) {
            setError('houseNumber', { type: 'manual', message: t('invalidHouseNumber') });
            return false;
        }

        if (!chosenCity) {
            setError('city', { type: 'manual', message: t('invalidCity') });
            return false;
        }

        if (!apartmentNumber?.trim()) {
            setError('apartmentNumber', { type: 'manual', message: t('invalidApartmentNumber') });
            return false;
        }

        // בדיקת מספר טלפון - מתחיל ב־05 וכולל 10 ספרות בדיוק
        const phoneRegex = /^05\d{8}$/;
        if (!phoneRegex.test(phone)) {
            setError('phone', { type: 'manual', message: t('invalidPhone') });
            return false;
        }

        // בדיקת אימייל
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            setError('email', { type: 'manual', message: t('invalidEmail') || 'נא להזין אימייל תקין' });
            return false;
        }

        return true;
    };

    // חשיפה של פונקציית הוולידציה להורה
    useEffect(() => {
        if (window.guestAddressValidate) {
            window.guestAddressValidate.current = validateInput;
        }
    }, [chosenCity, watch]);

    // ניקוי error כשמבחרים עיר
    useEffect(() => {
        if (chosenCity && errors.guestCity) {
            clearErrors("guestCity");
        }
    }, [chosenCity, errors.guestCity, clearErrors]);

    // מעקב אחרי השדות וניקוי errors כשהקלט תקין
    const guestName = watch("guestName");
    const guestLastName = watch("guestLastName");
    const guestPhone = watch("guestPhone");
    const guestEmail = watch("guestEmail");
    const guestStreet = watch("guestStreet");
    const guestHouseNumber = watch("guestHouseNumber");
    const guestApartmentNumber = watch("guestApartmentNumber");

    const phoneRegex = /^05\d{8}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // ניקוי error של שם פרטי
    useEffect(() => {
        if (guestName?.trim() && errors.guestName) {
            clearErrors("guestName");
        }
    }, [guestName, errors.guestName, clearErrors]);

    // ניקוי error של שם משפחה
    useEffect(() => {
        if (guestLastName?.trim() && errors.guestLastName) {
            clearErrors("guestLastName");
        }
    }, [guestLastName, errors.guestLastName, clearErrors]);

    // ניקוי error של טלפון
    useEffect(() => {
        if (guestPhone && phoneRegex.test(guestPhone) && errors.guestPhone) {
            clearErrors("guestPhone");
        }
    }, [guestPhone, errors.guestPhone, clearErrors]);

    // ניקוי error של אימייל
    useEffect(() => {
        if (guestEmail && emailRegex.test(guestEmail) && errors.guestEmail) {
            clearErrors("guestEmail");
        }
    }, [guestEmail, errors.guestEmail, clearErrors]);

    // ניקוי error של רחוב
    useEffect(() => {
        if (guestStreet?.trim() && errors.guestStreet) {
            clearErrors("guestStreet");
        }
    }, [guestStreet, errors.guestStreet, clearErrors]);

    // ניקוי error של מספר בית
    useEffect(() => {
        if (guestHouseNumber?.trim() && errors.guestHouseNumber) {
            clearErrors("guestHouseNumber");
        }
    }, [guestHouseNumber, errors.guestHouseNumber, clearErrors]);

    // ניקוי error של מספר דירה
    useEffect(() => {
        if (guestApartmentNumber?.trim() && errors.guestApartmentNumber) {
            clearErrors("guestApartmentNumber");
        }
    }, [guestApartmentNumber, errors.guestApartmentNumber, clearErrors]);

    return (
        <div className="w-full">
            <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <IoLocationOutline className="text-mainColor-dark text-xl" />
                        {t('deliveryDetails')}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {/* שם פרטי */}
                        <div>
                            <InputArea
                                register={register}
                                label={showingTranslateValue(
                                    storeCustomizationSetting?.dashboard?.full_name
                                )}
                                name="guestName"
                                type="text"
                                placeholder={showingTranslateValue(
                                    storeCustomizationSetting?.dashboard?.full_name
                                )}
                            />
                            <Error errorName={errors.guestName} />
                        </div>

                        {/* שם משפחה */}
                        <div>
                            <InputArea
                                register={register}
                                label={showingTranslateValue(
                                    storeCustomizationSetting?.dashboard?.last_name
                                )}
                                name="guestLastName"
                                type="text"
                                placeholder={showingTranslateValue(
                                    storeCustomizationSetting?.dashboard?.last_name
                                )}
                            />
                            <Error errorName={errors.guestLastName} />
                        </div>

                        {/* טלפון */}
                        <div>
                            <InputArea
                                register={register}
                                label={showingTranslateValue(
                                    storeCustomizationSetting?.dashboard?.user_phone
                                )}
                                name="guestPhone"
                                type="tel"
                                placeholder={showingTranslateValue(
                                    storeCustomizationSetting?.dashboard?.user_phone
                                )}
                            />
                            <Error errorName={errors.guestPhone} />
                        </div>

                        {/* אימייל */}
                        <div>
                            <InputArea
                                register={register}
                                label={showingTranslateValue(
                                    storeCustomizationSetting?.dashboard?.user_email
                                )}
                                name="guestEmail"
                                type="email"
                                placeholder={showingTranslateValue(
                                    storeCustomizationSetting?.dashboard?.user_email
                                )}
                            />
                            <Error errorName={errors.guestEmail} />
                        </div>

                        {/* עיר */}
                        <div>
                            <Label label={t('city')} />
                            <City
                                setValue={setChosenCity}
                                placeholder={chosenCity ? JSON.stringify(chosenCity) : t('selectCity')}
                            />
                            <Error errorName={errors.guestCity} />
                        </div>

                        {/* רחוב */}
                        <div>
                            <InputArea
                                register={register}
                                label={t('street')}
                                name="guestStreet"
                                type="text"
                                placeholder={t('street')}
                            />
                            <Error errorName={errors.guestStreet} />
                        </div>

                        {/* מספר בית */}
                        <div>
                            <InputArea
                                register={register}
                                label={t('houseNumber')}
                                name="guestHouseNumber"
                                type="text"
                                placeholder={t('houseNumber')}
                            />
                            <Error errorName={errors.guestHouseNumber} />
                        </div>

                        {/* מספר דירה */}
                        <div>
                            <InputArea
                                register={register}
                                label={t('apartmentNumber')}
                                name="guestApartmentNumber"
                                type="text"
                                placeholder={t('apartmentNumber')}
                            />
                            <Error errorName={errors.guestApartmentNumber} />
                        </div>

                        {/* קומה */}
                        <div>
                            <InputArea
                                register={register}
                                label={t('floor')}
                                name="guestFloor"
                                type="number"
                                placeholder={t('floor')}
                                isRequired={false}
                            />
                            <Error errorName={errors.guestFloor} />
                        </div>

                        {/* קוד כניסה */}
                        <div>
                            <InputArea
                                register={register}
                                label={t('entryCode')}
                                name="guestEntryCode"
                                type="text"
                                placeholder={t('entryCode')}
                                isRequired={false}
                            />
                            <Error errorName={errors.guestEntryCode} />
                        </div>

                        {/* מיקוד */}
                        <div>
                            <InputArea
                                register={register}
                                label={t('postalCode')}
                                name="guestPostalCode"
                                type="text"
                                placeholder={t('postalCode')}
                                isRequired={false}
                            />
                            <Error errorName={errors.guestPostalCode} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuestAddressForm;