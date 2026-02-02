// src/component/login/Login.js
import { FiHash, FiLock, FiMail } from "react-icons/fi";
import { useTranslations } from "next-intl";

// internal import
import Error from "@component/form/Error";
import useLoginSubmit from "@hooks/useLoginSubmit";
import InputArea from "@component/form/InputArea";
import MainBT from "@component/button/MainBT";

const Login = ({
  loginType = "regular",
  setShowResetPassword,
  setModalOpen,
  newsletterOptIn = false,
}) => {
  const {
    handleSubmit,
    submitHandler,
    register,
    errors,
    loading
  } = useLoginSubmit(setModalOpen, newsletterOptIn);
  const t = useTranslations();

  const isBusinessLogin = loginType === "business";

  return (
    <>
      <form
        onSubmit={handleSubmit(submitHandler)}
        className="flex flex-col justify-center"
      >
        <div className="grid grid-cols-1 gap-5">
          <div className="form-group">
            <InputArea
              register={register}
              // label={t('email')}
              name="registerEmail"
              type="email"
              placeholder={t('email')}
              Icon={FiMail}
            />
            <Error errorName={errors.registerEmail} />
          </div>
          <div className="form-group">
            <InputArea
              register={register}
              // label={t('password')}
              name="password"
              type="password"
              placeholder={t('password')}
              Icon={FiLock}
            />

            <Error errorName={errors.password} />
          </div>

          {isBusinessLogin && (
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

          <div className="flex items-center justify-between">
            <div className="flex ms-auto">
              <button
                type="button"
                onClick={() => setShowResetPassword(true)}
                className="text-end text-sm text-heading ps-3 underline hover:no-underline focus:outline-none"
              >
                {t('forgotPassword')}
              </button>
            </div>
          </div>
          {loading ? (
            <MainBT
              disabled={loading}
              type="submit"
            >
              <div className="flex items-center justify-center gap-2 whitespace-nowrap">
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
              {t('loginTitle')}
            </MainBT>
          )}
        </div>
      </form>
    </>
  );
};

export default Login;
