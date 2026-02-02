// src/component/common/MinimalTitle.jsx
import React from "react";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import { CgShapeHalfCircle } from "react-icons/cg";

const MinimalTitle = ({ title, subtitle }) => {
    const { ref, inView } = useInView({
        threshold: 0.01,
        triggerOnce: true, // גורם לכך שהאנימציה תתרחש רק פעם אחת
    });

    return (
        <div className="flex gap-3 items-stretch h-full overflow-hidden" ref={ref}>
            {/* <div className="w-1.5 min-w-[6px] bg-mainColor rounded self-stretch" /> */}
            
            <div className={`flex items-center justify-center shrink-0`} style={{ height: subtitle ? '59px' : '33px' }}>
                <img 
                    src="/categories icons/mnm/M-logo.png" 
                    alt="M Logo" 
                    className="h-full w-auto object-contain mt-[10%]"
                    onError={(e) => {
                        console.error('Image failed to load:', e.target.src);
                    }}
                />
            </div>

            <div className="flex flex-col justify-center overflow-hidden">
                {title && (
                    <h1
                        className={`text-mainColor-leaf md:text-4xl ${subtitle ? 'text-lg' : 'text-3xl'} font-extrabold text-start ${inView ? 'animate-title' : 'opacity-0'}`}
                        key={title}
                    >
                        {title}
                    </h1>
                )}
                {subtitle && (
                    <h2
                        className={`text-mainColor md:text-xl text-sm font-medium text-start ${inView ? 'animate-subtitle' : 'opacity-0'}`}
                        key={subtitle}
                    >
                        {subtitle}
                    </h2>
                )}
            </div>
        </div>
    );
};

export default MinimalTitle;