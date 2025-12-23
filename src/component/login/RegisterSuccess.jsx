// src/component/login/RegisterSuccess.jsx
import useTranslation from "next-translate/useTranslation";

// Internal import
import { useEffect } from "react";
import MainBT from "@component/button/MainBT";
import MinimalTitle from "@component/common/MinimalTitle";

const RegisterSuccess = () => {
  const { t } = useTranslation();

  useEffect(() => {
    return () => {
      localStorage.removeItem("showRegisterSuccess");
    }
  }, [localStorage.showRegisterSuccess]);

  return (
    <>
      <div className="flex justify-between items-center mt-5 mb-4 bg-white shadow-md rounded-xl p-3 border-s-4 border-b-4 border-mainColor">
        <MinimalTitle title={t("common:registerSuccessTitle")} />
      </div>
      <div className="flex flex-col justify-center gap-3">
        <p className="text-center"><b>{t("common:registerMessage1")}</b> {t("common:registerMessage2")}</p>
        <a
          href="https://mail.google.com"
          target="_blank">
          <MainBT>
            {t("common:goToEmail")}
          </MainBT>
        </a>
      </div>
    </>
  );
};

export default RegisterSuccess;