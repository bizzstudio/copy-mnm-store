// src/pages/404.js
import React from "react";
import Image from "next/image";
import useTranslation from "next-translate/useTranslation";
import Link from "next/link";
import MainBT from "@component/button/MainBT";
import Layout from "@layout/Layout";

const NotFound = () => {
  const { t } = useTranslation();
  return (
    <Layout 
      title={t("common:notFoundTitle")} 
      description={t("common:notFoundDescription")}
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
              {t("common:notFoundTitle")}
            </h1>
            
            <p className="text-lg font-sans text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {t("common:notFoundDescription")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <Link href="/">
                <MainBT className="!w-fit px-8 py-3 text-lg">
                  {t("common:backToHome")}
                </MainBT>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
