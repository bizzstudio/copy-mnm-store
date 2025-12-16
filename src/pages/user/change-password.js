import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Cookies from "js-cookie";

// Internal import
import Error from "@component/form/Error";
import Dashboard from "@pages/user/dashboard";
import InputArea from "@component/form/InputArea";
import CustomerServices from "@services/CustomerServices";
import { notifyError, notifySuccess } from "@utils/toast";
import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";
import useTranslation from "next-translate/useTranslation";
import MainBT from "@component/button/MainBT";

const ChangePassword = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);

  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();
  const { t } = useTranslation();

  const onSubmit = ({ email, currentPassword, newPassword }) => {
    // return notifySuccess("This Feature is disabled for demo!");

    setLoading(true);
    CustomerServices.changePassword({ email, currentPassword, newPassword })
      .then((res) => {
        notifySuccess(res.message);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        notifyError(err ? err.response.data.message : err.message);
      });
  };

  useEffect(() => {
    if (Cookies.get("userInfo")) {
      const user = JSON.parse(Cookies.get("userInfo"));
      setValue("email", user.email);
    }
  });

  return (
    <Dashboard
      title={showingTranslateValue(
        storeCustomizationSetting?.dashboard?.change_password
      )}
      description="This is change-password page"
    >
      <h2 className="text-xl font-serif font-semibold mb-5">
        {showingTranslateValue(
          storeCustomizationSetting?.dashboard?.change_password
        )}
      </h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="md:grid-cols-6 md:gap-6">
          <div className="md:mt-0 md:col-span-2">
            <div className="lg:mt-6 bg-white">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 xs:col-span-6 sm:col-span-6">
                  <InputArea
                    register={register}
                    label={showingTranslateValue(
                      storeCustomizationSetting?.dashboard?.user_email
                    )}
                    name="email"
                    type="email"
                    placeholder={showingTranslateValue(
                      storeCustomizationSetting?.dashboard?.user_email
                    )}
                  />
                  <Error errorName={errors.email} />
                </div>
                <div className="col-span-6 xs:col-span-6 sm:col-span-6">
                  <InputArea
                    register={register}
                    label={showingTranslateValue(
                      storeCustomizationSetting?.dashboard?.current_password
                    )}
                    name="currentPassword"
                    type="password"
                    autocomplete="new-password"
                    placeholder={showingTranslateValue(
                      storeCustomizationSetting?.dashboard?.current_password
                    )}
                  />
                  <Error errorName={errors.currentPassword} />
                </div>
                <div className="col-span-6 xs:col-span-6 sm:col-span-6">
                  <InputArea
                    register={register}
                    label={showingTranslateValue(
                      storeCustomizationSetting?.dashboard?.new_password
                    )}
                    name="newPassword"
                    type="password"
                    autocomplete="new-password"
                    placeholder={showingTranslateValue(
                      storeCustomizationSetting?.dashboard?.new_password
                    )}
                  />
                  <Error errorName={errors.newPassword} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-5 text-right">
          {loading ? (
            <MainBT
              disabled={loading}
              type="submit"
              className="px-6"
            >
              <div className="flex items-center justify-center gap-1">
                <img
                  src="/loader/spinner.gif"
                  alt="Loading"
                  width={20}
                  height={10}
                  className="saturate-0"
                />
                {t("common:Processing")}
              </div>
            </MainBT>
          ) : (
            <MainBT
              type="submit"
              className="px-6"
            >
              {showingTranslateValue(
                storeCustomizationSetting?.dashboard?.change_password
              )}
            </MainBT>
          )}
        </div>
      </form>
    </Dashboard>
  );
};

export default ChangePassword;
