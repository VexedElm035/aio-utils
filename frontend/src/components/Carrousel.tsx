import { useState, useEffect, useCallback } from "react";

const CARDS = [
  { id: 1,  subtitle: "subtitle1", color: "#e8d5b7" },
  { id: 2,  subtitle: "subtitle2", color: "#b7cee8" },
  { id: 3,  subtitle: "subtitle3", color: "#d4b7e8" },
  { id: 4,  subtitle: "subtitle4", color: "#b7e8cc" },
  { id: 5,  subtitle: "subtitle5", color: "#e8c4b7" },
  { id: 6,  subtitle: "subtitle6", color: "#e8e4b7" },
  { id: 7,  subtitle: "subtitle7", color: "#b7e8e4" },
  { id: 8,  subtitle: "subtitle8", color: "#e8b7d4" },
  { id: 9,  subtitle: "subtitle9", color: "#c4e8b7" },
  { id: 10, subtitle: "subtitle10",color: "#b7bde8" },
];

function Card({ card }: { card: (typeof CARDS)[number] }) {
  return (
    <div
      className="w-64 h-96 rounded flex flex-col items-center justify-center gap-6 shadow-xl transition-transform duration-300 hover:scale-105"
      style={{ background: card.color }}
    >
      <div className="text-center px-5">
        <p className="text-xl font-semibold text-gray-900 mb-1">Card {card.id}</p>
        <p className="text-sm text-gray-600 leading-relaxed">{card.subtitle}</p>
      </div>
      <button className="px-6 py-2 border-2 border-gray-900 rounded text-sm font-semibold text-gray-900 bg-transparent cursor-pointer hover:bg-black hover:bg-opacity-10 transition-colors">
        Push me
      </button>
    </div>
  );
}

function rotateYValue(i: number){
    return Math.max(-80, -i * 20)
}

function xSpacing(i: number){
    return i * 40 - (i * 30)
}

function zSpacing(i: number){
    return -i * 400 - (i * i * 20)
}

export default function Carousel3D() {
  const [order, setOrder] = useState(() => CARDS.map((_, i) => i));

  const goToIndex = useCallback((targetIndex: number) => {
    setOrder((prevOrder) => {
      const currentPos = prevOrder.indexOf(targetIndex);
      if (currentPos <= 0) return prevOrder;
      
      const newOrder = [...prevOrder];
      newOrder.splice(currentPos, 1);
      newOrder.unshift(targetIndex);
      return newOrder;
    });
  }, []);

  const onChange = useCallback((dir: number) => {
    setOrder((prevOrder) => {
      const newOrder = [...prevOrder];
      if (dir === 1) {
        newOrder.push(newOrder.shift()!);
      } else {
        newOrder.unshift(newOrder.pop()!);
      }
      return newOrder;
    });
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") onChange(1);
      if (e.key === "ArrowLeft") onChange(-1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onChange]);

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-gray-100">

      {/* Carousel container
          perspective stays inline: it's a single numeric value not expressible
          with Tailwind's base utility classes */}
      <div
        className="relative h-screen max-w-3xl mx-auto flex items-center"
        style={{ perspective: "5000px" }}
      >
        {CARDS.map((card, i) => {
          const pos = order.indexOf(i);
          const x = xSpacing(pos);
          const z = zSpacing(pos);
          const rotateY = rotateYValue(pos);
          const zIndex = -pos;

          return (
            <div
              key={card.id}
              className="absolute w-64 h-4/5 flex justify-center items-center cursor-pointer"
              onClick={() => goToIndex(i)}
              style={{
                transformStyle: "preserve-3d",
                transition: "transform 600ms cubic-bezier(0.4, 0, 0.2, 1)",
                willChange: "transform",
                transformOrigin: "right center",
                transform: `translate3d(${x}px, 0px, ${z}px) rotateY(${rotateY}deg)`,
                zIndex: zIndex,
              }}
            >
              <Card card={card} />
            </div>
          );
        })}
      </div>

      
    </div>
  );
}
