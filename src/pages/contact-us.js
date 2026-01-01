// src/pages/contact-us.js
import React, { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { FiMail, FiMapPin, FiPhone } from "react-icons/fi";

// Internal import
import Layout from "@layout/Layout";
import Label from "@component/form/Label";
import Error from "@component/form/Error";
import InputArea from "@component/form/InputArea";
import PageHeader from "@component/header/PageHeader";
import useGetSetting from "@hooks/useGetSetting";
import CMSkeleton from "@component/preloader/CMSkeleton";
import useUtilsFunction from "@hooks/useUtilsFunction";
import CustomerServices from "@services/CustomerServices";
import notifyApiResponse from "@utils/notifyApiResponse";
import MainBT from "@component/button/MainBT";
import { getI18nProps } from "@utils/i18n";

const ContactUs = () => {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const { showingTranslateValue } = useUtilsFunction();
  const { storeCustomizationSetting, loading: settingsLoading, error } = useGetSetting();

  const submitHandler = async (data) => {
    setLoading(true);
    try {
      const res = await CustomerServices.sendContactUsMessage(data);
      notifyApiResponse(res, true);
      reset(); // ריקון הטופס לאחר שליחה מוצלחת
    } catch (error) {
      console.log("error :>> ", error);
      notifyApiResponse(error, false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title={t('contactUs')} description={t('contactUsDescription')}>
      {storeCustomizationSetting?.contact_us?.header_status && (
        <PageHeader
          headerBg={storeCustomizationSetting?.contact_us?.header_bg}
          title={showingTranslateValue(
            storeCustomizationSetting?.contact_us?.title
          )}
        />
      )}

      <div className="sm:py-10 py-5 px-5 sm:px-10">
        <div className="max-w-screen-2xl mx-auto sm:py-10 py-5 px-5 sm:px-10 bg-white rounded-lg">
          {/* פרטי החנות */}
          <div className="grid md:grid-cols-2 gap-6 lg:grid-cols-3 xl:gap-8 mb-10">
            {settingsLoading ? (
              <CMSkeleton
                count={10}
                height={20}
                error={error}
                loading={settingsLoading}
              />
            ) : (
              <div className="border p-5 rounded-lg text-center">
                <span className="flex justify-center text-4xl text-mainColor">
                  <FiMail />
                </span>
                <h5 className="text-xl font-bold">
                  {showingTranslateValue(
                    storeCustomizationSetting?.contact_us?.email_box_title
                  )}
                </h5>
                <p className="text-base opacity-90">
                  <a
                    href={`mailto:${storeCustomizationSetting?.contact_us?.email_box_email}`}
                    className="text-mainColor-dark"
                  >
                    {showingTranslateValue(
                      storeCustomizationSetting?.contact_us?.email_box_email
                    )}
                  </a>{" "}
                  {showingTranslateValue(
                    storeCustomizationSetting?.contact_us?.email_box_text
                  )}
                </p>
              </div>
            )}
            {settingsLoading ? (
              <CMSkeleton
                count={10}
                height={20}
                error={error}
                loading={settingsLoading}
              />
            ) : (
              <div className="border p-5 rounded-lg text-center">
                <span className="flex justify-center text-4xl text-mainColor">
                  <FiPhone />
                </span>
                <h5 className="text-xl font-bold">
                  {showingTranslateValue(
                    storeCustomizationSetting?.contact_us?.call_box_title
                  )}
                </h5>
                <p className="text-base opacity-90">
                  <a
                    href={`tel:+972${String(storeCustomizationSetting?.contact_us?.call_box_phone?.he || '').replace(/^0/, '')}`}
                    className="text-mainColor-dark"
                  >
                    {showingTranslateValue(
                      storeCustomizationSetting?.contact_us?.call_box_phone
                    )}
                  </a>{" "}
                  {showingTranslateValue(
                    storeCustomizationSetting?.contact_us?.call_box_text
                  )}
                </p>
              </div>
            )}
            {settingsLoading ? (
              <CMSkeleton
                count={10}
                height={20}
                error={error}
                loading={settingsLoading}
              />
            ) : (
              <div className="border p-5 rounded-lg text-center">
                <span className="flex justify-center text-4xl text-mainColor">
                  <FiMapPin />
                </span>
                <h5 className="text-xl font-bold">
                  {showingTranslateValue(
                    storeCustomizationSetting?.contact_us?.address_box_title
                  )}
                </h5>
                <a
                  className="text-base opacity-90 text-mainColor-dark"
                  target="_blank"
                  href={`https://www.google.com/maps/search/${showingTranslateValue(
                    storeCustomizationSetting?.contact_us?.address_box_address_one
                  )}`}>
                  <span>
                    {showingTranslateValue(
                      storeCustomizationSetting?.contact_us
                        ?.address_box_address_one
                    )}
                  </span>
                  {/* {" "}
                      <br />
                      {showingTranslateValue(
                        storeCustomizationSetting?.contact_us
                          ?.address_box_address_two
                      )}
                      {" "}
                      <br />
                      {showingTranslateValue(
                        storeCustomizationSetting?.contact_us
                          ?.address_box_address_three
                      )} */}
                </a>
              </div>
            )}
          </div>

          {/* contact form */}
          <div className="relative px-0 mx-auto flex flex-col lg:flex-row w-full items-start justify-between gap-16">
            <div className="relative px-0 sm:pb-0 pb-2 w-full lg:w-7/12 flex flex-col md:flex-row">
              <form
                onSubmit={handleSubmit(submitHandler)}
                className="w-full mx-auto flex flex-col justify-center"
              >
                <div className="mb-12">
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold font-serif mb-3">
                    <CMSkeleton
                      count={1}
                      height={50}
                      // error={error}
                      loading={settingsLoading}
                      data={storeCustomizationSetting?.contact_us?.form_title}
                    />
                  </h3>
                  <p className="text-base opacity-90 leading-7">
                    <CMSkeleton
                      count={2}
                      height={20}
                      // error={error}
                      loading={settingsLoading}
                      data={
                        storeCustomizationSetting?.contact_us?.form_description
                      }
                    />
                  </p>
                </div>

                <div className="flex flex-col space-y-5">
                  <div className="flex flex-col md:flex-row space-y-5 md:space-y-0">
                    <div className="w-full md:w-1/2 ">
                      <InputArea
                        register={register}
                        label={t('contact-page-form-input-name')}
                        name="name"
                        type="text"
                        placeholder={t(
                          'contact-page-form-plaholder-name'
                        )}
                      />
                      <Error errorName={errors.name} />
                    </div>
                    <div className="w-full md:w-1/2 md:mr-2.5 lg:mr-5 mt-2 md:mt-0">
                      <InputArea
                        register={register}
                        label={t('contact-page-form-input-email')}
                        name="email"
                        type="email"
                        placeholder={t(
                          'contact-page-form-plaholder-email'
                        )}
                      />
                      <Error errorName={errors.email} />
                    </div>
                  </div>
                  <div className="relative">
                    <InputArea
                      register={register}
                      label={t('contact-page-form-input-subject')}
                      name="subject"
                      type="text"
                      placeholder={t(
                        'contact-page-form-plaholder-subject'
                      )}
                    />
                    <Error errorName={errors.subject} />
                  </div>
                  <div className="relative mb-4">
                    <Label
                      label={t('contact-page-form-input-message')}
                    />
                    <textarea
                      {...register("message", {
                        required: `Message is required!`,
                      })}
                      name="message"
                      className="px-4 py-3 flex items-center w-full rounded appearance-none opacity-75 transition duration-300 ease-in-out text-sm focus:ring-0 bg-white border border-gray-300 focus:shadow-none focus:outline-none focus:border-gray-500 placeholder-body"
                      autoComplete="off"
                      spellCheck="false"
                      rows="4"
                      placeholder={t(
                        'contact-page-form-plaholder-message'
                      )}
                    ></textarea>
                    <Error errorName={errors.message} />
                  </div>
                  <div className="relative">
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
                        {t('contact-page-form-send-btn')}
                      </MainBT>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* תמונה משמאל */}
            <div className="lg:w-4/12 flex flex-col h-full">
              <Image
                width={874}
                height={874}
                src={
                  storeCustomizationSetting?.contact_us?.left_col_img ||
                  "/contact-us.png"
                }
                alt="logo"
                className="block sm:w-full mx-auto sm:max-w-[400px] max-w-[90%]"
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};


export async function getStaticProps(context) {
  return {
    props: await getI18nProps(context),
  };
}

export default ContactUs;