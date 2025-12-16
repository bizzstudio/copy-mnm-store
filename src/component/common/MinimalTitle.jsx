// src/component/common/MinimalTitle.jsx
import React from "react";
import { useInView } from "react-intersection-observer";

const MinimalTitle = ({ title, subtitle }) => {
    const { ref, inView } = useInView({
        threshold: 0.01,
        triggerOnce: true, // גורם לכך שהאנימציה תתרחש רק פעם אחת
    });

    return (
        <div className="flex gap-3 items-stretch h-full" ref={ref}>
            <div className="w-1.5 min-w-[6px] bg-mainColor rounded self-stretch" />
            <div className="flex flex-col justify-center overflow-hidden">
                {title && (
                    <h1
                        className={`md:text-4xl text-lg font-bold text-start ${inView ? 'animate-title' : 'opacity-0'}`}
                        key={title}
                    >
                        {title}
                    </h1>
                )}
                {subtitle && (
                    <h2
                        className={`md:text-2xl text-sm font-light text-start ${inView ? 'animate-subtitle' : 'opacity-0'}`}
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