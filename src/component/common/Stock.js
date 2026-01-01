import { useTranslations } from "next-intl";

const Stock = ({ stock, card , top = 0, right = 0}) => {
  const t = useTranslations();

  return (
    // <>
    //   {stock <= 0 ? (
    //     <span className={`bg-red-100 absolute top-${top} right-${right} z-10 text-red-700 rounded-full inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium font-serif`}>
    //       {t('stockOut')}
    //     </span>
    //   ) : (
    //     <>
    //       <span
    //         className={`${
    //           card
    //             ? `bg-gray-100 absolute top-${top} right-${right} z-10 text-green-500 rounded-full text-xs px-2 py-0.5 font-medium`
    //             : `bg-green-100 text-green-500 rounded-full inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold font-serif`
    //         }`}
    //       >
    //         {t('stock')}
    //         {/* : */}
    //         {/* <span className="text-mainColor-dark pl-1 font-bold">&nbsp;{stock}</span> */}
    //       </span>
    //     </>
    //   )}
    // </>
    <></>
  );
};

export default Stock;
