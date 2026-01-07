"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MotionSection } from "@/components/ui/motion-section";
export default function Experience() {
    const experiences = [
        {
            title: "Backend Developer",
            company: "Additio App",
            period: "Feb 2025 - Present",
            location: "Gerona, Cataluña, España",
            description: [
                "Developed complex business logic and functional features using Python.",
                "Implemented data visualization views and technical reports using XML and QWeb.",
                "Collaborated within an agile team to maintain code and deliver updates."
            ]
        },
        {
            title: "Information Technology System Administrator",
            company: "Re7Systems",
            period: "May 2023 - Oct 2023",
            location: "Lloret de Mar, Cataluña, España",
            description: [
                "Managed corporate infrastructure and Office 365 tenant security.",
                "Deployed virtualization environments using Proxmox and Synology NAS.",
                "Configured secure network policies for SMB clients."
            ]
        },
        {
            title: "IT Technician Workplace",
            company: "HIPRA",
            period: "Oct 2020 - Feb 2021",
            location: "Amer, Catalonia, Spain",
            description: [
                "Managed IT incidents and requests via SmartIT, ensuring strict SLA compliance.",
                "Administered Cisco telecommunications equipment, including VOIP and collaboration tools.",
                "Deployed enterprise hardware and mobile devices (MDM), managing warranties and asset lifecycles."
            ]
        }
    ];

    return (
        <section id="experience" className="py-24 px-6 relative">
            <div className="max-w-4xl mx-auto space-y-12">
                <MotionSection className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Professional Experience</h2>
                    <p className="text-muted-foreground text-lg">My journey in the tech industry.</p>
                </MotionSection>

                <div className="grid gap-8">
                    {experiences.map((exp, index) => (
                        <MotionSection key={index} delay={index * 0.1}>
                            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300">
                                <CardHeader>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <CardTitle className="text-xl text-primary">{exp.title}</CardTitle>
                                            <CardDescription className="text-lg font-semibold text-foreground">{exp.company}</CardDescription>
                                        </div>
                                        <div className="flex flex-col md:items-end gap-1 text-sm text-muted-foreground">
                                            <Badge variant="secondary" className="w-fit">{exp.period}</Badge>
                                            <span>{exp.location}</span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                        {exp.description.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </MotionSection>
                    ))}
                </div>
            </div>
        </section>
    );
}
