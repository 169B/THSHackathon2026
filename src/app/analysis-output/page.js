"use client";

import Link from "next/link";

export default function AnalysisOutputPage() {
  return (
    <div className="font-body antialiased flex min-h-screen bg-surface text-on-surface">
      <aside className="h-[calc(100vh-1.5rem)] w-52 fixed left-3 top-3 bg-surface-container-low border border-outline-variant/20 flex flex-col py-6 z-40 rounded-2xl shadow-xl shadow-black/25 overflow-hidden">
        <div className="px-5 mb-8">
          <h1 className="text-lg font-bold text-primary font-headline">Estimately</h1>
          <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest mt-1">
            Task Suite
          </p>
        </div>
        <nav className="flex-1 space-y-1 px-2">
          <Link
            className="flex items-center gap-2 px-3 py-2 text-on-surface-variant opacity-80 hover:bg-surface-container-high hover:text-on-surface transition-all"
            href="/dashboard"
          >
            <span className="material-symbols-outlined text-xl">dashboard</span>
            <span className="font-headline text-xs font-medium">Dashboard</span>
          </Link>
          <Link
            className="flex items-center gap-2 px-3 py-2 text-primary font-bold border-r-4 border-primary bg-surface-container-high transition-all"
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

      <main className="ml-56 flex-1 flex flex-col min-h-screen">
        <header className="w-full sticky top-0 z-40 bg-surface h-16 px-8 flex justify-between items-center border-b border-outline-variant/15">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold tracking-tight text-on-surface font-headline">
              Analysis Output
            </h2>
            <div className="hidden md:flex bg-surface-container-low px-3 py-1.5 rounded-full items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-xs text-on-surface-variant font-medium">Processing Complete</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-on-surface-variant">account_circle</span>
          </div>
        </header>

        <section className="p-8 max-w-7xl mx-auto w-full space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 bg-surface-container-low rounded-xl p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] -mr-32 -mt-32"></div>
              <div className="relative z-10">
                <span className="text-xs font-bold text-primary tracking-widest uppercase mb-4 block">
                  Primary Prediction
                </span>
                <h3 className="font-headline text-5xl font-extrabold text-on-surface mb-2">14.2 hrs</h3>
                <p className="text-on-surface-variant text-lg">
                  Total duration estimated for{" "}
                  <span className="text-on-surface font-semibold">Q4 Fiscal Audit Preparation</span>
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 pt-8 border-t border-outline-variant/10 relative z-10">
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-tighter mb-1">
                    Average Person
                  </p>
                  <p className="text-xl font-headline font-bold">18.5 hrs</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-tighter mb-1">
                    Your Speed
                  </p>
                  <p className="text-xl font-headline font-bold text-primary">1.3x Faster</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-tighter mb-1">
                    Efficiency Gain
                  </p>
                  <p className="text-xl font-headline font-bold text-secondary">23.2%</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-4 bg-surface-container-high rounded-xl p-8 flex flex-col items-center justify-center text-center">
              <div className="w-32 h-32 rounded-full border-4 border-outline-variant/20 flex items-center justify-center relative mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                  <circle
                    className="text-outline-variant/10"
                    cx="64"
                    cy="64"
                    fill="transparent"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                  ></circle>
                  <circle
                    className="text-primary"
                    cx="64"
                    cy="64"
                    fill="transparent"
                    r="58"
                    stroke="currentColor"
                    strokeDasharray="364.4"
                    strokeDashoffset="29.15"
                    strokeLinecap="round"
                    strokeWidth="8"
                  ></circle>
                </svg>
                <span className="text-3xl font-headline font-black absolute inset-0 flex items-center justify-center">
                  92%
                </span>
              </div>
              <h4 className="text-xl font-bold mb-2 font-headline">Confidence Score</h4>
              <p className="text-sm text-on-surface-variant">
                Highly reliable based on 42 similar past projects.
              </p>
            </div>

            <div className="md:col-span-12 bg-surface-container-low rounded-xl overflow-hidden flex flex-col md:flex-row">
              <div className="md:w-1/3 p-8 border-r border-outline-variant/5 bg-surface-container-lowest">
                <h4 className="font-headline text-2xl font-bold mb-4">AI Insights</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Our neural engine processed your unique work patterns and project complexity.
                </p>
                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                    <span>High Momentum Detected</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                    <span>Optimal Resource Allocation</span>
                  </div>
                </div>
              </div>
              <div className="md:w-2/3 p-8 bg-surface-container-low">
                <p className="text-on-surface-variant leading-relaxed mb-6">
                  Based on your historical performance, you tend to complete data-heavy tasks
                  significantly faster than baseline average.
                </p>
                <p className="text-on-surface-variant leading-relaxed">
                  The system recommends focused intervals to capitalize on peak efficiency.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-12">
            <div className="flex items-center justify-between mb-8">
              <h4 className="font-headline text-2xl font-bold">Predicted Milestones</h4>
              <span className="text-sm text-on-surface-variant uppercase tracking-wider font-bold">
                Chronological Flow
              </span>
            </div>
            <div className="relative">
              <div className="absolute top-8 left-0 w-full h-px bg-outline-variant/20 hidden md:block"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                {[
                  ["01", "Initial Draft", "Project Kickoff & Structure", "Oct 24, 2023"],
                  ["02", "Data Verification", "Logic Check & Sourcing", "Oct 26, 2023"],
                  ["03", "Final Submission", "Review & Deployment", "Oct 28, 2023"],
                ].map(([num, title, sub, date]) => (
                  <div key={num} className="bg-surface-container rounded-lg p-6 flex flex-col gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold">
                      {num}
                    </div>
                    <div>
                      <h5 className="font-bold text-lg font-headline">{title}</h5>
                      <p className="text-sm text-on-surface-variant mb-2">{sub}</p>
                      <p className="text-xs text-secondary font-bold">{date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-16 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-outline-variant/10">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors font-medium">
                <span className="material-symbols-outlined">share</span>
                Share Result
              </button>
              <button className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors font-medium">
                <span className="material-symbols-outlined">archive</span>
                Save to History
              </button>
            </div>
            <div className="flex gap-4">
              <button className="px-8 py-3 rounded-lg bg-surface-container-high border border-outline-variant/20 font-bold hover:bg-surface-bright transition-colors">
                Recalculate
              </button>
              <button className="px-10 py-3 rounded-lg bg-primary text-on-primary font-bold flex items-center gap-2 active:scale-95 transition-transform shadow-lg shadow-primary/10">
                <span className="material-symbols-outlined">file_download</span>
                Export Report
              </button>
            </div>
          </div>
        </section>
        <div className="h-24"></div>
      </main>
    </div>
  );
}
