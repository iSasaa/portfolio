"use client";

import { useEffect, useRef } from "react";

export function TiltedGrid() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = canvas.width = 300;
        let height = canvas.height = 300;

        let offsetY = 0;
        let offsetX = 0;
        let speed = 1;
        let mouseX = 0;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            mouseX = x * 0.1; // Parallax factor
        }

        canvas.addEventListener("mousemove", handleMouseMove);

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, "#000");
            gradient.addColorStop(1, "#1a1a2e");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            ctx.save();
            ctx.translate(width / 2, height / 2);

            ctx.strokeStyle = "rgba(0, 255, 255, 0.5)";
            ctx.lineWidth = 1;

            const fov = 200;
            const viewY = -100;

            offsetY = (offsetY + speed) % 40;
            offsetX += (mouseX - offsetX) * 0.05;

            ctx.beginPath();

            for (let z = 0; z < 600; z += 40) {
                const zPos = z - offsetY;
                if (zPos < 10) continue;

                const scale = fov / (fov + zPos);
                const y2d = (zPos + viewY) * scale + 50;

                const w = width * 4 * scale;

                ctx.moveTo(-w + offsetX * scale, y2d);
                ctx.lineTo(w + offsetX * scale, y2d);
            }

            for (let x = -600; x < 600; x += 40) {
                const xStart = x;
                const zStart = 0;
                const scaleStart = fov / (fov + zStart);

                const xEnd = x;
                const zEnd = 600;
                const scaleEnd = fov / (fov + zEnd);

                ctx.moveTo((x - offsetX) * 2, height);
                ctx.lineTo((x * 0.1 - offsetX * 0.1), 0);
            }

            ctx.stroke();
            ctx.restore();

            const glow = ctx.createRadialGradient(width / 2, 0, 10, width / 2, 20, 200);
            glow.addColorStop(0, "rgba(255, 0, 255, 0.8)");
            glow.addColorStop(1, "transparent");
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, width, 100);

            requestAnimationFrame(animate);
        }

        const anim = requestAnimationFrame(animate);
        return () => {
            cancelAnimationFrame(anim);
            canvas.removeEventListener("mousemove", handleMouseMove);
        }
    }, []);

    return (
        <div className="w-[300px] h-[300px] relative border rounded-xl overflow-hidden bg-black">
            <canvas ref={canvasRef} />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black to-transparent pointer-events-none" />
        </div>
    );
}
