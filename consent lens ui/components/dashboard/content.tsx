"use client";

import { motion } from "framer-motion";
import { RiskGauge } from "./risk-gauge";
import { StatCards } from "./stat-cards";
import { HistoryTable } from "./history-table";
import { fadeUp, staggerContainer } from "@/lib/motion";

import Link from "next/link";

export function DashboardContent() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <span className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase opacity-80">Dashboard</span>
        <h1 className="mt-4 text-5xl font-bold tracking-tight text-foreground">
          Your privacy command center
        </h1>
        <p className="mt-6 text-muted-foreground max-w-lg mx-auto text-[15px] leading-relaxed">
          Monitor consent risks, track analysis history, and configure AI modes from one unified interface.
        </p>
      </div>

      {/* Main Dashboard Card */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="glass-card w-full max-w-[1200px] rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl"
      >
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-8 py-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[13px] font-medium text-foreground/90">ConsentLens Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="text-[11px] text-muted-foreground">AI Active</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="grid gap-6 p-8 lg:grid-cols-12">
          {/* Left: Gauge */}
          <motion.div variants={fadeUp} className="lg:col-span-4 h-full cursor-pointer hover:scale-[1.01] transition-transform">
            <Link href="/dashboard/analytics">
              <RiskGauge />
            </Link>
          </motion.div>

          {/* Middle: Stats List */}
          <motion.div variants={fadeUp} className="lg:col-span-4 h-full cursor-pointer hover:scale-[1.01] transition-transform">
            <Link href="/dashboard/analytics">
              <StatCards />
            </Link>
          </motion.div>

          {/* Right: History View */}
          <motion.div variants={fadeUp} className="lg:col-span-4 h-full cursor-pointer hover:scale-[1.01] transition-transform">
            <Link href="/dashboard/history">
              <HistoryTable />
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
