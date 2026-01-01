// src/pages/404.js
import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import Link from "next/link";
import MainBT from "@component/button/MainBT";
import Layout from "@layout/Layout";
import { getI18nProps } from "@utils/i18n";

const NotFound = () => {
  const t = useTranslations();
  return (
    <Layout 
      title={t('notFoundTitle')} 
      description={t('notFoundDescription')}
    >
      <div className="px-6 py-10 lg:py-20 flex flex-wrap content-center">
        <div className="block justify-items-stretch mx-auto items-center text-center max-w-4xl">
          <div className="mb-8">
            <Image 
              width={650} 
              height={450} 
              src="/404.svg"
              alt="עמוד לא נמצא" 
              className="mx-auto"
            />
          </div>
          
          <div className="space-y-6">
            <h1 className="font-bold font-serif text-3xl lg:text-5xl leading-tight text-gray-800">
              {t('notFoundTitle')}
            </h1>
            
            <p className="text-lg font-sans text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {t('notFoundDescription')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <Link href="/">
                <MainBT className="!w-fit px-8 py-3 text-lg">
                  {t('backToHome')}
                </MainBT>
              </Link>
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

export default NotFound;
