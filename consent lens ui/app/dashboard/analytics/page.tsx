"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BarChart2, PieChart, Activity, Shield, Target, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";

export default function AnalyticsPage() {
    const [stats, setStats] = useState({
        total: 0,
        avgScore: 0,
        safeCount: 0,
        riskyCount: 0
    });

    const fetchStats = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data, error } = await supabase
                .from("scans")
                .select("risk_score")
                .eq("user_id", user.id);

            if (!error && data) {
                const total = data.length;
                const avg = total > 0 ? Math.round(data.reduce((acc: number, s: any) => acc + s.risk_score, 0) / total) : 0;
                const safe = data.filter(s => s.risk_score >= 70).length;
                const risky = data.filter(s => s.risk_score < 40).length;
                setStats({ total, avgScore: avg, safeCount: safe, riskyCount: risky });
            }
        }
    };

    useEffect(() => {
        const setupRealtime = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await fetchStats();

            const channel = supabase
                .channel('analytics-realtime')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'scans',
                        filter: `user_id=eq.${user.id}`
                    },
                    () => {
                        fetchStats();
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };

        setupRealtime();
    }, []);

    return (
        <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Privacy Analytics</h1>
                    <p className="mt-2 text-muted-foreground">Deep insights into your digital privacy footprint.</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[12px] font-bold uppercase tracking-wider">Live Analysis</span>
                </div>
            </div>

            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
            >
                <motion.div variants={fadeUp} className="glass-card p-6 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent">
                    <Activity className="h-5 w-5 text-primary mb-4" />
                    <h3 className="text-sm text-muted-foreground">Total Analyzed</h3>
                    <p className="text-4xl font-bold mt-2">{stats.total}</p>
                </motion.div>

                <motion.div variants={fadeUp} className="glass-card p-6 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent">
                    <Shield className="h-5 w-5 text-accent mb-4" />
                    <h3 className="text-sm text-muted-foreground">Safe Decisions</h3>
                    <p className="text-4xl font-bold text-accent mt-2">{stats.safeCount}</p>
                </motion.div>

                <motion.div variants={fadeUp} className="glass-card p-6 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent">
                    <Target className="h-5 w-5 text-chart-5 mb-4" />
                    <h3 className="text-sm text-muted-foreground">Average Score</h3>
                    <p className="text-4xl font-bold mt-2">{stats.avgScore}</p>
                </motion.div>

                <motion.div variants={fadeUp} className="glass-card p-6 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent">
                    <Zap className="h-5 w-5 text-destructive mb-4" />
                    <h3 className="text-sm text-muted-foreground">High Risk Detected</h3>
                    <p className="text-4xl font-bold text-destructive mt-2">{stats.riskyCount}</p>
                </motion.div>
            </motion.div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="glass-card p-8 rounded-3xl border border-white/[0.08] min-h-[400px]">
                    <div className="flex items-center gap-3 mb-8">
                        <BarChart2 className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Risk Distribution</h3>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm"><span className="text-accent">Safe (70-100)</span><span>{stats.safeCount} scans</span></div>
                            <div className="h-3 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.06]">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${(stats.safeCount / stats.total) * 100}%` }} className="h-full bg-accent" transition={{ duration: 1, ease: "easeOut" }} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm"><span className="text-chart-5">Medium (40-69)</span><span>{stats.total - stats.safeCount - stats.riskyCount} scans</span></div>
                            <div className="h-3 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.06]">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${((stats.total - stats.safeCount - stats.riskyCount) / stats.total) * 100}%` }} className="h-full bg-chart-5" transition={{ duration: 1, ease: "easeOut" }} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm"><span className="text-destructive">Risky (0-39)</span><span>{stats.riskyCount} scans</span></div>
                            <div className="h-3 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.06]">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${(stats.riskyCount / stats.total) * 100}%` }} className="h-full bg-destructive" transition={{ duration: 1, ease: "easeOut" }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-8 rounded-3xl border border-white/[0.08] min-h-[400px] flex flex-col items-center justify-center text-center">
                    <PieChart className="h-12 w-12 text-muted-foreground/20 mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground/50 italic font-mono uppercase tracking-tighter">Advanced Analytics</h3>
                    <p className="mt-2 text-muted-foreground/40 max-w-[280px]">Weekly privacy trends and pattern analysis incoming in v1.3</p>
                    <div className="mt-8 px-6 py-2 bg-white/[0.02] border border-white/[0.06] rounded-full text-[11px] text-muted-foreground/60">SYSTEM STATUS: OPTIMIZING</div>
                </div>
            </div>
        </div>
    );
}
