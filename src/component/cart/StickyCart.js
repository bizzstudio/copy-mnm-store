import dynamic from "next/dynamic";
import React, { useContext, useState } from "react";
import { IoBagHandleOutline } from "react-icons/io5";

// Internal import
import { SidebarContext } from "@context/SidebarContext";
import useAsync from "@hooks/useAsync";
import SettingServices from "@services/SettingServices";
import { useTranslations } from "next-intl";
import useCart from "@hooks/useCart";
import Calculating from "./Calculating";

const StickyCart = () => {
  const { totalItems, customCartTotal } = useCart();
  const { toggleCartDrawer } = useContext(SidebarContext);
  const { data: globalSetting } = useAsync(SettingServices.getGlobalSetting);
  const t = useTranslations();

  const currency = globalSetting?.default_currency || "₪";

  return (
    <button aria-label="Cart" onClick={toggleCartDrawer} className="absolute">
      <div className="left-0 w-35 float-right fixed top-2/4 bottom-2/4 align-middle cursor-pointer z-30 hidden lg:block xl:block max-w-[140px]">
      <div className="shadow-xl rounded-lg">
        <div className="flex flex-col items-center justify-center bg-white rounded-tr-lg p-2 text-gray-700 border-mainColor-dark border">
          <span className="text-2xl mb-1 text-mainColor-dark">
            <IoBagHandleOutline />
          </span>
          <span className="px-2 text-sm font-serif font-medium">
            {totalItems} {t('items')}
          </span>
        </div>
        <div className="flex flex-row items-center justify-center bg-mainColor-dark p-2 text-white text-base font-serif font-medium rounded-br-lg mx-auto">
        {typeof customCartTotal === 'number' ?
            <>
              {customCartTotal.toFixed(2)}
              <small>{currency}</small>
            </>
            : <Calculating showText={false} />}
        </div>
        </div>
      </div>
    </button>
  );
};

export default dynamic(() => Promise.resolve(StickyCart), { ssr: false });
