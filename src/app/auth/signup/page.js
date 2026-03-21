"use client";

import Link from "next/link";
import TopNavBar from "@/components/TopNavBar";
import Footer from "@/components/Footer";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "signup", email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Sign up failed");
      // Sign in right away after successful registration
      const signinRes = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "signin", email, password }),
      });
      const signinData = await signinRes.json();
      if (!signinRes.ok) throw new Error(signinData.error ?? "Sign in after registration failed");
      sessionStorage.setItem("session_id", signinData.sessionId);
      sessionStorage.setItem("user_id", signinData.userId);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TopNavBar />

      <main className="relative flex flex-grow items-center justify-center overflow-hidden px-6">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/5 rounded-full blur-[100px]"></div>

        <section className="z-10 w-full max-w-md py-16">
          <div className="mb-12 space-y-2">
            <h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface">
              Create account
            </h1>
            <p className="text-on-surface-variant">
              Start estimating your study time smarter.
            </p>
          </div>

          <div className="relative rounded-xl border border-outline-variant/15 bg-surface-container-low p-8 shadow-2xl">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <span className="material-symbols-outlined text-4xl text-primary">
                school
              </span>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-error-container/20 px-4 py-3 text-sm text-error">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Name */}
              <div className="space-y-2">
                <label
                  className="font-label text-xs font-semibold uppercase tracking-widest text-on-surface-variant"
                  htmlFor="name"
                >
                  Full Name
                </label>
                <input
                  className="w-full rounded-lg border border-outline-variant/20 bg-surface-container-highest px-4 py-4 font-body text-on-surface placeholder:text-on-surface-variant/40 transition-all duration-300 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  id="name"
                  placeholder="Your name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label
                  className="font-label text-xs font-semibold uppercase tracking-widest text-on-surface-variant"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <input
                  className="w-full rounded-lg border border-outline-variant/20 bg-surface-container-highest px-4 py-4 font-body text-on-surface placeholder:text-on-surface-variant/40 transition-all duration-300 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  id="email"
                  placeholder="name@company.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label
                  className="font-label text-xs font-semibold uppercase tracking-widest text-on-surface-variant"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    className="w-full rounded-lg border border-outline-variant/20 bg-surface-container-highest px-4 py-4 font-body text-on-surface placeholder:text-on-surface-variant/40 transition-all duration-300 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    id="password"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors hover:text-on-surface"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <button
                className="w-full rounded-lg bg-gradient-to-br from-primary to-primary-container py-4 font-headline font-bold text-on-primary shadow-lg shadow-primary/10 transition-all duration-200 active:scale-[0.98] hover:brightness-110 disabled:opacity-60"
                type="submit"
                disabled={loading}
              >
                {loading ? "Creating account…" : "Create Account"}
              </button>
            </form>

            <div className="mt-8 border-t border-outline-variant/10 pt-8 text-center">
              <p className="text-sm text-on-surface-variant">
                Already have an account?
                <Link
                  className="ml-1 font-semibold text-on-secondary-container transition-colors duration-200 hover:text-secondary"
                  href="/auth/email"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
