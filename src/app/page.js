"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/appwrite";

export default function EmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  useEffect(() => {
    getCurrentUser().then(() => router.replace("/dashboard")).catch(() => {});
  }, [router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push(`/password?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="z-50 w-full bg-[#111411] font-['Manrope'] text-sm tracking-wide antialiased">
        <div className="flex w-full max-w-none items-center justify-between px-12 py-6">
          <div className="text-2xl font-bold tracking-tighter text-[#b4cdb8]">
            Estimately
          </div>
        </div>
      </header>

      <main className="relative flex flex-grow items-center justify-center overflow-hidden px-6">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/5 rounded-full blur-[100px]"></div>

        <section className="z-10 w-full max-w-md">
          <div className="mb-12 space-y-2">
            <h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface">
              Enter your email
            </h1>
          </div>

          <div className="relative rounded-xl border border-outline-variant/15 bg-surface-container-low p-8 shadow-2xl">


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
                    placeholder="name@school.edu"
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
                    href="/signup"
                >
                  Sign up
                </a>
              </p>
            </div>
          </div>


        </section>
      </main>
    </div>
  );
}
