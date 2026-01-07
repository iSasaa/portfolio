"use client";

import { motion } from "framer-motion";

export function IsoBlocks() {
    const blocks = [0, 1, 2, 3, 4, 5, 6, 7, 8];

    return (
        <div className="w-[300px] h-[300px] relative border rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center">
            <div className="relative w-full h-full transform rotate-x-60 rotate-z-45 scale-75 mt-20 ml-10">
                <div className="grid grid-cols-3 gap-4">
                    {blocks.map((i) => (
                        <IsoBlock key={i} index={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function IsoBlock({ index }: { index: number }) {
    return (
        <motion.div
            className="w-16 h-16 relative cursor-pointer"
            whileHover={{ y: -20 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <div className="absolute inset-0 bg-primary/80 transform skew-y-0" style={{ transform: "rotateX(60deg) rotateZ(45deg) translateZ(10px)" }} />

            <div className="w-full h-full bg-primary rounded-lg shadow-lg border-t-4 border-l-4 border-white/20" />

            <div className="absolute top-20 left-0 w-full h-4 bg-black/40 blur-md rounded-full transform scale-x-75" />
        </motion.div>
    )
}
