"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Globe, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { supabase } from "@/lib/supabase";

export function StatCards() {
  const [stats, setStats] = useState([
    { icon: Globe, label: "Total Scanned", value: "0", change: "Live", positive: true },
    { icon: AlertTriangle, label: "Risks Found", value: "0", change: "Detected", positive: true },
    { icon: CheckCircle, label: "Compliant Rate", value: "0%", change: "Safe", positive: true },
    { icon: TrendingUp, label: "Avg. Score", value: "0", change: "/ 100", positive: true },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("scans")
        .select("risk_score")
        .eq("user_id", user.id);

      if (!error && data) {
        const total = data.length;
        const risks = data.filter(s => s.risk_score < 40).length; // Low score = high risk in my logic or vice versa? 
        // Logic check: Extension uses (score/100)*180 for needle. 
        // In backend: score 100 is "Proceed Safely", 0 is "Avoid".
        // So High Score = Good, Low Score = Bad.

        const highRisks = data.filter(s => s.risk_score < 40).length; // Low score (<40) = Risky
        const compliant = data.filter(s => s.risk_score >= 70).length; // High score (>=70) = Compliant
        const avg = total > 0 ? Math.round(data.reduce((acc, s) => acc + s.risk_score, 0) / total) : 0;
        const compliantRate = total > 0 ? Math.round((compliant / total) * 100) : 0;

        setStats([
          { icon: Globe, label: "Total Scanned", value: total.toLocaleString(), change: "Live", positive: true },
          { icon: AlertTriangle, label: "Risks Found", value: highRisks.toString(), change: "Caution Required", positive: false },
          { icon: CheckCircle, label: "Compliant Rate", value: `${compliantRate}%`, change: "High Safety", positive: true },
          { icon: TrendingUp, label: "Avg. Score", value: avg.toString(), change: "/ 100", positive: true },
        ]);
      }
    };

    fetchStats();

    const channel = supabase.channel('stats-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'scans' }, fetchStats)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-4 w-full"
    >
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          variants={fadeUp}
          className="glass-card flex items-center justify-between rounded-2xl p-5"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.06] text-primary">
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[12px] text-muted-foreground">{stat.label}</p>
              <p className="text-xl font-semibold tracking-tight text-foreground">
                {stat.value}
              </p>
            </div>
          </div>
          <span className={`text-[11px] font-medium ${stat.positive ? 'text-accent' : 'text-destructive'}`}>
            {stat.change}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}
