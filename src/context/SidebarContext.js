// SidebarContext.js
import OfferServices from "@services/OfferServices";
import CategoryServices from "@services/CategoryServices";
import Cookies from "js-cookie";
import React, { useState, useMemo, createContext, useEffect, useContext, useCallback } from "react";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";
import { UserContext } from "@context/UserContext";
import { notifyError } from "@utils/toast";
import {
  getTokenFromUserInfoCookieValue,
  isStoreLoginRequired,
} from "@utils/storeAccess";
// import useNotification from "@hooks/useNotification";

// create context
export const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const router = useRouter();
  const t = useTranslations();
  const {
    state: { userInfo },
  } = useContext(UserContext);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [offers, setOffers] = useState([]); // משתנה לשמירת המבצעים
  const [categories, setCategories] = useState([]); // משתנה לשמירת הקטגוריות
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const VALID_LOGIN_METHODS = ["login-regular", "login-bussines", "register", "reset-password"];

  // רק פתיחה: אם יש method תקין ב-URL – פותחים את המודאל (לא כשכבר מחוברים)
  useEffect(() => {
    if (!router.isReady) return;
    if (
      userInfo?.token ||
      getTokenFromUserInfoCookieValue(Cookies.get("userInfo") || "")
    ) {
      return;
    }
    const method = router.query.method;
    if (typeof method === "string" && VALID_LOGIN_METHODS.includes(method)) {
      setLoginModalOpen(true);
    }
  }, [router.isReady, router.query.method, userInfo]);

  // שליפת המבצעים פעם אחת כשאתר נטען
  const fetchOffers = async () => {
    try {
      const res = await OfferServices.getAllOffers();
      // console.log("res offers:", res);
      setOffers(res || []);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Failed to fetch offers:", error);
      }
      setOffers([]);
    }
  };

  // שליפת הקטגוריות פעם אחת כשאתר נטען
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await CategoryServices.getShowingCategory();
      setCategories(res || []);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Failed to fetch categories:", error);
      }
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const canFetchCatalogData = () => {
    if (!isStoreLoginRequired()) return true;
    if (userInfo?.token) return true;
    return !!getTokenFromUserInfoCookieValue(Cookies.get("userInfo") || "");
  };

  useEffect(() => {
    if (!canFetchCatalogData()) {
      setOffers([]);
      setCategories([]);
      setCategoriesLoading(false);
      return;
    }
    fetchOffers();
    fetchCategories();
  }, [userInfo]);

  // פונקציה לריענון
  const refreshOffers = async () => {
    await fetchOffers();
  };

  // פונקציה לריענון קטגוריות
  const refreshCategories = async () => {
    await fetchCategories();
  };

  // const { socket } = useNotification();

  const toggleCartDrawer = useCallback(() => {
    setCartDrawerOpen((prev) => {
      const opening = !prev;
      if (opening) {
        const token =
          userInfo?.token ||
          getTokenFromUserInfoCookieValue(Cookies.get("userInfo") || "");
        if (!token) {
          setLoginModalOpen(true);
          notifyError(t("loginRequiredForCart"));
          return prev;
        }
      }
      return !prev;
    });
  }, [userInfo, t]);

  const closeCartDrawer = () => setCartDrawerOpen(false);

  const toggleCategoryDrawer = () => setCategoryDrawerOpen(!categoryDrawerOpen);
  const closeCategoryDrawer = () => setCategoryDrawerOpen(false);

  const toggleModal = () => setIsModalOpen(!isModalOpen);
  const closeModal = () => setIsModalOpen(false);

  const handleChangePage = (p) => {
    setCurrentPage(p);
  };

  // console.log('categories :>> ', categories);

  const value = useMemo(
    () => ({
      cartDrawerOpen,
      toggleCartDrawer,
      closeCartDrawer,
      setCartDrawerOpen,
      categoryDrawerOpen,
      toggleCategoryDrawer,
      closeCategoryDrawer,
      isModalOpen,
      toggleModal,
      closeModal,
      loginModalOpen,
      setLoginModalOpen,
      currentPage,
      setCurrentPage,
      handleChangePage,
      isLoading,
      setIsLoading,
      offers,
      refreshOffers,
      categories,
      categoriesLoading,
      refreshCategories,
    }),

    [
      cartDrawerOpen,
      categoryDrawerOpen,
      isModalOpen,
      loginModalOpen,
      currentPage,
      isLoading,
      offers,
      categories,
      categoriesLoading,
      toggleCartDrawer,
    ]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
};