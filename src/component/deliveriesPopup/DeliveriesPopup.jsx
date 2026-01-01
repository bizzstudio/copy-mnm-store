import React from "react";
import Image from "next/image";
import Link from "next/link";

// Internal import
import useGetSetting from "@hooks/useGetSetting";
import CMSkeleton from "@component/preloader/CMSkeleton";
import useUtilsFunction from "@hooks/useUtilsFunction";
import Cookies from "js-cookie";
import MainBT from "@component/button/MainBT";

const DeliveriesPopup = ({ closeCategoryDrawer = () => { } }) => {
  const { storeCustomizationSetting, error, loading } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();

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

  return (
    <div className="w-full h-min bg-white p-6 rounded-lg">
      <div className="flex justify-center items-center">
        <div
          className="flex flex-col justify-start mt-5 gap-3"
        >
          <span className="text-base lg:text-lg">
            <CMSkeleton
              count={1}
              height={20}
              error={error}
              loading={loading}
              data={storeCustomizationSetting?.home?.quick_delivery_subtitle}
              html={true}
            />
          </span>
          <h2 className={currentLang ? "font-serif text-xl lg:text-2xl font-bold mb-1 text-right" : "font-serif text-xl lg:text-2xl font-bold mb-1"}>
            <CMSkeleton
              count={1}
              height={30}
              error={error}
              loading={loading}
              data={storeCustomizationSetting?.home?.quick_delivery_title}
              html={true}
            />
          </h2>
          <div className={currentLang ? "text-sm font-sans leading-6 text-right" : "text-sm font-sans leading-6"}>
            <CMSkeleton
              count={4}
              height={20}
              error={error}
              loading={loading}
              data={
                storeCustomizationSetting?.home?.quick_delivery_description
              }
              html={true}
            />
          </div>
          <Link
            onClick={closeCategoryDrawer}
            href={`${storeCustomizationSetting?.home?.quick_delivery_link}`}
          >
            <MainBT>
              {showingTranslateValue(
                storeCustomizationSetting?.home?.quick_delivery_button
              )}
            </MainBT>
          </Link>
        </div>
        <div className="w-1/5 min-w-fit grow hidden lg:flex md:flex flex-col md:justify-items-center lg:justify-end">
          <Image
            width={300}
            height={300}
            alt="Quick Delivery to Your Home"
            className="block object-contain"
            src={
              storeCustomizationSetting?.home?.quick_delivery_img ||
              "/cta/delivery-boy.png"
            }
          />
          <Link
            onClick={closeCategoryDrawer}
            href={`${storeCustomizationSetting?.home?.quick_delivery_link}`}
          >
            <MainBT>
              {showingTranslateValue(
                storeCustomizationSetting?.home?.quick_delivery_button
              )}
            </MainBT>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DeliveriesPopup;
