"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/appwrite";

export default function AnalysisOutputPage() {
  const router = useRouter();
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    getCurrentUser().catch(() => router.replace("/"));
    const stored = sessionStorage.getItem("lastPrediction");
    if (stored) {
      setPrediction(JSON.parse(stored));
    }
  }, [router]);

  if (!prediction) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-on-surface-variant">
        <div className="text-center space-y-4">
          <p>No prediction data available.</p>
          <Link href="/task-input" className="text-primary font-bold hover:underline">Create a new task</Link>
        </div>
      </div>
    );
  }

  const predictedMinutes = prediction.ai?.predicted_minutes || prediction.predicted_minutes;
  const predictedHours = (predictedMinutes / 60).toFixed(1);
  const avgMinutes = prediction.ai?.avg_person_minutes || prediction.avg_person_minutes || 0;
  const avgHours = (avgMinutes / 60).toFixed(1);
  const speedRatio = prediction.speed_ratio || 1;
  const speedLabel = speedRatio < 1
    ? `${((1 - speedRatio) * 100).toFixed(0)}% Faster`
    : speedRatio > 1
    ? `${((speedRatio - 1) * 100).toFixed(0)}% Slower`
    : "Average";
  const confidence = (prediction.ai?.confidence || prediction.confidence || "medium").toUpperCase();
  const confidencePercent = confidence === "HIGH" ? 92 : confidence === "MEDIUM" ? 65 : 35;
  const circumference = 2 * Math.PI * 58; // r=58
  const dashOffset = circumference * (1 - confidencePercent / 100);
  const efficiencyGain = speedRatio < 1 ? `${((1 - speedRatio) * 100).toFixed(1)}%` : "--";

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
        </header>

        <section className="p-8 max-w-7xl mx-auto w-full space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Primary Prediction */}
            <div className="md:col-span-8 bg-surface-container-low rounded-xl p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] -mr-32 -mt-32"></div>
              <div className="relative z-10">
                <span className="text-xs font-bold text-primary tracking-widest uppercase mb-4 block">
                  Primary Prediction
                </span>
                <h3 className="font-headline text-5xl font-extrabold text-on-surface mb-2">
                  {predictedHours} hrs
                </h3>
                <p className="text-on-surface-variant text-lg">
                  Total duration estimated for{" "}
                  <span className="text-on-surface font-semibold">{prediction.taskTitle}</span>
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 pt-8 border-t border-outline-variant/10 relative z-10">
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-tighter mb-1">Average Person</p>
                  <p className="text-xl font-headline font-bold">{avgHours} hrs</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-tighter mb-1">Your Speed</p>
                  <p className="text-xl font-headline font-bold text-primary">{speedRatio}x {speedLabel}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-tighter mb-1">Efficiency Gain</p>
                  <p className="text-xl font-headline font-bold text-secondary">{efficiencyGain}</p>
                </div>
              </div>
            </div>

            {/* Confidence Score */}
            <div className="md:col-span-4 bg-surface-container-high rounded-xl p-8 flex flex-col items-center justify-center text-center">
              <div className="w-32 h-32 rounded-full border-4 border-outline-variant/20 flex items-center justify-center relative mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                  <circle className="text-outline-variant/10" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8"></circle>
                  <circle className="text-primary" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round" strokeWidth="8"></circle>
                </svg>
                <span className="text-3xl font-headline font-black absolute inset-0 flex items-center justify-center">
                  {confidencePercent}%
                </span>
              </div>
              <h4 className="text-xl font-bold mb-2 font-headline">Confidence: {confidence}</h4>
              <p className="text-sm text-on-surface-variant">
                Buffer: +{prediction.buffer_percent}%
              </p>
            </div>

            {/* AI Insights */}
            <div className="md:col-span-12 bg-surface-container-low rounded-xl overflow-hidden flex flex-col md:flex-row">
              <div className="md:w-1/3 p-8 border-r border-outline-variant/5 bg-surface-container-lowest">
                <h4 className="font-headline text-2xl font-bold mb-4">AI Insights</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Prediction generated using your work history and task parameters.
                </p>
                <div className="mt-8 space-y-4">
                  {speedRatio < 1 && (
                    <div className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                      <span>Faster Than Average</span>
                    </div>
                  )}
                  {prediction.ai?.suggested_approach && (
                    <div className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                      <span>Strategy Available</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="md:w-2/3 p-8 bg-surface-container-low space-y-4">
                {prediction.ai?.reasoning && (
                  <p className="text-on-surface-variant leading-relaxed">{prediction.ai.reasoning}</p>
                )}
                {prediction.ai?.suggested_approach && (
                  <div>
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Strategy</p>
                    <p className="text-on-surface-variant leading-relaxed">{prediction.ai.suggested_approach}</p>
                  </div>
                )}
                {prediction.ai?.motivation_insight && (
                  <div>
                    <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Motivation</p>
                    <p className="text-on-surface-variant leading-relaxed">{prediction.ai.motivation_insight}</p>
                  </div>
                )}
                {prediction.ai?.tips?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-tertiary uppercase tracking-widest mb-1">Tips</p>
                    <ul className="list-disc ml-4 text-on-surface-variant text-sm space-y-1">
                      {prediction.ai.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                    </ul>
                  </div>
                )}
                {!prediction.ai?.reasoning && !prediction.ai?.suggested_approach && (
                  <p className="text-on-surface-variant leading-relaxed">
                    Prediction calculated using your historical task completion data and the formula engine.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Daily Blocks / Milestones */}
          {prediction.daily_blocks?.length > 0 && (
            <div className="pt-12">
              <div className="flex items-center justify-between mb-8">
                <h4 className="font-headline text-2xl font-bold">Suggested Schedule</h4>
                <span className="text-sm text-on-surface-variant uppercase tracking-wider font-bold">
                  Daily Blocks
                </span>
              </div>
              <div className="relative">
                <div className="absolute top-8 left-0 w-full h-px bg-outline-variant/20 hidden md:block"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 relative z-10">
                  {prediction.daily_blocks.map((block, i) => (
                    <div key={i} className="bg-surface-container rounded-lg p-6 flex flex-col gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div>
                        <h5 className="font-bold text-lg font-headline">{block.minutes} min</h5>
                        <p className="text-xs text-secondary font-bold">{block.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="pt-16 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-outline-variant/10">
            <div></div>
            <div className="flex gap-4">
              <Link href="/task-input" className="px-8 py-3 rounded-lg bg-surface-container-high border border-outline-variant/20 font-bold hover:bg-surface-bright transition-colors">
                New Task
              </Link>
              <Link href="/dashboard" className="px-10 py-3 rounded-lg bg-primary text-on-primary font-bold flex items-center gap-2 active:scale-95 transition-transform shadow-lg shadow-primary/10">
                <span className="material-symbols-outlined">dashboard</span>
                Dashboard
              </Link>
            </div>
          </div>
        </section>
        <div className="h-24"></div>
      </main>
    </div>
  );
}
