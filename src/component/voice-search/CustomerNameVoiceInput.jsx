// src/component/voice-search/CustomerNameVoiceInput.jsx
import React, { useState, useCallback } from 'react';
import { HiMicrophone } from 'react-icons/hi2';
import { useTranslations } from "next-intl";
import VoiceRecognition from './VoiceRecognition';

const CustomerNameVoiceInput = ({ value, onChange, disabled = false, onVoiceStart }) => {
    const t = useTranslations();
    const [transcript, setTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isVoiceActive, setIsVoiceActive] = useState(false);

    // פונקציה לעיבוד הטקסט שהתקבל מהזיהוי הקולי
    const processTranscript = useCallback(async (text) => {
        if (!text.trim()) return;

        // עדכון השדה עם הטקסט שזוהה
        onChange(text.trim());

        // סגירת הזיהוי הקולי
        setIsVoiceActive(false);
        setTranscript('');
    }, [onChange]);

    const toggleVoiceInput = () => {
        if (disabled) return;
        
        if (!isVoiceActive) {
            // כאשר מפעילים זיהוי שם לקוח - להודיע לרכיב האב
            if (onVoiceStart) {
                onVoiceStart();
            }
        }
        
        setIsVoiceActive(!isVoiceActive);
        if (!isVoiceActive) {
            setTranscript('');
        }
    };

    return (
        <div className="relative">
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={t('enterCustomerName')}
                    disabled={disabled}
                    className="form-input py-2 px-3 md:px-4 w-full appearance-none transition ease-in-out border text-input text-sm rounded-md h-12 duration-200 bg-white border-gray-200 focus:ring-0 focus:outline-none focus:border-mainColor placeholder-gray-500 placeholder-opacity-75"
                />

                <button
                    type="button"
                    onClick={toggleVoiceInput}
                    disabled={disabled}
                    className={`flex items-center justify-center p-3 rounded-lg transition-colors duration-200 border border-gray-200 ${isVoiceActive
                        ? 'bg-mainColor text-white'
                        : 'text-blackhover:text-mainColor-dark hover:bg-mainColor-superLight'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    title={t('voiceInputCustomerName')}
                >
                    <HiMicrophone size={22} />
                </button>
            </div>

            {/* רכיב הזיהוי הקולי */}
            {isVoiceActive && (
                <div className="absolute top-full left-0 right-0 mt-2 z-10 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                    <div className="mb-2">
                        <h4 className="text-sm font-medium text-gray-700 text-right">
                            {t('voiceRecognitionCustomerName')}
                        </h4>
                        <p className="text-xs text-gray-500 text-right">
                            {t('speakCustomerName')}
                        </p>
                    </div>

                    <VoiceRecognition
                        transcript={transcript}
                        setTranscript={setTranscript}
                        onTranscriptComplete={processTranscript}
                        isListening={isListening}
                        setIsListening={setIsListening}
                    />

                    <div className="flex justify-end mt-3">
                        <button
                            type="button"
                            onClick={() => setIsVoiceActive(false)}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            {t('close')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerNameVoiceInput; 