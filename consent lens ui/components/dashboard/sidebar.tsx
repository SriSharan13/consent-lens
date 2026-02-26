"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  LayoutDashboard,
  Clock,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
} from "lucide-react";

import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: Clock, label: "History", href: "/dashboard/history" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside
      className={`flex flex-col border-r border-white/[0.06] bg-sidebar transition-all duration-300 ${collapsed ? "w-16" : "w-56"
        }`}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-white/[0.06] px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Shield className="h-4 w-4" />
            </div>
            <span className="text-[14px] font-semibold tracking-tight text-sidebar-foreground">
              ConsentLens
            </span>
          </Link>
        )}
        {collapsed && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Shield className="h-4 w-4" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden text-muted-foreground transition-colors duration-200 hover:text-foreground lg:block"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <ChevronLeft
            className={`h-4 w-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""
              }`}
          />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex h-9 items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition-all duration-300 ${isActive
                ? "bg-primary/[0.08] text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/[0.06] p-3">
        <button
          onClick={handleLogout}
          className="flex h-9 w-full items-center gap-3 rounded-lg px-3 text-[13px] text-muted-foreground transition-all duration-300 hover:bg-secondary hover:text-foreground"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </aside>
  );
}
