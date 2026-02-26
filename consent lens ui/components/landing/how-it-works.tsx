"use client";

import { motion } from "framer-motion";
import { Globe, Brain, ShieldCheck } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/motion";

const steps = [
  {
    icon: Globe,
    step: "01",
    title: "Navigate Anywhere",
    description:
      "Browse the web like you normally do. No extra steps or configurations required.",
  },
  {
    icon: Brain,
    step: "02",
    title: "Instant Verification",
    description:
      "We scan hidden legal clauses and data sharing agreements while you browse the site.",
  },
  {
    icon: ShieldCheck,
    step: "03",
    title: "Plain English Insights",
    description:
      "Get a clear summary of what matters most—your data, your rights, and any potential risks.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative px-6 py-32">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="mx-auto max-w-6xl"
      >
        <motion.div variants={fadeUp} className="mb-16 text-center">
          <span className="text-[12px] font-medium tracking-widest text-primary uppercase">
            How it Works
          </span>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Three steps to privacy clarity
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground">
            No manual reading required. Install once and let us handle the rest.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <motion.div
              key={step.step}
              variants={fadeUp}
              className="glass-card group relative rounded-2xl p-8 transition-all duration-500 hover:shadow-[0_8px_40px_rgba(0,0,0,0.3),0_0_60px_rgba(124,92,252,0.06),inset_0_1px_0_rgba(255,255,255,0.1)]"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/[0.08] text-primary transition-colors duration-500 group-hover:bg-primary/[0.12]">
                  <step.icon className="h-5 w-5" />
                </div>
                <span className="font-mono text-[12px] text-muted-foreground/50">
                  {step.step}
                </span>
              </div>
              <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
