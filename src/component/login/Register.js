//src/component/login/Register.js
import { FiLock, FiMail, FiPhone, FiUser } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { useState } from "react";

// Internal import
import Error from "@component/form/Error";
import InputArea from "@component/form/InputArea";
import useLoginSubmit from "@hooks/useLoginSubmit";
import MainBT from "@component/button/MainBT";

const Register = ({ setShowResetPassword, setModalOpen, newsletterOptIn = false }) => {
  const {
    handleSubmit,
    submitHandler,
    register,
    errors,
    loading,
    watch,
    setError,
  } = useLoginSubmit(setModalOpen, newsletterOptIn);
  const t = useTranslations();

  const [notMatch, setNotMatch] = useState({ message: '' });

  const comparePasswords = (value) => {
    if (value !== watch("password")) {
      setNotMatch({ message: t('passwordsDoNotMatch') });
    } else {
      setNotMatch('');
    }
  };

  const validateInput = (data) => {
    const { name, lastName, phone, confirmPassword } = data;

    // בדיקת רווחים בשדות שם ושם משפחה
    if (!name.trim()) {
      setError('name', { type: 'manual', message: t('invalidName') });
      return false;
    }

    if (!lastName.trim()) {
      setError('lastName', { type: 'manual', message: t('invalidLastName') });
      return false;
    }

    // בדיקת מספר טלפון - מתחיל ב־05 וכולל 10 ספרות בדיוק
    const phoneRegex = /^05\d{8}$/;
    if (!phoneRegex.test(phone)) {
      setError('phone', { type: 'manual', message: t('invalidPhone') });
      return false;
    }

    // בדיקת אימות סיסמה
    if (data.password !== confirmPassword) {
      setError('confirmPassword', { type: 'manual', message: t('passwordsDoNotMatch') });
      return false;
    }

    return true;
  };

  const customSubmitHandler = (data) => {
    if (validateInput(data)) {
      submitHandler(data);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(customSubmitHandler)}
        className="flex flex-col justify-center w-full"
      >
        <div className="grid grid-cols-2 gap-5">
          <div className="col-span-2 xs:col-span-1">
            <InputArea
              register={register}
              // label={t('name')}
              name="name"
              type="text"
              placeholder={t('name')}
              Icon={FiUser}
            />
            <Error errorName={errors.name} />
          </div>

          <div className="col-span-2 xs:col-span-1">
            <InputArea
              register={register}
              // label={t('lastName')}
              name="lastName"
              type="text"
              placeholder={t('lastName')}
              Icon={FiUser}
            />
            <Error errorName={errors.lastName} />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <InputArea
              register={register}
              // label={t('email')}
              name="email"
              type="email"
              placeholder={t('email')}
              Icon={FiMail}
            />
            <Error errorName={errors.email} />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <InputArea
              register={register}
              // label={t('phone')}
              name="phone"
              type="tel"
              placeholder={t('phone')}
              Icon={FiPhone}
            />
            <Error errorName={errors.phone} />
          </div>

          <div className="col-span-2 flex gap-3 flex-col sm:flex-row">
            <div className="form-group w-full">
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

            {/* אימות סיסמה */}
            <div className="form-group w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-800 focus-within:text-gray-900 sm:text-base">
                    <FiLock />
                  </span>
                </div>
                <input
                  {...register("confirmPassword", {
                    required: t('confirmPassword') + " is required!",
                    validate: (value) => {
                      if (value !== watch("password")) {
                        return t('passwordsDoNotMatch');
                      }
                      return true;
                    }
                  })}
                  type="password"
                  placeholder={t('confirmPassword')}
                  className="py-2 px-4 pl-10 w-full appearance-none border text-sm opacity-75 text-input rounded-md placeholder-body min-h-12 transition duration-200 focus:ring-0 ease-in-out bg-white border-gray-200 focus:outline-none focus:border-mainColor h-11 md:h-12"
                />
              </div>
              <Error errorName={errors.confirmPassword} />
            </div>
          </div>

          {/* <div className="flex items-center justify-between">
            <div className="flex ms-auto">
              <button
                type="button"
                onClick={() => setShowResetPassword(true)}
                className="text-end text-sm text-heading ps-3 underline hover:no-underline focus:outline-none"
              >
                {t('forgotPassword')}
              </button>
            </div>
          </div> */}
          {loading ? (
            <MainBT
              disabled={loading}
              type="submit"
              className="col-span-2 flex items-center justify-center"
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
              className="col-span-2 flex items-center justify-center"
            >
              {t('signingUp')}
            </MainBT>
          )}
        </div>
      </form>
    </>
  );
};

export default Register;
