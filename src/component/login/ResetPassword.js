import Link from "next/link";
import React from "react";
import { FiMail } from "react-icons/fi";
import { useTranslations } from "next-intl";

// Internal import
import Error from "@component/form/Error";
import InputArea from "@component/form/InputArea";
import useLoginSubmit from "@hooks/useLoginSubmit";
import MinimalTitle from "@component/common/MinimalTitle";
import MainBT from "@component/button/MainBT";

const ResetPassword = ({ setShowResetPassword, setModalOpen }) => {
  const { handleSubmit, submitHandler, register, errors, loading } =
    useLoginSubmit(setModalOpen);
  const t = useTranslations();

  return (
    <>
      <div className="flex justify-between items-center mt-5 mb-4 bg-white shadow-md rounded-xl p-3 border-s-4 border-b-4 border-mainColor">
        <MinimalTitle title={t('recoverPasswordTitle')} />
      </div>
      <form
        onSubmit={handleSubmit(submitHandler)}
        className="flex flex-col justify-center"
      >
        <div className="grid grid-cols-1 gap-5">
          <div className="form-group">
            <InputArea
              register={register}
              label={t('email')}
              name="verifyEmail"
              type="email"
              placeholder={t('registerEmail')}
              Icon={FiMail}
            />
            <Error errorName={errors.verifyEmail} />
          </div>

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
                <span>{t('processing')}</span>
              </div>
            </MainBT>
          ) : (
            <MainBT
              disabled={loading}
              type="submit"
            >
              {t('recoverPassword')}
            </MainBT>
          )}
        </div>
      </form>
    </>
  );
};

export default ResetPassword;
