// src/component/login/ResetPassword.js
import React, { useState } from "react";
import { FiMail, FiHash } from "react-icons/fi";
import { useTranslations } from "next-intl";

// Internal import
import Error from "@component/form/Error";
import InputArea from "@component/form/InputArea";
import useLoginSubmit from "@hooks/useLoginSubmit";
import MainBT from "@component/button/MainBT";
import Tabs from "@component/common/Tabs";

const ResetPassword = ({ setShowResetPassword, setModalOpen }) => {
  const [currentMethod, setCurrentMethod] = useState("reset-regular");
  const {
    handleSubmit,
    submitHandler,
    register,
    errors,
    loading,
  } = useLoginSubmit(setModalOpen);
  const t = useTranslations();

  const isBusinessReset = currentMethod === "reset-bussines";

  return (
    <>
      <Tabs
        activeTab={currentMethod}
        onTabChange={setCurrentMethod}
        tabs={[
          {
            id: "reset-regular",
            label: <span>{t("loginRegularTab")}</span>,
            content: <></>,
          },
          {
            id: "reset-bussines",
            label: <span>{t("loginBusinessTab")}</span>,
            content: <></>,
          },
        ]}
      />
      <form
        onSubmit={handleSubmit(submitHandler)}
        className="flex flex-col justify-center"
      >
        <div className="grid grid-cols-1 gap-5">
          <div className="form-group">
            <InputArea
              register={register}
              label={t("email")}
              name="verifyEmail"
              type="email"
              placeholder={t("registerEmail")}
              Icon={FiMail}
            />
            <Error errorName={errors.verifyEmail} />
          </div>

          {isBusinessReset && (
            <div className="form-group">
              <InputArea
                register={register}
                name="rivhitCustomerNumber"
                type="tel"
                placeholder={t("rivhitCustomerNumber")}
                Icon={FiHash}
                isRequired={true}
              />
              <Error errorName={errors.rivhitCustomerNumber} />
            </div>
          )}

          {loading ? (
            <MainBT disabled={loading} type="submit">
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
            </MainBT>
          ) : (
            <MainBT disabled={loading} type="submit">
              {t("recoverPassword")}
            </MainBT>
          )}
        </div>
      </form>
    </>
  );
};

export default ResetPassword;