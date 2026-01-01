// src/component/voice-search/VoiceSearchButton.jsx
import React, { useState } from 'react';
import { HiMicrophone } from 'react-icons/hi2';
import { useTranslations } from "next-intl";
import VoiceSearchModal from './VoiceSearchModal';

const VoiceSearchButton = ({ tooltipMessage = null }) => {
    const t = useTranslations();
    const [modalOpen, setModalOpen] = useState(false);

    // הודעת tooltip - ברירת מחדל או מה שהועבר
    const defaultTooltip = t('voiceSearchTooltip');
    const tooltip = tooltipMessage || defaultTooltip;

    return (
        <>
            {/* כפתור המיקרופון */}
            <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="flex items-center justify-center p-1.5 sm:p-3 -ml-1 sm:-ml-2 rounded-lg text-black hover:text-mainColor transition-colors duration-200 group relative outline-none shrink-0"
                // title={tooltip}
                aria-label="תמלול קולי"
            >
                <HiMicrophone className="w-4 h-4 sm:w-5 sm:h-5" />

                {/* Tooltip */}
                <div className="lg:block hidden absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap max-w-xs text-center z-50">
                    {tooltip}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>
            </button>

            {/* המודל */}
            {modalOpen && (
                <VoiceSearchModal
                    modalOpen={modalOpen}
                    setModalOpen={setModalOpen}
                    titleMessage={tooltip}
                />
            )}
        </>
    );
};

export default VoiceSearchButton; 