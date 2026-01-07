"use client";

import { useEffect, useRef } from "react";

export function ParticleVortex() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = canvas.width = 300;
        let height = canvas.height = 300;
        const particles: any[] = [];

        for (let i = 0; i < 100; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2 + 1,
                angle: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.05 + 0.01,
                dist: Math.random() * 100 + 20
            });
        }

        const animate = () => {
            ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = "#ffffff";

            const cx = width / 2;
            const cy = height / 2;

            for (let p of particles) {
                p.angle += p.speed;
                p.x = cx + Math.cos(p.angle) * p.dist;
                p.y = cy + Math.sin(p.angle) * p.dist * 0.8;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            }

            requestAnimationFrame(animate);
        }

        const anim = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(anim);
    }, []);

    return (
        <div className="w-[300px] h-[300px] relative border rounded-xl overflow-hidden bg-black">
            <canvas ref={canvasRef} />
        </div>
    );
}
