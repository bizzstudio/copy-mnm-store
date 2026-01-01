// src/component/modal/SubModal.js
import React, { Fragment } from "react";
import { Dialog, DialogBackdrop, Transition } from "@headlessui/react";

const SubModal = ({ modalOpen, z = null, children }) => {
  return (
    <>
      <Transition appear show={modalOpen} as={Fragment}>
        <Dialog
          as="div"
          className={`fixed inset-0 z-30 overflow-y-auto text-center`}
          onClose={() => {}} // disable closing via backdrop click
          style={{ zIndex: z ? z : 30 }}
          static // prevent closing on ESC keypress
        >
          <div className="min-h-screen p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
            >
              <DialogBackdrop className="fixed inset-0 bg-black opacity-60" />
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
              <div className="inline-block overflow-hidden text-left align-middle transition-all transform bg-white rounded-2xl xl:max-w-6xl shadow-popup">
                {children}
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default React.memo(SubModal);
