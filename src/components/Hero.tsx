"use client";

import { Button } from "@/components/ui/button";
import { Download, Linkedin, Mail, MapPin } from "lucide-react";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { motion } from "framer-motion";
import { RacingGame, CAR_VARIANTS } from "./hero-visuals/RacingGame";
import { useState } from "react";

export default function Hero() {
    const [selectedCar, setSelectedCar] = useState(2);
    const [isGamePlaying, setIsGamePlaying] = useState(false);

    return (
        <section className="min-h-[90vh] flex items-center justify-center px-6 lg:px-24 pt-20 pb-12 relative overflow-hidden">

            <div className="absolute inset-0 -z-10 bg-background">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-60 dark:opacity-0 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px] opacity-0 dark:opacity-40 transition-opacity duration-500" />

                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                    className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[100px]"
                />
            </div>

            <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start py-12">

                <div className="space-y-8 text-center lg:text-left order-2 lg:order-1 lg:sticky lg:top-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-4"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            Available for work
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-tight snap-color">
                            Joan Sasanedas <br className="hidden lg:block" /> i Planella
                        </h1>
                        <h2 className="text-2xl md:text-3xl font-mono text-muted-foreground h-10">
                            <TypewriterEffect text="Backend Developer" />
                        </h2>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0"
                    >
                        Junior Software Developer with a <span className="text-foreground font-semibold snap-color">strong CS foundation</span>.
                        I architect scalable backend solutions using <span className="text-foreground font-semibold snap-color">Python</span>, <span className="text-foreground font-semibold snap-color">SQL</span>, <span className="text-foreground font-semibold snap-color">C++</span>, and <span className="text-foreground font-semibold snap-color">GitHub</span>.
                        Passionate about modern web development with <span className="text-foreground font-semibold snap-color">React</span> and <span className="text-foreground font-semibold snap-color">Next.js</span>.
                    </motion.p>



                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4"
                    >
                        <Button className="h-12 px-8 text-lg shadow-lg hover:shadow-primary/25 transition-all" asChild>
                            <a href="https://www.linkedin.com/in/joan-sasanedas-4b9b91205" target="_blank" rel="noopener noreferrer">
                                <Linkedin className="w-5 h-5 mr-2" />
                                LinkedIn
                            </a>
                        </Button>
                        <Button variant="outline" className="h-12 px-8 text-lg border-primary/20 hover:bg-primary/5 transition-all" asChild>
                            <a href={`${process.env.BASE_PATH || ''}/cv.pdf`} download="Joan_Sasanedas_CV.pdf">
                                <Download className="w-5 h-5 mr-2" />
                                Download CV
                            </a>
                        </Button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="flex items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground pt-4"
                    >
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span>Malgrat de Mar, Catalonia, ES</span>
                        </div>
                        <a href="mailto:joansasanedas@gmail.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                            <Mail className="w-4 h-4 text-primary" />
                            joansasanedas@gmail.com
                        </a>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative order-1 lg:order-2 flex flex-col items-center justify-center py-10 w-full"
                >
                    <div className="w-full max-w-4xl h-[350px]">
                        <RacingGame
                            selectedCar={selectedCar}
                            onGameStateChange={setIsGamePlaying}
                        />
                    </div>

                    <div className="relative h-12 flex justify-center items-center mt-4">
                        {/* CAR SELECTOR (Visible only when not driving) */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{
                                opacity: isGamePlaying ? 0 : 1,
                                y: isGamePlaying ? 10 : 0,
                                pointerEvents: isGamePlaying ? 'none' : 'auto'
                            }}
                            className="flex gap-3 p-2 bg-background/50 backdrop-blur-md rounded-full border border-primary/10 shadow-lg"
                        >
                            {CAR_VARIANTS.map((car, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedCar(i)}
                                    className={`w-6 h-6 rounded-full transition-all duration-300 relative ${selectedCar === i ? 'scale-125 ring-2 ring-primary ring-offset-2 ring-offset-background' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                                    style={{ background: car.color }}
                                    title={car.name}
                                >
                                    {selectedCar === i && (
                                        <motion.div
                                            layoutId="active-car-ring"
                                            className="absolute inset-0 rounded-full border-2 border-white"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </button>
                            ))}
                        </motion.div>
                    </div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 1.0 }}
                        className="text-sm font-mono text-primary/60 mt-4 text-center"
                    >
                        🎮 <span className="font-bold">Controls:</span> Use <span className="font-bold text-foreground">WASD</span> to drive + <span className="font-bold text-foreground">SPACE</span> to drift. No mouse needed.
                    </motion.p>
                </motion.div>

            </div>
        </section>
    );
}
