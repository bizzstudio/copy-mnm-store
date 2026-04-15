// OfferCard.js
import React, { useContext, useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

// Internal import
import Coupon from "@component/coupon/Coupon";
import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";
import Discount from "@component/common/Discount";
import ScrollOfferCard from "@component/product/ScrollOfferCard";
import getOfferNames from "./getOfferNames";
import { SidebarContext } from "@context/SidebarContext";
import MinimalTitle from "@component/common/MinimalTitle";

const OfferCard = ({ discountProducts, height }) => {
  const { storeCustomizationSetting } = useGetSetting();
  const { offers } = useContext(SidebarContext);
  const headerRef = useRef(null);
  const [headerPx, setHeaderPx] = useState(0);
  const t = useTranslations();

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const measure = () => setHeaderPx(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const carouselH = Number(height) || 0;
  const innerHeight = Math.max(0, carouselH - headerPx);
  const scrollContainerStyle =
    innerHeight > 0
      ? { height: innerHeight }
      : { minHeight: "clamp(240px, 42vh, 520px)" };

  const isProductWithDiscount = (product) => {
    const offerName = getOfferNames(offers, product);
    if (offerName) {
      return <Discount slug product={product} title={offerName} />
    } else {
      return <></>
    }
  }

  const scrollContentRef = useRef(null);

  const handleMouseEnter = () => {
    if (scrollContentRef.current) {
      scrollContentRef.current.classList.add('paused');
    }
  };

  const handleMouseLeave = () => {
    if (scrollContentRef.current) {
      scrollContentRef.current.classList.remove('paused');
    }
  };

  return (
    <div className="w-full min-w-0 min-h-0 group">
      <div className="transition duration-150 ease-linear transform border-mainColor">
        <div className="text-gray-900 pb-2 border-b rounded-t flex items-center justify-center" ref={headerRef}>
          <div className="w-full bg-white rounded-xl p-3 border-s-4 border-b-4 border-mainColor">
            <MinimalTitle title={t('lastOffers')} />
          </div>
        </div>
        <div className="scroll-container" style={scrollContainerStyle}>
          <div className="scroll-content"
            ref={scrollContentRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {discountProducts?.map((product, index) => (
              <div key={product._id + index} className="group w-full h-auto flex gap-4 justify-start products-center bg-white py-3 px-6 border-b transition-all border-gray-100 relative last:border-b-0 cursor-pointer">
                <ScrollOfferCard product={product} offers={offers} key={product._id} />
              </div>
            ))}
            {discountProducts?.map((product, index) => (
              <div key={`${product._id}-clone-${index}`} className="group w-full h-auto flex gap-4 justify-start products-center bg-white py-3 px-6 border-b transition-all border-gray-100 relative last:border-b-0 cursor-pointer">
                <ScrollOfferCard product={product} offers={offers} key={product._id} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferCard;