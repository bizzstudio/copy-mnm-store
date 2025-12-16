// src/pages/terms-and-conditions.js
import React from "react";
import useTranslation from "next-translate/useTranslation";

// Internal import
import Layout from "@layout/Layout";
import useGetSetting from "@hooks/useGetSetting";
import PageHeader from "@component/header/PageHeader";
import CMSkeleton from "@component/preloader/CMSkeleton";
import useUtilsFunction from "@hooks/useUtilsFunction";

const TermAndConditions = () => {
  const { storeCustomizationSetting, loading, error } = useGetSetting();
  // console.log('storeCustomizationSetting :>> ', storeCustomizationSetting);
  const { showingTranslateValue } = useUtilsFunction();
  const { t } = useTranslation();

  return (
    <Layout
      title={t("common:termsAndConditions")}
      description={t("common:termsAndConditionsDescription")}
    >
      <PageHeader
        headerBg={storeCustomizationSetting?.term_and_condition?.header_bg}
        title={showingTranslateValue(
          storeCustomizationSetting?.term_and_condition?.title
        )}
      />
      <div className="sm:py-10 py-5 px-5 sm:px-10">
        <div className="max-w-screen-2xl mx-auto pt-10 px-3 sm:px-10 bg-white rounded-lg break-words">
          <CMSkeleton
            html
            count={15}
            height={15}
            error={error}
            loading={loading}
            data={storeCustomizationSetting?.term_and_condition?.description}
          />
          <br />
          <CMSkeleton count={15} height={15} loading={loading} />
          <br />
          <CMSkeleton count={15} height={15} loading={loading} />
        </div>
      </div>
    </Layout>
  );
};

export default TermAndConditions;