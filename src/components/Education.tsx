"use client";

import { MotionSection } from "@/components/ui/motion-section";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Education() {
    return (
        <section id="education" className="py-24 px-6 lg:px-24">
            <div className="max-w-4xl mx-auto">
                <MotionSection>
                    <h2 className="text-3xl font-bold mb-12 border-b border-border/50 pb-4">Education</h2>

                    <div className="space-y-8">
                        <MotionSection delay={0.1}>
                            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300">
                                <CardHeader>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <CardTitle className="text-xl text-primary">Universitat de Girona</CardTitle>
                                            <CardDescription className="text-lg font-semibold text-foreground">Bachelor&apos;s Degree Computer Engineering</CardDescription>
                                        </div>
                                        <div className="flex flex-col md:items-end gap-1 text-sm text-muted-foreground">
                                            <span className="font-bold text-primary">Jan 2021 - Present</span>
                                            <span>GPA: 7</span>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        </MotionSection>

                        <MotionSection delay={0.2}>
                            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300">
                                <CardHeader>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <CardTitle className="text-xl text-primary">Institut Sa Palomera</CardTitle>
                                            <CardDescription className="text-lg font-semibold text-foreground">Higher Technician Network Systems Administration</CardDescription>
                                        </div>
                                        <div className="flex flex-col md:items-end gap-1 text-sm text-muted-foreground">
                                            <span className="font-bold text-primary">Jan 2019 - Jan 2021</span>
                                            <span>GPA: 8</span>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        </MotionSection>
                    </div>
                </MotionSection>
            </div>
        </section>
    );
}
