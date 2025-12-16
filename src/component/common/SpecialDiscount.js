import useUtilsFunction from "@hooks/useUtilsFunction";
import useTranslation from "next-translate/useTranslation";

const SpecialDiscount = ({ title = '', slug, modal }) => {
  const { t } = useTranslation();

  return (
    <span className={
      modal
        ? "w-full flex items-center justify-center text-center text-dark text-sm bg-customRed-superLight text-customRed py-2 px-2 m-2 rounded font-medium"
        : slug
          ? "text-dark text-sm bg-customRed-superLight text-customRed py-1 px-2 rounded font-medium z-10 left-0 top-4"
          : "w-full flex items-center justify-center text-center text-dark text-xs bg-customRed-superLight text-customRed py-2 px-2 m-2 rounded font-medium"
    }  >
      {title}
    </span>
  );
};

export default SpecialDiscount;
