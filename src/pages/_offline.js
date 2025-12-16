import React from 'react';
import Head from 'next/head';
// import useTranslation from "next-translate/useTranslation";

const Offline = () => {
  return (
    <>
      <Head>
        <title>אין חיבור לאינטרנט - תמרים בתומר</title>
      </Head>
      <div className="px-6 py-10 lg:py-20 bg-mainColor-superLight h-screen flex flex-wrap content-center">
        <div className="block justify-items-stretch mx-auto items-center text-center">
          <h2 className="font-bold font-serif font-2xl lg:text-3xl leading-6 mb-4">
            אין חיבור לאינטרנט!
          </h2>
          <p className="block text-center text-base font-sans text-gray-600">
            אנא התחברו לאינטרנט כדי לראות את הגרסה החיה של האתר
          </p>
        </div>
      </div>
    </>
  );
};

export default Offline;
