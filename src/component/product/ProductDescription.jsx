// src/component/product/ProductDescription.jsx
import { useState, useEffect, useRef } from 'react';
import { useTranslations } from "next-intl";
import useUtilsFunction from '@hooks/useUtilsFunction';

const ProductDescription = ({ description }) => {
    const t = useTranslations();
    const { showingTranslateValue, lang } = useUtilsFunction();
    const [isReadMore, setIsReadMore] = useState(true);
    const [shouldShowButton, setShouldShowButton] = useState(false);
    const contentRef = useRef(null);
    const [cutText, setCutText] = useState('');

    useEffect(() => {
        if (!description) return;

        const rawText = showingTranslateValue(description)
            ?.replace(/\r\r/g, '<br />')
            ?.replace(/\r/g, '<br />')
            ?.replace(/\n\n/g, '<br />')
            ?.replace(/\n/g, '<br />');

        if (!rawText) return;

        // בדיקת תווים
        const hasMoreThan220Chars = rawText.replace(/<br\s*\/?>/gi, '').length > 220;

        // בדיקת שורות
        const brTags = rawText.match(/<br\s*\/?>/gi) || [];
        const hasMoreThan3Lines = brTags.length >= 3;

        setShouldShowButton(hasMoreThan220Chars || hasMoreThan3Lines);

        if (hasMoreThan220Chars || hasMoreThan3Lines) {
            // גזירת טקסט לפי 3 שורות או 220 תווים - המוקדם מביניהם
            let threeLinesCutoff = rawText.length;
            let brCount = 0;
            for (let i = 0; i < rawText.length; i++) {
                const substr = rawText.slice(i, i + 6).toLowerCase();
                if (substr.startsWith('<br')) {
                    brCount++;
                    if (brCount === 3) {
                        threeLinesCutoff = i;
                        break;
                    }
                }
            }

            const plainText = rawText.replace(/<br\s*\/?>/gi, '');
            const cutoffPoint = Math.min(220, threeLinesCutoff);
            const limited = rawText.slice(0, cutoffPoint);
            setCutText(limited + (rawText.length > cutoffPoint ? '...' : ''));
        } else {
            setCutText(rawText);
        }
    }, [description]);

    const fullHtml = showingTranslateValue(description)
        ?.replace(/\r\r/g, '<br />')
        ?.replace(/\r/g, '<br />')
        ?.replace(/\n\n/g, '<br />')
        ?.replace(/\n/g, '<br />');

    if (!description || description?.[lang] === 'null' || description?.[lang] === 'undefined' || !fullHtml) return null;

    return (
        <div className="mb-2 text-right">
            <div className="text-base leading-5 text-gray-600 md:leading-6">
                <div
                    ref={contentRef}
                    className={`transition-all duration-500 ease-in-out overflow-hidden ${isReadMore ? 'max-h-[7.5em]' : 'max-h-[1000px]'
                        }`}
                    style={{ lineHeight: '1.5em' }} // 1.5em * 5 = 7.5em ≈ 3 שורות
                >
                    <div
                        dangerouslySetInnerHTML={{
                            __html: isReadMore ? cutText : fullHtml,
                        }}
                    />
                </div>

                {shouldShowButton && (
                    <div className="mt-0.5">
                        <span
                            onClick={() => setIsReadMore(!isReadMore)}
                            className="read-or-hide cursor-pointer text-customRed hover:text-customRed-dark transition-colors duration-200 font-medium"
                        >
                            {isReadMore
                                ? t('moreInfo')
                                : t('showLess')}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDescription;