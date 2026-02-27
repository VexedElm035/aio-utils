import { useState, useEffect, useCallback } from "react";
import PdfCard from "./PdfCard";
import type { PdfItem } from "../views/documents/pdfoptions/PdfView";

function rotateYValue(i: number) {
    return Math.max(-80, -i * 20);
}

function xSpacing(i: number) {
    return i * 60 - i * 30;
}

function zSpacing(i: number) {
    return -i * 400 - i * i * 20;
}

interface PdfCarouselProps {
    items: PdfItem[];
    onRemove: (id: string) => void;
}

const PdfCarousel = ({ items, onRemove }: PdfCarouselProps) => {
    const [order, setOrder] = useState<number[]>([]);

    // Keep order in sync with the items array length
    useEffect(() => {
        setOrder((prev) => {
            if (prev.length === items.length) return prev;
            if (prev.length < items.length) {
                const added = Array.from(
                    { length: items.length - prev.length },
                    (_, i) => prev.length + i,
                );
                return [...prev, ...added];
            }
            return items.map((_, i) => i);
        });
    }, [items]);

    const goToIndex = useCallback((targetIndex: number) => {
        setOrder((prev) => {
            const pos = prev.indexOf(targetIndex);
            if (pos <= 0) return prev;
            const next = [...prev];
            next.splice(pos, 1);
            next.unshift(targetIndex);
            return next;
        });
    }, []);

    const shift = useCallback((dir: number) => {
        setOrder((prev) => {
            const next = [...prev];
            if (dir === 1) {
                next.push(next.shift()!);
            } else {
                next.unshift(next.pop()!);
            }
            return next;
        });
    }, []);

    // Keyboard navigation
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") shift(1);
            if (e.key === "ArrowLeft") shift(-1);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [shift]);

    if (items.length === 0) return null;

    return (
        <div
            className="flex flex-1 min-h-80 lg:min-h-120 relative items-center justify-center mt-3"
            style={{ perspective: "5000px" }}
        >
            {items.map((item, i) => {
                const pos = order.indexOf(i);
                if (pos === -1) return null;

                return (
                    <div
                        className="retro-window w-48 lg:w-56 absolute cursor-pointer flex flex-col justify-center items-center p-2 pt-0"
                        key={item.id}
                        onClick={() => goToIndex(i)}
                        style={{
                            transformStyle: "preserve-3d",
                            transition: "transform 600ms cubic-bezier(0.4, 0, 0.2, 1)",
                            willChange: "transform",
                            transformOrigin: "right center",
                            transform: `translate3d(${xSpacing(pos)}px, 0px, ${zSpacing(pos)}px) rotateY(${rotateYValue(pos)}deg)`,
                            zIndex: -pos,
                        }}
                    >
                        <PdfCard item={item} onRemove={onRemove} />
                    </div>
                );
            })}
        </div>
    );
};

export default PdfCarousel;
