"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export function HexagonPulse() {
    const rows = 5;
    const cols = 5;
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);



    const hexagons = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const xOffset = c * 50 + (r % 2 === 1 ? 25 : 0);
            const yOffset = r * 44;
            hexagons.push({ r, c, x: xOffset, y: yOffset, id: r * cols + c });
        }
    }

    return (
        <div className="w-[300px] h-[300px] relative border rounded-xl overflow-hidden bg-gray-950 flex items-center justify-center">
            <div className="relative w-[280px] h-[250px]">
                {hexagons.map((hex) => {
                    const isHovered = hoveredIndex === hex.id;

                    const isNeighbor = hoveredIndex !== null && Math.abs(hoveredIndex - hex.id) === 1;

                    return (
                        <motion.div
                            key={hex.id}
                            className="absolute w-[48px] h-[54px]"
                            style={{
                                left: hex.x,
                                top: hex.y,
                                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
                            }}
                            animate={{
                                scale: isHovered ? 1.1 : isNeighbor ? 0.95 : 1,
                                backgroundColor: isHovered ? "#3b82f6" : isNeighbor ? "#1e40af" : "#1f2937",
                                zIndex: isHovered ? 10 : 1
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            onMouseEnter={() => setHoveredIndex(hex.id)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <div className="w-full h-full bg-black/20" />
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
