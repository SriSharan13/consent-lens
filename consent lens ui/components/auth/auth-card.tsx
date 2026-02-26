"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { scaleIn, easeOut } from "@/lib/motion";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface AuthCardProps {
  mode: "login" | "signup";
}

export function AuthCard({ mode }: AuthCardProps) {
  const isLogin = mode === "login";
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    try {
      let authResponse;
      if (isLogin) {
        authResponse = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });
        if (authResponse.error) throw authResponse.error;
      } else {
        authResponse = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              full_name: name,
              avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail}`
            },
          },
        });

        if (authResponse.error) {
          if (authResponse.error.message.includes("already registered")) {
            throw new Error("This email is already registered. Please sign in instead.");
          }
          throw authResponse.error;
        }

        // Handle case where email confirmation is required
        if (authResponse.data?.user && !authResponse.data.session) {
          alert("Success! Please check your email inbox to verify your account before logging in.");
          setLoading(false);
          router.push("/login");
          return;
        }
      }

      const user = authResponse.data.user;
      if (user) {
        // Enforce storage in our 'profiles' table for all auth methods
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: user.id,
          full_name: user.user_metadata?.full_name || name || (isLogin ? "User" : "New User"),
          avatar_url: user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
          updated_at: new Date().toISOString(),
        });

        if (profileError) {
          console.warn("Profile sync warning:", profileError.message);
        }
      }

      if (!isLogin) {
        alert("Account successfully created! You can now log in.");
        window.location.href = "/";
        return;
      }

      router.push("/dashboard");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      alert(error.message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-6">
      {/* Background glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.04] blur-[100px]" />

      <motion.div
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-sm"
      >
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Shield className="h-5 w-5" />
            </div>
          </Link>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-[13px] text-muted-foreground">
            {isLogin
              ? "Sign in to access your dashboard"
              : "Get started with ConsentLens today"}
          </p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8">
          <form onSubmit={handleAuth} className="flex flex-col gap-5">
            {!isLogin && (
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="name"
                  className="text-[12px] font-medium text-muted-foreground"
                >
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Smith"
                  className="h-10 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 text-[14px] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] placeholder:text-muted-foreground/40 transition-all duration-300 focus:border-primary/30 focus:bg-white/[0.05] focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-[12px] font-medium text-muted-foreground"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="h-10 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 text-[14px] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] placeholder:text-muted-foreground/40 transition-all duration-300 focus:border-primary/30 focus:bg-white/[0.05] focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="text-[12px] font-medium text-muted-foreground"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="h-10 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 text-[14px] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] placeholder:text-muted-foreground/40 transition-all duration-300 focus:border-primary/30 focus:bg-white/[0.05] focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group mt-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-[14px] font-medium text-primary-foreground transition-all duration-300 hover:shadow-[0_0_32px_rgba(124,92,252,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {isLogin ? "Sign in" : "Create account"}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span className="text-[11px] text-muted-foreground/50">or</span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="glass-inner flex h-10 w-full items-center justify-center gap-2 rounded-lg text-[13px] text-muted-foreground transition-all duration-300 hover:bg-white/[0.06] hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </button>
        </div>

        {/* Switch */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5, ease: easeOut }}
          className="mt-6 text-center text-[13px] text-muted-foreground"
        >
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Link
            href={isLogin ? "/signup" : "/login"}
            className="text-primary transition-colors duration-300 hover:text-primary/80"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
