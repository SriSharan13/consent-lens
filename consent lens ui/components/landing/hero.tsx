"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Chrome } from "lucide-react";
import { fadeUp, staggerContainer, easeOut } from "@/lib/motion";
import { InstallExtensionModal } from "@/components/InstallExtensionModal";

export function Hero() {
  const [showInstallModal, setShowInstallModal] = useState(false);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.04] blur-[120px]" />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center"
      >
        {/* Badge */}
        <motion.div
          variants={fadeUp}
          className="glass-subtle mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
        >
          <div className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="text-[12px] font-medium tracking-wide text-muted-foreground uppercase">
            No more hidden trackers
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl"
        >
          We read the fine print, <br />
          <span className="text-gradient-brand">so you don't have to.</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-6 max-w-xl text-pretty text-[17px] leading-relaxed text-muted-foreground"
        >
          The average privacy policy takes 30 minutes to read. ConsentLens surfaces trackers, data brokers, and your rights in seconds—directly in your browser.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <button
            onClick={() => setShowInstallModal(true)}
            className="group relative inline-flex h-11 items-center gap-2.5 rounded-xl bg-primary px-6 text-[14px] font-medium text-primary-foreground transition-all duration-300 hover:shadow-[0_0_32px_rgba(124,92,252,0.35)]"
          >
            <Chrome className="h-4 w-4" />
            Install Extension
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={fadeUp}
          className="mt-20 flex justify-center gap-12"
        >
          {[
            { value: "<2s", label: "Avg. Scan Time" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <span className="text-2xl font-semibold tracking-tight text-foreground">
                {stat.value}
              </span>
              <span className="text-[12px] text-muted-foreground">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <InstallExtensionModal
        open={showInstallModal}
        onOpenChange={setShowInstallModal}
      />
    </section>
  );
}
