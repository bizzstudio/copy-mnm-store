// src/component/modal/LoginModal.js
import React from "react";
import { useRouter } from "next/router";

// Internal import
import Common from "@component/login/Common";
import MainModal from "@component/modal/MainModal";

const LoginModal = ({ modalOpen, setModalOpen }) => {
  const router = useRouter();

  const handleClose = (value) => {
    setModalOpen(value);
    if (!value && router.query.method) {
      const { method, ...rest } = router.query;
      router.replace(
        { pathname: router.pathname, query: rest },
        undefined,
        { shallow: true, scroll: false }
      );
    }
  };

  return (
    <MainModal modalOpen={modalOpen} setModalOpen={handleClose}>
      <div className="inline-block sm:w-screen w-full max-w-lg sm:p-10 p-5 pt-10 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
        <Common setModalOpen={handleClose} />
      </div>
    </MainModal>
  );
};

export default LoginModal;