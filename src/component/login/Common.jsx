// src/component/login/Common.jsx
import React, { useState, useEffect, useContext } from "react";
import { GoogleLogin } from "@react-oauth/google";
import Cookies from "js-cookie";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

// Internal import
import useAsync from "@hooks/useAsync";
import Login from "@component/login/Login";
import { notifyError } from "@utils/toast";
import useLoginSubmit from "@hooks/useLoginSubmit";
import Register from "@component/login/Register";
import ResetPassword from "@component/login/ResetPassword";
import SettingServices from "@services/SettingServices";
import CheckInput from "@component/form/checkInput";
import Tabs from "@component/common/Tabs";
import MinimalTitle from "@component/common/MinimalTitle";
import { SidebarContext } from "@context/SidebarContext";

const VALID_METHODS = ["login-regular", "login-bussines", "register", "reset-password"];

const Common = ({ setModalOpen }) => {
  const router = useRouter();
  const { loginModalOpen } = useContext(SidebarContext);

  // סטייט של התוכן – Common מנהל, טעינה ראשונית לפי query
  const [currentMethod, setCurrentMethod] = useState("login-regular");
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);

  const { handleGoogleSignIn } = useLoginSubmit(setModalOpen, newsletterOptIn);
  const { data: storeSetting } = useAsync(SettingServices.getStoreSetting);
  const t = useTranslations();

  // טעינה ראשונית: קובעים את המסך לפי ה-query
  useEffect(() => {
    if (!router.isReady) return;
    const method = router.query.method;
    if (typeof method === "string" && VALID_METHODS.includes(method)) {
      setCurrentMethod(method);
    }
  }, [router.isReady, router.query.method]);

  // כשהמודאל נפתח בלי method ב-URL (למשל מכפתור) – מעדכנים את ה-URL
  useEffect(() => {
    if (!router.isReady || !loginModalOpen) return;
    const method = router.query.method;
    if (typeof method !== "string" || !VALID_METHODS.includes(method)) {
      router.replace(
        { pathname: router.pathname, query: { ...router.query, method: currentMethod } },
        undefined,
        { shallow: true, scroll: false }
      );
    }
  }, [loginModalOpen, router.isReady, currentMethod]);

  // החלפת מסך – מעדכנים סטייט ו-query באותה לחיצה
  const setMethod = (nextMethod) => {
    setCurrentMethod(nextMethod);
    router.replace(
      { pathname: router.pathname, query: { ...router.query, method: nextMethod } },
      undefined,
      { shallow: true, scroll: false }
    );
  };

  const isResetPassword = currentMethod === "reset-password";
  const isRegister = currentMethod === "register";
  const isLoginRegular = currentMethod === "login-regular" || !currentMethod;

  const handleAuthToggle = () => {
    if (isRegister) {
      setMethod("login-regular");
    } else {
      setMethod("register");
    }
  };

  const lang = Cookies.get("_lang") || "he";

  const getTitle = () => {
    if (isResetPassword) return t('recoverPasswordTitle');
    if (isRegister) return t('registerTitle');
    return t('loginTitle');
  };

  return (
    <>
      <div className="bg-white mx-auto">
        <div className="flex justify-between items-center mb-4 bg-white shadow-md rounded-xl p-3 border-s-4 border-b-4 border-mainColor">
          <MinimalTitle title={getTitle()} />
        </div>

        {isResetPassword ? (
          <ResetPassword
            setShowResetPassword={(val) => setMethod(val ? "reset-password" : "login-regular")}
            setModalOpen={setModalOpen}
          />
        ) : isRegister ? (
          <Register
            setShowResetPassword={(val) => setMethod(val ? "reset-password" : "login-regular")}
            setModalOpen={setModalOpen}
            newsletterOptIn={newsletterOptIn}
          />
        ) : (
          <Tabs
            activeTab={currentMethod}
            onTabChange={setMethod}
            tabs={[
              {
                id: "login-regular",
                label: <span>{t("loginRegularTab")}</span>,
                content: (
                  <Login
                    loginType="regular"
                    setShowResetPassword={() => setMethod("reset-password")}
                    setModalOpen={setModalOpen}
                    newsletterOptIn={newsletterOptIn}
                  />
                ),
              },
              {
                id: "login-bussines",
                label: <span>{t("loginBusinessTab")}</span>,
                content: (
                  <Login
                    loginType="business"
                    setShowResetPassword={() => setMethod("reset-password")}
                    setModalOpen={setModalOpen}
                    newsletterOptIn={newsletterOptIn}
                  />
                ),
              },
            ]}
          />
        )}

        {/* צ'קבוקס ניוזלטר - מופיע בכל המצבים */}
        {!isResetPassword && (
          <div className="flex items-center gap-2 mt-4 mb-4 px-2">
            <CheckInput
              id="newsletterOptIn"
              type="checkbox"
              checked={newsletterOptIn}
              onChange={(e) => setNewsletterOptIn(e.target.checked)}
            />
            <label htmlFor="newsletterOptIn" className="text-sm text-gray-700 cursor-pointer">
              {t('newsletterOptInLabel')}
            </label>
          </div>
        )}

        <div>
          {storeSetting?.google_login_status && isLoginRegular && (
            <>
              <div className="mt-7 mb-3 after:bg-gray-100 before:bg-gray-100 fo10t-sans text-center font-medium">
                {t('orGoogle')}
              </div>
              <div className="flex items-center justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSignIn}
                  onFailure={(err) =>
                    notifyError(
                      err?.message || "Something wrong on your auth setup!"
                    )
                  }
                  theme="outline"
                  size="large"
                  text="signin_with"
                  shape="pill"
                  logo_alignment="center"
                  width="100%"
                  locale={lang}
                />
              </div>
            </>
          )}
        </div>
        <div className="text-center text-sm text-gray-900 mt-4">
          <div className="text-gray-500 mt-2.5">
            {isRegister ? t('alreadyHaveAccount') : t('notAccount')}
            <button
              onClick={handleAuthToggle}
              className="text-gray-800 hover:text-blackfont-bold mx-1 underline"
            >
              {isRegister ? t('loginBtn') : t('register')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Common;