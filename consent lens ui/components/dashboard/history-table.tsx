"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";

interface ScanEntry {
  id: string;
  site_url: string;
  scanned_at: string;
  risk_score: number;
  decision: string;
}

function riskLevel(score: number) {
  if (score >= 70) return "Low";
  if (score >= 40) return "Medium";
  return "High";
}

function riskColor(score: number) {
  const risk = riskLevel(score);
  if (risk === "Low") return "text-accent";
  if (risk === "Medium") return "text-chart-5";
  return "text-destructive";
}

function riskBg(score: number) {
  const risk = riskLevel(score);
  if (risk === "Low") return "bg-accent/10";
  if (risk === "Medium") return "bg-chart-5/10";
  return "bg-destructive/10";
}

export function HistoryTable() {
  const [scans, setScans] = useState<ScanEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScans = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("scans")
          .select("*")
          .eq("user_id", user.id)
          .order("scanned_at", { ascending: false })
          .limit(6);

        if (!error && data) {
          setScans(data);
        }
      }
      setLoading(false);
    };

    fetchScans();

    const channel = supabase.channel('recent-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'scans' }, fetchScans)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
        <p className="text-muted-foreground text-[12px]">Loading scans...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden p-6">
      <h3 className="mb-6 flex items-center gap-2 text-[12px] font-medium tracking-wide text-muted-foreground uppercase">
        <span className="opacity-50">👁️</span> Recent Scans
      </h3>
      <div className="flex flex-col gap-3">
        {scans.length === 0 ? (
          <div className="py-10 text-center text-[12px] text-muted-foreground italic">
            No scans detected yet.
          </div>
        ) : (
          scans.map((entry) => (
            <div
              key={entry.id}
              className="group flex items-center justify-between rounded-xl bg-white/[0.03] p-4 border border-white/[0.04] transition-all hover:bg-white/[0.06] hover:border-white/[0.1] hover:translate-x-1"
            >
              <span className="font-mono text-[13px] text-foreground/80 group-hover:text-foreground">
                {entry.site_url}
              </span>
              <span
                className={`text-[12px] font-semibold ${riskColor(entry.risk_score)}`}
              >
                {riskLevel(entry.risk_score)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
