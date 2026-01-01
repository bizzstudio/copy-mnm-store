// src/component/invoice/Invoice.js
import dayjs from "dayjs";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import Cookies from "js-cookie";
import 'dayjs/locale/he'; // ייבוא תאריכים בעברית

// Internal import
import OrderTable from "@component/order/OrderTable";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { useTranslations } from "next-intl";
import useGetSetting from "@hooks/useGetSetting";

const Invoice = ({ data, printRef, globalSetting, currency }) => {
  // console.log('invoice data',data)

  const { getNumberTwo, showingTranslateValue } = useUtilsFunction();
  const t = useTranslations();
  const { storeCustomizationSetting } = useGetSetting();

  let currentLang = Cookies.get('_lang');

  switch (currentLang) {
    case 'he':
      dayjs.locale('he'); // הגדרת השפה לעברית
      break;
    case 'en':
      dayjs.locale('en'); // הגדרת השפה לאנגלית
      break;
    default:
      dayjs.locale('en'); // הגדרת ברירת מחדל לאנגלית
      break;
  }

  const { name } = data?.user_info || {};
  const { city, street, houseNumber, apartmentNumber } = data?.user_info?.address || {};

  return (
    <div ref={printRef}>
      <div className="bg-mainColor-light p-8 rounded-t-xl">
        <div className="flex lg:flex-row md:flex-row flex-col lg:items-center justify-between pb-4 border-b border-mainColor-superLight">
          <div>
            <h1 className="font-bold font-serif text-2xl uppercase">{t('order')}</h1>
            <h6 className="text-gray-700">
              <b>{t('status')}: </b>
              {(() => {
                switch (data?.status?.name) {
                  case "delivered":
                  case "POS-Completed":
                    return <span className="text-mainColor">{data?.status?.heName}</span>;
                  case "Pending":
                    return <span className="text-gray-400">{data?.status?.heName}</span>;
                  case "Cancel":
                    return <span className="text-red-500">{data?.status?.heName}</span>;
                  case "Processing":
                    return <span className="text-green-600">{data?.status?.heName}</span>;
                  case "Deleted":
                    return <span className="text-red-500">{data?.status?.heName}</span>;
                  default:
                    return <span className="text-red-500">{data?.status?.heName}</span>;
                }
              })()}
            </h6>
            {/* הערות הלקוח להזמנה */}
            {data?.customer_note && (
              <div>
                <h6 className="text-gray-700"><b>{t('notes')}: </b>{data?.customer_note}</h6>
              </div>
            )}
          </div>
          <div className="lg:text-right text-left">
            <h2 className="text-lg font-serif font-semibold mt-4 lg:mt-0 md:mt-0">
              <Link href="/">
                <Image
                  width={190}
                  height={40}
                  // src="/logo/logo-color.svg"
                  src={storeCustomizationSetting?.navbar?.logo}
                  alt="logo"
                  className="-mx-1.5"
                />
              </Link>
            </h2>
            <p className="text-sm text-gray-500">
              {globalSetting?.address ||
                "Cecilia Chapman, 561-4535 Nulla LA, <br /> United States 96522"}
            </p>
          </div>
        </div>
        <div className="flex lg:flex-row md:flex-row flex-col justify-between pt-4">
          <div className="mb-3 md:mb-0 lg:mb-0 flex flex-col">
            <span className="font-bold font-serif text-sm uppercase text-gray-600 block">
              {t('date')}
            </span>
            <span className="text-sm text-gray-500 block">
              {data.createdAt !== undefined && (
                <span>{dayjs(data?.createdAt).format("MMMM D, YYYY")}</span>
              )}
            </span>
          </div>
          <div className="mb-3 md:mb-0 lg:mb-0 flex flex-col">
            <span className="font-bold font-serif text-sm uppercase text-gray-600 block">
              {t('orderNo')}
            </span>
            <span className="text-sm text-gray-500 block">
              #{data?.invoice}
            </span>
          </div>
          <div className="flex flex-col lg:text-right text-left">
            <span className="font-bold font-serif text-sm uppercase text-gray-600 block">
              {t('orderTo')}
            </span>
            <span className="text-sm text-gray-500 block min-w-[175px]">
              {name}<br />
              {city?.city_name_he}, {street}, {houseNumber}{apartmentNumber ? "/" + apartmentNumber : ''}<br />
              {data?.user_info?.email}<br />
              <span className="ml-2">{data?.user_info?.contact}</span>
            </span>
          </div>
        </div>
      </div>
      <div className="s">
        <div className="overflow-hidden lg:overflow-visible px-8 my-10">
          <div className="-my-2 overflow-x-auto">
            <table className="table-auto min-w-full border border-gray-100 divide-y divide-gray-200">
              <thead className="bg-mainColor-superLight">
                <tr className="text-xs bg-gray-100">
                  <th
                    scope="col"
                    className="font-serif font-semibold px-6 py-2 text-gray-700 uppercase tracking-wider text-center"
                  >
                    {t('sr')}
                  </th>
                  <th
                    scope="col"
                    className="font-serif font-semibold px-6 py-2 text-gray-700 uppercase tracking-wider text-center"
                  >
                    {t('productName')}
                  </th>
                  <th
                    scope="col"
                    className="font-serif font-semibold px-6 py-2 text-gray-700 uppercase tracking-wider text-center"
                  >
                    {t('quantity')}
                  </th>
                  <th
                    scope="col"
                    className="font-serif font-semibold px-6 py-2 text-gray-700 uppercase tracking-wider text-center"
                  >
                    {t('itemPrice')}
                  </th>

                  <th
                    scope="col"
                    className="font-serif font-semibold px-6 py-2 text-gray-700 uppercase tracking-wider text-right"
                  >
                    {t('amount')}
                  </th>
                </tr>
              </thead>
              <OrderTable data={data} currency={currency} />
            </table>
          </div>
        </div>
      </div>

      <div className="border-t border-b border-gray-100 p-10 bg-mainColor-superLight">
        <div className="flex lg:flex-row md:flex-row flex-col justify-between pt-4">
          <div className="mb-3 md:mb-0 lg:mb-0  flex flex-col sm:flex-wrap">
            <span className="mb-1 font-bold font-serif text-sm uppercase text-gray-600 block">
              {t('paymentMethod')}
            </span>
            <span className="text-sm text-gray-500 font-semibold font-serif block">
              {t(data?.paymentMethod)}
            </span>
          </div>
          <div className="mb-3 md:mb-0 lg:mb-0  flex flex-col sm:flex-wrap">
            <span className="mb-1 font-bold font-serif text-sm uppercase text-gray-600 block">
              {t('shippingCost')}

            </span>
            <span className="text-sm text-gray-500 font-semibold font-serif block">
              {currency}
              {getNumberTwo(data.shippingCost)}
            </span>
          </div>
          <div className="mb-3 md:mb-0 lg:mb-0  flex flex-col sm:flex-wrap">
            <span className="mb-1 font-bold font-serif text-sm uppercase text-gray-600 block">
              {showingTranslateValue(
                storeCustomizationSetting?.checkout?.discount
              )}
            </span>
            <span className="text-sm text-gray-500 font-semibold font-serif block">
              {currency}
              {getNumberTwo(data.discount)}
            </span>
          </div>
          {data.offerDiscount && data.offerDiscount > 0 && (
            <div className="mb-3 md:mb-0 lg:mb-0  flex flex-col sm:flex-wrap">
              <span className="mb-1 font-bold font-serif text-sm uppercase text-gray-600 block">
                {t('thresholdDiscount')}
              </span>
              <span className="text-sm text-gray-500 font-semibold font-serif block">
                {currency}
                {getNumberTwo(data.offerDiscount)}
              </span>
            </div>
          )}
          <div className="flex flex-col sm:flex-wrap">
            <span className="mb-1 font-bold font-serif text-sm uppercase text-gray-600 block">
              {t('totalAmount')}
            </span>
            <span className="text-2xl font-serif font-bold text-red-500 block">
              {currency}
              {getNumberTwo(data.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
