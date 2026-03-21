"use client";

import Link from "next/link";
import { useState } from "react";

export default function PasswordPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [email] = useState("architect@temporal.com");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Sign in with password:", password);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* TopNavBar */}
      <nav className="top-0 left-0 z-50 w-full max-w-none flex items-center justify-between bg-[#111411] px-12 py-6 font-['Manrope'] text-sm tracking-wide antialiased">
        <div className="text-2xl font-bold tracking-tighter text-[#b4cdb8]">
          Estimately
        </div>
        <div className="flex space-x-4 items-center">
          <button className="material-symbols-outlined text-[#c3c8c1] transition-colors hover:text-[#e1e3de]">
            search
          </button>
          <div className="h-8 w-8 rounded-full bg-surface-container-high flex items-center justify-center border border-outline-variant/20">
            <span className="material-symbols-outlined text-xs">person</span>
          </div>
        </div>
      </nav>

      {/* Main Content: Password Entry Screen */}
      <main className="relative flex flex-grow items-center justify-center overflow-hidden px-6 py-24">
        {/* Atmospheric Background Elements */}
        <div className="absolute top-1/4 -left-20 h-96 w-96 rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="absolute bottom-1/4 -right-20 h-96 w-96 rounded-full bg-secondary/5 blur-[120px]"></div>

        {/* Centered Card Layout */}
        <div className="z-10 w-full max-w-md">
          <div className="relative rounded-xl bg-surface-container-low p-10 shadow-2xl lg:p-12">
            {/* Headline Section */}
            <header className="mb-10 lg:text-left text-center">
              <h1 className="font-headline mb-2 text-4xl font-extrabold tracking-tight text-on-surface">
                Welcome Back.
              </h1>
              <p className="font-body text-sm text-on-surface-variant">
                Please enter your password to continue to Estimately.
              </p>
            </header>

            <form className="space-y-8" onSubmit={handleSubmit}>
              {/* Read-only Email Field */}
              <div className="space-y-2">
                <label className="px-1 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
                  Account
                </label>
                <div className="flex items-center justify-between rounded-lg border border-outline-variant/10 bg-surface-container-lowest px-4 py-3.5">
                  <div className="flex space-x-3 items-center">
                    <span className="material-symbols-outlined text-primary">
                      alternate_email
                    </span>
                    <span className="truncate font-medium text-on-surface">
                      {email}
                    </span>
                  </div>
                  <Link
                    className="text-xs font-semibold text-primary transition-colors hover:text-on-surface"
                    href="/"
                  >
                    Change
                  </Link>
                </div>
              </div>

              {/* Password Input Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label
                    className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <a
                    className="text-[10px] font-bold uppercase tracking-widest text-secondary transition-colors hover:text-on-secondary-container"
                    href="/reset-password"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="group relative">
                  <input
                    className="w-full rounded-lg border border-outline-variant/20 bg-surface-container-highest px-4 py-3.5 text-on-surface outline-none placeholder:text-outline-variant/50 transition-all duration-300 focus:border-primary focus:ring-1 focus:ring-primary/20"
                    id="password"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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

              {/* Actions */}
              <div className="space-y-6 pt-4">
                <button
                  className="w-full rounded-lg bg-gradient-to-br from-primary to-primary-container py-4 font-bold text-on-primary shadow-lg shadow-primary/10 transition-all duration-200 active:scale-[0.98] hover:brightness-110"
                  type="submit"
                >
                  Sign In
                </button>
                <div className="flex justify-center">
                  <button
                    className="group flex space-x-2 text-sm font-medium text-on-surface-variant transition-colors duration-300 hover:text-on-surface"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-lg transition-transform group-hover:-translate-x-1">
                      arrow_back
                    </span>
                    <span>Back to email</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Contextual Information (Asymmetric Editorial Style) */}
          <div className="mt-8 flex items-center justify-between px-2 text-[10px] font-medium uppercase tracking-widest text-on-surface-variant/60">
            <span>EST. 2024</span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary/40"></span>
              Secure Session Active
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
