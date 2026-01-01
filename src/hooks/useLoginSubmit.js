// src/hooks/useLoginSubmit.js
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import { set, useForm } from "react-hook-form";

// Internal import
import { UserContext } from "@context/UserContext";
import { notifyError, notifySuccess } from "@utils/toast";
import CustomerServices from "@services/CustomerServices";
import { useTranslations } from "next-intl";
import { trackNewsletterSignup } from "@services/flashy";
import notifyApiResponse from "@utils/notifyApiResponse";

const useLoginSubmit = (setModalOpen, newsletterOptIn = false) => {
  const router = useRouter();
  const { redirect } = router.query;
  const { dispatch } = useContext(UserContext);
  const t = useTranslations();

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
    setError,
  } = useForm();

  const cookieTimeOut = 10;

  const submitHandler = ({
    name,
    lastName,
    email,
    registerEmail,
    verifyEmail,
    password,
    phone
  }) => {
    setLoading(true);

    // console.log({
    //   name,
    //   lastName,
    //   email,
    //   registerEmail,
    //   verifyEmail,
    //   password,
    //   phone
    // })

    // login
    if (registerEmail && password) {
      if (localStorage.getItem("plsRegisterAgain")) {
        setLoading(false);
        notifyError(t('pls_register_again'));
        return;
      } else {
        CustomerServices.customerLogin({
          registerEmail,
          password,
        })
          .then((res) => {
            console.log('login res :>> ', res);
            setLoading(false);
            setModalOpen(false);
            localStorage.removeItem("plsRegisterAgain");
            localStorage.removeItem("waitingForVerification");
            // גרימה לפופאפ הזנת כתובת לקפוץ אם אין לו כתובת
            if (!res.address.city) {
              localStorage.setItem("firstTime", true);
            }
            router.push(redirect || "/");
            notifySuccess(t('loginSuccess'));
            dispatch({ type: "USER_LOGIN", payload: res });
            Cookies.set("userInfo", JSON.stringify(res), {
              expires: cookieTimeOut,
            });

            // רישום לניוזלטר אם המשתמש סימן את הצ'קבוקס
            if (newsletterOptIn && res.email) {
              trackNewsletterSignup(res.email, res.name, res.lastName, res.phone || res.contact || '');
            }

            // window.location.reload();
          })
          .catch((err) => {
            // בדיקה אם המשתמש כבר נרשם וממתין לאימות
            if (localStorage.getItem("waitingForVerification") == registerEmail) {
              setLoading(false);
              notifyError(t('waiting_for_verification'));
              return;
            } else {
              notifyError(err ? err.response.data.message : err.message);
              setLoading(false);
            }
          });
      }
    }

    // register
    if (name && email && password) {
      // ווידוא שהשם משתמש הוא 2 מילים לפחות
      // const usernameWords = name.trim().split(" ");
      // if (usernameWords.length < 2) {
      //   setLoading(false);
      //   notifyError(t('username_at_least_two_words'));
      //   return;
      // }
      CustomerServices.verifyEmailAddress({ name, lastName, email, password, phone })
        .then((res) => {
          // טיפול בלקוח קיים שמסומן כלא רשום ועכשיו נרשם
          if (res.keyWord === "customerRegistered") {
            // הלקוח כבר קיים ועכשיו נרשם - התחברות ישירה
            setLoading(false);
            setModalOpen(false);
            localStorage.removeItem("plsRegisterAgain");
            localStorage.removeItem("waitingForVerification");

            // שמירת פרטי המשתמש והתחברות
            dispatch({ type: "USER_LOGIN", payload: res });
            Cookies.set("userInfo", JSON.stringify(res), {
              expires: cookieTimeOut,
            });

            notifyApiResponse(res, true);

            // רישום לניוזלטר אם המשתמש סימן את הצ'קבוקס
            if (newsletterOptIn && res.email) {
              trackNewsletterSignup(res.email, res.name, res.lastName, res.phone || res.contact || '');
            }

            router.push(redirect || "/");
            // window.location.reload();
            return;
          }

          // תהליך הרשמה רגיל - שליחת אימייל אימות
          if (res.waitingForVerification) {
            localStorage.setItem("waitingForVerification", res.waitingForVerification);
            // מחיקת האימייל מהלוקל סטורג' תוך רבע שעה
            setTimeout(() => {
              localStorage.removeItem("waitingForVerification");
              // אחרי רבע שעה החלפת ההודעה לנא להרשם מחדש
              localStorage.setItem("plsRegisterAgain", true);
            }, 1000 * 60 * 15);
          }
          setLoading(false);
          setModalOpen(false);
          // notifySuccess(res.message);
          localStorage.setItem("showRegisterSuccess", true); // פופאפ במקום נוטיפיי

          // רישום לניוזלטר אם המשתמש סימן את הצ'קבוקס
          if (newsletterOptIn) {
            trackNewsletterSignup(email, name, lastName, phone || '');
          }
        })
        .catch((err) => {
          console.log(err)
          setLoading(false);
          notifyApiResponse(err, false);
        });
    }

    // forget password
    if (verifyEmail) {
      CustomerServices.forgetPassword({ verifyEmail })
        .then((res) => {
          setLoading(false);
          notifySuccess(res.message);
          setValue("verifyEmail");
        })
        .catch((err) => {
          setLoading(false);
          notifyError(err ? err.response.data.message : err.message);
        });
    }
  };

  const handleGoogleSignIn = (credentialResponse) => {
    if (credentialResponse) {
      CustomerServices.signUpWithProvider({
        credential: credentialResponse?.credential
      })
        .then((res) => {
          console.log('google sign in res :>> ', res);

          setModalOpen(false);
          notifySuccess(t('loginSuccess'));
          router.push(redirect || "/");
          dispatch({ type: "USER_LOGIN", payload: res });
          Cookies.set("userInfo", JSON.stringify(res), {
            expires: cookieTimeOut,
          });

          // רישום לניוזלטר אם המשתמש סימן את הצ'קבוקס
          if (newsletterOptIn && res.email) {
            trackNewsletterSignup(res.email, res.name, res.lastName, res.phone || res.contact || '');
          }

          // window.location.reload();
        })

        .catch((err) => {
          notifyError(err.message);
          setModalOpen(false);
        });
    }
  };

  return {
    handleSubmit,
    submitHandler,
    handleGoogleSignIn,
    register,
    errors,
    loading,
    watch,
    setError
  };
};

export default useLoginSubmit;
