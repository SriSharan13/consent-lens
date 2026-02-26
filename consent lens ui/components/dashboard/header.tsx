"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User, Copy, Check, ChevronDown, LogOut, Settings as SettingsIcon, Bell } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function DashboardHeader() {
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        // First set the auth user
        setUser(data.user);

        // Then try to get the enriched profile from the database
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          // Merge profile data into user object for the UI
          setUser((prev: any) => ({
            ...prev,
            user_metadata: {
              ...prev?.user_metadata,
              full_name: profile.full_name,
              avatar_url: profile.avatar_url,
            }
          }));
        }
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/[0.06] bg-background/50 px-8 backdrop-blur-md z-40 relative">
      <div>
        <h2 className="text-[14px] font-medium text-foreground">Dashboard</h2>
        <p className="text-[11px] text-muted-foreground">Monitor and manage your privacy scans</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 h-10 px-2 rounded-full hover:bg-white/[0.04] transition-all group"
            title="User Profile Menu"
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary border border-primary/20 overflow-hidden">
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 mt-3 w-72 rounded-2xl bg-[#0d0d12] border border-white/[0.08] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Profile Header */}
                <div className="bg-gradient-to-br from-primary/10 via-transparent to-transparent p-6 pb-4">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="h-12 w-12 rounded-full border-2 border-primary/20 p-0.5 bg-black">
                      <img
                        src={user?.user_metadata?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                        alt="Avatar"
                        className="h-full w-full rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-foreground truncate">{user?.user_metadata?.full_name || "Syncing Name..."}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                  <div className="inline-flex px-2 py-0.5 rounded-md bg-accent/10 border border-accent/20 text-[9px] font-bold text-accent uppercase tracking-wider">
                    Premium Member
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2 pt-0">
                  <div className="h-[1px] bg-white/[0.06] mx-2 mb-2" />
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setShowDropdown(false)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-[13px] text-foreground hover:bg-white/[0.05] rounded-xl transition-colors group"
                  >
                    <User className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    Profile Overview
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setShowDropdown(false)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-[13px] text-foreground hover:bg-white/[0.05] rounded-xl transition-colors group"
                  >
                    <SettingsIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    Account Settings
                  </Link>
                  <div className="h-[1px] bg-white/[0.06] mx-2 my-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-[13px] text-destructive hover:bg-destructive/10 rounded-xl transition-colors group"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
