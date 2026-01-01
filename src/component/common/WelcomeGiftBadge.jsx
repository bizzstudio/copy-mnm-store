// src/component/common/WelcomeGiftBadge.jsx
import { FiGift } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { useContext } from "react";
import { UserContext } from "@context/UserContext";

const WelcomeGiftBadge = ({ onClick, className = "" }) => {
  const t = useTranslations();
  const { state: { userInfo } } = useContext(UserContext);

  // הצגת הבאדג' רק אם יש מתנה שעדיין לא שומשה
  if (!userInfo?.welcomeGift || userInfo?.welcomeGift?.isUsed) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 bg-gradient-to-r from-mainColor to-mainColor-dark text-white px-3 py-2 sm:px-4 sm:py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse hover:animate-none text-xs sm:text-sm ${className}`}
      aria-label={t('welcomeGiftAvailable')}
    >
      <FiGift size={18} className="shrink-0 sm:hidden" />
      <span className="font-medium hidden sm:inline">
        {t('giftAvailable')}
      </span>
      <div className="w-2 h-2 bg-white rounded-full animate-ping absolute top-1 right-1 hidden sm:block"></div>
    </button>
  );
};

export default WelcomeGiftBadge;

