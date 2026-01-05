// src/component/button/MainBT.jsx
import React from 'react';

const MainBT = React.forwardRef(({ children, className, variant = 'primary', ...props }, ref) => {
    return (
        <button
            ref={ref}
            className={`relative cursor-pointer inline-flex items-center justify-center px-4 py-3 text-sm font-normal rounded-lg h-full transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-mainColor-leaf focus:ring-offset-2 hover:ring-2 hover:ring-mainColor-leaf hover:ring-offset-2 active:scale-95 active:translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none overflow-hidden group ${variant === 'primary' ? 'bg-mainColor text-white border border-mainColor-dark/20 hover:border-mainColor-dark/40' : variant === 'secondary' ? 'bg-white text-mainColor border border-mainColor/50 hover:border-mainColor' : ''} ${className || ''}`}
            {...props}
        >
            {variant === 'primary' ? (
                <>
                    <span className="absolute inset-0 bg-mainColor-dark opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                    <span className="relative z-10">{children}</span>
                </>
            ) : (
                <>
                    <span className="absolute inset-0 bg-mainColor-light opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                    <span className="relative z-10">{children}</span>
                </>
            )}
        </button>
    );
});

MainBT.displayName = 'MainBT';

export default MainBT;