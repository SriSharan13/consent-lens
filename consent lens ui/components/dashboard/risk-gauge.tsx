"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { easeOut } from "@/lib/motion";
import { supabase } from "@/lib/supabase";

export function RiskGauge() {
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchAvg = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("scans")
        .select("risk_score")
        .eq("user_id", user.id);

      if (!error && data && data.length > 0) {
        const avg = Math.round(data.reduce((acc, s) => acc + s.risk_score, 0) / data.length);
        setScore(avg);
      }
    };

    fetchAvg();

    const channel = supabase.channel('gauge-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'scans' }, fetchAvg)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  // Logic: 100 is Safe (Low Risk), 0 is Avoid (High Risk)
  const label = score >= 70 ? "Low Risk" : score >= 40 ? "Medium Risk" : "High Risk";
  const color = score >= 70 ? "text-accent" : score >= 40 ? "text-chart-5" : "text-destructive";

  return (
    <div className="glass-card flex flex-col items-center justify-center rounded-2xl p-8 h-full">
      <h3 className="mb-6 text-[12px] font-medium tracking-wide text-muted-foreground uppercase">
        Risk Profile
      </h3>
      <div className="relative flex h-52 w-52 items-center justify-center">
        <svg className="h-52 w-52 -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="6"
          />
          <motion.circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="url(#risk-gradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: easeOut, delay: 0.2 }}
          />
          <defs>
            <linearGradient id="risk-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7c5cfc" />
              <stop offset="100%" stopColor="#2dd4bf" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute flex flex-col items-center">
          <motion.span
            key={score}
            className="text-5xl font-semibold tracking-tight text-foreground"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="mt-1 text-[11px] text-muted-foreground">Average Score</span>
        </div>
      </div>
      <span className={`mt-6 text-[14px] font-semibold uppercase tracking-wider ${color}`}>
        {label}
      </span>
    </div>
  );
}
