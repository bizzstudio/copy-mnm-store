// src/component/checkout/DeliveryOptions.jsx
import React from "react";
import { MdOutlinePhoneEnabled, MdOutlineLocalShipping } from "react-icons/md";
import { FaDoorOpen } from "react-icons/fa";
import useTranslation from "next-translate/useTranslation";

const DeliveryOptions = ({ register, selectedCallOnArrival, isDeliverable }) => {
    const { t } = useTranslation();

    if (!isDeliverable) return null;

    return (
        <div className="w-full">
            <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <MdOutlineLocalShipping className="text-mainColor-dark text-xl" />
                        {t("common:deliveryOptions")}
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <label className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 hover:border-mainColor transition-all duration-200 group flex-1 ${selectedCallOnArrival === "true"
                            ? "bg-mainColor/5 border-mainColor"
                            : "border-gray-200"
                            }`}>
                            <input
                                type="radio"
                                value="true"
                                defaultChecked
                                {...register("callOnArrival")}
                                className="w-4 h-4 text-mainColor border-gray-300"
                            />
                            <div className="flex items-center gap-3 ms-2">
                                <MdOutlinePhoneEnabled className={`w-5 h-5 transition-colors ${selectedCallOnArrival === "true"
                                    ? "text-mainColor"
                                    : "text-gray-500 group-hover:text-mainColor"
                                    }`} />
                                <span className={`text-sm font-medium transition-colors ${selectedCallOnArrival === "true"
                                    ? "text-stone-700"
                                    : "text-stone-700 group-hover:text-stone-900"
                                    }`}>
                                    {t("common:callOnArrival")}
                                </span>
                            </div>
                        </label>

                        <label className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 hover:border-mainColor transition-all duration-200 group flex-1 ${selectedCallOnArrival === "false"
                            ? "bg-mainColor/5 border-mainColor"
                            : "border-gray-200"
                            }`}>
                            <input
                                type="radio"
                                value="false"
                                {...register("callOnArrival")}
                                className="w-4 h-4 text-mainColor border-gray-300"
                            />
                            <div className="flex items-center gap-3 ms-2">
                                <FaDoorOpen className={`w-5 h-5 transition-colors ${selectedCallOnArrival === "false"
                                    ? "text-mainColor"
                                    : "text-gray-500 group-hover:text-mainColor"
                                    }`} />
                                <span className={`text-sm font-medium transition-colors ${selectedCallOnArrival === "false"
                                    ? "text-stone-700"
                                    : "text-stone-700 group-hover:text-stone-900"
                                    }`}>
                                    {t("common:leaveAtDoor")}
                                </span>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryOptions;

