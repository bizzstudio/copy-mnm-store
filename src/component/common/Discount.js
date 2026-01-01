// src/component/common/Discount.js
import { AiOutlineGift } from "react-icons/ai";

const Discount = ({
  slug,
  modal,
  title = '',
  search,
  card,
}) => {
  return (
    <div
      className={
        modal
          ? 'mb-3'
          : slug
            ? ''
            : search
              ? ''
              : card
                ? 'mb-[19px]'
                : ''
      }
    >
      {title && (
        <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs sm:text-sm font-medium text-black bg-mainColor rounded-lg shadow-sm ${modal
          ? 'absolute end-3 top-3 ms-3 outline-8 outline-white'
          : slug
            ? 'outline-8 outline-white'
            : search
              ? 'mt-1'
              : card
                ? 'absolute start-2 sm:start-3 top-2 sm:top-3 me-2 sm:me-3 z-10 outline-5 sm:outline-7 outline-white'
                : ''
          }`}>
          <AiOutlineGift className="w-[14px] sm:w-[18px] min-w-[14px] sm:min-w-[18px] h-[14px] sm:h-[18px] min-h-[14px] sm:min-h-[18px]" />
          {title}
        </span>
      )}
    </div>
  );
};

export default Discount;
