"use client";

import Link from "next/link";
import { useState } from "react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Password reset requested for:", email);
    setSubmitted(true);
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

      <main className="relative flex flex-grow flex-col items-center justify-center overflow-hidden px-6 py-20">
        {/* Abstract Background Element */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]"></div>

        {/* Reset Password Card */}
        <div className="z-10 w-full max-w-md">
          <div className="group relative overflow-hidden rounded-lg bg-surface-container-low p-10 shadow-2xl lg:p-12">
            {/* Visual Accent */}
            <div className="absolute left-0 top-0 h-full w-1 bg-primary/20 transition-colors duration-500 group-hover:bg-primary"></div>

            <div className="space-y-8">
              <div className="space-y-3">
                <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">
                  Forgot Password?
                </h1>
                <p className="font-medium leading-relaxed text-on-surface-variant">
                  Enter your email to receive a reset link.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label
                    className="ml-1 text-xs font-semibold uppercase tracking-widest text-on-surface-variant/80"
                    htmlFor="email"
                  >
                    Work Email
                  </label>
                  <div className="group relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <span className="material-symbols-outlined text-xl text-outline-variant transition-colors group-focus-within:text-primary">
                        mail
                      </span>
                    </div>
                    <input
                      className="w-full rounded-lg border-0 bg-surface-container-highest py-4 pl-12 pr-4 text-on-surface outline-none placeholder:text-on-surface-variant/40 ring-1 ring-outline-variant/20 transition-all focus:bg-surface-container-highest/80 focus:ring-2 focus:ring-primary"
                      id="email"
                      name="email"
                      placeholder="name@company.com"
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  className="group flex w-full items-center justify-center gap-2 bg-gradient-to-br from-primary to-primary-container py-4 font-bold tracking-wide text-on-primary shadow-lg shadow-primary/10 transition-all duration-200 active:scale-95 hover:scale-[1.01]"
                  type="submit"
                >
                  Send Link
                  <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </button>
              </form>

              <div className="flex flex-col items-center space-y-6 pt-4">
                <Link
                  className="inline-flex items-center gap-2 text-sm font-semibold text-on-secondary-container transition-colors duration-300 hover:text-secondary"
                  href="/"
                >
                  <span className="material-symbols-outlined text-base">
                    arrow_back
                  </span>
                  Back to sign in
                </Link>
                <div className="flex items-center gap-3 rounded-lg bg-surface-container-lowest/50 px-5 py-3">
                  <span
                    className="material-symbols-outlined text-lg text-secondary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    lock_reset
                  </span>
                  <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-on-surface-variant">
                    Reset links expire in 24 hours
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contextual Decorative Pattern (Asymmetric) */}
          <div className="mt-8 flex justify-end opacity-20 px-2">
            <div className="grid grid-cols-4 gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
              <div className="h-1.5 w-1.5 rounded-full bg-primary-container"></div>
              <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
              <div className="h-1.5 w-1.5 rounded-full bg-primary-container"></div>
              <div className="h-1.5 w-1.5 rounded-full bg-primary-container"></div>
              <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
              <div className="h-1.5 w-1.5 rounded-full bg-primary-container"></div>
              <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
