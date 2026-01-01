import React from 'react'
import { useTranslations } from "next-intl";

export default function Calculating({ showText = true }) {
    const t = useTranslations();

    return (
        <span className="flex flex-row justify-center items-center gap-1 text-center">
            <img
                src="/loader/spinner.gif"
                alt="Loading"
                width={20}
                height={10}
                className="saturate-0"
            />
            {showText && <span>
                {t('calculating')}
            </span>}
        </span>
    )
}
