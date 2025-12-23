// src/component/userAddressUpdate/UserAddressUpdate.jsx
import Cookies from "js-cookie";
import { useForm } from "react-hook-form";
import React, { useContext, useEffect, useState } from "react";
import useTranslation from "next-translate/useTranslation";

// Internal import
import Label from "@component/form/Label";
import Error from "@component/form/Error";
import InputArea from "@component/form/InputArea";
import CustomerServices from "@services/CustomerServices";
import { UserContext } from "@context/UserContext";
import { notifySuccess, notifyError } from "@utils/toast";
import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";
import City from "@component/select/City";
import MinimalTitle from "@component/common/MinimalTitle";
import MainBT from "@component/button/MainBT";

const UserAddressUpdate = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [chosenCity, setChosenCity] = useState();
  const {
    state: { userInfo },
  } = useContext(UserContext);
  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
  } = useForm();

  const validateInput = (data) => {
    const { name, lastName, phone, street, houseNumber, apartmentNumber } = data;

    // בדיקת רווחים בשדות שם פרטי ושם משפחה
    if (!name.trim()) {
      setError('name', { type: 'manual', message: t('common:invalidName') });
      return false;
    }

    if (!lastName.trim()) {
      setError('lastName', { type: 'manual', message: t('common:invalidLastName') });
      return false;
    }

    // בדיקת רווחים בשדות כתובת
    if (!street.trim()) {
      setError('street', { type: 'manual', message: t('common:invalidStreet') });
      return false;
    }

    if (!houseNumber.trim()) {
      setError('houseNumber', { type: 'manual', message: t('common:invalidHouseNumber') });
      return false;
    }

    if (!chosenCity) {
      setError('city', { type: 'manual', message: t('common:invalidCity') });
      return false;
    }

    if (!apartmentNumber.trim()) {
      setError('apartmentNumber', { type: 'manual', message: t('common:invalidApartmentNumber') });
      return false;
    }

    // בדיקת מספר טלפון - מתחיל ב־05 וכולל 10 ספרות בדיוק
    const phoneRegex = /^05\d{8}$/;
    if (!phoneRegex.test(phone)) {
      setError('phone', { type: 'manual', message: t('common:invalidPhone') });
      return false;
    }

    return true;
  };

  const onSubmit = (data) => {
    setLoading(true);

    if (!validateInput(data)) {
      setLoading(false);
      return;
    }

    const userData = {
      name: data.name,
      lastName: data.lastName,
      email: data.email,
      address: {
        city: chosenCity,
        street: data.street,
        houseNumber: data.houseNumber,
        apartmentNumber: data.apartmentNumber,
        floor: data.floor,
        entryCode: data.entryCode,
        postalCode: data.postalCode,
      },
      phone: data.phone,
      image: imageUrl,
    };

    CustomerServices.updateCustomer(userInfo._id, userData)
      .then((res) => {
        if (res) {
          setLoading(false);
          notifySuccess(t("common:success"));
          Cookies.set("userInfo", JSON.stringify(res), {
            expires: 10, // 10 days
          });
          window.location.reload();
        }
      })
      .catch((err) => {
        setLoading(false);
        notifyError(err?.response?.data?.message || err?.message);
      });
  };

  useEffect(() => {
    if (Cookies.get("userInfo")) {
      const user = JSON.parse(Cookies.get("userInfo"));
      setValue("name", user.name);
      setValue("lastName", user.lastName);
      setValue("email", user.email);
      if (user.address) {
        setValue("street", user.address.street);
        setValue("houseNumber", user.address.houseNumber);
        setValue("apartmentNumber", user.address.apartmentNumber);
        setValue("floor", user.address.floor);
        setValue("entryCode", user.address.entryCode);
        setValue("postalCode", user.address.postalCode);
        setChosenCity(user.address.city);
      }
      setValue("phone", user.phone);
      setImageUrl(user.image);
    }
  }, [setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex justify-between items-center mt-5 mb-4 bg-white shadow-md rounded-xl p-3 border-s-4 border-b-4 border-mainColor">
        <MinimalTitle title={t("common:updateProfileTitle")} />
      </div>
      <div className="mt-5 md:mt-0 md:col-span-2">
        <div className="mt-10 sm:mt-0">
          <div className="md:grid-cols-6 md:gap-6">
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="lg:mt-6 mt-4 bg-white">
                <div className="grid grid-cols-6 gap-6">
                  {/* name and last name */}
                  <div className="flex flex-col xs:flex-row gap-4 col-span-6">
                    <div className="w-full">
                      <InputArea
                        register={register}
                        label={showingTranslateValue(
                          storeCustomizationSetting?.dashboard?.full_name
                        )}
                        name="name"
                        type="text"
                        placeholder={showingTranslateValue(
                          storeCustomizationSetting?.dashboard?.full_name
                        )}
                      />
                      <Error errorName={errors.name} />
                    </div>
                    <div className="w-full">
                      <InputArea
                        register={register}
                        label={showingTranslateValue(
                          storeCustomizationSetting?.dashboard?.last_name
                        )}
                        name="lastName"
                        type="text"
                        placeholder={showingTranslateValue(
                          storeCustomizationSetting?.dashboard?.last_name
                        )}
                      />
                      <Error errorName={errors.lastName} />
                    </div>
                  </div>

                  <div className="col-span-6 xs:col-span-3 sm:col-span-3">
                    <InputArea
                      register={register}
                      label={showingTranslateValue(
                        storeCustomizationSetting?.dashboard?.user_phone
                      )}
                      name="phone"
                      type="tel"
                      placeholder={showingTranslateValue(
                        storeCustomizationSetting?.dashboard?.user_phone
                      )}
                    />
                    <Error errorName={errors.phone} />
                  </div>

                  <div className="col-span-6 xs:col-span-3 sm:col-span-3">
                    <InputArea
                      register={register}
                      label={showingTranslateValue(
                        storeCustomizationSetting?.dashboard?.user_email
                      )}
                      name="email"
                      type="email"
                      placeholder={showingTranslateValue(
                        storeCustomizationSetting?.dashboard?.user_email
                      )}
                    />
                    <Error errorName={errors.email} />
                  </div>

                  <div className="col-span-6 xs:col-span-3 sm:col-span-3">
                    <Label label={t("common:city")} />
                    <City
                      setValue={setChosenCity}
                      placeholder={JSON.stringify(chosenCity)}
                    />
                  </div>

                  <div className="col-span-6 xs:col-span-3 sm:col-span-3">
                    <InputArea
                      register={register}

                      label={t("common:street")}
                      name="street"
                      type="text"
                      placeholder={t("common:street")}
                    />
                    <Error errorName={errors.street} />
                  </div>

                  <div className="col-span-6 xs:col-span-3 sm:col-span-2">
                    <InputArea
                      register={register}
                      label={t("common:houseNumber")}
                      name="houseNumber"
                      type="text"
                      placeholder={t("common:houseNumber")}
                    />
                    <Error errorName={errors.houseNumber} />
                  </div>

                  <div className="col-span-6 xs:col-span-3 sm:col-span-2">
                    <InputArea
                      register={register}
                      label={t("common:apartmentNumber")}
                      name="apartmentNumber"
                      type="text"
                      placeholder={t("common:apartmentNumber")}
                    />
                    <Error errorName={errors.apartmentNumber} />
                  </div>

                  <div className="col-span-6 xs:col-span-3 sm:col-span-2">
                    <InputArea
                      register={register}
                      label={t("common:floor")}
                      name="floor"
                      type="number"
                      placeholder={t("common:floor")}
                      isRequired={false}
                    />
                    <Error errorName={errors.floor} />
                  </div>

                  <div className="col-span-6 xs:col-span-3 sm:col-span-2">
                    <InputArea
                      register={register}
                      label={t("common:entryCode")}
                      name="entryCode"
                      type="text"
                      placeholder={t("common:entryCode")}
                      isRequired={false}
                    />
                    <Error errorName={errors.entryCode} />
                  </div>

                  <div className="col-span-6 xs:col-span-3 sm:col-span-2">
                    <InputArea
                      register={register}
                      label={t("common:postalCode")}
                      name="postalCode"
                      type="text"
                      placeholder={t("common:postalCode")}
                      isRequired={false}
                    />
                    <Error errorName={errors.postalCode} />
                  </div>


                </div>
                <div className="w-full mt-7">
                  {loading ? (
                    <MainBT
                      disabled={loading}
                      type="submit"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <img
                          src="/loader/spinner.gif"
                          alt="Loading"
                          width={20}
                          height={10}
                          className="saturate-0"
                        />
                        {t("common:processing")}
                      </div>
                    </MainBT>
                  ) : (
                    <MainBT
                      disabled={loading}
                      type="submit"
                    >
                      {showingTranslateValue(
                        storeCustomizationSetting?.dashboard?.update_button
                      )}
                    </MainBT>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
    // <></>
  );
};

export default UserAddressUpdate;
