import useUtilsFunction from "@hooks/useUtilsFunction";
import Cookies from "js-cookie";
import React from "react";

const OrderTable = ({ data, currency }) => {
  const { getNumberTwo } = useUtilsFunction();

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

  return (
    <tbody className="bg-white divide-y divide-gray-100 text-serif text-sm">
      {data?.cart?.map((item, i) => (
        <tr key={i}>
          <th className="px-6 py-1 whitespace-nowrap font-normal text-gray-500 text-center">
            {i + 1}{" "}
          </th>
          <td className="px-6 py-1 whitespace-nowrap font-normal text-gray-500 text-center">
            {currentLang ? item.title?.he : item.title?.en}
          </td>
          <td className="px-6 py-1 whitespace-nowrap font-bold text-center">
            {item.quantity}{" "}
          </td>
          <td className="px-6 py-1 whitespace-nowrap font-bold text-center font-DejaVu">
            {currency}
            {getNumberTwo(item.discountedPrice ? item.discountedPrice / item.quantity : item.itemTotal / item.quantity)}
          </td>

          <td className="px-6 py-1 whitespace-nowrap text-right font-bold font-DejaVu k-grid text-red-500">
            {currency}
            {getNumberTwo(item.discountedPrice ? item.discountedPrice : item.itemTotal)}         
          </td>
        </tr>
      ))}
    </tbody>
  );
};

export default OrderTable;
