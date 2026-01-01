// src/pages/faqs.js
import React from "react";
import Image from "next/image";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/solid";

// Internal import
import Layout from "@layout/Layout";
import useGetSetting from "@hooks/useGetSetting";
import PageHeader from "@component/header/PageHeader";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { useTranslations } from "next-intl";
import { getI18nProps } from "@utils/i18n";

const Faq = () => {
  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();
  const t = useTranslations();

  return (
    <Layout
      title={t('FAQ')}
      description={t('faqDescription')}
    >
      <PageHeader
        headerBg={storeCustomizationSetting?.faq?.header_bg}
        title={showingTranslateValue(storeCustomizationSetting?.faq?.title)}
      />
      <div className="bg-white">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-10 py-10 lg:py-12">
          <div className="grid gap-4 lg:mb-8 items-center md:grid-cols-2 xl:grid-cols-2">
            <div className="pr-16">
              <Image
                width={720}
                height={550}
                src={storeCustomizationSetting?.faq?.left_img || "/faq.svg"}
                alt="logo"
              />
            </div>
            <div className="">
              {storeCustomizationSetting?.faq?.faq_one?.he && (
                <Disclosure>
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex justify-between w-full px-4 py-3 text-base font-medium text-left text-gray-600 focus:text-blackbg-mainColor-superLight hover:bg-mainColor-superLight rounded-lg focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
                        <span>
                          {showingTranslateValue(
                            storeCustomizationSetting?.faq?.faq_one
                          )}
                        </span>
                        <ChevronUpIcon
                          className={`${open ? "transform rotate-180 text-mainColor" : ""
                            } w-5 h-5 text-gray-500`}
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="px-4 pt-3 pb-8 text-sm leading-7 text-gray-500">
                        {showingTranslateValue(
                          storeCustomizationSetting?.faq?.description_one
                        )}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              )}

              {storeCustomizationSetting?.faq?.faq_two?.he && (
                <Disclosure as="div" className="mt-2">
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex justify-between w-full px-4 py-3 text-base font-medium text-left text-gray-600 focus:text-blackbg-mainColor-superLight hover:bg-mainColor-superLight rounded-lg focus:outline-none">
                        <span>
                          {" "}
                          {showingTranslateValue(
                            storeCustomizationSetting?.faq?.faq_two
                          )}
                        </span>
                        <ChevronUpIcon
                          className={`${open ? "transform rotate-180 text-mainColor" : ""
                            } w-5 h-5 text-gray-500`}
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="px-4 pt-3 pb-8 text-sm leading-7 text-gray-500">
                        {showingTranslateValue(
                          storeCustomizationSetting?.faq?.description_two
                        )}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              )}

              {storeCustomizationSetting?.faq?.faq_three?.he && (
                <Disclosure as="div" className="mt-2">
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex justify-between w-full px-4 py-3 text-base font-medium text-left text-gray-600 focus:text-blackbg-mainColor-superLight hover:bg-mainColor-superLight rounded-lg focus:outline-none">
                        <span>
                          {" "}
                          {showingTranslateValue(
                            storeCustomizationSetting?.faq?.faq_three
                          )}
                        </span>
                        <ChevronUpIcon
                          className={`${open ? "transform rotate-180 text-mainColor" : ""
                            } w-5 h-5 text-gray-500`}
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="px-4 pt-3 pb-8 text-sm leading-7 text-gray-500">
                        {showingTranslateValue(
                          storeCustomizationSetting?.faq?.description_three
                        )}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              )}

              {storeCustomizationSetting?.faq?.faq_four?.he && (
                <Disclosure as="div" className="mt-2">
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex justify-between w-full px-4 py-3 text-base font-medium text-left text-gray-600 focus:text-blackbg-mainColor-superLight hover:bg-mainColor-superLight rounded-lg focus:outline-none">
                        <span>
                          {" "}
                          {showingTranslateValue(
                            storeCustomizationSetting?.faq?.faq_four
                          )}
                        </span>
                        <ChevronUpIcon
                          className={`${open ? "transform rotate-180 text-mainColor" : ""
                            } w-5 h-5 text-gray-500`}
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="px-4 pt-3 pb-8 text-sm leading-7 text-gray-500">
                        {showingTranslateValue(
                          storeCustomizationSetting?.faq?.description_four
                        )}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              )}

              {storeCustomizationSetting?.faq?.faq_five?.he && (
                <Disclosure as="div" className="mt-2">
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex justify-between w-full px-4 py-3 text-base font-medium text-left text-gray-600 focus:text-blackbg-mainColor-superLight hover:bg-mainColor-superLight rounded-lg focus:outline-none">
                        <span>
                          {showingTranslateValue(
                            storeCustomizationSetting?.faq?.faq_five
                          )}
                        </span>
                        <ChevronUpIcon
                          className={`${open ? "transform rotate-180 text-mainColor" : ""
                            } w-5 h-5 text-gray-500`}
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="px-4 pt-3 pb-8 text-sm leading-7 text-gray-500">
                        {showingTranslateValue(
                          storeCustomizationSetting?.faq?.description_five
                        )}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              )}

              {storeCustomizationSetting?.faq?.faq_six?.he && (
                <Disclosure as="div" className="mt-2">
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex justify-between w-full px-4 py-3 text-base font-medium text-left text-gray-600 focus:text-blackbg-mainColor-superLight hover:bg-mainColor-superLight rounded-lg focus:outline-none">
                        <span>
                          {showingTranslateValue(
                            storeCustomizationSetting?.faq?.faq_six
                          )}
                        </span>
                        <ChevronUpIcon
                          className={`${open ? "transform rotate-180 text-mainColor" : ""
                            } w-5 h-5 text-gray-500`}
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="px-4 pt-3 pb-8 text-sm leading-7 text-gray-500">
                        {showingTranslateValue(
                          storeCustomizationSetting?.faq?.description_six
                        )}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              )}

              {storeCustomizationSetting?.faq?.faq_seven?.he && (
                <Disclosure>
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex justify-between w-full px-4 py-3 text-base font-medium text-left text-gray-600 focus:text-blackbg-mainColor-superLight hover:bg-mainColor-superLight rounded-lg focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
                        <span>
                          {" "}
                          {showingTranslateValue(
                            storeCustomizationSetting?.faq?.faq_seven
                          )}
                        </span>
                        <ChevronUpIcon
                          className={`${open ? "transform rotate-180 text-mainColor" : ""
                            } w-5 h-5 text-gray-500`}
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="px-4 pt-3 pb-8 text-sm leading-7 text-gray-500">
                        {showingTranslateValue(
                          storeCustomizationSetting?.faq?.description_seven
                        )}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              )}

              {storeCustomizationSetting?.faq?.faq_eight?.he && (
                <Disclosure as="div" className="mt-2">
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex justify-between w-full px-4 py-3 text-base font-medium text-left text-gray-600 focus:text-blackbg-mainColor-superLight hover:bg-mainColor-superLight rounded-lg focus:outline-none">
                        <span>
                          {showingTranslateValue(
                            storeCustomizationSetting?.faq?.faq_eight
                          )}
                        </span>
                        <ChevronUpIcon
                          className={`${open ? "transform rotate-180 text-mainColor" : ""
                            } w-5 h-5 text-gray-500`}
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="px-4 pt-3 pb-8 text-sm leading-7 text-gray-500">
                        {showingTranslateValue(
                          storeCustomizationSetting?.faq?.description_eight
                        )}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};


export async function getStaticProps(context) {
  return {
    props: await getI18nProps(context),
  };
}

export default Faq;