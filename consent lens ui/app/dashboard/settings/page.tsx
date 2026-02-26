"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User, Mail, Shield, Smartphone, Globe, Bell, Key, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const [profile, setProfile] = useState<any>(null);
    const router = useRouter();

    const [autoSync, setAutoSync] = useState(true);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                supabase.from('profiles').select('*').eq('id', user.id).single()
                    .then(({ data }) => setProfile(data || { id: user.id, full_name: user.user_metadata.full_name, avatar_url: user.user_metadata.avatar_url, email: user.email }));
            }
        });
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
    };

    return (
        <div className="flex flex-col gap-8 p-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
                <p className="mt-2 text-muted-foreground">Manage your account and privacy preferences.</p>
            </div>

            <motion.div variants={fadeUp} initial="hidden" animate="visible" className="grid gap-6">
                {/* Profile Section */}
                <section className="glass-card p-8 rounded-3xl border border-white/[0.08]">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" /> Profile Details
                    </h3>
                    <div className="flex items-center gap-6 mb-8">
                        <div className="h-20 w-20 rounded-full border-2 border-primary/20 p-1 bg-gradient-to-br from-primary/10 to-transparent">
                            <img
                                src={profile?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                                alt="Avatar"
                                className="h-full w-full rounded-full object-cover"
                            />
                        </div>
                        <div>
                            <p className="text-xl font-bold">{profile?.full_name || "Syncing..."}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <Mail className="h-3 w-3" /> {profile?.email || "Email Hidden"}
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                            <label className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Full Name</label>
                            <p className="text-sm font-medium mt-1">{profile?.full_name || "..."}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                            <label className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">User ID</label>
                            <p className="text-sm font-mono mt-1 opacity-50 truncate">{profile?.id}</p>
                        </div>
                    </div>
                </section>

                {/* Security Section */}
                <section className="glass-card p-8 rounded-3xl border border-white/[0.08]">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-accent" /> Security & Privacy
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                            <div className="flex items-center gap-3">
                                <Smartphone className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <h4 className="text-sm font-medium">Automatic Sync</h4>
                                    <p className="text-[11px] text-muted-foreground">Keep extension synced with dashboard</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setAutoSync(!autoSync)}
                                className={`h-6 w-12 rounded-full relative transition-colors duration-200 ${autoSync ? 'bg-accent' : 'bg-white/10'}`}
                                title="Toggle Automatic Sync"
                            >
                                <div className={`absolute top-1 h-4 w-4 bg-white rounded-full transition-all duration-200 ${autoSync ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                            <div className="flex items-center gap-3">
                                <Globe className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <h4 className="text-sm font-medium">Browser Integration</h4>
                                    <p className="text-[11px] text-muted-foreground">Chrome Extension status: Active</p>
                                </div>
                            </div>
                            <div className="px-3 py-1 bg-accent/10 text-accent text-[10px] font-bold rounded-md">CONNECTED</div>
                        </div>
                    </div>
                </section>

                {/* Account Actions */}
                <div className="flex items-center gap-4 mt-4">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-8 py-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl text-sm font-bold hover:bg-destructive/15 transition-all"
                    >
                        <LogOut className="h-4 w-4" /> Sign Out from Dashboard
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
