import Link from "next/link";
import React from "react";
import { FiMail } from "react-icons/fi";
import useTranslation from "next-translate/useTranslation";

// Internal import
import Error from "@component/form/Error";
import InputArea from "@component/form/InputArea";
import useLoginSubmit from "@hooks/useLoginSubmit";
import MinimalTitle from "@component/common/MinimalTitle";
import MainBT from "@component/button/MainBT";

const ResetPassword = ({ setShowResetPassword, setModalOpen }) => {
  const { handleSubmit, submitHandler, register, errors, loading } =
    useLoginSubmit(setModalOpen);
  const { t } = useTranslation();

  return (
    <>
      <div className="flex justify-between items-center mt-5 mb-4 bg-mainColor-superLight rounded-lg p-3">
        <MinimalTitle title={t("common:recoverPasswordTitle")} />
      </div>
      <form
        onSubmit={handleSubmit(submitHandler)}
        className="flex flex-col justify-center"
      >
        <div className="grid grid-cols-1 gap-5">
          <div className="form-group">
            <InputArea
              register={register}
              label={t("common:email")}
              name="verifyEmail"
              type="email"
              placeholder={t("common:registerEmail")}
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
                <span>{t("common:processing")}</span>
              </div>
            </MainBT>
          ) : (
            <MainBT
              disabled={loading}
              type="submit"
            >
              {t("common:recoverPassword")}
            </MainBT>
          )}
        </div>
      </form>
    </>
  );
};

export default ResetPassword;
