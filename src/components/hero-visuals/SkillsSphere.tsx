"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const skills = [
    "Python", "React", "Next.js", "SQL", "C++",
    "Git", "Docker", "AWS", "Node", "TypeScript",
    "Linux", "Azure"
];

export function SkillsSphere() {
    const [items, setItems] = useState<{ skill: string; x: number; y: number; z: number }[]>([]);

    useEffect(() => {
        const newItems = skills.map((skill, i) => {
            const theta = Math.acos(-1 + (2 * i) / skills.length);
            const phi = Math.sqrt(skills.length * Math.PI) * theta;
            const x = 120 * Math.sin(theta) * Math.cos(phi);
            const y = 120 * Math.sin(theta) * Math.sin(phi);
            const z = 120 * Math.cos(theta);
            return { skill, x, y, z };
        });
        setItems(newItems);
    }, []);

    if (items.length === 0) {
        return <div className="w-[300px] h-[300px]" />; // Placeholder to avoid layout shift
    }

    return (
        <div className="relative w-[300px] h-[300px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 animate-spin-slow-3d transform-style-3d">
                {items.map((item, i) => (
                    <motion.div
                        key={item.skill}
                        className="absolute text-sm font-bold text-primary"
                        style={{
                            transform: `translate3d(${item.x}px, ${item.y}px, ${item.z}px)`,
                        }}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
                    >
                        {item.skill}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
