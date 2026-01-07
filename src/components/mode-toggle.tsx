"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"

export function ModeToggle() {
    const { setTheme, resolvedTheme } = useTheme()

    const toggleTheme = () => {
        if (resolvedTheme === "dark") {
            setTheme("light");
        } else {
            setTheme("dark");
        }
    }


    return (
        <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={{
                boxShadow: ["0px 0px 0px rgba(0,0,0,0)", "0px 0px 15px rgba(var(--primary), 0.5)", "0px 0px 0px rgba(0,0,0,0)"],
            }}
            transition={{
                boxShadow: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }
            }}
            className="rounded-full"
        >
            <Button
                variant="outline"
                size="icon"
                className="focus-visible:ring-0 relative rounded-full border-primary/50 bg-primary/10 hover:bg-primary/20 hover:text-primary transition-colors"
                onClick={toggleTheme}
            >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
            </Button>
        </motion.div>
    )

}
