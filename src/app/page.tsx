import Hero from "@/components/Hero";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import Education from "@/components/Education";
import Contact from "@/components/Contact";

import { Projects } from "@/components/Projects";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground antialiased selection:bg-primary/30 selection:text-primary">
      <Hero />
      <Experience />
      <Education />
      <Projects />
      <Skills />
      <Contact />
    </main>
  );
}
