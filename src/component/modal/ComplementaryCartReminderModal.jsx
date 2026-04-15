import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { useTranslations } from "next-intl";
import MainBT from "@component/button/MainBT";

/**
 * הודעה אחרי הוספת "מוצר משלים" מהמקטע מוצרים קשורים (לא alert).
 */
export default function ComplementaryCartReminderModal({ open, onClose }) {
  const t = useTranslations();

  return (
    <Dialog open={open} onClose={onClose} className="relative z-[60]" dir="rtl">
      <DialogBackdrop className="fixed inset-0 bg-black/40 transition-opacity" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
          <h3 className="mb-3 text-center font-serif text-lg font-semibold text-mainColor-dark">
            {t("complementaryReminderTitle")}
          </h3>
          <p className="mb-6 text-center text-sm leading-relaxed text-gray-700">
            {t("complementaryReminderBody")}
          </p>
          <MainBT type="button" onClick={onClose} className="w-full">
            {t("complementaryReminderOk")}
          </MainBT>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
