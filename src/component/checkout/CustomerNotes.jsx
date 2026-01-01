// src/component/checkout/CustomerNotes.jsx
import React from "react";
import { MdKeyboardArrowDown, MdOutlineEditNote } from "react-icons/md";
import { useTranslations } from "next-intl";

const CustomerNotes = ({ register, watch, isNoteOpen, setIsNoteOpen }) => {
    const t = useTranslations();

    return (
        <div className="w-full flex flex-col h-full">
            <div className="border px-5 lg:px-8 py-3 rounded-lg bg-white">
                <div className={`flex justify-between items-center`}
                    onClick={() => setIsNoteOpen(!isNoteOpen)}>
                    <h2 className="font-semibold font-serif text-lg flex items-center gap-2">
                        <MdOutlineEditNote className="text-mainColor-dark text-xl" />
                        {t('customerNote')}
                    </h2>
                    <button type="button" className="text-mainColor">
                        <MdKeyboardArrowDown size={30} className={`transform ${isNoteOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>
                <div className={`relative overflow-hidden duration-500 ease-in-out ${isNoteOpen ? 'max-h-96 p-1 pt-3' : 'max-h-0'}`}>
                    <textarea
                        rows={4}
                        maxLength={200}
                        className="textareaCheckout w-full border border-gray-200 rounded-md px-4 py-3 text-sm font-sans focus-visible:outline-none focus:outline-none "
                        placeholder={t('typeHere')}
                        {...register("customer_note")}
                    />

                    <div className="absolute bottom-4 left-2 text-xs text-gray-400 bg-white px-1 rounded">
                        {watch("customer_note")?.length || 0}/200
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerNotes;

