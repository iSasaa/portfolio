"use client";

import { useEffect, useRef } from "react";

export function GravityGrid() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = canvas.width = 300;
        let height = canvas.height = 300;

        const spacing = 20;
        let mouseX = -1000;
        let mouseY = -1000;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        };

        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mouseleave", () => { mouseX = -1000; mouseY = -1000; });

        const animate = () => {
            // Calculate inverse square law attraction for grid points
            ctx.clearRect(0, 0, width, height);
            ctx.strokeStyle = "rgba(100, 100, 100, 0.4)";
            ctx.lineWidth = 1;

            for (let x = 0; x <= width; x += spacing) {
                for (let y = 0; y <= height; y += spacing) {
                    const dx = x - mouseX;
                    const dy = y - mouseY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const maxDist = 100;

                    let drawX = x;
                    let drawY = y;

                    if (dist < maxDist) {
                        const force = (maxDist - dist) / maxDist;
                        const angle = Math.atan2(dy, dx);
                        const moveDist = force * 20;
                        drawX -= Math.cos(angle) * moveDist;
                        drawY -= Math.sin(angle) * moveDist;
                    }

                    ctx.fillStyle = "rgba(100, 100, 100, 0.8)";
                    ctx.beginPath();
                    ctx.arc(drawX, drawY, 1, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

        };

        const anim = requestAnimationFrame(animate);
        return () => {
            cancelAnimationFrame(anim);
            canvas.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    return (
        <div className="w-[300px] h-[300px] relative border rounded-xl overflow-hidden bg-background/50 backdrop-blur">
            <canvas ref={canvasRef} />
            <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-muted-foreground pointer-events-none">MOVE MOUSE</div>
        </div>
    );
}
