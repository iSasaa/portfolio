"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Terminal } from "lucide-react";
import { useEffect, useState } from "react";
import { ModeToggle } from "./mode-toggle";

export default function NavBar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <motion.header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/80 backdrop-blur-md border-b border-border/40 py-4" : "bg-transparent py-6"}`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="container mx-auto px-6 lg:px-24 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
                    <Terminal className="w-6 h-6 text-primary" />
                    <span>JS<span className="text-primary">.dev</span></span>
                </div>

                <nav className="hidden md:flex items-center gap-8">
                    <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Home</a>
                    <a href="#experience" className="text-sm font-medium hover:text-primary transition-colors">Experience</a>
                    <a href="#education" className="text-sm font-medium hover:text-primary transition-colors">Education</a>
                    <a href="#projects" className="text-sm font-medium hover:text-primary transition-colors">Projects</a>
                    <a href="#skills" className="text-sm font-medium hover:text-primary transition-colors">Skills</a>
                    <a href="#contact" className="text-sm font-medium hover:text-primary transition-colors">Contact</a>
                </nav>

                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-2" asChild>
                        <a href="https://github.com/iSasaa" target="_blank" rel="noopener noreferrer">
                            GitHub
                        </a>
                    </Button>
                    <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2" asChild>
                        <a href="https://www.linkedin.com/in/joan-sasanedas-4b9b91205" target="_blank" rel="noopener noreferrer">
                            LinkedIn
                        </a>
                    </Button>
                    <div className="pl-4 border-l border-border/50">
                        <ModeToggle />
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
