"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { Search, Filter, ExternalLink, ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";

interface ScanEntry {
    id: string;
    site_url: string;
    risk_score: number;
    decision: string;
    reasons: string[];
    scanned_at: string;
}

export default function HistoryPage() {
    const [scans, setScans] = useState<ScanEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchScans = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data, error } = await supabase
                .from("scans")
                .select("*")
                .eq("user_id", user.id)
                .order("scanned_at", { ascending: false });

            if (!error && data) {
                setScans(data);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        const setupRealtime = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch initial data
            await fetchScans();

            // Real-time subscription
            const channel = supabase
                .channel('realtime-scans')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'scans',
                        filter: `user_id=eq.${user.id}`
                    },
                    (payload) => {
                        console.log('New scan detected:', payload);
                        setScans(prev => [payload.new as ScanEntry, ...prev]);
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };

        setupRealtime();
    }, []);

    const filteredScans = scans.filter(s =>
        s.site_url.toLowerCase().includes(search.toLowerCase()) ||
        s.decision.toLowerCase().includes(search.toLowerCase())
    );

    const riskColor = (score: number) => {
        if (score >= 70) return "text-accent";
        if (score >= 40) return "text-chart-5";
        return "text-destructive";
    };

    const RiskIcon = ({ score }: { score: number }) => {
        if (score >= 70) return <ShieldCheck className="h-4 w-4 text-accent" />;
        if (score >= 40) return <ShieldQuestion className="h-4 w-4 text-chart-5" />;
        return <ShieldAlert className="h-4 w-4 text-destructive" />;
    };

    return (
        <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Analysis History</h1>
                <p className="mt-2 text-muted-foreground">View and manage your previous privacy scans.</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search websites or decisions..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm hover:bg-white/[0.06] transition-colors font-medium">
                    <Filter className="h-4 w-4" />
                    Filter
                </button>
            </div>

            {loading ? (
                <div className="flex h-64 items-center justify-center text-muted-foreground">
                    Loading scans...
                </div>
            ) : (
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid gap-4"
                >
                    {filteredScans.map((scan) => (
                        <motion.div
                            key={scan.id}
                            variants={fadeUp}
                            className="glass-card p-6 rounded-2xl border border-white/[0.06] hover:border-white/10 transition-all group"
                        >
                            <div className="flex items-start justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <RiskIcon score={scan.risk_score} />
                                        <h3 className="text-lg font-semibold font-mono">{scan.site_url}</h3>
                                        <a
                                            href={`https://${scan.site_url}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Visit Website"
                                        >
                                            <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-primary" />
                                        </a>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Analyzed on {format(new Date(scan.scanned_at), "MMMM d, yyyy 'at' hh:mm a")}
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                        {scan.reasons.slice(0, 3).map((reason, i) => (
                                            <span key={i} className="text-[11px] px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.06] text-muted-foreground">
                                                {reason}
                                            </span>
                                        ))}
                                        {scan.reasons.length > 3 && (
                                            <span className="text-[11px] px-2 py-1 text-muted-foreground">
                                                +{scan.reasons.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right flex flex-col items-end">
                                    <div className={`text-2xl font-bold ${riskColor(scan.risk_score)}`}>
                                        {scan.risk_score}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Risk Score</div>
                                    <div className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${riskColor(scan.risk_score)} bg-white/[0.02] border border-white/[0.06]`}>
                                        {scan.decision}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {filteredScans.length === 0 && (
                        <div className="py-20 text-center text-muted-foreground">
                            No scans found matching your search.
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}
