"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup } from "@/lib/appwrite";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(email, password, name);
      router.replace("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to create account");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* TopNavBar */}
      <header className="z-50 w-full bg-[#111411] font-['Manrope'] text-sm tracking-wide antialiased">
        <div className="flex w-full max-w-none items-center justify-between px-12 py-6">
          <div className="text-2xl font-bold tracking-tighter text-[#b4cdb8]">
            Estimately
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative flex flex-grow items-center justify-center overflow-hidden px-6">
        {/* Organic Background Accents */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/5 rounded-full blur-[100px]"></div>

        <section className="z-10 w-full max-w-md">
          {/* Asymmetric Editorial Intro */}
          <div className="mb-12 space-y-2">
            <h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface">
              Join Estimately
            </h1>
          </div>

          {/* Focus Card */}
          <div className="relative rounded-xl border border-outline-variant/15 bg-surface-container-low p-8 shadow-2xl">
            <form className="space-y-6" onSubmit={handleSubmit}>
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
                  placeholder="John Student"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

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
                  placeholder="name@school.edu"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

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
                    placeholder="Create a strong password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-error-container/20 border border-error/30 px-4 py-3 text-sm text-error">
                  {error}
                </div>
              )}
              <button
                className="w-full rounded-lg bg-gradient-to-br from-primary to-primary-container py-4 font-headline font-bold text-on-primary shadow-lg shadow-primary/10 transition-all duration-200 active:scale-[0.98] hover:brightness-110 disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="mt-8 border-t border-outline-variant/10 pt-8 text-center">
              <p className="text-sm text-on-surface-variant">
                Already have an account?
                <a
                  className="ml-1 font-semibold text-on-secondary-container transition-colors duration-200 hover:text-secondary"
                  href="/"
                >
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
