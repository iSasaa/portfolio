"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";

interface TypewriterEffectProps {
    text: string;
    className?: string;
}

export function TypewriterEffect({ text, className }: TypewriterEffectProps) {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest));
    const displayText = useTransform(rounded, (latest) => text.slice(0, latest));
    const [animationComplete, setAnimationComplete] = useState(false);

    useEffect(() => {
        const controls = animate(count, text.length, {
            type: "tween",
            duration: 2,
            ease: "linear",
            onComplete: () => setAnimationComplete(true),
        });
        return controls.stop;
    }, [count, text.length]);

    return (
        <span className={className}>
            <motion.span>{displayText}</motion.span>
            {animationComplete && (
                <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    className="inline-block w-[2px] h-[1em] bg-primary align-middle ml-1"
                />
            )}
        </span>
    );
}
