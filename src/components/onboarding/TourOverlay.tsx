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
        window.addEventListener('scroll', updatePosition);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition);
        };
    }, [targetElement, isActive]);

    if (!isActive || !position) return null;

    return (
        <>
            {/* Backdrop overlay */}
            <div
                className="fixed inset-0 bg-black/60 z-[9997] transition-opacity duration-300"
                style={{ opacity: isActive ? 1 : 0 }}
            />

            {/* Spotlight cutout */}
            <div
                className="fixed z-[9998] pointer-events-none transition-all duration-400"
                style={{
                    top: `${position.top - 8}px`,
                    left: `${position.left - 8}px`,
                    width: `${position.width + 16}px`,
                    height: `${position.height + 16}px`,
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 20px 4px rgba(var(--primary), 0.3)',
                    borderRadius: '12px',
                }}
            />

            {/* Highlighted element border */}
            <div
                className="fixed z-[9998] pointer-events-none transition-all duration-400 border-2 border-primary rounded-xl animate-pulse"
                style={{
                    top: `${position.top - 8}px`,
                    left: `${position.left - 8}px`,
                    width: `${position.width + 16}px`,
                    height: `${position.height + 16}px`,
                }}
            />
        </>
    );
};

export default TourOverlay;
export type { TourOverlayProps };
