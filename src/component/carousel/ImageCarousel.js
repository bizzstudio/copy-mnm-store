import dynamic from "next/dynamic";
import Image from "next/image";
import { useRef } from "react";
import { IoChevronBackOutline, IoChevronForward } from "react-icons/io5"; // requires a loader
import { Navigation } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";

const ImageCarousel = ({ images, handleChangeImage }) => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  return (
    <Swiper
      spaceBetween={15}
      navigation={true}
      allowTouchMove={true}
      loop={false}
      loopFillGroupWithBlank={false}
      loopedSlides={images?.length}
      slidesPerView="auto"
      freeMode={true}
      grabCursor={true}
      modules={[Navigation]}
      className="mySwiper image-carousel select-none"
    >
      {images?.map((img, i) => (
        <SwiperSlide key={i + 1} className="group !w-auto flex-shrink-0">
          <button onClick={() => handleChangeImage(img)}>
            <div className="w-[100px] h-[100px] overflow-hidden border inline-flex items-center justify-center px-2 py-1 mt-2">
              <Image
                src={img}
                alt="product"
                width={100}
                height={100}
                style={{
                  objectFit: 'contain',
                  width: '100%',
                  height: '100%'
                }}
              />
            </div>
          </button>
        </SwiperSlide>
      ))}
      <button ref={prevRef} className="prev">
        <IoChevronBackOutline />
      </button>
      <button ref={nextRef} className="next">
        <IoChevronForward />
      </button>
    </Swiper>
  );
};

export default dynamic(() => Promise.resolve(ImageCarousel), { ssr: false });