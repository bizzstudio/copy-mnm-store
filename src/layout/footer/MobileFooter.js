// sr/layou/foote/MobileFooter.js
import React, { useContext, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

import { TbCategoryPlus, TbDiscount, TbHomeDot } from "react-icons/tb";
import { MdOutlineSettingsBackupRestore } from "react-icons/md";
import { FaList } from "react-icons/fa6";
import { RiHome6Line, RiShoppingCartLine, RiUserAddLine } from "react-icons/ri";
import { HiOutlineUser } from "react-icons/hi";
import useTranslation from "next-translate/useTranslation";

import { UserContext } from "@context/UserContext";
import LoginModal from "@component/modal/LoginModal";
import { SidebarContext } from "@context/SidebarContext";
import CategoryDrawer from "@component/drawer/CategoryDrawer";
import useCart from "@hooks/useCart";
import { BsFire } from "react-icons/bs";
import { FiRefreshCcw } from "react-icons/fi";
import useUtilsFunction from "@hooks/useUtilsFunction";

const MobileFooter = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const { toggleCartDrawer, toggleCategoryDrawer, categories } = useContext(SidebarContext);
  const { totalItems } = useCart();
  const { getCategorySlug, showingTranslateValue, findCategoryByIdentifier } = useUtilsFunction();

  const {
    state: { userInfo },
  } = useContext(UserContext);

  const { t } = useTranslation();

  // Fallbacks לטקסטים אם אין מפתח i18n קיים
  const lblAllProducts = t("common:allProducts");
  const lblDeals = t("common:deals");
  const lblCart = t("common:cart");
  const lblLogin = t("common:login");
  const lblRestore = t("common:restoreOrderBTN");
  const lblHome = t("common:homeBTN");

  // מציאת קטגוריית המבצעים
  const offersCategory = categories?.[0]?.children 
    ? findCategoryByIdentifier(categories[0].children, "מבצעים")
    : null;
  const offersCategorySlug = offersCategory ? getCategorySlug(offersCategory) : "מבצעים";

  return (
    <>
      <LoginModal modalOpen={modalOpen} setModalOpen={setModalOpen} />
      <div className="flex flex-col h-full justify-between align-middle bg-white rounded cursor-pointer overflow-y-scroll flex-grow scrollbar-hide w-full">
        <CategoryDrawer className="w-6 h-6 drop-shadow-xl" />
      </div>

      <footer
        className="lg:hidden fixed z-30 bottom-0 w-full rounded-t-3xl"
        style={{
          boxShadow:
            "0 -10px 15px -3px rgb(0 0 0 / 0.1), 0 -4px 6px -4px rgb(0 0 0 / 0.1)",
        }}
      >
        {/* בר עליון מעוגל עם קו עליון בצבע המותג */}
        <div className="relative bg-mainColor-superLight text-[#2a2100] w-full px-4 sm:px-8 pt-3 pb-2 border-t-0 border-[#2a2100] rounded-t-3xl">
          {/* גריד של 5 – העגלה באמצע ומוגבהת */}
          <div className="grid grid-cols-5 items-end gap-1 text-center">
            {/* 1. כל המוצרים – אותה פונקציונליות של כפתור הקטגוריות */}
            <button
              aria-label={lblAllProducts}
              onClick={toggleCategoryDrawer}
              className="grid grid-cols-1 gap-0.5 items-center justify-center h-full focus:outline-none"
            >
              <div className="w-[6vw] h-[6vw] min-w-[24px] min-h-[24px] max-w-[32px] max-h-[32px] flex items-center justify-center mx-auto">
                <TbCategoryPlus className="w-full h-full drop-shadow" />
              </div>
              <span className="text-[10px] leading-tight">{lblAllProducts}</span>
            </button>

            {/* 2. מבצעים – לינק */}
            <Link
              href={`/product-category/${offersCategorySlug}`}
              aria-label={lblDeals}
              className="grid grid-cols-1 gap-0.5 items-center justify-center h-full text-red-600"
            >
              <div className="w-[6vw] h-[6vw] min-w-[24px] min-h-[24px] max-w-[32px] max-h-[32px] flex items-center justify-center mx-auto">
                <BsFire className="w-full h-full drop-shadow" />
              </div>
              <span className="text-[10px] leading-tight">{lblDeals}</span>
            </Link>

            {/* 3. עגלה – מעוצב כמו בתמונה */}
            <button
              onClick={toggleCartDrawer}
              aria-label={lblCart}
              className="relative grid grid-cols-1 items-center justify-center"
              style={{ marginTop: 'calc(-1 * (15vw + 12px))' }}
            >
              <div
                className="rounded-full bg-mainColor text-[#2a2100] ring-[0px] ring-[#2a2100] shadow-md flex items-center justify-center"
                style={{
                  width: 'clamp(55px, 15vw, 75px)',
                  height: 'clamp(55px, 15vw, 75px)',
                  marginBottom: 'clamp(8px, 2vw, 12px)'
                }}
              >
                <div className="relative flex items-center justify-center mx-auto" style={{ width: 'clamp(32px, 9vw, 44px)', height: 'clamp(32px, 9vw, 44px)' }}>
                  <RiShoppingCartLine className="w-full h-full" />
                  {totalItems > 0 && (
                    <span className="absolute text-[9px] xs:text-[11px] sm:text-[12px] font-bold top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      {totalItems}
                    </span>
                  )}
                </div>
              </div>
              {/* <span className="text-[11px] leading-tight mt-1">{lblCart}</span> */}
            </button>

            {/* 4. כניסה/שחזור הזמנה – תלוי אם המשתמש מחובר */}
            {userInfo ? (
              <Link
                href="/user/my-orders"
                aria-label={lblRestore}
                className="grid grid-cols-1 gap-0.5 items-center justify-center h-full"
              >
                <div className="w-[6vw] h-[6vw] min-w-[24px] min-h-[24px] max-w-[32px] max-h-[32px] flex items-center justify-center mx-auto">
                  <FiRefreshCcw className="w-full h-full drop-shadow" />
                </div>
                <span className="text-[10px] leading-tight">{lblRestore}</span>
              </Link>
            ) : (
              <button
                aria-label={lblLogin}
                onClick={() => setModalOpen(true)}
                className="grid grid-cols-1 gap-0.5 items-center justify-center h-full"
              >
                <div className="w-[6vw] h-[6vw] min-w-[24px] min-h-[24px] max-w-[32px] max-h-[32px] flex items-center justify-center mx-auto">
                  <RiUserAddLine className="w-full h-full drop-shadow" />
                </div>
                <span className="text-[10px] leading-tight">{lblLogin}</span>
              </button>
            )}

            {/* 5. בית */}
            <Link
              href="/"
              aria-label={lblHome}
              className="grid grid-cols-1 gap-0.5 items-center justify-center h-full"
            >
              <div className="w-[6vw] h-[6vw] min-w-[24px] min-h-[24px] max-w-[32px] max-h-[32px] flex items-center justify-center mx-auto">
                <TbHomeDot className="w-full h-full drop-shadow" />
              </div>
              <span className="text-[10px] leading-tight">{lblHome}</span>
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
};

export default dynamic(() => Promise.resolve(MobileFooter), { ssr: false });