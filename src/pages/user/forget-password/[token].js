// src/pages/user/forget-password/[token].js
import { useRouter } from "next/router";
import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { ToastContainer } from "react-toastify";
import { IoCheckmarkCircle } from "react-icons/io5";

// Internal import
import Error from "@component/form/Error";
import CustomerServices from "@services/CustomerServices";
import { notifyError } from "@utils/toast";
import MainBT from "@component/button/MainBT";
import MinimalTitle from "@component/common/MinimalTitle";
import { getI18nProps } from "@utils/i18n";
import { isStoreLoginRequired } from "@utils/storeAccess";

const REDIRECT_DELAY_MS = 2000;

const ForgetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const router = useRouter();
  const password = useRef("");
  const t = useTranslations();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  password.current = watch("newPassword");

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => {
      router.replace(
        isStoreLoginRequired() ? "/?method=login-bussines" : "/?method=login-regular"
      );
    }, REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [successMessage, router]);

  const submitHandler = ({ newPassword }) => {
    setLoading(true);
    CustomerServices.resetPassword({
      newPassword,
      token: router.query?.token,
    })
      .then((res) => {
        setLoading(false);
        setSuccessMessage(res.message);
        setValue("newPassword", "");
        setValue("confirm_password", "");
      })
      .catch((err) => {
        setLoading(false);
        notifyError(err ? err?.response?.data?.message : err.message);
      });
  };

  if (successMessage) {
    return (
      <>
        <ToastContainer />
        <div className="h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
          <IoCheckmarkCircle className="text-mainColor text-6xl mb-4" />
          <h2 className="text-2xl font-bold font-serif text-center text-gray-800">
            {successMessage}
          </h2>
          <p className="text-sm text-gray-500 mt-3">
            {t("forgetPasswordRedirecting")}
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer />
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow max-w-md w-full space-y-8 py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6 bg-white shadow-md rounded-xl p-3 border-s-4 border-b-4 border-mainColor">
            <MinimalTitle
              title={t("resetPasswordTitle")}
              subtitle={t("resetPasswordSubtitle")}
            />
          </div>
          <form
            onSubmit={handleSubmit(submitHandler)}
            className="flex flex-col justify-center"
          >
            <div className="grid grid-cols-1 gap-5">
              <div className="form-group">
                <input
                  name="newPassword"
                  type="password"
                  placeholder={t("newPasswordPlaceholder")}
                  {...register("newPassword", {
                    required: t("passwordRequired"),
                    minLength: {
                      value: 8,
                      message: t("passwordMinLength"),
                    },
                  })}
                  className="py-2 px-4 md:px-5 w-full appearance-none border text-sm opacity-75 text-input rounded-md placeholder-body min-h-12 transition duration-200 focus:ring-0 ease-in-out bg-gray-100 border-gray-200 focus:outline-none focus:border-mainColor h-11 md:h-12"
                />
                <Error errorName={errors.newPassword} />
              </div>
              <div className="form-group">
                <input
                  name="confirm_password"
                  type="password"
                  placeholder={t("confirmPassword")}
                  {...register("confirm_password", {
                    validate: (value) =>
                      value === password.current ||
                      t("passwordsDoNotMatch"),
                  })}
                  className="py-2 px-4 md:px-5 w-full appearance-none border text-sm opacity-75 text-input rounded-md placeholder-body min-h-12 transition duration-200 focus:ring-0 ease-in-out bg-gray-100 border-gray-200 focus:outline-none focus:border-mainColor h-11 md:h-12"
                />
                <Error errorName={errors.confirm_password} />
              </div>

              <MainBT disabled={loading} type="submit">
                {loading ? (
                  <div className="flex items-center justify-center gap-1">
                    <img
                      src="/loader/spinner.gif"
                      alt="Loading"
                      width={20}
                      height={10}
                      className="saturate-0"
                    />
                    <span>{t("processing")}</span>
                  </div>
                ) : (
                  t("resetPasswordTitle")
                )}
              </MainBT>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps = async (context) => {
  const i18nProps = await getI18nProps(context);

  return {
    props: {
      params: context.params,
      ...i18nProps,
    },
  };
};

export default ForgetPassword;
