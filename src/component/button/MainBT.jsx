// src/component/button/MainBT.jsx
import React from 'react';

const MainBT = React.forwardRef(({ children, className, ...props }, ref) => {
    return (
        <button
            ref={ref}
            className={`glow-btn ${className || ''} ${props.disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}
            {...props}
        >
            <div className="w-full flex items-center justify-center relative z-10">
                {children}
            </div>
        </button>
    );
});

MainBT.displayName = 'MainBT';

export default MainBT;