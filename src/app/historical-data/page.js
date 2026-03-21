"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, addTask, getCompletedTasks } from "@/lib/appwrite";

// Map display types to backend task_type values
const TYPE_MAP = {
  "Conceptual Research": "writing",
  "Problem-based Analysis": "problem",
  "Technical Implementation": "problem",
  "Administrative / Support": "writing",
};

function createEmptyEntry() {
  return {
    taskName: "",
    courseProject: "other",
    type: "Conceptual Research",
    timeTaken: "",
    timeUnit: "Hours",
    motivation: 7,
  };
}

export default function HistoricalDataPage() {
  const router = useRouter();
  const [taskCount, setTaskCount] = useState(3);
  const [entries, setEntries] = useState([
    createEmptyEntry(),
    createEmptyEntry(),
    createEmptyEntry(),
  ]);
  const [savedCount, setSavedCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [existingTasks, setExistingTasks] = useState([]);

  useEffect(() => {
    getCurrentUser()
      .then(() => getCompletedTasks())
      .then(setExistingTasks)
      .catch(() => router.replace("/"));
  }, [router]);

  useEffect(() => {
    setEntries((prev) => {
      if (taskCount === prev.length) return prev;
      if (taskCount < prev.length) return prev.slice(0, taskCount);
      return [
        ...prev,
        ...Array.from({ length: taskCount - prev.length }, () => createEmptyEntry()),
      ];
    });
  }, [taskCount]);

  const updateEntry = (index, patch) => {
    setEntries((prev) => prev.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    let count = 0;
    for (const entry of entries) {
      if (!entry.taskName || !entry.timeTaken) continue;
      const minutes = entry.timeUnit === "Hours" ? Math.round(Number(entry.timeTaken) * 60) : Number(entry.timeTaken);
      await addTask({
        title: entry.taskName,
        description: "",
        class_type: entry.courseProject,
        task_type: TYPE_MAP[entry.type] || "writing",
        difficulty: 3,
        complexity: 3,
        motivation: entry.motivation * 10,
        estimated_length: minutes,
        set_size: 0,
        status: "done",
        actual_time: minutes,
        post_motivation: entry.motivation * 10,
      });
      count++;
    }
    setSavedCount(count);
    setExistingTasks(await getCompletedTasks());
    setSaving(false);
  };

  return (
    <div className="bg-background text-on-surface font-body min-h-screen flex">
      <aside className="hidden md:flex h-[calc(100vh-1.5rem)] w-52 fixed left-3 top-3 bg-surface-container-low border border-outline-variant/20 flex-col py-6 z-40 rounded-2xl shadow-xl shadow-black/25 overflow-hidden">
        <div className="px-5 mb-8">
          <h1 className="text-lg font-bold text-primary font-headline">Estimately</h1>
          <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest mt-1">
            Task Suite
          </p>
        </div>
        <nav className="space-y-1 px-2">
          <Link
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-all"
            href="/dashboard"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-medium text-xs font-headline">Dashboard</span>
          </Link>
          <Link
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-all"
            href="/task-input"
          >
            <span className="material-symbols-outlined">add_task</span>
            <span className="font-medium text-xs font-headline">New Task</span>
          </Link>
          <Link
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-container text-primary transition-all"
            href="/historical-data"
          >
            <span className="material-symbols-outlined">history</span>
            <span className="font-medium text-xs font-headline">Historical Data</span>
          </Link>
        </nav>
      </aside>

      <div className="flex-grow md:ml-56">
        <header className="bg-surface sticky top-0 z-40 border-b border-outline-variant/20">
          <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
            <div className="text-xl font-bold text-on-surface tracking-tighter font-headline md:hidden">
              Estimately
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 pt-12 pb-32">
          <section className="mb-12">
            <h1 className="text-5xl font-headline font-extrabold tracking-tight text-on-surface mb-2">
              Historical Data
            </h1>
            <p className="text-on-surface-variant text-lg max-w-2xl">
              Provide previous task data to calibrate your predictive engine.
            </p>
          </section>

          <section className="mb-24">
            <div className="bg-surface-container-low p-8 md:p-12 rounded-xl">
              <div className="mb-8 rounded-lg border border-outline-variant/20 bg-surface-container p-4">
                <label className="text-xs uppercase tracking-widest font-semibold text-on-surface-variant ml-1 block mb-2">
                  Number of Historical Tasks to Input
                </label>
                <input
                  className="w-full md:w-56 bg-surface-container-highest border-none rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-primary transition-all outline-none"
                  type="number"
                  min="1"
                  max="30"
                  value={taskCount}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    if (Number.isNaN(next)) return;
                    setTaskCount(Math.max(1, Math.min(30, next)));
                  }}
                />
                <p className="text-xs text-on-surface-variant mt-2">
                  Add as many historical tasks as you want, then scroll and fill each entry.
                </p>
              </div>

              <form className="space-y-10" onSubmit={onSubmit}>
                {entries.map((entry, index) => (
                  <section
                    key={`entry-${index}`}
                    className="space-y-8 rounded-xl border border-outline-variant/10 bg-surface-container p-6"
                  >
                    <h2 className="text-xl font-headline font-bold text-primary">
                      Historical Task {index + 1}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest font-semibold text-on-surface-variant ml-1">
                          Task Name
                        </label>
                        <input
                          className="w-full bg-surface-container-highest border-none rounded-lg p-4 text-on-surface focus:ring-2 focus:ring-primary transition-all outline-none"
                          type="text"
                          value={entry.taskName}
                          onChange={(e) => updateEntry(index, { taskName: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest font-semibold text-on-surface-variant ml-1">
                          Subject
                        </label>
                        <select
                          className="w-full bg-surface-container-highest border-none rounded-lg p-4 text-on-surface focus:ring-2 focus:ring-primary transition-all outline-none appearance-none cursor-pointer"
                          value={entry.courseProject}
                          onChange={(e) => updateEntry(index, { courseProject: e.target.value })}
                        >
                          <option value="math">Math</option>
                          <option value="science">Science</option>
                          <option value="english">English</option>
                          <option value="history">History</option>
                          <option value="cs">Computer Science</option>
                          <option value="art">Art</option>
                          <option value="language">Foreign Language</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest font-semibold text-on-surface-variant ml-1">
                        Type
                      </label>
                      <select
                        className="w-full bg-surface-container-highest border-none rounded-lg p-4 text-on-surface focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                        value={entry.type}
                        onChange={(e) => updateEntry(index, { type: e.target.value })}
                      >
                        <option>Conceptual</option>
                        <option>Problem-based</option>
                        <option>Other </option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest font-semibold text-on-surface-variant ml-1">
                        Actual Time Taken
                      </label>
                      <div className="flex gap-2">
                        <input
                          className="flex-grow bg-surface-container-highest border-none rounded-lg p-4 text-on-surface focus:ring-2 focus:ring-primary transition-all outline-none"
                          type="number"
                          value={entry.timeTaken}
                          onChange={(e) => updateEntry(index, { timeTaken: e.target.value })}
                        />
                        <select
                          className="w-32 bg-surface-container-highest border-none rounded-lg p-4 text-on-surface focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                          value={entry.timeUnit}
                          onChange={(e) => updateEntry(index, { timeUnit: e.target.value })}
                        >
                          <option>Hours</option>
                          <option>Minutes</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-6 pt-4">
                      <div className="flex justify-between items-end">
                        <label className="text-xs uppercase tracking-widest font-semibold text-on-surface-variant ml-1">
                          Motivation Level
                        </label>
                        <span className="text-primary font-bold text-xl">{entry.motivation}</span>
                      </div>
                      <div className="relative px-1">
                        <input
                          className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
                          max="10"
                          min="1"
                          step="1"
                          type="range"
                          value={entry.motivation}
                          onChange={(e) =>
                            updateEntry(index, { motivation: Number(e.target.value) })
                          }
                        />
                        <div className="flex justify-between mt-4 px-1">
                          <span className="text-[10px] text-outline-variant font-bold">1 (LOW)</span>
                          <span className="text-[10px] text-outline-variant font-bold">5</span>
                          <span className="text-[10px] text-outline-variant font-bold">10 (HIGH)</span>
                        </div>
                      </div>
                    </div>
                  </section>
                ))}

                <div className="pt-6">
                  <button
                    className="flex w-full items-center justify-center gap-4 rounded-xl bg-primary px-8 py-5 font-headline font-bold text-on-primary shadow-lg shadow-primary/15 transition-all duration-200 hover:brightness-105 active:scale-[0.98] disabled:opacity-50"
                    type="submit"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save All Data Entries"}
                  </button>
                  {savedCount > 0 ? (
                    <p className="text-xs text-primary mt-3 text-center">
                      Saved {savedCount} historical task entries.
                    </p>
                  ) : null}
                </div>
              </form>
            </div>
          </section>

          {/* Existing Completed Tasks */}
          {existingTasks.length > 0 && (
            <section className="mb-24">
              <h2 className="text-2xl font-headline font-bold text-on-surface mb-4">Previously Completed Tasks</h2>
              <div className="space-y-3">
                {existingTasks.map(t => (
                  <div key={t.$id} className="bg-surface-container-low rounded-lg border border-outline-variant/10 p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-on-surface">{t.title}</h4>
                      <p className="text-[11px] text-on-surface-variant">
                        <span className="capitalize">{t.class_type}</span>
                        {t.actual_time > 0 && <span> · {t.actual_time}m actual</span>}
                        {t.estimated_length > 0 && <span> · {t.estimated_length}m estimated</span>}
                      </p>
                    </div>
                    <span className="text-[10px] text-tertiary font-bold uppercase">Done</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
