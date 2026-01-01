// Internal import
import Layout from "@layout/Layout";
import Coupon from "@component/coupon/Coupon";
import PageHeader from "@component/header/PageHeader";
import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { useTranslations } from "next-intl";
import { getI18nProps } from "@utils/i18n";

const Offer = () => {
  const { data } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();
  const t = useTranslations();

  return (
    <Layout title={t('Offers')} description={t('offersDescription')}>
      <PageHeader
        headerBg={data?.offer?.header_bg}
        title={showingTranslateValue(data?.offer?.title)}
      />
      <div className="mx-auto max-w-screen-2xl px-4 py-10 lg:py-20 sm:px-10">
        <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
          <Coupon />
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

export default Offer;
