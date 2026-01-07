"use client";

import { useEffect, useRef } from "react";

export function MagneticParticles() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        let width = canvas.width = 300;
        let height = canvas.height = 300;



        ctx.fillStyle = "white";
        ctx.font = "bold 150px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("DEV", width / 2, height / 2);

        const imageData = ctx.getImageData(0, 0, width, height);
        ctx.clearRect(0, 0, width, height);

        const particles: any[] = [];
        const density = 4;

        for (let y = 0; y < height; y += density) {
            for (let x = 0; x < width; x += density) {
                const index = (y * width + x) * 4;
                const alpha = imageData.data[index + 3];
                if (alpha > 128) {
                    particles.push({
                        originX: x,
                        originY: y,
                        x: x,
                        y: y,
                        vx: 0,
                        vy: 0,
                        color: `hsl(${Math.random() * 60 + 200}, 80%, 60%)`
                    });
                }
            }
        }

        let mouseX = -1000;
        let mouseY = -1000;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        }

        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mouseleave", () => { mouseX = -1000; mouseY = -1000 });

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            for (let p of particles) {
                const dx = mouseX - p.x;
                const dy = mouseY - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const maxDistance = 80;
                const force = (maxDistance - distance) / maxDistance;

                if (distance < maxDistance) {

                    const repelForce = 5 + force * 20;
                    p.vx -= forceDirectionX * repelForce;
                    p.vy -= forceDirectionY * repelForce;
                }

                const homeDx = p.originX - p.x;
                const homeDy = p.originY - p.y;
                p.vx += homeDx * 0.05;
                p.vy += homeDy * 0.05;

                p.vx *= 0.85;
                p.vy *= 0.85;

                p.x += p.vx;
                p.y += p.vy;

                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, 2, 2);
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
        <div className="w-[300px] h-[300px] relative border rounded-xl overflow-hidden bg-background">
            <canvas ref={canvasRef} />
            <div className="absolute inset-0 flex items-center justify-center -z-10">
                <span className="text-muted-foreground/10 text-6xl font-bold">LOADING</span>
            </div>
        </div>
    );
}
