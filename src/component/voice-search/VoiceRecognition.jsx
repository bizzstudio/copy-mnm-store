// src/component/voice-search/VoiceRecognition.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { HiMicrophone } from 'react-icons/hi2';
import { useTranslations } from "next-intl";
import Loading from '@component/preloader/Loading';

/**
 * props:
 * • transcript, setTranscript               - state שמנוהל ב־Modal
 * • onTranscriptComplete(text:string)       - פונקציית עיבוד
 * • isListening, setIsListening             - אינדיקטור למצב האזנה
 */
const VoiceRecognition = ({
    transcript,
    setTranscript,
    onTranscriptComplete,
    isListening,
    setIsListening,
}) => {
    const t = useTranslations();
    const [isProcessing, setIsProcessing] = useState(false);
    const [refres, setRefres] = useState(0);
    const [isInitializing, setIsInitializing] = useState(true); // ממתין למיקרופון

    /* ───── refs ───── */
    const recognitionRef = useRef(null);   // מופע ה-API
    const idleTimerRef = useRef(null);     // 500 ms שקט → עיבוד
    const restartingRef = useRef(false);   // מונע לולאת start-abort
    const destroyedRef = useRef(false);    // מרמז על unmount
    const processedLengthRef = useRef(0);  // כמה תווים כבר נשלחו לעיבוד
    const fullTranscriptRef = useRef('');  // הטקסט המלא מה-API
    const isProcessingRef = useRef(false); // מונע עיבוד כפול

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const restartTimerRef = useRef(null);   // מונע loop של start-stop
    const mobileDebounceRef = useRef(null);  // דיבאונס 1 ש׳
    const lastMobileTextRef = useRef('');    // הטקסט הסופי האחרון

    // פונקציה לעיבוד עם הגנה מפני קריאות כפולות
    const processText = useCallback(async (text) => {
        if (isProcessingRef.current || !text.trim()) return;

        isProcessingRef.current = true;
        setIsProcessing(true);

        // מעדכנים את המיקום של מה שכבר עובד לפני העיבוד
        processedLengthRef.current = fullTranscriptRef.current.length;

        // מאפסים את התצוגה מיד כשהעיבוד מתחיל
        setTranscript('');

        try {
            await onTranscriptComplete(text);
        } finally {
            setIsProcessing(false);
            isProcessingRef.current = false;
        }
    }, [onTranscriptComplete, setTranscript]);

    /* ════════════════════════════════════════════════════════
       Bootstrap SpeechRecognition פעם אחת
    ════════════════════════════════════════════════════════ */
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error('Web Speech API לא נתמך בדפדפן הזה');
            return;
        }

        let rec = new SpeechRecognition();
        rec.continuous = true;      // האזנה מתמדת
        rec.interimResults = true;      // תוצאות ביניים
        rec.lang = 'he-IL';

        /* --- אירועי מחזור חיים --- */
        rec.onstart = () => {
            // השירות התחיל, אבל המיקרופון עדיין לא בהכרח מוכן
            setIsInitializing(true);
        };
        // rec.onstart = () => setIsListening(true);

        // המיקרופון באמת מתחיל לקלוט אודיו - זה המומנט שאנחנו חיכינו לו!
        rec.onaudiostart = () => {
            setIsInitializing(false);
            setIsListening(true);
        };

        // כשהמיקרופון מפסיק לקלוט
        rec.onaudioend = () => {
            setIsListening(false);
        };

        rec.onend = () => {
            // במובייל נתחיל מייד סשן חדש (reset buffer)
            if (isMobile && !destroyedRef.current) {
                try { rec.start(); } catch (_) { }
                return;                       // אל תריץ את לוגיקת ה-refres
            }

            setRefres(refres + 1);
            if (destroyedRef.current) return;        // אל תחדש אם נפרדנו

            if (refres > 1) {
                setIsListening(false);
            }
        };

        /* --- שגיאות --- */
        rec.onerror = (e) => {
            // איפוס מצבים בשגיאה
            setIsInitializing(false);
            setIsListening(false);

            // aborted / no-speech הם תקינים בלוגיקה שלנו - מתעלמים
            if (e.error === 'aborted' || e.error === 'no-speech') return;
            console.error('speech-error:', e);
        };

        /* --- תוצאות דיבור --- */
        rec.onresult = (e) => {
            if (isMobile) {
                const result = e.results[e.resultIndex];
                const text = result[0].transcript.trim();

                /* תצוגה חיה תמיד */
                setTranscript(text);
                setIsProcessing(true);

                /* מחכים רק ל-final */
                if (!result.isFinal) return;

                // שומרים את הטקסט האחרון ו(מחדש-)מאפס את הטיימר
                lastMobileTextRef.current = text;
                clearTimeout(mobileDebounceRef.current);
                mobileDebounceRef.current = setTimeout(() => {
                    const finalText = lastMobileTextRef.current;

                    console.log('✅ FINAL אחרי 1 ש׳ שקט:', finalText);
                    processText(finalText);     // שליחה לשרת
                    setTranscript('');          // ניקוי תצוגה

                    /* עוצרים את הסשן – כדי לא לצבור היסטוריה */
                    try { rec.stop(); } catch (_) { }

                    // Safety: אם onend לא יורה (נדיר)
                    clearTimeout(restartTimerRef.current);
                    restartTimerRef.current = setTimeout(() => {
                        if (recognitionRef.current && recognitionRef.current !== rec) return;
                        try { rec.start(); } catch (_) { }
                    }, 1000);
                }, 1000);   // ← דיבאונס 1 ש׳

                return;
            } else {
                // בונים את הטקסט המלא מכל התוצאות
                let fullText = '';
                for (let i = 0; i < e.results.length; i++) {
                    fullText += e.results[i][0].transcript;
                }

                // שומרים את הטקסט המלא
                fullTranscriptRef.current = fullText.trim();

                // מציגים רק את החלק החדש (מעבר למה שכבר עובד)
                const newPart = fullText.substring(processedLengthRef.current).trim();
                if (newPart) {
                    setTranscript(newPart);
                }
            }
        };

        /* --- הפעלה --- */
        try { rec.start(); }
        catch { console.error('Cannot start speech recognition'); }

        recognitionRef.current = rec;

        /* --- ניקוי במשיכת פלאג --- */
        return () => {
            destroyedRef.current = true;
            clearTimeout(idleTimerRef.current);
            processedLengthRef.current = 0;
            fullTranscriptRef.current = '';
            isProcessingRef.current = false;
            try { rec.stop(); } catch (_) { /* ignore */ }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refres]);

    /* ════════════════════════════════════════════════════════
       ללא שינוי → שולחים לעיבוד
    ════════════════════════════════════════════════════════ */
    useEffect(() => {
        if (!transcript || isProcessingRef.current || isMobile) return;

        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = setTimeout(() => {
            const text = transcript.trim();
            if (text) {
                processText(text);
            }
        }, 1000);

        return () => clearTimeout(idleTimerRef.current);
    }, [transcript, processText]);

    /* ════════════════════════════════════════════════════════
       UI
    ════════════════════════════════════════════════════════ */
    return (
        <div className="space-y-4">
            {/* תצוגת התמלול */}
            <div className="min-h-[100px] max-h-[200px] overflow-y-auto border-2 border-dashed border-gray-300 rounded-lg bg-mainColor-superLight flex flex-col justify-between">
                {transcript ? (
                    <p className="text-gray-800 text-right leading-relaxed whitespace-pre-wrap p-3">
                        {transcript}
                    </p>
                ) : (
                    <p className="text-gray-500 text-center italic p-3 flex items-center justify-center relative">
                        {isInitializing
                            ? <div className="absolute top-1 flex items-center justify-center">
                                <Loading />
                            </div>
                            //t('voiceSearchInitializing')
                            : (isListening ? t('startTalking') : ' ')
                        }
                        {/* {isListening ? t('startTalking') : ' '} */}
                    </p>
                )}

                {/* אינדיקטור האזנה / עיבוד */}
                <div className="w-full flex justify-between items-stretch gap-3 p-2 pb-1 text-gray-400">
                    <div className={`flex items-center gap-[3px] ${isInitializing
                        ? 'animate-pulse'
                        : (isListening ? 'animate-pulse' : 'cursor-pointer')
                        }`}
                        onClick={() => {
                            if (!isListening && !isInitializing) {
                                setRefres(0);
                            }
                        }}
                    >
                        <HiMicrophone size={15} />
                        <span className="text-base mb-px">
                            {isInitializing
                                ? t('voiceSearchInitializing')
                                : (isListening
                                    ? t('voiceSearchListening')
                                    : t('voiceSearchNotListening')
                                )
                            }
                        </span>
                    </div>

                    {isProcessing && (
                        <div className="flex items-center gap-[5px]">
                            <div className="animate-spin w-3 h-3 border-2 border-t-transparent rounded-full border-gray-400" />
                            <span className="text-base">{t('processing')}...</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VoiceRecognition;