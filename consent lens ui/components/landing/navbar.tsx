"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Shield } from "lucide-react";
import { fadeIn } from "@/lib/motion";

export function Navbar() {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/");
        if (res.ok || res.status === 404) {
          // 404 is fine as long as the server responds
          setBackendOnline(true);
        } else {
          setBackendOnline(false);
        }
      } catch (e) {
        setBackendOnline(false);
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.header
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] backdrop-blur-xl"
      style={{
        background:
          "linear-gradient(180deg, rgba(10, 10, 15, 0.85) 0%, rgba(10, 10, 15, 0.70) 100%)",
        boxShadow:
          "0 4px 24px rgba(0, 0, 0, 0.2), inset 0 -1px 0 rgba(255, 255, 255, 0.04)",
      }}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Shield className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-semibold tracking-tight text-foreground">
              ConsentLens
            </span>
            <div className="flex items-center gap-1.5">
              <div
                className={`h-1.5 w-1.5 rounded-full ${backendOnline === true
                  ? "bg-accent shadow-[0_0_8px_rgba(45,212,191,0.5)]"
                  : backendOnline === false
                    ? "bg-destructive"
                    : "bg-muted-foreground/30"
                  }`}
              />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {backendOnline === true
                  ? "Backend Online"
                  : backendOnline === false
                    ? "Backend Offline"
                    : "Checking Backend..."}
              </span>
            </div>
          </div>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="#features"
            className="text-[13px] text-muted-foreground transition-colors duration-300 hover:text-foreground"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-[13px] text-muted-foreground transition-colors duration-300 hover:text-foreground"
          >
            How it Works
          </Link>

        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-[13px] text-muted-foreground transition-colors duration-300 hover:text-foreground"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="group relative inline-flex h-9 items-center rounded-lg bg-primary px-4 text-[13px] font-medium text-primary-foreground transition-all duration-300 hover:shadow-[0_0_24px_rgba(124,92,252,0.3)]"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}
