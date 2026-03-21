"use client";

import Link from "next/link";
import { useState } from "react";

export default function Dashboard() {
  const [motivation, setMotivation] = useState(7);

  return (
    <div className="flex h-screen bg-surface text-on-surface">
      {/* Sidebar */}
      <aside className="h-[calc(100vh-1.5rem)] w-52 fixed left-3 top-3 bg-surface-container-low border border-outline-variant/20 flex flex-col py-6 z-40 rounded-2xl shadow-xl shadow-black/25 overflow-hidden">
        <div className="px-5 mb-8">
          <h1 className="text-lg font-bold text-primary font-headline">Estimately</h1>
          <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest mt-1">
            Task Suite
          </p>
        </div>
        <nav className="flex-1 space-y-1 px-2">
          <Link
            className="flex items-center gap-2 px-3 py-2 text-primary font-bold border-r-4 border-primary bg-surface-container-high transition-all"
            href="/dashboard"
          >
            <span className="material-symbols-outlined text-xl">dashboard</span>
            <span className="font-headline text-xs font-medium">Dashboard</span>
          </Link>
          <Link
            className="flex items-center gap-2 px-3 py-2 text-on-surface-variant opacity-80 hover:bg-surface-container-high hover:text-on-surface transition-all"
            href="/task-input"
          >
            <span className="material-symbols-outlined text-xl">add_task</span>
            <span className="font-headline text-xs font-medium">New Task</span>
          </Link>
          <Link
            className="flex items-center gap-2 px-3 py-2 text-on-surface-variant opacity-80 hover:bg-surface-container-high hover:text-on-surface transition-all"
            href="/historical-data"
          >
            <span className="material-symbols-outlined text-xl">history</span>
            <span className="font-headline text-xs font-medium">Historical Data</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-56 min-h-screen flex-1">
        {/* Top NavBar */}
        <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-6 bg-surface/60 backdrop-blur-xl border-b border-outline-variant/15 reveal">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold tracking-tight text-on-surface font-headline">
              Dashboard
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-7 w-7 rounded-full overflow-hidden border border-primary/20 bg-surface-container-highest flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface-variant text-lg">
                person
              </span>
            </div>
          </div>
        </header>

        {/* Page Canvas */}
        <div className="p-8 space-y-10 max-w-7xl">
          {/* Hero Section: Motivation Slider */}
          <section className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center reveal reveal-delay-1">
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface">
                  Welcome back.
                </h2>
              </div>
              <Link
                href="/task-input"
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-primary px-8 py-3 font-headline font-bold text-on-primary shadow-lg shadow-primary/15 transition-all duration-200 hover:brightness-105 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined">add</span>
                New Task
              </Link>
            </div>
            <div className="md:col-span-3 bg-surface-container-low p-6 rounded-xl space-y-4 border border-outline-variant/5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-secondary tracking-widest uppercase">
                  Motivation Score
                </span>
                <span className="text-3xl font-bold font-headline text-secondary">
                  {motivation}
                </span>
              </div>
              <div className="space-y-2">
                <input
                  className="w-full h-2.5 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-secondary"
                  max="10"
                  min="1"
                  step="1"
                  type="range"
                  value={motivation}
                  onChange={(e) => setMotivation(Number(e.target.value))}
                />
                <div className="flex justify-between text-[10px] text-on-surface-variant/60 font-medium px-0.5">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                  <span>6</span>
                  <span>7</span>
                  <span>8</span>
                  <span>9</span>
                  <span>10</span>
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-on-surface-variant font-bold uppercase tracking-tight pt-2 border-t border-outline-variant/5">
                <span>Low Focus</span>
                <span>Peak Performance</span>
              </div>
            </div>
          </section>

          {/* 7-Day Calendar View */}
          <section className="space-y-4 reveal reveal-delay-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-headline text-primary-fixed-dim">
                Task Schedule
              </h3>
              <div className="flex gap-1">
                <button className="p-1.5 rounded bg-surface-container-high hover:bg-surface-variant text-on-surface transition-colors">
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button className="p-1.5 rounded bg-surface-container-high hover:bg-surface-variant text-on-surface transition-colors">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-px bg-outline-variant/10 rounded-lg overflow-hidden border border-outline-variant/5">
              {/* Monday */}
              <div className="bg-surface-container-low p-3 min-h-[120px] flex flex-col gap-2">
                <span className="text-[9px] font-bold text-on-surface-variant uppercase">
                  Mon 12
                </span>
              </div>

              {/* Tuesday - Active */}
              <div className="bg-surface-container-high p-3 min-h-[120px] flex flex-col gap-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-6 h-6 bg-secondary/10 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                </div>
                <span className="text-[9px] font-bold text-on-surface uppercase">Tue 13</span>
              </div>

              {/* Wednesday */}
              <div className="bg-surface-container-low p-3 min-h-[120px] flex flex-col gap-2">
                <span className="text-[9px] font-bold text-on-surface-variant uppercase">
                  Wed 14
                </span>
              </div>

              {/* Thursday */}
              <div className="bg-surface-container-low p-3 min-h-[120px] flex flex-col gap-2">
                <span className="text-[9px] font-bold text-on-surface-variant uppercase">
                  Thu 15
                </span>
              </div>

              {/* Friday */}
              <div className="bg-surface-container-low p-3 min-h-[120px] flex flex-col gap-2">
                <span className="text-[9px] font-bold text-on-surface-variant uppercase">
                  Fri 16
                </span>
              </div>

              {/* Saturday */}
              <div className="bg-surface-container-lowest p-3 min-h-[120px] flex flex-col gap-2 opacity-50">
                <span className="text-[9px] font-bold text-on-surface-variant uppercase">
                  Sat 17
                </span>
              </div>

              {/* Sunday */}
              <div className="bg-surface-container-lowest p-3 min-h-[120px] flex flex-col gap-2 opacity-50">
                <span className="text-[9px] font-bold text-on-surface-variant uppercase">
                  Sun 18
                </span>
              </div>
            </div>
          </section>

          {/* Queue & Stats */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 reveal reveal-delay-3">
            {/* Queue Section */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-xl font-bold font-headline text-on-surface">Task List</h3>
                <p className="text-xs text-on-surface-variant">
                  Immediate priorities based on project deadlines.
                </p>
              </div>
              <div className="bg-surface-container-lowest p-8 rounded-lg border border-outline-variant/10 text-center">
                <p className="text-on-surface-variant">
                  No tasks at this time.
                </p>
              </div>
            </div>

            {/* Combined Stats Section */}
            <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/10 flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>

              {/* Weekly Stats */}
              <div className="space-y-3 relative z-10">
                <div>
                  <span className="text-[9px] font-bold text-secondary uppercase tracking-[0.2em]">
                    Activity
                  </span>
                  <h3 className="text-lg font-bold font-headline leading-tight">
                    Weekly Stats
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface-container-lowest p-2 rounded">
                    <p className="text-xl font-extrabold font-headline text-primary tracking-tight">
                      --
                    </p>
                    <p className="text-[10px] text-on-surface-variant font-medium">
                      Hours Predicted
                    </p>
                  </div>
                  <div className="bg-surface-container-lowest p-2 rounded">
                    <p className="text-xl font-extrabold font-headline text-secondary tracking-tight">
                      --
                    </p>
                    <p className="text-[10px] text-on-surface-variant font-medium">
                      Avg Motivation
                    </p>
                  </div>
                </div>
              </div>

              <hr className="border-outline-variant/10 relative z-10" />

              {/* Lifetime Stats */}
              <div className="space-y-3 relative z-10">
                <div>
                  <span className="text-[9px] font-bold text-secondary uppercase tracking-[0.2em]">
                    Summary
                  </span>
                  <h3 className="text-lg font-bold font-headline leading-tight">
                    Lifetime Stats
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface-container-lowest p-2 rounded">
                    <p className="text-xl font-extrabold font-headline text-primary tracking-tight">
                      --
                    </p>
                    <p className="text-[10px] text-on-surface-variant font-medium">
                      Hours Predicted
                    </p>
                  </div>
                  <div className="bg-surface-container-lowest p-2 rounded">
                    <p className="text-xl font-extrabold font-headline text-primary tracking-tight">
                      --
                    </p>
                    <p className="text-[10px] text-on-surface-variant font-medium">
                      Words Written
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-outline-variant/10 mt-auto">
                <p className="text-[10px] text-on-surface-variant/70 italic">
                  Start creating tasks to track progress.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
