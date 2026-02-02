// src/layout/navbar/NavbarUserButton.jsx
import Link from "next/link";
import Image from "next/image";
import { FiUser, FiUserCheck } from "react-icons/fi";
import { useTranslations } from "next-intl";

const NavbarUserButton = ({ userInfo, imageUrl, onLoginClick }) => {
  const t = useTranslations();

  if (userInfo?.name) {
    return (
      <Link
        className="group cursor-pointer flex items-center gap-2 pl-3 pr-2 py-1 rounded-full bg-white ring-2 ring-offset-2 ring-mainColor hover:ring-mainColor-leaf transition-all outline-none focus:ring-2 focus:ring-mainColor-leaf/30 focus:ring-offset-2"
        aria-label={t("hello") + " " + (userInfo?.name ?? "")}
        href="/user/dashboard"
      >
        {imageUrl || userInfo?.image ? (
          <Image
            width={100}
            height={100}
            src={imageUrl || userInfo?.image}
            alt="user"
            className="min-w-full min-h-full object-cover"
          />
        ) : (
          <FiUserCheck className="w-5 h-5 drop-shadow-xl" />
        )}
        <span className="text-base font-medium whitespace-nowrap text-inherit">
          {t("hello")} {(userInfo?.name ?? "").slice(0, 10).trim()}
        </span>
      </Link>
    );
  }

  return (
    <button
      className="group cursor-pointer flex items-center justify-center bg-white text-2xl font-bold w-9 h-9 rounded-full leading-none outline-none ring-2 ring-offset-2 ring-mainColor hover:ring-mainColor-leaf transition-all overflow-hidden"
      aria-label="Login"
      onClick={onLoginClick}
    >
      <FiUser className="w-6 h-6 drop-shadow-xl group-hover:scale-110 transition-all duration-200" />
    </button>
  );
};

export default NavbarUserButton;