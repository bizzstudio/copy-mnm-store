import React from 'react'
import useTranslation from "next-translate/useTranslation";

export default function Calculating({ showText = true }) {
    const { t } = useTranslation();

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
                {t("common:calculating")}
            </span>}
        </span>
    )
}
