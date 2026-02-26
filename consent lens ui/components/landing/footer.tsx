"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/motion";

export function Footer() {
  return (
    <motion.footer
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      className="border-t border-white/[0.06]"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 py-16">
        <motion.div variants={fadeUp} className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Shield className="h-4 w-4" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            ConsentLens
          </span>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="flex items-center gap-8"
        >
          {["Privacy", "Terms", "Docs", "GitHub", "Contact"].map((link) => (
            <a
              key={link}
              href="#"
              className="text-[13px] text-muted-foreground transition-colors duration-300 hover:text-foreground"
            >
              {link}
            </a>
          ))}
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="text-[12px] text-muted-foreground/60"
        >
          {"2026 ConsentLens. All rights reserved."}
        </motion.p>
      </div>
    </motion.footer>
  );
}
