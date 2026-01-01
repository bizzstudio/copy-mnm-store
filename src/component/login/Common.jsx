// src/component/login/Common.jsx
import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import Cookies from "js-cookie";
import { useTranslations } from "next-intl";

// Internal import
import useAsync from "@hooks/useAsync";
import Login from "@component/login/Login";
import { notifyError } from "@utils/toast";
import useLoginSubmit from "@hooks/useLoginSubmit";
import Register from "@component/login/Register";
import ResetPassword from "@component/login/ResetPassword";
import SettingServices from "@services/SettingServices";
import CheckInput from "@component/form/checkInput";

const Common = ({ setModalOpen }) => {
  const [showRegister, setShowRegister] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);

  const { handleGoogleSignIn } = useLoginSubmit(setModalOpen, newsletterOptIn);
  const { data: storeSetting } = useAsync(SettingServices.getStoreSetting);
  const t = useTranslations();

  const handleModal = () => {
    setShowRegister(!showRegister);
    setShowResetPassword(false);
  };

  const lang = Cookies.get("_lang") || "he";

  return (
    <>
      <div className="bg-white mx-auto">
        {showResetPassword ? (
          <ResetPassword
            setShowResetPassword={setShowResetPassword}
            setModalOpen={setModalOpen}
          />
        ) : showRegister ? (
          <Register
            setShowResetPassword={setShowResetPassword}
            setModalOpen={setModalOpen}
            newsletterOptIn={newsletterOptIn}
          />
        ) : (
          <Login
            setShowResetPassword={setShowResetPassword}
            setModalOpen={setModalOpen}
            newsletterOptIn={newsletterOptIn}
          />
        )}

        {/* צ'קבוקס ניוזלטר - מופיע בכל המצבים */}
        {!showResetPassword && (
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
          {storeSetting?.google_login_status && !showRegister && (
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
            {showRegister ? t('alreadyHaveAccount') : t('notAccount')}
            <button
              onClick={handleModal}
              className="text-gray-800 hover:text-blackfont-bold mx-1 underline"
            >
              {showRegister ? t('loginBtn') : t('register')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Common;
