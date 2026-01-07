"use client";

import { motion } from "framer-motion";

export function NeonAvatar() {
    return (
        <div className="relative w-[250px] h-[250px] flex items-center justify-center">

            <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-primary/30 blur-2xl"
            />

            <div className="absolute inset-4 rounded-full border-2 border-primary/50 border-dashed animate-spin-slow" />

            <div className="relative w-40 h-40 rounded-full bg-card border-2 border-primary flex items-center justify-center overflow-hidden z-10">
                <span className="text-4xl font-bold text-primary">JS</span>
            </div>
        </div>
    );
}
