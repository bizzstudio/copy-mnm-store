// DeliveryMsgModal.jsx
import React from "react";
import { useTranslations } from "next-intl";
import { getNextDeliveryMessage } from "@utils/getNextDeliveryMessage";
import MinimalTitle from "@component/common/MinimalTitle";
import MainBT from "@component/button/MainBT";

const DeliveryMsgModal = ({
  closeModal = () => { },
  cityName = "",               // שם העיר/האזור לצורך הטקסט
  shippingDays = [],           // מערך הימים המותרים למשלוח: [1,2,3,4,5,6] וכדומה
}) => {
  const t = useTranslations();

  const finalMessage = getNextDeliveryMessage(cityName, shippingDays);

  return (
    <div className="sm:w-52 w-full">
      <div className="flex justify-between items-center mt-5 mb-4 bg-white shadow-md rounded-xl p-3 border-s-4 border-b-4 border-mainColor">
        <MinimalTitle title={t('pleaseNotePopupTitle')} />
      </div>
      <div className="flex flex-col justify-center gap-3">
        <p className="text-center text-lg">
          {finalMessage}
        </p>
        <MainBT onClick={closeModal}>
          {t('ok')}
        </MainBT>
      </div>
    </div>
  );
};

export default DeliveryMsgModal;