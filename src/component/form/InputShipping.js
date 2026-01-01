import DeliveryServices from "@services/DeliveryServices";
import Cookies from "js-cookie";
import { useTranslations } from "next-intl";
import React from "react";
import { FiInfo, FiTruck } from "react-icons/fi";
import dayjs from 'dayjs';
import 'dayjs/locale/he';

const InputShipping = ({
  register,
  value,
  time,
  cost = 0,
  currency,
  handleShippingCost,
  icon = <FiTruck />,
  isDeliverable,
  note = '',
  nextTime = null,
  isDeliveryOpen = true,
}) => {

  const t = useTranslations();

  let currentLang = Cookies.get('_lang');

  switch (currentLang) {
    case 'he':
      currentLang = true;
      break;
    case 'en':
      currentLang = false;
      break;
    default:
      currentLang = false;
      break;
  }

  const formatDate = (dateString) => {
    dayjs.locale('he');
    const date = dayjs(dateString);
    return date.format('dddd, D בMMMM החל משעה HH:mm');
  };

  return (
    <div className={`p-3 card border border-gray-200 ${isDeliverable && isDeliveryOpen ? "bg-white" : "opacity-60"} rounded-md h-full flex items-center`}>
      <label className={`label w-full px-1.5 ${isDeliverable && isDeliveryOpen ? "cursor-pointer" : "cursor-not-allowed"}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-3xl text-gray-400">
              {icon}
            </span>
            <div>
              <h6 className={`flex items-center gap-1 font-serif font-medium text-base ${isDeliverable && isDeliveryOpen ? "text-gray-600" : "text-gray-400"} `}>
                {value == 1 ? t('pickup') : t('shipping')} {note && <span className="text-base text-gray-400" title={note}><FiInfo /></span>}
              </h6>
              {!isDeliveryOpen ?
                <p className={nextTime ? "text-sm text-red-500 -mt-1 pl-3" : "text-sm text-gray-400 -mt-1"}>
                  {t('deliveriesNotAvailable')}
                </p>
                :
                !isDeliverable && <p className={nextTime ? "text-sm text-red-500 -mt-1 pl-3" : "text-sm text-gray-400 -mt-1"}>
                  {nextTime ? `${t('nextAvailable')} ${formatDate(nextTime)}` : t('cannotDeliver')}
                </p>}
            </div>
          </div>
          <input
            onClick={() => {
              handleShippingCost(cost)
            }}
            {...register(`shippingOption`, {
              required: `Shipping Option is required!`,
            })}
            name="shippingOption"
            type="radio"
            disabled={!isDeliveryOpen || !isDeliverable}
            value={value}
            className={`form-radio outline-none focus:ring-0 text-blackbg-transparent cursor-pointer ${!isDeliverable || !isDeliveryOpen ? "cursor-not-allowed" : ""}`}
          />
        </div>
      </label>
    </div>
  );
};

export default InputShipping;
