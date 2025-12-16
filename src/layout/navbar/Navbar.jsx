// src/layout/navbar/Navbar.jsx
import { useContext, useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { IoHome, IoNewspaperOutline, IoSearchOutline } from "react-icons/io5";
import { FiShoppingCart, FiUser, FiBell, FiUserCheck } from "react-icons/fi";
import { FaX } from "react-icons/fa6";
import { MdPointOfSale } from "react-icons/md";
import useTranslation from "next-translate/useTranslation";
import debounce from "lodash.debounce";
import { RiCustomerServiceLine } from "react-icons/ri";
import { TbTruckDelivery } from "react-icons/tb";
import { IoInformationCircleOutline } from "react-icons/io5";
import { FaList } from "react-icons/fa";

// Internal import
import NavbarPromo from "@layout/navbar/NavbarPromo";
import { UserContext } from "@context/UserContext";
import LoginModal from "@component/modal/LoginModal";
import CartDrawer from "@component/drawer/CartDrawer";
import { SidebarContext } from "@context/SidebarContext";
import useGetSetting from "@hooks/useGetSetting";
import { handleLogEvent } from "@utils/analytics";
import ProductServices from "@services/ProductServices";
import ResultWindow from "@component/resultWindow/resultWindow";
import AttributeServices from "@services/AttributeServices";
import useCart from "@hooks/useCart";
import VoiceSearchButton from "@component/voice-search/VoiceSearchButton";
import DropdownMenu from "@component/menu/DropdownMenu";
import MainModal from "@component/modal/MainModal";
import AutoDeliveriesPopup from "@component/deliveriesPopup/AutoDeliveriesPopup";

const Navbar = ({ cashierPage = false }) => {
  const { t } = useTranslation();
  const router = useRouter();

  const [imageUrl, setImageUrl] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState();
  const [attributes, setAttributes] = useState();
  const [modalOpen, setModalOpen] = useState(false);
  const [deliveriesPopup, setDeliveriesPopup] = useState(false);

  const { toggleCartDrawer } = useContext(SidebarContext);
  const { state: { userInfo } } = useContext(UserContext);

  const { totalItems } = useCart();

  const { storeCustomizationSetting } = useGetSetting();

  const navbarRef = useRef(null);
  const logoRef = useRef(null);
  const [logoHeight, setLogoHeight] = useState(null);
  const [logoWidth, setLogoWidth] = useState(0);


  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchText.trim()) {
      router.push(`/search?query=${searchText.trim()}`, null, { scroll: false });
      setSearchText("");
      handleLogEvent("search", `searched ${searchText}`);
    }
  };

  // חיפוש מיידי
  useEffect(() => {
    const fetchData = async () => {
      if (searchText.trim()) {
        // קבלת המוצרים המתאימים מהשרת
        let serverProducts = await ProductServices.getShowingStoreProducts({
          title: searchText,
        });
        setSearchResults(serverProducts.products);
        // קבלת התכונות מהשרת
        let attributes = await AttributeServices.getShowingAttributes();
        setAttributes(attributes);
      } else {
        setSearchResults();
      }
    };

    // הוצאה לפועל של הפונקציה אחרי מינימום 300 אלפיות כדי למנוע הצפת בקשות
    const debouncedFetch = debounce(fetchData, 300);

    debouncedFetch();

    return () => {
      debouncedFetch.cancel();
    };
  }, [searchText])


  useEffect(() => {
    if (Cookies.get("userInfo")) {
      const user = JSON.parse(Cookies.get("userInfo"));
      setImageUrl(user.image);
    }
  }, []);

  // מדידת גובה הNavbar והגדרת גובה הלוגו
  useEffect(() => {
    const updateLogoDimensions = () => {
      if (navbarRef.current) {
        const navbarHeight = navbarRef.current.offsetHeight;
        setLogoHeight(navbarHeight * 1.35);
      }
      if (logoRef.current) {
        const width = logoRef.current.offsetWidth;
        setLogoWidth(width);
      }
    };

    updateLogoDimensions();
    window.addEventListener('resize', updateLogoDimensions);

    // עדכון אחרי שהדף נטען
    const timer = setTimeout(updateLogoDimensions, 100);
    const timer2 = setTimeout(updateLogoDimensions, 500);

    return () => {
      window.removeEventListener('resize', updateLogoDimensions);
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, [cashierPage]);

  return (
    <>
      {deliveriesPopup && (
        <MainModal modalOpen={deliveriesPopup} setModalOpen={setDeliveriesPopup}>
          <div className="px-3 sm:px-6 md:px-8 lg:px-11 py-4 sm:py-6 md:py-8 pt-10">
            <AutoDeliveriesPopup />
          </div>
        </MainModal>
      )}

      <CartDrawer />
      {modalOpen && (
        <LoginModal modalOpen={modalOpen} setModalOpen={setModalOpen} />
      )}

      <>
        <div
          ref={navbarRef}
          className={`sticky top-0 z-20 bg-white flex xl:flex-row w-full drop-shadow-lg ${cashierPage ? "border-b" : ""}`}
        >
          {/* logo - בצד ימין, בגובה 1.3 כפול מה-navbar כך שהחלק התחתון חורג */}
          <Link
            ref={logoRef}
            href={cashierPage ? "/cashier-desk" : "/"}
            className="absolute right-0 top-0 flex items-start overflow-visible pointer-events-auto z-10"
            style={{ height: logoHeight ? `${logoHeight}px` : '130%' }}
          >
            <Image
              width={500}
              height={500}
              src={storeCustomizationSetting?.navbar?.logo}
              alt="logo"
              className="h-full w-auto object-contain"
              style={{ objectPosition: 'center top' }}
            />
          </Link>

          {/* חיפוש + תפריט */}
          <div
            className="w-full"
            style={{ paddingRight: logoHeight > 0 ? `${logoHeight}px` : '180px' }}
          >
            <div className="w-full flex flex-col-reverse md:flex-row items-center md:gap-3 gap-0">
              <div className="w-full">
                <div className="h-auto sm:h-16 lg:h-auto flex items-center justify-between mx-auto py-2.5 lg:py-5 2xl:py-3">

                  {/* קטגוריות */}
                  <div className="hidden 2xl:block w-full border-gray-200 bg-white">
                    <NavbarPromo logoHeight={logoHeight} />
                  </div>

                  {/* Search Bar */}
                  <div className="flex flex-col w-full max-w-[700px] mx-auto px-1.5 sm:px-2">
                    <form onSubmit={handleSubmit}
                      className={`flex relative w-full h-[32px] sm:h-[40px] lg:min-w-[250px] items-center px-2 sm:px-3.5 rounded-[10px] transition-[border-radius] duration-500 ease-in-out bg-gray-100 focus-within:rounded-[1px] before:content-[''] before:absolute before:bg-mainColor before:transform before:scale-x-0 before:origin-center before:w-full before:h-[2px] before:left-0 before:bottom-0 before:rounded-[1px] before:transition-transform before:duration-300 before:ease-in-out focus-within:before:scale-100`}>
                      <button type="submit" className="border-none bg-none text-[#8b8ba7] focus:text-mainColor text-base sm:text-lg flex-shrink-0">
                        <IoSearchOutline />
                      </button>
                      <input
                        onChange={(e) => setSearchText(e.target.value)}
                        className="peer text-xs sm:text-sm bg-transparent w-full h-full px-1.5 sm:px-2 py-0 sm:py-[0.7em] border-none focus:outline-none focus:ring-0"
                        placeholder={t(`common:search-placeholder`)}
                        required
                        type="text"
                        value={searchText}
                      />
                      <button onClick={() => { setSearchResults(), setSearchText("") }} type="reset" className="border-none peer-placeholder-shown:opacity-0 peer-placeholder-shown:invisible transition-opacity duration-300 flex-shrink-0" >
                        <FaX size={10} className="sm:w-3 sm:h-3" />
                      </button>

                      {/* כפתור התמלול הקולי */}
                      <VoiceSearchButton />

                      {searchResults && <ResultWindow
                        products={searchResults}
                        attributes={attributes}
                        clearInput={() => { setSearchResults(), setSearchText("") }}
                        closeResultWindow={() => setSearchResults()}
                      />}
                    </form>
                  </div>

                  {/* תפריט נוסף */}
                  <div className="me-2 ms-1 sm:me-7 sm:ms-5">
                    <DropdownMenu
                      options={[
                        {
                          label: (
                            <Link href="/עלינו" className="group hover:underline">
                              <div className="flex items-center justify-center gap-1.5 font-semibold">
                                <IoInformationCircleOutline size={22} />
                                <span>{t("common:aboutUs")}</span>
                              </div>
                            </Link>
                          ),
                          onClick: () => { }, // אין צורך בפעולה כי זה לינק
                        },
                        {
                          label: (
                            <Link href="/צרו-קשר" className="group hover:underline">
                              <div className="flex items-center justify-center gap-1.5 font-semibold">
                                <RiCustomerServiceLine size={19} />
                                <span>{t("common:contactUs")}</span>
                              </div>
                            </Link>
                          ),
                          onClick: () => { }, // אין צורך בפעולה כי זה לינק
                        },
                        {
                          label: (
                            <Link href="/blogs" className="group hover:underline">
                              <div className="flex items-center justify-center gap-1.5 font-semibold">
                                <IoNewspaperOutline size={20} />
                                <span>{t("common:blogsTitle")}</span>
                              </div>
                            </Link>
                          ),
                          onClick: () => { }, // אין צורך בפעולה כי זה לינק
                        },
                        {
                          label: (
                            <div className="group hover:underline">
                              <div className="flex items-center justify-center gap-1.5 font-semibold">
                                <TbTruckDelivery size={24} />
                                <span>{t("common:deliveryAreas")}</span>
                              </div>
                            </div>
                          ),
                          onClick: () => setDeliveriesPopup(true),
                        },
                        {
                          label: (
                            <Link href="/תקנון-אתר" className="group hover:underline">
                              <div className="flex items-center justify-center gap-1.5 font-semibold">
                                <FaList size={17} />
                                <span>{t("common:termsAndConditions")}</span>
                              </div>
                            </Link>
                          ),
                          onClick: () => { }, // אין צורך בפעולה כי זה לינק
                        },
                      ]}
                    />
                  </div>

                  {/* כפתור סל הקניות */}
                  <div className="px-3 sm:px-10 hidden md:hidden md:items-center lg:flex gap-5 absolute inset-y-0 right-0 sm:static sm:inset-auto sm:pr-0">
                    <button
                      aria-label="Total"
                      onClick={toggleCartDrawer}
                      className="relative text-2xl font-bold"
                    >
                      {totalItems === 0 ? null :
                        <span className="absolute z-10 top-0 right-0 inline-flex items-center justify-center p-1 h-5 text-xs font-medium leading-none text-red-100 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full" style={{ minWidth: '20px', aspectRatio: '1/1' }}>
                          {totalItems}
                        </span>
                      }
                      <FiShoppingCart className="w-6 h-6 drop-shadow-xl" />
                    </button>

                    {/* כפתור פרופיל */}
                    {userInfo?.name ?
                      <Link
                        className="flex items-center justify-center bg-white hover:bg-mainColor hover:text-white text-2xl font-bold w-9 h-9 rounded-full leading-none outline outline-2 outline-mainColor outline-offset-2 hover:scale-110 hover:outline-none transition-all overflow-hidden"
                        aria-label="Login"
                        href="/user/dashboard"
                      >
                        {imageUrl || userInfo?.image ?
                          <Image
                            width={100}
                            height={100}
                            src={imageUrl || userInfo?.image}
                            alt="user"
                            className="min-w-full min-h-full object-cover"
                          /> :
                          <span className="flex items-center justify-center leading-none font-bold font-serif mb-0.5">
                            <FiUserCheck className="w-6 h-6 drop-shadow-xl" />
                          </span>}
                      </Link> :
                      <button className="flex items-center justify-center bg-white hover:bg-mainColor hover:text-white text-2xl font-bold w-9 h-9 rounded-full leading-none outline outline-2 outline-mainColor outline-offset-2 hover:scale-110 hover:outline-none transition-all overflow-hidden"
                        aria-label="Login"
                        onClick={() => setModalOpen(!modalOpen)}>
                        <FiUser className="w-6 h-6 drop-shadow-xl" />
                      </button>
                    }

                    {/* כפתור עמוד קופה - רק לקופאים */}
                    {userInfo?.isCashier && (
                      <Link
                        href={cashierPage ? "/" : "/cashier-desk"}
                        className="flex items-center justify-center text-white bg-mainColor text-2xl font-bold w-9 h-9 rounded-full leading-none outline outline-2 outline-mainColor outline-offset-2 hover:scale-110 hover:outline-none transition-all overflow-hidden"
                        aria-label={cashierPage ? t("common:backToHomePgae") : t("common:cashierDesk")}
                        title={cashierPage ? t("common:backToHomePgae") : t("common:cashierDesk")}
                      >
                        {cashierPage ?
                          <IoHome className="w-5 h-5 drop-shadow-xl" /> :
                          <MdPointOfSale className="w-5 h-5 drop-shadow-xl" />
                        }
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* פס קטגוריות מתחת ל-navbar - רק ב-xl ומטה */}
        {!cashierPage && (
          <div className="2xl:hidden block w-full">
            <NavbarPromo logoHeight={logoHeight} />
          </div>
        )}
      </>
    </>
  );
};
export default dynamic(() => Promise.resolve(Navbar), { ssr: false });