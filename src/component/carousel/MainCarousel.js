import React, { useRef, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";
import Router from "next/router";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

const MainCarousel = () => {
  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue, showingUrl, showingImage } =
    useUtilsFunction();
  const swiperRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const showArrows =
    storeCustomizationSetting?.slider?.left_right_arrow ||
    storeCustomizationSetting?.slider?.both_slider;

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
    <div className="w-full flex items-stretch gap-2">
      {/* חץ שמאלה – מחוץ לבאנר, לא על התמונה */}
      {showArrows && (
        <button
          type="button"
          onClick={() => swiperRef.current?.slidePrev()}
          onKeyDown={(e) => e.key === "Enter" && swiperRef.current?.slidePrev()}
          aria-label="שקף קודם"
          className={`shrink-0 w-10 h-10 sm:w-12 sm:h-12 self-center flex items-center justify-center rounded-full bg-white/90 hover:bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all z-10 ${isBeginning ? "opacity-40 pointer-events-none" : ""}`}
        >
          <FaChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
        </button>
      )}

      <Swiper
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          setIsBeginning(swiper.isBeginning);
          setIsEnd(swiper.isEnd);
        }}
        onSlideChange={(swiper) => {
          setIsBeginning(swiper.isBeginning);
          setIsEnd(swiper.isEnd);
        }}
        spaceBetween={30}
        centeredSlides={true}
        autoplay={{
          delay: 8000,
          disableOnInteraction: false,
        }}
        speed={1500}
        loop={true}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        pagination={
          (storeCustomizationSetting?.slider?.bottom_dots ||
            storeCustomizationSetting?.slider?.both_slider) && {
            clickable: true,
          }
        }
        modules={[Autoplay, Pagination, EffectFade]}
        className="mySwiper flex-1 min-w-0"
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
          </SwiperSlide>
        ))}
      </Swiper>

      {/* חץ ימינה – מחוץ לבאנר, לא על התמונה */}
      {showArrows && (
        <button
          type="button"
          onClick={() => swiperRef.current?.slideNext()}
          onKeyDown={(e) => e.key === "Enter" && swiperRef.current?.slideNext()}
          aria-label="שקף הבא"
          className={`shrink-0 w-10 h-10 sm:w-12 sm:h-12 self-center flex items-center justify-center rounded-full bg-white/90 hover:bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all z-10 ${isEnd ? "opacity-40 pointer-events-none" : ""}`}
        >
          <FaChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
        </button>
      )}
    </div>
  );
};

export default MainCarousel;
