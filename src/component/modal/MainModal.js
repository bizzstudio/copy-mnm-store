// src/component/modal/MainModal.js
import React from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { IoClose } from "react-icons/io5";

const MainModal = ({ modalOpen, setModalOpen, children, z = null, onClose }) => {
  const handleClose = () => {
    if (onClose) {
      onClose(); // השתמש בפונקציה שהועברה ב-onClose
    } else {
      setModalOpen(false); // התנהגות ברירת מחדל
    }
  };

  return (
    <Dialog
      open={modalOpen}
      onClose={handleClose}
      className="relative z-50"
      dir="rtl"
      style={{ zIndex: z ? z : 50 }}
    >
      <DialogBackdrop className="fixed inset-0 bg-black/30 backdrop-blur-sm" />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            className="w-full max-w-none sm:w-auto sm:max-w-6xl transform overflow-hidden rounded-2xl bg-white align-middle shadow-xl transition-all relative"
          >
            {children}
            <button
              onClick={handleClose}
              type="button"
              className="absolute sm:end-5 sm:top-5 end-2 top-2 inline-flex justify-center p-1 sm:p-2 sm:text-base text-sm font-medium text-white bg-mainColor border-none rounded-full -outline-offset-1 sm:outline-8 outline-4 outline-white z-10 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-mainColor-leaf focus:ring-offset-2 hover:ring-2 hover:ring-mainColor-leaf hover:ring-offset-2 active:scale-95 active:translate-y-0.5"
            >
              <IoClose />
            </button>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default React.memo(MainModal);