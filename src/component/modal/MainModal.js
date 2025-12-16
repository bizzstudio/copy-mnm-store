// src/component/modal/MainModal.js
import React, { Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { IoClose } from "react-icons/io5";

const MainModal = ({ modalOpen, setModalOpen, children, z = null, onClose }) => {
  const cancelButtonRef = useRef();

  const handleClose = () => {
    if (onClose) {
      onClose(); // השתמש בפונקציה שהועברה ב-onClose
    } else {
      setModalOpen(false); // התנהגות ברירת מחדל
    }
  };

  return (
    <>
      <Transition appear show={modalOpen} as={Fragment}>
        <Dialog
          as="div"
          className={`fixed inset-0 z-30 overflow-y-auto text-center`}
          onClose={handleClose}
          initialFocus={cancelButtonRef}
          style={{ zIndex: z ? z : 30 }}
        >
          <div className="min-h-[100dvh] sm:px-8 px-2">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
            // leaveFrom="opacity-100 scale-100"
            // leaveTo="opacity-80"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black opacity-60" />
            </Transition.Child>

            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div
                className="inline-block w-full max-w-none sm:w-auto sm:max-w-6xl overflow-hidden text-left align-middle transition-all transform bg-white rounded-2xl xl:max-w-6xl shadow-popup my-8"
              >
                {children}
                <div className="absolute sm:right-5 sm:top-5 right-2 top-1 z-10">
                  <button
                    ref={cancelButtonRef}
                    onClick={handleClose}
                    type="button"
                    className="inline-flex justify-center p-1 sm:p-2 sm:text-base text-sm font-medium text-white bg-mainColor border-none rounded-full outline -outline-offset-1 sm:outline-[8px] outline-4 outline-white"
                  >
                    <IoClose />
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default React.memo(MainModal);