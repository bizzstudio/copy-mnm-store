import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import useTranslation from "next-translate/useTranslation";
import Cookies from "js-cookie";
import 'dayjs/locale/he'; // ייבוא תאריכים בעברית

const OrderHistory = ({ order, currency }) => {

  const { t } = useTranslation();
  const [status, setStatus] = useState(null);
  const [dateFormat, setDateFormat] = useState("D/MM/YYYY"); // פורמט ברירת מחדל

  useEffect(() => {
    const fetchStatus = async () => {
      if (order?.status?.name === "Delivered")
        setStatus(<span className="text-blackmax-md:w-min max-md:flex max-md:mx-auto">{order?.status?.heName}</span>);
      else if (order?.status?.name === "Pending")
        setStatus(<span className="text-gray-400 max-md:w-min max-md:flex max-md:mx-auto">{order?.status?.heName}</span>);
      else if (order?.status?.name === "Cancel")
        setStatus(<span className="text-red-500 max-md:w-min max-md:flex max-md:mx-auto">{order?.status?.heName}</span>);
      else if (order?.status?.name === "Processing")
        setStatus(<span className="text-green-600 max-md:w-min max-md:flex max-md:mx-auto">{order?.status?.heName}</span>);
      else {
        const phone = order?.status?.phone;
        setStatus(<span className="text-blue-700">{order?.status?.heName}{phone ? ' - ' + phone : ''}</span>);
      }
    };

    fetchStatus();
  }, [order.status]);
  // console.log("order: ", order);

  let currentLang = Cookies.get('_lang');

  switch (currentLang) {
    case 'he':
      dayjs.locale('he'); // הגדרת השפה לעברית
      break;
    case 'en':
      dayjs.locale('en'); // הגדרת השפה לאנגלית
      break;
    default:
      dayjs.locale('he'); // הגדרת ברירת מחדל לעברית
      break;
  }

  // שינוי פורמט הזמן בהתאם לגודל המסך
  useEffect(() => {
    const updateDateFormat = () => {
      if (window.innerWidth <= 768) {
        setDateFormat("D/MM/YY"); // פורמט לשנה בשתי ספרות למסכים קטנים
      } else {
        setDateFormat("D/MM/YYYY"); // פורמט רגיל למסכים גדולים
      }
    };

    updateDateFormat(); // קריאה ראשונית בעת הטעינה
    window.addEventListener("resize", updateDateFormat); // האזנה לשינוי גודל מסך

    return () => {
      window.removeEventListener("resize", updateDateFormat);
    };
  }, []);

  return (
    <>
      <td className="px-1 md:px-5 py-3 leading-6 whitespace-nowrap justify-center md:flex hidden">
        <span className="uppercase text-sm font-medium">
          {order?.invoice}
        </span>
      </td>
      <td className="px-1 md:px-5 py-3 leading-6 text-center whitespace-nowrap">
        <span className="text-sm">
          {dayjs(order.createdAt).format(dateFormat)}
        </span>
      </td>

      <td className="px-1 md:px-5 py-3 leading-6 text-center whitespace-nowrap md:block hidden">
        <span className="text-sm">{t(`common:${order.paymentMethod}`)}</span>
      </td>
      <td className="px-1 md:px-5 py-3 leading-6 text-center md:whitespace-nowrap font-medium text-sm max-md:w-min">
        {status}
      </td>
      <td className="px-1 md:px-5 py-3 leading-6 text-center whitespace-nowrap">
        <span className="text-sm font-bold">
          {currency}
          {parseFloat(order?.total).toFixed(2)} ₪
        </span>
      </td>
    </>
  );
};

export default OrderHistory;
