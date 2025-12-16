// src/hooks/useInView.js
import { useEffect, useState, useRef } from 'react';

export default function useInView(options) {
    const ref = useRef(null);
    const [isIntersecting, setIntersecting] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setIntersecting(entry.isIntersecting),
            options
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [ref, options]);

    return [ref, isIntersecting];
};