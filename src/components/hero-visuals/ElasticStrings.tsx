"use client";

import { useEffect, useRef } from "react";

export function ElasticStrings() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = canvas.width = 300;
        let height = canvas.height = 300;

        const strings: any[] = [];
        const stringCount = 10;
        const spacing = height / (stringCount + 1);

        for (let i = 0; i < stringCount; i++) {
            strings.push({
                y: (i + 1) * spacing,
                targetY: (i + 1) * spacing,
                velocity: 0,
                amplitude: 0,
                frequency: 0.1
            });
        }

        let mouseX = -100;
        let mouseY = -100;
        let py = -100;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;

            // Strum support
            const dy = mouseY - py;

            for (let s of strings) {
                if (Math.abs(mouseY - s.y) < 20 && Math.abs(mouseX - width / 2) < 150) {
                    s.velocity += dy * 0.5;
                }
            }
            py = mouseY;
        };

        canvas.addEventListener("mousemove", handleMouseMove);

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;

            for (let s of strings) {
                const force = (s.targetY - s.y) * 0.1;
                s.velocity += force;
                s.velocity *= 0.95;
                s.y += s.velocity;

                ctx.beginPath();
                ctx.moveTo(0, s.targetY);
                ctx.quadraticCurveTo(width / 2, s.y + (s.y - s.targetY), width, s.targetY);
                ctx.stroke();
            }

            requestAnimationFrame(animate);
        }
        const anim = requestAnimationFrame(animate);
        return () => {
            cancelAnimationFrame(anim);
            canvas.removeEventListener("mousemove", handleMouseMove);
        }
    }, []);

    return (
        <div className="w-[300px] h-[300px] relative border rounded-xl overflow-hidden bg-gradient-to-br from-indigo-900 to-black">
            <canvas ref={canvasRef} />
            <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-white/50 pointer-events-none">STRUM THE STRINGS</div>
        </div>
    );
}
