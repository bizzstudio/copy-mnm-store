import Link from 'next/link'
import React from 'react'

export default function DynamicPopup({ popup = {} }) {

    const hasRealDesc = popup.description && (() => {
        // Remove HTML tags and check if there's actual text content
        const textContent = popup.description.replace(/<[^>]*>/g, '').trim();
        return textContent.length > 0;
    })();

    return (
        <div className='flex flex-col justify-center items-center'>
            {popup.image && <img src={popup.image} alt={popup.title} style={{ height: popup.imageHeight }} />}
            {popup.title &&
                <h2 className="text-2xl font-bold mt-4 text-center">{popup.title}</h2>
            }
            {popup.subTitle && <h3 className="text-lg mt-1 font-medium text-neutral-600 text-center">{popup.subTitle}</h3>}
            {hasRealDesc &&
                <div className="mt-2 text-center dynamicPopup" dangerouslySetInnerHTML={{ __html: popup.description }} />
            }
            {popup.link && (
                <Link
                    href={popup.link}
                    target={popup.targetBlank ? "_blank" : "_self"}
                    className="mt-5 flex items-center gap-2 font-semibold cursor-pointer transition-all bg-mainColor text-white px-6 py-1.5 h-11 rounded-lg border-mainColor-dark border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px] whitespace-nowrap"
                >
                    {popup.linkName}
                </Link>
            )}
        </div>
    )
}
