// src/component/common/FloatingWhatsApp.jsx
import React from 'react';
import { useRouter } from 'next/router';
import { useTranslations } from "next-intl";
import { BsWhatsapp } from 'react-icons/bs';

const FloatingWhatsApp = ({
  categoryName = '',
  subCategoryName = '',
  productName = '',
  customMessage = '',
  orderNumber = ''
}) => {
  const t = useTranslations();
  const router = useRouter();
  const phoneNumber = process.env.NEXT_PUBLIC_CUSTOMER_SERVICE;

  // פונקציה ליצירת הודעה מותאמת לעמוד
  const createMessage = () => {
    const { pathname, asPath } = router;
    let baseMessage = '';

    // אם הועבר הודעה מותאמת אישית
    if (customMessage) {
      baseMessage = customMessage;
    }
    // זיהוי סוג העמוד לפי הנתיב
    else if (pathname.startsWith('/product') && productName) {
      baseMessage = t('whatsappProductMessage', { productName });
    }
    else if (pathname.startsWith('/product-category') && categoryName && subCategoryName) {
      baseMessage = t('whatsappSubCategoryMessage', { categoryName, subCategoryName });
    }
    else if (pathname.startsWith('/product-category') && categoryName) {
      baseMessage = t('whatsappCategoryMessage', { categoryName });
    }
    else if (pathname === '/offers') {
      baseMessage = t('whatsappOffersMessage');
    }
    else if (pathname === '/search') {
      baseMessage = t('whatsappSearchMessage');
    }
    // עמודי משתמש ספציפיים
    else if (pathname === '/user/dashboard') {
      baseMessage = t('whatsappDashboardMessage');
    }
    else if (pathname === '/user/my-orders') {
      baseMessage = t('whatsappMyOrdersMessage');
    }
    else if (pathname === '/user/my-documents') {
      baseMessage = t('whatsappMyDocumentsMessage');
    }
    // עמודי משתמש כלליים (לאחר הבדיקות הספציפיות)
    else if (pathname.startsWith('/user')) {
      baseMessage = t('whatsappAccountMessage');
    }
    else if (pathname === '/contact-us' || pathname === '/צרו-קשר') {
      baseMessage = t('whatsappContactMessage');
    }
    else if (pathname === '/about-us' || pathname === '/עלינו') {
      baseMessage = t('whatsappAboutMessage');
    }
    else if (pathname === '/terms-and-conditions' || pathname === '/תקנון-אתר') {
      baseMessage = t('whatsappTermsMessage');
    }
    else if (pathname === '/checkout') {
      baseMessage = t('whatsappCheckoutMessage');
    }
    else if (pathname.startsWith('/order') && orderNumber) {
      baseMessage = t('whatsappOrderMessage', { orderNumber });
    }
    // הודעה כללית - ברירת מחדל
    else {
      baseMessage = t('whatsappDefaultMessage');
    }

    // הוספת הקישור לכל הודעה
    const currentUrl = window.location.href;
    const fullMessage = `${baseMessage}\n\nהגעתי מהעמוד הזה:\n${currentUrl}`;
    
    return fullMessage;
  };

  const handleWhatsAppClick = () => {
    const message = createMessage();
    // console.log('message :>> ', message);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send/?phone=${phoneNumber}&text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed lg:bottom-6 bottom-[73px] lg:left-6 left-3 z-50">
      <div className="relative group">
        {/* בועת הודעה ב-hover */}
        <div className="absolute bottom-[70px] -left-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-64 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="text-sm text-gray-700 font-medium">
            {t('whatsappBubbleText')}
          </div>
          <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
        </div>

        {/* כפתור וואטסאפ */}
        <button
          onClick={handleWhatsAppClick}
          className="bg-green-500 hover:bg-green-600 text-white rounded-full lg:w-14 lg:h-14 w-[38px] h-[38px] flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
        //   title={t('whatsappTooltip')}
        >
          <BsWhatsapp className="lg:w-6 lg:h-6 w-[20px] h-[20px]" />
        </button>
      </div>
    </div>
  );
};

export default FloatingWhatsApp; 