"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { FileText, EyeOff, Scale } from "lucide-react";

const principles = [
    {
        icon: FileText,
        title: "The 30-Minute Problem",
        text: "The average privacy policy is over 4,000 words. Reading every policy for the sites you visit would take 250 hours a year. We built this to give those hours back."
    },
    {
        icon: EyeOff,
        title: "Beyond the Checkbox",
        text: "Agreeing to terms shouldn't mean surrendering your data. We highlight exactly what is being collected and, more importantly, who it's being sold to."
    },
    {
        icon: Scale,
        title: "Plain English Only",
        text: "Legal jargon is designed to be confusing. Our system distills complex clauses into simple risk scores so you can make informed decisions in real-time."
    }
];

export function AboutProject() {
    return (
        <section className="relative px-6 py-24 bg-white/[0.01]">
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="mx-auto max-w-5xl"
            >
                <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
                    <motion.div variants={fadeUp}>
                        <span className="text-[12px] font-bold tracking-[0.2em] text-primary uppercase opacity-60">The Mission</span>
                        <h2 className="mt-6 text-4xl font-semibold tracking-tight text-foreground leading-[1.2]">
                            Because privacy shouldn't <br /> require a law degree.
                        </h2>
                        <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                            ConsentLens started with a simple observation: we all click "Accept" because we don't have time to do anything else. This project is about shifting the power balance back to the user.
                        </p>
                        <div className="mt-10 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] border-l-primary border-l-4">
                            <p className="text-sm italic text-muted-foreground">
                                "Our goal isn't just to show you a score. It's to help you understand the digital footprint you're leaving behind, one website at a time."
                            </p>
                            <p className="mt-4 text-[12px] font-bold text-foreground opacity-80">— The ConsentLens Team</p>
                        </div>
                    </motion.div>

                    <motion.div variants={staggerContainer} className="grid gap-8">
                        {principles.map((item, i) => (
                            <motion.div key={i} variants={fadeUp} className="flex gap-4">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </motion.div>
        </section>
    );
}
