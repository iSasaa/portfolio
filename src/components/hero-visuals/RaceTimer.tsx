"use client";

import { useEffect, useState, useRef } from 'react';

export function RaceTimer({ isRunning, startTime, onFinish }: { isRunning: boolean, startTime: number | null, onFinish?: (time: number) => void }) {
    const [elapsed, setElapsed] = useState(0);
    const frameRef = useRef<number>(0);

    useEffect(() => {
        if (isRunning && startTime) {
            const update = () => {
                const now = Date.now();
                setElapsed(now - startTime);
                frameRef.current = requestAnimationFrame(update);
            };
            frameRef.current = requestAnimationFrame(update);
        } else if (!isRunning && startTime) {
            // Stopped
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        } else {
            setElapsed(0);
        }

        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [isRunning, startTime]);

    // Format mm:ss.ms
    const formatTime = (ms: number) => {

        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const millis = Math.floor((ms % 1000) / 10); // Show 2 digits
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(2, '0')}`;
    };

    return (
        <div className="font-mono text-2xl font-black tracking-wider text-white tabular-nums drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            <span className="text-yellow-400">TIME:</span> {formatTime(elapsed)}
        </div>
    );
}

// Utility for formatting time elsewhere
export const formatRaceTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const millis = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(2, '0')}`;
};
