"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { MotionSection } from "@/components/ui/motion-section";

const coreSkills = [
    // Programming
    "Java", "C++", "Python", "JavaScript", "Node.js", "SQL", "PostgreSQL",
    "Odoo", "QWeb", "XML", "Software Development",
    // Systems & Tools
    "Git", "AWS", "Azure AZ-104", "Networking", "Office 365"
];

export default function Skills() {
    return (
        <section id="skills" className="py-24 px-6 lg:px-24 bg-secondary/10">
            <div className="max-w-5xl mx-auto">
                <MotionSection className="text-center">
                    <h2 className="text-3xl font-bold mb-8">Core Skills</h2>

                    <div className="flex flex-wrap justify-center gap-3">
                        {coreSkills.map((skill, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ scale: 1.1, rotate: 1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Badge
                                    variant="outline"
                                    className="px-4 py-2 text-base font-normal bg-background/50 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all cursor-default select-none"
                                >
                                    {skill}
                                </Badge>
                            </motion.div>
                        ))}
                    </div>
                </MotionSection>
            </div>
        </section>
    );
}
