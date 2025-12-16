import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation, EffectFade } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

// Internal import

import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";
import Router from "next/router";

const MainCarousel = () => {
  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue, showingUrl, showingImage } =
    useUtilsFunction();

  const sliderData = [
    {
      id: 1,

      title: showingTranslateValue(
        storeCustomizationSetting?.slider?.first_title
      ),
      info: showingTranslateValue(
        storeCustomizationSetting?.slider?.first_description
      ),
      buttonName: showingTranslateValue(
        storeCustomizationSetting?.slider?.first_button
      ),
      url: showingUrl(storeCustomizationSetting?.slider?.first_link),
      image:
        showingImage(storeCustomizationSetting?.slider?.first_img)
    },
    {
      id: 2,
      title: showingTranslateValue(
        storeCustomizationSetting?.slider?.second_title
      ),
      info: showingTranslateValue(
        storeCustomizationSetting?.slider?.second_description
      ),
      buttonName: showingTranslateValue(
        storeCustomizationSetting?.slider?.second_button
      ),
      url: showingUrl(storeCustomizationSetting?.slider?.second_link),
      image:
        showingImage(storeCustomizationSetting?.slider?.second_img)
    },
    {
      id: 3,
      title: showingTranslateValue(
        storeCustomizationSetting?.slider?.third_title
      ),
      info: showingTranslateValue(
        storeCustomizationSetting?.slider?.third_description
      ),
      buttonName: showingTranslateValue(
        storeCustomizationSetting?.slider?.third_button
      ),
      url: showingUrl(storeCustomizationSetting?.slider?.third_link),
      image:
        showingImage(storeCustomizationSetting?.slider?.third_img)
    },
    {
      id: 4,
      title: showingTranslateValue(
        storeCustomizationSetting?.slider?.four_title
      ),
      info: showingTranslateValue(
        storeCustomizationSetting?.slider?.four_description
      ),
      buttonName: showingTranslateValue(
        storeCustomizationSetting?.slider?.four_button
      ),
      url: showingUrl(storeCustomizationSetting?.slider?.four_link),
      image:
        showingImage(storeCustomizationSetting?.slider?.four_img)
    },
    {
      id: 5,
      title: showingTranslateValue(
        storeCustomizationSetting?.slider?.five_title
      ),
      info: showingTranslateValue(
        storeCustomizationSetting?.slider?.five_description
      ),
      buttonName: showingTranslateValue(
        storeCustomizationSetting?.slider?.five_button
      ),
      url: showingUrl(storeCustomizationSetting?.slider?.five_link),
      image:
        showingImage(storeCustomizationSetting?.slider?.five_img)
    },
  ].filter(item => item.image);

  return (
    <>
      <Swiper
        spaceBetween={30}
        centeredSlides={true}
        autoplay={{
          delay: 8000,
          disableOnInteraction: false,
        }}
        speed={1500}
        loop={true}
        effect="fade" // הוספת אפקט fade
        fadeEffect={{ crossFade: true }} // הגדרת אפשרויות לאפקט fade
        pagination={
          (storeCustomizationSetting?.slider?.bottom_dots ||
            storeCustomizationSetting?.slider?.both_slider) && {
            clickable: true,
          }
        }
        navigation={
          (storeCustomizationSetting?.slider?.left_right_arrow ||
            storeCustomizationSetting?.slider?.both_slider) && {
            clickable: true,
          }
        }
        modules={[Autoplay, Pagination, Navigation, EffectFade]} // הוספת EffectFade למודולים
        className="mySwiper"
      >
        {sliderData?.map((item, i) => (
          <SwiperSlide
            className="h-full relative rounded-lg overflow-hidden cursor-pointer"
            key={i + 1}
            onClick={() => Router.push(item.url)}
          >
            <div className="text-sm text-gray-600 hover:text-emerald-dark">
              <Image
                width={950}
                height={400}
                src={item.image}
                alt={item.title}
                className="object-cover w-full h-full"
                priority
              />
            </div>
            {/* <div className="absolute top-0 left-0 z-10 p-r-16 flex-col flex w-full h-full place-items-start justify-center">
              <div className="flex flex-col pl-4 pr-12 sm:pl-10 sm:pr-16 w-10/12 lg:w-8/12 xl:w-7/12">
                <h1 className="mb-2 font-serif text-xl sm:text-lg md:text-2xl line-clamp-1 md:line-clamp-none  lg:line-clamp-none  lg:text-3xl font-bold text-gray-800">
                  {item.title}
                </h1>
                <p className="text-base leading-6 text-gray-600 font-sans line-clamp-1 md:line-clamp-none lg:line-clamp-none">
                  {item.info}
                </p>
                <Link
                  href={item.url}
                  className="hidden w-fit sm:inline-block lg:inline-block mt-6 items-center gap-2 font-semibold cursor-pointer transition-all bg-mainColor text-white px-6 py-1.5 h-10 rounded-lg border-mainColor-dark border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]"
                >
                  {item.buttonName}
                </Link>
              </div>
            </div> */}
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
};

export default MainCarousel;
