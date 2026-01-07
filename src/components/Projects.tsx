"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    ExternalLink,
    Github,
    Smartphone,
    Monitor,
    Terminal,
    Database,
    Code2,
    Search
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const projects = [
    {
        title: "RollerMat",
        description: "Official website for RollerMat. A modern, responsive web application.",
        tags: ["Web", "Frontend"],
        link: "https://rollermat.es/",
        icon: <Monitor className="w-6 h-6" />,
        type: "Professional"
    },
    {
        title: "Personal Portfolio",
        description: "My interactive CV brought to life. Features a fully playable 3D car minigame where you can drive through my experience or compete in a fun time-trial race.",
        tags: ["React", "Next.js", "Three.js", "Tailwind"],
        link: "#",
        icon: <Code2 className="w-6 h-6" />,
        type: "Personal"
    },
    {
        title: "BookAir",
        description: "Flight search engine mobile app clonning Skyscanner's core functionality. Specialized in NoSQL data handling.",
        tags: ["Flutter", "Spring Boot", "ElasticSearch", "NoSQL"],
        link: null,
        icon: <Search className="w-6 h-6" />,
        type: "University"
    },
    {
        title: "Amazon Clone",
        description: "Fully functional e-commerce mobile application replicating Amazon's shopping experience.",
        tags: ["Android Studio", "Spring Boot", "Java"],
        link: null,
        icon: <Smartphone className="w-6 h-6" />,
        type: "University"
    },
    {
        title: "Be Water",
        description: "Water distribution network simulation and management tool. Optimizes resource allocation during drought scenarios.",
        tags: ["Java", "Algorithmic", "Simulation"],
        link: null,
        icon: <Database className="w-6 h-6" />,
        type: "University"
    },
    {
        title: "Exam Schedule Generator",
        description: "Optimized exam timetable generator. Parses CSV inputs to resolve conflicts between subjects, degrees, and incompatibilities automatically.",
        tags: ["C++", "Backtracking", "Optimization"],
        link: null,
        icon: <Terminal className="w-6 h-6" />,
        type: "University"
    },
    {
        title: "Solitaire CLI",
        description: "Classic Solitaire card game implemented entirely in C++ for the terminal.",
        tags: ["C++", "CLI", "Game Dev"],
        link: null,
        icon: <Terminal className="w-6 h-6" />,
        type: "University"
    }
];

export function Projects() {
    return (
        <section id="projects" className="py-20 relative overflow-hidden">
            <div className="container mx-auto px-4 z-10 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="mb-12 text-center"
                >
                    <h2 className="text-4xl font-bold mb-4 tracking-tight">Featured Projects</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        A showcase of my professional work, personal hobbies, and university achievements.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <Card className="h-full bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all hover:bg-card/80 group">
                                <CardHeader>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:scale-110 transition-transform duration-300">
                                            {project.icon}
                                        </div>
                                        <Badge variant={project.type === "Professional" ? "default" : "secondary"}>
                                            {project.type}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-xl mb-2">{project.title}</CardTitle>
                                    <CardDescription className="line-clamp-3">
                                        {project.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {project.tags.map((tag, i) => (
                                            <Badge key={i} variant="outline" className="text-xs bg-background/50">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                    {project.link && (
                                        <Button variant="ghost" size="sm" className="w-full group/btn" asChild>
                                            <a href={project.link} target="_blank" rel="noopener noreferrer">
                                                Visit Project
                                                <ExternalLink className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                            </a>
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="mt-16 text-center"
                >
                    <Button variant="outline" size="lg" className="rounded-full px-8 border-primary/20 hover:bg-primary/10 transition-all group" asChild>
                        <a href="https://github.com/iSasaa" target="_blank" rel="noopener noreferrer">
                            <Github className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                            View More on GitHub
                        </a>
                    </Button>
                </motion.div>
            </div>
        </section>
    );
}
