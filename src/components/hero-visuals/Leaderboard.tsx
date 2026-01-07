"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { formatRaceTime } from './RaceTimer';

type Score = {
    name: string;
    time: number;
    date: string;
};

const DEFAULT_SCORES: Score[] = [
    { name: "SpeedDemon", time: 45000, date: new Date().toISOString() },
    { name: "Turbo", time: 52300, date: new Date().toISOString() },
    { name: "NoviceDriver", time: 65000, date: new Date().toISOString() },
];

export function Leaderboard({ newTime, onClose }: { newTime?: number, onClose: () => void }) {
    const [scores, setScores] = useState<Score[]>([]);
    const [name, setName] = useState('');
    const [submitted, setSubmitted] = useState(false);

    // Load Scores
    useEffect(() => {
        const stored = localStorage.getItem('racing-leaderboard');
        if (stored) {
            setScores(JSON.parse(stored));
        } else {
            setScores(DEFAULT_SCORES);
            localStorage.setItem('racing-leaderboard', JSON.stringify(DEFAULT_SCORES));
        }
    }, []);

    const handleSubmit = () => {
        if (!name.trim() || !newTime) return;

        const newScore: Score = {
            name: name.trim(),
            time: newTime,
            date: new Date().toISOString()
        };

        const updatedScores = [...scores, newScore].sort((a, b) => a.time - b.time).slice(0, 10); // Keep top 10
        setScores(updatedScores);
        localStorage.setItem('racing-leaderboard', JSON.stringify(updatedScores));
        setSubmitted(true);
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-md p-4">
            <div className="w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-2xl">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">
                        Leaderboard
                    </h2>
                    {newTime && (
                        <div className="mt-2 text-xl text-muted-foreground">
                            Your Time: <span className="text-primary font-mono font-bold">{formatRaceTime(newTime)}</span>
                        </div>
                    )}
                </div>

                {/* Submission Form */}
                {newTime && !submitted && (
                    <div className="mb-6 flex gap-2">
                        <input
                            type="text"
                            placeholder="Enter Nickname"
                            value={name}
                            onChange={(e) => setName(e.target.value.toUpperCase())}
                            maxLength={12}
                            className="flex-1 bg-background text-foreground px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary border border-input placeholder:text-muted-foreground"
                        />
                        <Button
                            onClick={handleSubmit}
                            disabled={!name.trim()}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                        >
                            Submit
                        </Button>
                    </div>
                )}

                {/* Table */}
                <div className="space-y-2 mb-6">
                    <div className="grid grid-cols-6 text-xs text-muted-foreground uppercase tracking-widest border-b border-border pb-2">
                        <div className="col-span-1">#</div>
                        <div className="col-span-3">Driver</div>
                        <div className="col-span-2 text-right">Time</div>
                    </div>
                    {scores.map((score, idx) => (
                        <div
                            key={idx}
                            className={`grid grid-cols-6 items-center text-sm font-mono py-1.5 px-2 rounded-md transition-colors
                                ${score.time === newTime && score.name === name ? 'bg-primary/10 text-primary font-bold' : 'text-foreground hover:bg-muted/50'}
                            `}
                        >
                            <div className="col-span-1 text-muted-foreground">{idx + 1}</div>
                            <div className="col-span-3 truncate">{score.name}</div>
                            <div className="col-span-2 text-right">{formatRaceTime(score.time)}</div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-center">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        Close & Restart
                    </Button>
                </div>
            </div>
        </div>
    );
}
