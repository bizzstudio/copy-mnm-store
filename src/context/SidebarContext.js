// SidebarContext.js
import OfferServices from "@services/OfferServices";
import CategoryServices from "@services/CategoryServices";
import React, { useState, useMemo, createContext, useEffect } from "react";
import { useRouter } from "next/router";
// import useNotification from "@hooks/useNotification";

// create context
export const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const router = useRouter();
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

  // רק פתיחה: אם יש method תקין ב-URL – פותחים את המודאל
  useEffect(() => {
    if (!router.isReady) return;
    const method = router.query.method;
    if (typeof method === "string" && VALID_LOGIN_METHODS.includes(method)) {
      setLoginModalOpen(true);
    }
  }, [router.isReady, router.query.method]);

  // שליפת המבצעים פעם אחת כשאתר נטען
  const fetchOffers = async () => {
    try {
      const res = await OfferServices.getAllOffers();
      // console.log("res offers:", res);
      setOffers(res || []);
    } catch (error) {
      console.error("Failed to fetch offers:", error);
    }
  };

  // שליפת הקטגוריות פעם אחת כשאתר נטען
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await CategoryServices.getShowingCategory();
      setCategories(res || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchCategories();
  }, []);

  // פונקציה לריענון
  const refreshOffers = async () => {
    await fetchOffers();
  };

  // פונקציה לריענון קטגוריות
  const refreshCategories = async () => {
    await fetchCategories();
  };

  // const { socket } = useNotification();

  const toggleCartDrawer = () => setCartDrawerOpen(!cartDrawerOpen);
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

    [cartDrawerOpen, categoryDrawerOpen, isModalOpen, loginModalOpen, currentPage, isLoading, offers, categories, categoriesLoading]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
};