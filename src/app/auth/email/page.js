"use client";

import TopNavBar from "@/components/TopNavBar";
import Footer from "@/components/Footer";
import { useState } from "react";

export default function EmailEntryPage() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email submitted:", email);
    // Handle email submission logic here
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TopNavBar />

      {/* Main Content Area */}
      <main className="relative flex flex-grow items-center justify-center overflow-hidden px-6">
        {/* Organic Background Accents */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/5 rounded-full blur-[100px]"></div>

        <section className="z-10 w-full max-w-md">
          {/* Asymmetric Editorial Intro */}
          <div className="mb-12 space-y-2">
            <h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface">
              Enter your email
            </h1>
          </div>

          {/* Focus Card */}
          <div className="relative rounded-xl border border-outline-variant/15 bg-surface-container-low p-8 shadow-2xl">
            {/* Decorative Accent */}
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <span className="material-symbols-outlined text-4xl text-primary">
                forest
              </span>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label
                  className="font-label text-xs font-semibold uppercase tracking-widest text-on-surface-variant"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <div className="relative">
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
              </div>
              <button
                className="w-full rounded-lg bg-gradient-to-br from-primary to-primary-container py-4 font-headline font-bold text-on-primary shadow-lg shadow-primary/10 transition-all duration-200 active:scale-[0.98] hover:brightness-110"
                type="submit"
              >
                Continue
              </button>
            </form>

            <div className="mt-8 border-t border-outline-variant/10 pt-8 text-center">
              <p className="text-sm text-on-surface-variant">
                New to Estimately?
                <a
                  className="ml-1 font-semibold text-on-secondary-container transition-colors duration-200 hover:text-secondary"
                  href="/auth/signup"
                >
                  Sign up
                </a>
              </p>
            </div>
          </div>

          {/* Footer-esque Microcopy for focused view */}
          <div className="mt-12 flex items-center justify-center gap-6 opacity-40">
            <div className="h-[1px] w-8 bg-outline-variant"></div>
            <span className="material-symbols-outlined text-on-surface">
              energy_savings_leaf
            </span>
            <div className="h-[1px] w-8 bg-outline-variant"></div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
