"use client";

import { Button } from "@/components/ui/button";
import { Github, Linkedin, Mail } from "lucide-react";
import { MotionSection } from "@/components/ui/motion-section";

export default function Contact() {
    return (
        <section id="contact" className="py-24 px-6 lg:px-24 bg-card/30 border-t border-border/40">
            <MotionSection className="max-w-4xl mx-auto text-center space-y-8">
                <h2 className="text-3xl font-bold">Contact</h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                    Malgrat de Mar, Catalonia
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Button variant="outline" className="h-14 px-8 w-full sm:w-auto text-lg gap-3" asChild>
                        <a href="mailto:joansasanedas@gmail.com">
                            <Mail className="w-5 h-5 text-primary" />
                            joansasanedas@gmail.com
                        </a>
                    </Button>

                    <Button variant="outline" className="h-14 px-8 w-full sm:w-auto text-lg gap-3" asChild>
                        <a href="https://www.linkedin.com/in/joan-sasanedas-4b9b91205" target="_blank" rel="noopener noreferrer">
                            <Linkedin className="w-5 h-5 text-primary" />
                            LinkedIn
                        </a>
                    </Button>
                </div>

                <div className="pt-16 text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Joan Sasanedas i Planella.</p>
                </div>
            </MotionSection>
        </section>
    );
}
