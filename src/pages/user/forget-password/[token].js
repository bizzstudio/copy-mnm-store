import { useRouter } from "next/router";
import React, { useState, useContext, useRef } from "react";
import Cookies from "js-cookie";
import { useForm } from "react-hook-form";
import { FiLock, FiMail } from "react-icons/fi";
import { ToastContainer } from "react-toastify";

// Internal import
import Error from "@component/form/Error";
import InputArea from "@component/form/InputArea";
import CustomerServices from "@services/CustomerServices";
import { UserContext } from "@context/UserContext";
import { notifyError, notifySuccess } from "@utils/toast";
import MainBT from "@component/button/MainBT";
import { getI18nProps } from "@utils/i18n";

const ForgetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { dispatch } = useContext(UserContext);
  const router = useRouter();
  const password = useRef("");
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  password.current = watch("newPassword");

  const submitHandler = ({ registerEmail, password, newPassword }) => {
    // notifySuccess("This Feature is disabled for demo!");

    setLoading(true);
    if (newPassword) {
      CustomerServices.resetPassword({
        newPassword,
        token: router.query?.token,
      })
        .then((res) => {
          setLoading(false);
          setShowLogin(true);
          notifySuccess(res.message);
          setValue("newPassword");
        })
        .catch((err) => {
          setLoading(false);
          notifyError(err ? err?.response?.data?.message : err.message);
        });
    }

    if (registerEmail && password) {
      CustomerServices.customerLogin({
        registerEmail,
        password,
      })
        .then((res) => {
          setLoading(false);
          router.push("/");
          notifySuccess("Login Success!");
          dispatch({ type: "USER_LOGIN", payload: res });
          Cookies.set("userInfo", JSON.stringify(res), {
            expires: 10, // 10 days
          });
          window.location.reload();
        })
        .catch((err) => {
          setLoading(false);
          notifyError(err ? err?.response?.data?.message : err.message);
        });
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow max-w-md w-full space-y-8 py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold font-serif">
              {showLogin ? "כניסה" : "איפוס סיסמה"}
            </h2>
            <p className="text-sm md:text-base text-gray-500 mt-2 mb-8 sm:mb-10">
              {showLogin
                ? "נא להיכנס עם הסיסמה החדשה"
                : "איפוס של הסיסמה שלך"}
            </p>
          </div>
          <form
            onSubmit={handleSubmit(submitHandler)}
            className="flex flex-col justify-center"
          >
            <div className="grid grid-cols-1 gap-5">
              {showLogin && (
                <>
                  {" "}
                  <div className="form-group">
                    <InputArea
                      register={register}
                      label="אימייל"
                      name="registerEmail"
                      type="email"
                      placeholder="אימייל"
                      Icon={FiMail}
                    />
                    <Error errorName={errors.registerEmail} />
                  </div>
                  <div className="form-group">
                    <InputArea
                      register={register}
                      label="סיסמה"
                      name="password"
                      type="password"
                      autocomplete="new-password"
                      placeholder="סיסמה"
                      Icon={FiLock}
                    />

                    <Error errorName={errors.password} />
                  </div>
                </>
              )}

              {!showLogin && (
                <>
                  {" "}
                  <div className="form-group">
                    <input
                      name="newPassword"
                      type="password"
                      placeholder="סיסמה חדשה"
                      {...register("newPassword", {
                        required: "You must specify a password",
                        minLength: {
                          value: 8,
                          message: "Password must have at least 8 characters",
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
                      placeholder="אימות סיסמה"
                      {...register("confirm_password", {
                        validate: (value) =>
                          value === password.current ||
                          "The passwords do not match",
                      })}
                      className="py-2 px-4 md:px-5 w-full appearance-none border text-sm opacity-75 text-input rounded-md placeholder-body min-h-12 transition duration-200 focus:ring-0 ease-in-out bg-gray-100 border-gray-200 focus:outline-none focus:border-mainColor h-11 md:h-12"
                    />

                    <Error errorName={errors.confirm_password} />
                  </div>
                </>
              )}

              <MainBT
                disabled={loading}
                type="submit"
              >
                {showLogin ? "כניסה למערכת" : "איפוס סיסמה"}
              </MainBT>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps = async ({ params }) => {
  const i18nProps = await getI18nProps(context);

  return {
    props: {
      params,
      ...i18nProps,
    },
  };
};

export default ForgetPassword;
