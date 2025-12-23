// src/component/common/ImageWithFallBack.js
import { useState, useRef } from "react";
import Image from "next/image";
import useTranslation from "next-translate/useTranslation";

const ImageWithFallback = ({
  fallback = "https://nmplus.co.il/wp-content/uploads/2025/03/%D7%A9%D7%95%D7%9E%D7%A8-%D7%9E%D7%A7%D7%95%D7%9D-1.png",
  alt,
  src,
  outOfStock,
  noPadding = false,
  modal,
  slug,
  card,
  scroll,
  search,
  enableZoom = false,
  ...props
}) => {
  const { t } = useTranslation();
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!enableZoom || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => {
    if (enableZoom) {
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    if (enableZoom) {
      setIsHovering(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${enableZoom ? "overflow-hidden" : ""}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {outOfStock && (
        <div className="absolute z-10 w-full h-full flex items-center justify-center">
          <div className={`bg-white bg-opacity-80 -rotate-6 text-customRed border-2 border-customRed rounded-md inline-flex items-center justify-center font-bold font-serif ${
            modal 
              ? "px-3 py-2 text-4xl"
              : slug
                ? "px-3 py-2 text-4xl"
                : card
                  ? "px-2 py-1 text-2xl"
                  : scroll
                    ? "px-1 py-1"
                    : search
                      ? "px-1 py-1 text-xs whitespace-nowrap"
                      : "px-2 py-1 text-2xl me-2 mb-2"
          }`}>
            {t("common:stockOut")}
          </div>
        </div>
      )}
      <Image
        alt={alt}
        src={src || fallback}
        {...props}
        fill
        style={{
          objectFit: "contain",
          transformOrigin: enableZoom ? `${mousePosition.x}% ${mousePosition.y}%` : "center",
          transform: enableZoom && isHovering ? "scale(2)" : "scale(1)",
          transition: enableZoom ? "transform 0.1s ease-out" : "transform duration-300 ease-in-out",
        }}
        sizes="100%"
        className={`object-contain ${
          enableZoom ? "cursor-zoom-in" : "group-hover:scale-105"
        } ${card ? "" : noPadding ? "p-1" : "p-4"}`}
      />
    </div>
  );
};

export default ImageWithFallback;
