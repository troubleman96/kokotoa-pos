import { useEffect, useState } from 'react';

interface TourOverlayProps {
    targetElement: string;
    isActive: boolean;
}

const TourOverlay = ({ targetElement, isActive }: TourOverlayProps) => {
    const [position, setPosition] = useState<{
        top: number;
        left: number;
        width: number;
        height: number;
    } | null>(null);

    useEffect(() => {
        if (!isActive || !targetElement) {
            setPosition(null);
            return;
        }

        const updatePosition = () => {
            const element = document.querySelector(targetElement);
            if (element) {
                const rect = element.getBoundingClientRect();
                setPosition({
                    top: rect.top + window.scrollY,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                    height: rect.height,
                });
            }
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [targetElement, isActive]);

    if (!isActive || !position) return null;

    return (
        <>
            {/* Backdrop overlay - subtle and calm */}
            <div
                className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-[9997] transition-opacity duration-500"
                style={{ opacity: isActive ? 1 : 0 }}
            />

            {/* Spotlight cutout - elegant glow */}
            <div
                className="fixed z-[9998] pointer-events-none transition-all duration-500 ease-out"
                style={{
                    top: `${position.top - 12}px`,
                    left: `${position.left - 12}px`,
                    width: `${position.width + 24}px`,
                    height: `${position.height + 24}px`,
                    boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.4), 0 0 40px 10px rgba(var(--primary), 0.25)',
                    borderRadius: '16px',
                }}
            />

            {/* Highlighted element border - pulsing accent */}
            <div
                className="fixed z-[9998] pointer-events-none transition-all duration-500 ease-out border-2 border-primary/30 rounded-[18px] animate-pulse"
                style={{
                    top: `${position.top - 8}px`,
                    left: `${position.left - 8}px`,
                    width: `${position.width + 16}px`,
                    height: `${position.height + 16}px`,
                    boxShadow: 'inset 0 0 20px rgba(var(--primary), 0.1)',
                }}
            />
        </>
    );
};

export default TourOverlay;
export type { TourOverlayProps };
