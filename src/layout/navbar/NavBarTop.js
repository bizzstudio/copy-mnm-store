import React, { useContext, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import dynamic from "next/dynamic";
import { IoLockOpenOutline } from "react-icons/io5";
import { FiPhoneCall, FiUser } from "react-icons/fi";

// Internal import
import LoginModal from "@component/modal/LoginModal";
import { UserContext } from "@context/UserContext";
import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";

const NavBarTop = () => {
  const {
    dispatch,
    state: { userInfo },
  } = useContext(UserContext);
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState(false);

  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();

  const handleModal = () => {
    if (userInfo?.email) {
      router.push("/user/dashboard");
    } else {
      setModalOpen(!modalOpen);
    }
  };

  const handleLogOut = () => {
    dispatch({ type: "USER_LOGOUT" });
    Cookies.remove("userInfo");
    Cookies.remove("couponInfo");
    window.location = "/";
  };

  console.log(' storeCustomizationSetting?.navbar',  storeCustomizationSetting?.navbar)
  return (
    <>
      {modalOpen && (
        <LoginModal modalOpen={modalOpen} setModalOpen={setModalOpen} />
      )}

      <div className="hidden lg:block bg-gray-100">
        <div className="w-full mx-auto px-3 sm:px-4">
          <div className="text-gray-700 py-2 font-sans text-xs font-medium border-b flex justify-between items-center">
            <span className="flex items-center">
              {storeCustomizationSetting?.navbar?.phone_number && 
              <FiPhoneCall className="mr-2" />
              }
              {showingTranslateValue(
                storeCustomizationSetting?.navbar?.help_text
              )}
              <a
                href={`tel:${storeCustomizationSetting?.navbar?.phone_number
                  // || "+099949343"
                  }`}
                className="font-bold text-blackml-1"
              >
                {storeCustomizationSetting?.navbar?.phone_number
                  // || "+099949343"
                }
              </a>
            </span>

            <div className="lg:text-right flex items-center navBar">
              {storeCustomizationSetting?.navbar?.about_menu_status && (
                <div>
                  <Link
                    href="/עלינו"
                    className="font-medium hover:text-mainColor-dark"
                  >
                    {showingTranslateValue(
                      storeCustomizationSetting?.navbar?.about_us
                    )}
                  </Link>
                  <span className="mx-2">|</span>
                </div>
              )}
              {storeCustomizationSetting?.navbar?.contact_menu_status && (
                <div>
                  <Link
                    href="/צרו-קשר"
                    className="font-medium hover:text-mainColor-dark"
                  >
                    {showingTranslateValue(
                      storeCustomizationSetting?.navbar?.contact_us
                    )}
                  </Link>
                  <span className="mx-2">|</span>
                </div>
              )}
              <button
                onClick={handleModal}
                className="font-medium hover:text-mainColor-dark"
              >
                {showingTranslateValue(
                  storeCustomizationSetting?.navbar?.my_account
                )}
              </button>
              <span className="mx-2">|</span>
              {userInfo?.email ? (
                <button
                  onClick={handleLogOut}
                  className="flex items-center font-medium hover:text-mainColor-dark"
                >
                  <span className="ml-1">
                    <IoLockOpenOutline />
                  </span>
                  {showingTranslateValue(
                    storeCustomizationSetting?.navbar?.logout
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setModalOpen(!modalOpen)}
                  className="flex items-center font-medium hover:text-mainColor-dark"
                >
                  <span className="ml-1">
                    <FiUser />
                  </span>

                  {showingTranslateValue(
                    storeCustomizationSetting?.navbar?.login
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default dynamic(() => Promise.resolve(NavBarTop), { ssr: false });
