import MinimalTitle from "@component/common/MinimalTitle";
import React from "react";

const PageHeader = ({ title, headerBg }) => {
  return (
    <div
      style={{ backgroundImage: `url(${headerBg || "/page-header-bg.jpg"})` }}
      className={`flex justify-center py-10 lg:py-32 bg-indigo-100 w-full bg-cover bg-no-repeat bg-bottom`}
    >
      <div className="flex mx-auto max-w-screen-2xl px-3 sm:px-10">
        <div className="flex justify-center flex-col relative">
          <h2 className="text-xl md:text-3xl lg:text-4xl font-bold font-serif text-center">
            <MinimalTitle title={title} />
          </h2>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
