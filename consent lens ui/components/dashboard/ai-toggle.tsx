"use client";

import { useState } from "react";
import { Cpu, Zap, Sparkles } from "lucide-react";

const modes = [
  { id: "hybrid", label: "Hybrid", icon: Zap, desc: "Best accuracy + speed" },
  { id: "local", label: "Local", icon: Cpu, desc: "On-device processing" },
  { id: "gemini", label: "Gemini", icon: Sparkles, desc: "Cloud AI analysis" },
] as const;

export function AiToggle() {
  const [activeMode, setActiveMode] = useState<string>("hybrid");

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-[12px] font-medium tracking-wide text-muted-foreground uppercase">
          AI Mode
        </h3>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          <span className="text-[11px] text-accent">Active</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setActiveMode(mode.id)}
            className={`flex items-center gap-3 rounded-xl p-3 text-left transition-all duration-300 ${
              activeMode === mode.id
                ? "border border-primary/20 bg-primary/[0.06] shadow-[0_0_20px_rgba(124,92,252,0.06)]"
                : "border border-transparent hover:bg-secondary"
            }`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-300 ${
                activeMode === mode.id
                  ? "bg-primary/15 text-primary"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              <mode.icon className="h-4 w-4" />
            </div>
            <div>
              <span
                className={`text-[13px] font-medium transition-colors duration-300 ${
                  activeMode === mode.id
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {mode.label}
              </span>
              <p className="text-[11px] text-muted-foreground/60">
                {mode.desc}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
