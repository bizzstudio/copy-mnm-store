// src/layout/navbar/NavbarUserButton.jsx
import Link from "next/link";
import Image from "next/image";
import { FiUser, FiUserCheck } from "react-icons/fi";
import { useTranslations } from "next-intl";

const NavbarUserButton = ({ userInfo, imageUrl, onLoginClick }) => {
  const t = useTranslations();

  if (userInfo?.name) {
    return (
      <div className="flex flex-col items-center shrink-0">
        <Link
          className="group cursor-pointer flex items-center gap-2 pl-3 pr-2 py-1 rounded-full bg-white ring-2 ring-offset-2 ring-mainColor hover:ring-mainColor-leaf transition-all outline-none focus:ring-2 focus:ring-mainColor-leaf/30 focus:ring-offset-2"
          aria-label={t("hello") + " " + (userInfo?.name ?? "")}
          href="/user/dashboard"
        >
          {imageUrl || userInfo?.image ? (
            <span className="w-8 h-8 rounded-full overflow-hidden block shrink-0">
              <Image
                width={36}
                height={36}
                src={imageUrl || userInfo?.image}
                alt="user"
                className="w-full h-full object-cover"
              />
            </span>
          ) : (
            <FiUserCheck className="w-5 h-5 drop-shadow-xl shrink-0" />
          )}
          <span className="text-base font-medium whitespace-nowrap text-inherit">
            {t("hello")} {(userInfo?.name ?? "").slice(0, 10).trim()}
          </span>
        </Link>
        <span className="hidden lg:block text-base font-semibold text-heading mt-0.5">
          {t("PersonalArea")}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center shrink-0">
      <button
        className="group cursor-pointer flex items-center justify-center bg-white text-2xl font-bold w-9 h-9 rounded-full leading-none outline-none ring-2 ring-offset-2 ring-mainColor hover:ring-mainColor-leaf transition-all overflow-hidden"
        aria-label="Login"
        onClick={onLoginClick}
      >
        <FiUser className="w-6 h-6 drop-shadow-xl group-hover:scale-110 transition-all duration-200" />
      </button>
      <span className="hidden lg:block text-base font-semibold text-heading mt-0.5">
        {t("PersonalArea")}
      </span>
    </div>
  );
};

export default NavbarUserButton;