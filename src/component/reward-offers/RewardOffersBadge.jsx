// src/component/reward-offers/RewardOffersBadge.jsx
import { FiGift } from "react-icons/fi";
import useTranslation from "next-translate/useTranslation";

const RewardOffersBadge = ({ onClick, count = 0, className = "" }) => {
    const { t } = useTranslation();

    // הצגת הבאדג' רק אם יש לפחות מבצע מתנה אחד זמין
    if (count === 0) {
        return null;
    }

    return (
        <button
            onClick={onClick}
            className={`relative flex items-center gap-2 bg-gradient-to-r from-mainColor to-mainColor-dark text-white px-3 py-2 sm:px-4 sm:py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse hover:animate-none text-xs sm:text-sm ${className}`}
      aria-label={t("common:rewardOffersAvailable")}
    >
      <FiGift size={18} className="shrink-0 sm:hidden" />
      <span className="font-medium hidden sm:inline">
        {count > 1 
          ? `${count} ${t("common:giftsAvailable")}`
          : t("common:giftAvailable")}
      </span>
            {count > 1 && (
                <span className="bg-white text-mainColor rounded-full px-2 py-0.5 text-xs font-bold ml-1">
                    {count}
                </span>
            )}
            <div className="w-2 h-2 bg-white rounded-full animate-ping absolute top-1 right-1 hidden sm:block"></div>
        </button>
    );
};

export default RewardOffersBadge;