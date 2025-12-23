// PickupMsgModal.jsx
import MainBT from '@component/button/MainBT';
import dayjs from 'dayjs';
import 'dayjs/locale/he';
import useTranslation from "next-translate/useTranslation";
import MinimalTitle from "@component/common/MinimalTitle";

// הגדרת השפה לעברית
dayjs.locale('he');

const PickupMsgModal = ({ closeModal = () => { } }) => {
  const { t } = useTranslation();
  const now = dayjs();
  const currentHour = now.hour();
  // systemDay: ראשון=1, שני=2, ... שישי=6, שבת=7
  const systemDay = now.day() + 1;

  let finalMessage = '';
  let pickupDate;
  let pickupWindow = '';

  // לוגיקה לאיסוף עצמי
  if (systemDay !== 6) { // אם היום אינו שישי
    if (currentHour < 14) { // אם ההזמנה לפני 14
      pickupDate = now;
      const formattedToday = pickupDate.format('DD/MM');
      const tomorrow = now.add(1, 'day').format('DD/MM');

      if (systemDay === 5) {
        // חמישי לפני 14 - עומס חריג = מחר עד 14
        finalMessage = `נשתדל ללקט את ההזמנה שלך היום (${formattedToday}) עד השעה 16, ובמקרי עומס חריגים – עד מחר (${tomorrow}) עד השעה 14.`;
      } else {
        // א'-ד' לפני 14 - עומס חריג = מחר עד 16
        finalMessage = `נשתדל ללקט את ההזמנה שלך היום (${formattedToday}) עד השעה 16, ובמקרי עומס חריגים – עד מחר (${tomorrow}) עד השעה 16.`;
      }
    } else { // אחרי 14: האיסוף מועבר למחר
      pickupDate = now.add(1, 'day');
      pickupWindow = systemDay === 5 ? 'עד 14' : 'עד 16';
      finalMessage = `נלקט את ההזמנה שלך מחר (${pickupDate.format('DD/MM')}) ${pickupWindow}.`;
    }
  } else { // יום שישי (systemDay === 6)
    if (currentHour < 10) { // עד 10 – איסוף היום עד 14
      pickupDate = now;
      pickupWindow = 'עד 14';
      finalMessage = `נלקט את ההזמנה שלך היום (${pickupDate.format('DD/MM')}) ${pickupWindow}.`;
    } else if (currentHour >= 10 && currentHour < 14) { // בין 10 ל-14
      // בין 10 ל-14 – ננסה לאסוף היום, אך ככל הנראה האיסוף יהיה ביום ראשון (שמערכתנו: systemDay=1)
      pickupDate = now.add(2, 'day');
      pickupWindow = 'עד 16';
      finalMessage = `נעשה מאמץ שההזמנה תהיה מוכנה היום עד 14, אך ככל הנראה היא תהיה מוכנה ביום ראשון (${pickupDate.format('DD/MM')}) ${pickupWindow}.`;
    } else { // אחרי 14
      // אחרי 14 – האיסוף בהכרח יהיה ביום ראשון
      pickupDate = now.add(2, 'day');
      pickupWindow = 'עד 16';
      finalMessage = `ההזמנה שלך תהיה מוכנה ביום ראשון (${pickupDate.format('DD/MM')}) ${pickupWindow}.`;
    }
  };

  return (
    <div className="sm:w-52 w-full">
      <div className="flex justify-between items-center mt-5 mb-4 bg-white shadow-md rounded-xl p-3 border-s-4 border-b-4 border-mainColor">
        <MinimalTitle title={t("common:pleaseNotePopupTitle")} />
      </div>
      <div className="flex flex-col justify-center gap-3">
        <p className="text-center text-lg">
          {finalMessage}
        </p>
        <MainBT onClick={closeModal}>
          {t("common:ok")}
        </MainBT>
      </div>
    </div>
  );
};

export default PickupMsgModal;