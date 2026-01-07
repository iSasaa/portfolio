"use client";

import { useEffect, useRef } from "react";

export function PhysicsNetwork() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = canvas.width = 300;
        let height = canvas.height = 300;



        const particles: any[] = [];
        const springLength = 80;
        const k = 0.05;
        const damping = 0.9;

        for (let i = 0; i < 20; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: 0,
                vy: 0,
                radius: 4,
                isDragging: false
            });
        }

        let draggedParticle: any = null;
        let mouseX = 0;
        let mouseY = 0;

        const handleMouseDown = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;

            for (let p of particles) {
                const dx = p.x - mouseX;
                const dy = p.y - mouseY;
                if (dx * dx + dy * dy < 100) {
                    draggedParticle = p;
                    p.isDragging = true;
                    break;
                }
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        };

        const handleMouseUp = () => {
            if (draggedParticle) {
                draggedParticle.isDragging = false;
                draggedParticle = null;
            }
        };

        canvas.addEventListener("mousedown", handleMouseDown);
        canvas.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                let p = particles[i];

                if (p.isDragging) {
                    p.x = mouseX;
                    p.y = mouseY;
                    p.vx = 0;
                    p.vy = 0;
                } else {
                    for (let j = i + 1; j < particles.length; j++) {
                        let p2 = particles[j];
                        let dx = p2.x - p.x;
                        let dy = p2.y - p.y;
                        let distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < 100) {
                            const force = (distance - springLength) * k;
                            const fx = (dx / distance) * force;
                            const fy = (dy / distance) * force;

                            p.vx += fx;
                            p.vy += fy;
                            p2.vx -= fx;
                            p2.vy -= fy;

                            ctx.strokeStyle = `rgba(100, 100, 100, ${1 - distance / 100})`;
                            ctx.beginPath();
                            ctx.moveTo(p.x, p.y);
                            ctx.lineTo(p2.x, p2.y);
                            ctx.stroke();
                        }
                    }

                    p.vx *= damping;
                    p.vy *= damping;
                    p.x += p.vx;
                    p.y += p.vy;

                    if (p.x < 0 || p.x > width) p.vx *= -1;
                    if (p.y < 0 || p.y > height) p.vy *= -1;
                }

                ctx.fillStyle = p.isDragging ? "#ffffff" : "#64748b";
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            }

            requestAnimationFrame(animate);
        };

        const anim = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(anim);
            canvas.removeEventListener("mousedown", handleMouseDown);
            canvas.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    return (
        <div className="w-[300px] h-[300px] relative border rounded-xl overflow-hidden bg-background/50 backdrop-blur">
            <canvas ref={canvasRef} className="cursor-grab active:cursor-grabbing" />
            <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-muted-foreground pointer-events-none">TRY DRAGGING NODES</div>
        </div>
    );
}
