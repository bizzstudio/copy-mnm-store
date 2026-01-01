// src/component/drawer/CategoryDrawer.js
import React, { useContext, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';

import Category from '@component/category/Category';
import { SidebarContext } from '@context/SidebarContext';

const CategoryDrawer = () => {
  const { categoryDrawerOpen, closeCategoryDrawer } =
    useContext(SidebarContext);
  const [isClosing, setIsClosing] = useState(false);

  // Handle close with animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      closeCategoryDrawer();
    }, 300); // Match animation duration
  };

  // Handle ESC key for accessibility
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && categoryDrawerOpen && !isClosing) {
        handleClose();
      }
    };

    if (categoryDrawerOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [categoryDrawerOpen, isClosing]);

  if (!categoryDrawerOpen) return null;

  return (
    <Dialog
      open={categoryDrawerOpen}
      onClose={handleClose}
      className={`relative z-50 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
    >
      <DialogBackdrop className={`fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`} />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full pr-0 sm:pr-4 md:pr-10">
            <DialogPanel className={`pointer-events-auto w-screen sm:max-w-[400px] transform transition duration-300 ease-in-out ${isClosing ? '-translate-x-full' : 'translate-x-0'}`}>
              <div className={`flex h-full flex-col bg-white shadow-xl ${isClosing ? 'animate-slide-out-left' : 'animate-slide-in-left'}`}>
                <Category onClose={handleClose} />
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default dynamic(() => Promise.resolve(CategoryDrawer), { ssr: false });