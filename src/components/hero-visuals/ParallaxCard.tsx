"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";

export function ParallaxCard() {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useTransform(y, [-100, 100], [25, -25]);
    const rotateY = useTransform(x, [-100, 100], [-25, 25]);

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const xPos = (e.clientX - rect.left - rect.width / 2);
        const yPos = (e.clientY - rect.top - rect.height / 2);



        x.set((xPos / rect.width) * 200);
        y.set((yPos / rect.height) * 200);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    }

    return (
        <div
            className="w-[280px] h-[350px] perspective-1000 flex items-center justify-center cursor-pointer"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <motion.div
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="relative w-full h-full rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-primary/50 shadow-2xl overflow-hidden"
            >

                <div
                    className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] opacity-20"
                    style={{ transform: "translateZ(20px)" }}
                />

                <div
                    className="absolute top-10 left-6 right-6 p-4 rounded-lg bg-gray-800/80 backdrop-blur border border-white/10 font-mono text-xs text-green-400 shadow-xl"
                    style={{ transform: "translateZ(60px)" }}
                >
                    <div className="mb-2 text-white/50">config.json</div>
                    {"{"}<br />
                    &nbsp;&nbsp;"role": "Master",<br />
                    &nbsp;&nbsp;"level": 999,<br />
                    &nbsp;&nbsp;"mode": "GOD"<br />
                    {"}"}
                </div>

                <div
                    className="absolute bottom-10 right-[-20px] w-32 h-32 rounded-full bg-primary/20 blur-xl"
                    style={{ transform: "translateZ(40px)" }}
                />
                <div
                    className="absolute bottom-12 right-6 w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center"
                    style={{ transform: "translateZ(80px)" }}
                >
                    <span className="text-xl font-bold text-white">JS</span>
                </div>

            </motion.div>
        </div>
    );
}
