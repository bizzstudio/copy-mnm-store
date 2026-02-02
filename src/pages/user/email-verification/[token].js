import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { IoCheckmarkCircle, IoCloseCircle } from "react-icons/io5";

// Internal import
import { notifySuccess } from "@utils/toast";
import CustomerServices from "@services/CustomerServices";
import { UserContext } from "@context/UserContext";
import Loading from "@component/preloader/Loading";
import { useTranslations } from "next-intl";
import { getI18nProps } from "@utils/i18n";

const EmailVerification = ({ params }) => {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { dispatch } = useContext(UserContext);
  const t = useTranslations();

  // console.log("params", params);

  useEffect(() => {
    setLoading(true);
    CustomerServices.registerCustomer(params?.token)
      .then((res) => {
        localStorage.setItem("firstTime", true);
        router.push("/");
        setLoading(false);
        setSuccess(res.message);
        notifySuccess(t('registerSuccess'));
        dispatch({ type: "USER_LOGIN", payload: res });
        Cookies.set("userInfo", JSON.stringify(res), {
          expires: 10, // 10 days
        });
      })
      .catch((err) => {
        setLoading(false);
        setError(err ? err.response.data.message : err.message);
      });
  }, []);

  return (
    <div className="flex justify-center items-center h-screen bg-mainColor-superLight">
      {loading ? (
        <Loading loading={loading} />
      ) : success ? (
        <div className="text-mainColor-superDark">
          <IoCheckmarkCircle className="mx-auto mb-2 text-center text-4xl" />
          <h2 className="text-xl font-medium"> {success} </h2>
        </div>
      ) : (
        <div className="text-red-600">
          <IoCloseCircle className="mx-auto mb-2 text-center text-4xl" />
          <h2 className="text-xl font-medium"> {error} </h2>
        </div>
      )}
    </div>
  );
};

export const getServerSideProps = async (context) => {
  const i18nProps = await getI18nProps(context);

  return {
    props: {
      params: context.params,
      ...i18nProps,
    },
  };
};

export default EmailVerification;
