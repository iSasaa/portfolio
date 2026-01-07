"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";

export function InteractiveCube() {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useTransform(y, [-100, 100], [30, -30]);
    const rotateY = useTransform(x, [-100, 100], [-30, 30]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { innerWidth, innerHeight } = window;
            const xPos = (e.clientX - innerWidth / 2) / (innerWidth / 2);
            const yPos = (e.clientY - innerHeight / 2) / (innerHeight / 2);

            x.set(xPos * 100);
            y.set(yPos * 100);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [x, y]);

    return (
        <div className="perspective-1000 w-[200px] h-[200px] flex items-center justify-center">
            <motion.div
                style={{
                    width: 100,
                    height: 100,
                    rotateX: rotateX,
                    rotateY: rotateY,
                    transformStyle: "preserve-3d",
                }}
                className="relative"
            >

                <div className="absolute inset-0 bg-primary/20 border-2 border-primary backdrop-blur-sm [transform:translateZ(50px)] flex items-center justify-center text-primary font-bold">DEV</div>
                <div className="absolute inset-0 bg-primary/20 border-2 border-primary backdrop-blur-sm [transform:translateZ(-50px)]" />
                <div className="absolute inset-0 bg-primary/20 border-2 border-primary backdrop-blur-sm [transform:rotateY(90deg)_translateZ(50px)]" />
                <div className="absolute inset-0 bg-primary/20 border-2 border-primary backdrop-blur-sm [transform:rotateY(-90deg)_translateZ(50px)]" />
                <div className="absolute inset-0 bg-primary/20 border-2 border-primary backdrop-blur-sm [transform:rotateX(90deg)_translateZ(50px)]" />
                <div className="absolute inset-0 bg-primary/20 border-2 border-primary backdrop-blur-sm [transform:rotateX(-90deg)_translateZ(50px)]" />
            </motion.div>
        </div>
    );
}
