// src/components/common/Tabs.jsx
import React, { useEffect, useRef, useState } from "react";

const Tabs = ({
    tabs = [{ id: "", label: <></>, content: <></> }],
    activeTab,
    onTabChange,
    fitContent = false,
}) => {
    const tabRefs = useRef({});
    const containerRef = useRef(null);

    const [tabWidths, setTabWidths] = useState({});
    const [tabPositions, setTabPositions] = useState({});

    // פונקציה למדידת רוחב ומיקום של כל כפתור
    const measureTabs = () => {
        if (fitContent && containerRef.current) {
            const widths = {};
            const positions = {};
            const containerRect = containerRef.current.getBoundingClientRect();
            const containerInlineStartX = containerRect.x;
            const containerInlineEndX = containerRect.x + containerRect.width;
            const dir = getComputedStyle(containerRef.current).direction; // 'ltr' | 'rtl'

            tabs.forEach((tabItem) => {
                const buttonRef = tabRefs.current[tabItem.id];
                if (buttonRef) {
                    const width = buttonRef.offsetWidth;
                    widths[tabItem.id] = width;
                    // משתמשים ב-getBoundingClientRect כדי לקבל את המיקום האמיתי אחרי justify-evenly,
                    // ואז ממירים למיקום לוגי (inline-start) בלי שימוש ב-left/right.
                    const buttonRect = buttonRef.getBoundingClientRect();
                    const buttonInlineStartX = buttonRect.x;
                    const buttonInlineEndX = buttonRect.x + buttonRect.width;

                    const inlineStartOffset =
                        dir === 'rtl'
                            ? containerInlineEndX - buttonInlineEndX
                            : buttonInlineStartX - containerInlineStartX;

                    positions[tabItem.id] = inlineStartOffset;
                }
            });

            setTabWidths(widths);
            setTabPositions(positions);
        }
    };

    // מדידת רוחב ומיקום של כל כפתור כאשר fitContent מופעל
    useEffect(() => {
        if (fitContent && containerRef.current) {
            // משתמשים ב-setTimeout כדי לוודא שהמדידה מתבצעת אחרי ה-render
            const timeoutId = setTimeout(measureTabs, 0);

            // משתמשים ב-ResizeObserver כדי למדוד מחדש כאשר הרוחב משתנה
            const resizeObserver = new ResizeObserver(() => {
                measureTabs();
            });

            // עוקבים אחרי ה-container כדי לזהות שינויים ב-justify-evenly
            if (containerRef.current) {
                resizeObserver.observe(containerRef.current);
            }

            tabs.forEach((tabItem) => {
                const buttonRef = tabRefs.current[tabItem.id];
                if (buttonRef) {
                    resizeObserver.observe(buttonRef);
                }
            });

            return () => {
                clearTimeout(timeoutId);
                resizeObserver.disconnect();
            };
        }
    }, [fitContent, tabs, activeTab]);

    const activeTabIndex = tabs.findIndex((tab) => tab.id === activeTab);

    let indicatorStyle = {};
    if (fitContent) {
        // חלוקה לפי רוחב
        const activeWidth = tabWidths[activeTab] || 0;
        const activePosition = tabPositions[activeTab] || 0;
        indicatorStyle = {
            height: 'calc(100% - 4px)',
            border: '0.5px solid rgba(0, 0, 0, 0.04)',
            insetInlineStart: `${activePosition + 2}px`,
            width: `${Math.max(activeWidth - 4, 0)}px`,
        };
    } else {
        // חלוקה שווה
        const indicatorWidth = 100 / tabs.length;
        indicatorStyle = {
            height: 'calc(100% - 4px)',
            border: '0.5px solid rgba(0, 0, 0, 0.04)',
            insetInlineStart: `calc(${activeTabIndex * indicatorWidth}% + 2px)`,
            width: `calc(${indicatorWidth}% - 4px)`,
        };
    }

    return (
        <div className="w-full">
            <div
                ref={containerRef}
                className={`relative flex items-center ${fitContent ? 'justify-between' : 'justify-around'} bg-gray-200 dark:bg-gray-700 dark:text-white rounded-[9px]`}
            >
                {/* אינדיקטור */}
                <div
                    className="absolute top-[2px] bg-mainColor z-9 rounded-[7px] transition-all duration-300 ease-out shadow-md"
                    style={indicatorStyle}
                />

                {/* כפתורי הכרטיסיות */}
                {tabs.map((tabItem) => (
                    <button
                        key={tabItem.id}
                        ref={(el) => (tabRefs.current[tabItem.id] = el)}
                        className={`relative py-3 z-10 flex items-center justify-center ${fitContent ? 'w-auto px-4' : 'w-full'} sm:text-base text-sm cursor-pointer transition-all duration-300 ${activeTab === tabItem.id ? 'opacity-100 text-white font-bold' : 'opacity-60'}`}
                        onClick={() => {
                            if (tabItem.id !== activeTab && onTabChange) {
                                onTabChange(tabItem.id);
                            }
                        }}
                    >
                        {tabItem.label}
                    </button>
                ))}
            </div>

            {/* תוכן הכרטיסיות */}
            <div className="mt-4">
                {tabs.map(
                    (tab) =>
                        activeTab === tab.id && <div key={tab.id}>{tab.content}</div>
                )}
            </div>
        </div>
    );
};

export default Tabs;