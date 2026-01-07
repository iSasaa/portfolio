"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";

export function ScrambleText() {
    const [text, setText] = useState("FULLSTACK");
    const targetText = "DEVELOPER";
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isHovering) {
            let iteration = 0;
            interval = setInterval(() => {
                setText(prev =>
                    targetText.split("").map((letter, index) => {
                        if (index < iteration) return targetText[index];
                        return chars[Math.floor(Math.random() * chars.length)];
                    }).join("")
                );

                if (iteration >= targetText.length) {
                    clearInterval(interval);
                }

                iteration += 1 / 3;
            }, 30);
        } else {
            setText("FULLSTACK");
        }

        return () => clearInterval(interval);
    }, [isHovering]);

    return (
        <div
            className="w-[300px] h-[300px] relative border rounded-xl overflow-hidden bg-black flex flex-col items-center justify-center cursor-crosshair group"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none" />

            <motion.h1
                className="text-4xl font-mono font-bold text-green-500 tracking-widest relative z-10"
                animate={{ scale: isHovering ? 1.1 : 1 }}
            >
                {text}
            </motion.h1>

            <p className="mt-4 text-xs font-mono text-green-500/50 blink">_ACCESS_GRANTED</p>
        </div>
    );
}
