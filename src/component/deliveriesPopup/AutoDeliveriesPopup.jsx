// src/component/deliveriesPopup/AutoDeliveriesPopup.jsx
import React from "react";
import Image from "next/image";
import useAsync from "@hooks/useAsync";
import DeliveryServices from "@services/DeliveryServices";
import useGetSetting from "@hooks/useGetSetting";
import { useTranslations } from "next-intl";
import Cookies from "js-cookie";

const AutoDeliveriesPopup = ({ closeCategoryDrawer = () => { } }) => {
  const { data: deliveries, error, loading } = useAsync(DeliveryServices.getAllDeliveries);
  const { storeCustomizationSetting } = useGetSetting();
  const t = useTranslations();

  let currentLang = Cookies.get('_lang');

  switch (currentLang) {
    case 'he':
      currentLang = true;
      break;
    case 'en':
      currentLang = false;
      break;
    default:
      currentLang = false;
      break;
  }

  // מיון הערים לפי א-ב
  const sortedCities = deliveries?.sort((a, b) => {
    const cityA = currentLang ? a.city.city_name_he : a.city.city_name_en;
    const cityB = currentLang ? b.city.city_name_he : b.city.city_name_en;
    return cityA?.localeCompare(cityB, currentLang ? 'he' : 'en');
  }) || [];

  return (
    <div className="w-full h-min bg-white p-3 sm:p-4 md:p-6 rounded-lg max-w-5xl mx-auto">
      <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8">
        {/* תוכן טקסט */}
        <div className="flex-1">
          <div className={`flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 md:gap-5 mb-4 sm:mb-5 ${currentLang ? "sm:flex-row-reverse" : ""}`}>
            <div className="flex flex-col justify-start gap-0.5 text-center sm:text-left">
              <h2 className={`font-serif text-lg sm:text-xl lg:text-2xl font-bold ${currentLang ? "sm:text-right" : ""} text-center`}>
                {t('deliveryAreas')}
              </h2>
              <div className={`text-xs sm:text-sm font-sans leading-5 sm:leading-6 ${currentLang ? "sm:text-right" : ""} text-center`}>
                {t('deliveryAreasDescription')}
              </div>
            </div>

            <Image
              width={100}
              height={100}
              alt={t('deliveryNationwide')}
              className="block object-contain shrink-0 sm:w-[120px] sm:h-[120px] md:w-[140px] md:h-[140px]"
              src={
                storeCustomizationSetting?.home?.quick_delivery_img ||
                "/cta/delivery-boy.png"
              }
            />
          </div>

          {/* רשימת הערים */}
          <div>
            {loading ? (
              <div className="space-y-2">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="h-4 sm:h-5 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-6 sm:py-8">
                <p className="text-red-500 text-sm">{t('errorLoadingData')}</p>
              </div>
            ) : sortedCities.length > 0 ? (
              <div className="max-h-60 sm:max-h-72 md:max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 md:gap-x-8 gap-y-1 ${currentLang ? "text-right" : ""}`}>
                  {sortedCities.map((delivery, index) => (
                    <div
                      key={index}
                      className="text-xs sm:text-sm text-gray-700 hover:text-mainColor-dark transition-colors duration-200 flex items-center gap-1.5 sm:gap-2 py-0.5"
                    >
                      <span className="text-mainColor-dark shrink-0">•</span>
                      <span className="truncate">{currentLang ? delivery.city.city_name_he : delivery.city.city_name_en}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <p className="text-gray-500 text-sm">{t('noCitiesFound')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoDeliveriesPopup;