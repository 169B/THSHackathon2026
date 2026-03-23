"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getCurrentUser, logout,
  getTasks, getCompletedTasks,
  updateTask, deleteTask,
} from "@/lib/appwrite";
import CanvasIntegration from "@/components/CanvasIntegration";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [motivation, setMotivation] = useState(7);
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Post-task logging
  const [loggingTask, setLoggingTask] = useState(null);
  const [actualTime, setActualTime] = useState("");
  const [postMotivation, setPostMotivation] = useState(50);

  useEffect(() => {
    getCurrentUser()
      .then((me) => {
        setUser(me);
        return Promise.all([getTasks(), getCompletedTasks()]);
      })
      .then(([t, c]) => { setTasks(t); setCompletedTasks(c); })
      .catch(() => router.replace("/"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  const handleToggleStatus = async (task) => {
    if (task.status === "pending") {
      await updateTask(task.$id, { status: "in-progress" });
    } else if (task.status === "in-progress") {
      setLoggingTask(task);
      setActualTime("");
      setPostMotivation(50);
      return;
    } else {
      await updateTask(task.$id, { status: "pending" });
    }
    setTasks(await getTasks());
  };

  const handleLogCompletion = async (e) => {
    e.preventDefault();
    await updateTask(loggingTask.$id, {
      status: "done",
      actual_time: parseInt(actualTime) || 0,
      post_motivation: parseInt(postMotivation),
    });
    setLoggingTask(null);
    setTasks(await getTasks());
    setCompletedTasks(await getCompletedTasks());
  };

  const handleDeleteTask = async (taskId) => {
    await deleteTask(taskId);
    setTasks(await getTasks());
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-surface text-on-surface-variant">Loading...</div>;

  // Stats calculations
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const allUnique = [...tasks, ...completedTasks].filter((t, i, arr) => arr.findIndex(x => x.$id === t.$id) === i);
  const weekTasks = allUnique.filter(t => new Date(t.$createdAt) >= weekAgo);
  const weekHours = (weekTasks.reduce((s, t) => s + (t.estimated_length || 0), 0) / 60).toFixed(1);
  const weekMotivation = weekTasks.length > 0 ? Math.round(weekTasks.reduce((s, t) => s + (t.motivation || 0), 0) / weekTasks.length) : 0;
  const totalHours = (allUnique.reduce((s, t) => s + (t.estimated_length || 0), 0) / 60).toFixed(1);
  const totalDone = completedTasks.length;

  // 7-day calendar
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const calendarDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - d.getDay() + i + 1); // Mon-Sun
    return d;
  });
  const todayStr = now.toDateString();

  const statusColors = { pending: "bg-secondary/20 text-secondary", "in-progress": "bg-primary/20 text-primary", done: "bg-tertiary/20 text-tertiary" };
  const statusLabels = { pending: "Not Started", "in-progress": "In Progress", done: "Done" };
  const activeTasks = tasks.filter(t => t.status !== "done");

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
            <span className="text-xs text-on-surface-variant">{user?.name || user?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-error transition-colors"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
            </button>
          </div>
        </header>

        {/* Page Canvas */}
        <div className="p-8 space-y-10 max-w-7xl">
          {/* Hero Section: Motivation Slider */}
          <section className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center reveal reveal-delay-1">
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface">
                  Welcome back{user?.name ? `, ${user.name}` : ""}.
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
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-headline text-primary-fixed-dim">
                Task Schedule
              </h3>
            </div>
            <div className="grid grid-cols-7 gap-px bg-outline-variant/10 rounded-lg overflow-hidden border border-outline-variant/5">
              {calendarDays.map((day) => {
                const isToday = day.toDateString() === todayStr;
                const dayTasks = activeTasks.filter(t => {
                  const created = new Date(t.$createdAt);
                  return created.toDateString() === day.toDateString();
                });
                return (
                  <div key={day.toISOString()} className={`${isToday ? "bg-surface-container-high" : "bg-surface-container-low"} p-3 min-h-[120px] flex flex-col gap-2 relative overflow-hidden`}>
                    {isToday && (
                      <div className="absolute top-0 right-0 w-6 h-6 bg-secondary/10 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                      </div>
                    )}
                    <span className={`text-[9px] font-bold uppercase ${isToday ? "text-on-surface" : "text-on-surface-variant"}`}>
                      {weekDays[day.getDay()]} {day.getDate()}
                    </span>
                    {dayTasks.slice(0, 2).map(t => (
                      <div key={t.$id} className="text-[10px] bg-primary/10 text-primary rounded px-1.5 py-0.5 truncate">
                        {t.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <span className="text-[9px] text-on-surface-variant">+{dayTasks.length - 2} more</span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Queue & Stats */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Queue Section */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-xl font-bold font-headline text-on-surface">Task List</h3>
                <p className="text-xs text-on-surface-variant">
                  Immediate priorities based on project deadlines.
                </p>
              </div>
              {activeTasks.length === 0 ? (
                <div className="bg-surface-container-lowest p-8 rounded-lg border border-outline-variant/10 text-center">
                  <p className="text-on-surface-variant">No tasks at this time.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeTasks.map(task => (
                    <div key={task.$id} className="bg-surface-container-lowest rounded-lg border border-outline-variant/10 p-4 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-sm text-on-surface truncate">{task.title}</h4>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${statusColors[task.status]}`}>
                            {statusLabels[task.status]}
                          </span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant">
                          {task.class_type && <span className="capitalize">{task.class_type}</span>}
                          {task.estimated_length > 0 && <span> · {task.estimated_length}m estimated</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleToggleStatus(task)} className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors" title={task.status === "pending" ? "Start" : "Complete"}>
                          <span className="material-symbols-outlined text-lg">{task.status === "pending" ? "play_arrow" : "check_circle"}</span>
                        </button>
                        <button onClick={() => handleDeleteTask(task.$id)} className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant hover:text-error transition-colors" title="Delete">
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Combined Stats Section */}
            <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/10 flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>

              {/* Weekly Stats */}
              <div className="space-y-3 relative z-10">
                <div>
                  <span className="text-[9px] font-bold text-secondary uppercase tracking-[0.2em]">Activity</span>
                  <h3 className="text-lg font-bold font-headline leading-tight">Weekly Stats</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface-container-lowest p-2 rounded">
                    <p className="text-xl font-extrabold font-headline text-primary tracking-tight">{weekHours}</p>
                    <p className="text-[10px] text-on-surface-variant font-medium">Hours Predicted</p>
                  </div>
                  <div className="bg-surface-container-lowest p-2 rounded">
                    <p className="text-xl font-extrabold font-headline text-secondary tracking-tight">{weekMotivation || "--"}</p>
                    <p className="text-[10px] text-on-surface-variant font-medium">Avg Motivation</p>
                  </div>
                </div>
              </div>

              <hr className="border-outline-variant/10 relative z-10" />

              {/* Lifetime Stats */}
              <div className="space-y-3 relative z-10">
                <div>
                  <span className="text-[9px] font-bold text-secondary uppercase tracking-[0.2em]">Summary</span>
                  <h3 className="text-lg font-bold font-headline leading-tight">Lifetime Stats</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface-container-lowest p-2 rounded">
                    <p className="text-xl font-extrabold font-headline text-primary tracking-tight">{totalHours}</p>
                    <p className="text-[10px] text-on-surface-variant font-medium">Hours Predicted</p>
                  </div>
                  <div className="bg-surface-container-lowest p-2 rounded">
                    <p className="text-xl font-extrabold font-headline text-primary tracking-tight">{totalDone}</p>
                    <p className="text-[10px] text-on-surface-variant font-medium">Tasks Completed</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-outline-variant/10 mt-auto">
                <p className="text-[10px] text-on-surface-variant/70 italic">
                  {allUnique.length === 0 ? "Start creating tasks to track progress." : `${allUnique.length} total tasks tracked.`}
                </p>
              </div>
            </div>
          </section>

          {/* Canvas LMS Integration */}
          <section className="reveal reveal-delay-3">
            <CanvasIntegration userId={user?.$id} />
          </section>

          {/* Post-Task Completion Modal */}
          {loggingTask && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-surface-container-low rounded-xl p-8 w-full max-w-md border border-outline-variant/20 shadow-2xl">
                <h3 className="text-xl font-bold font-headline text-on-surface mb-1">Log Completion</h3>
                <p className="text-sm text-on-surface-variant mb-6">{loggingTask.title}</p>
                <form onSubmit={handleLogCompletion} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-outline">Actual Time (minutes)</label>
                    <input type="number" value={actualTime} onChange={(e) => setActualTime(e.target.value)} className="w-full bg-surface-container-highest border-0 focus:ring-2 focus:ring-primary text-on-surface rounded-lg px-4 py-3 outline-none" required min="1" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-outline">Post-Task Motivation (0-100): {postMotivation}</label>
                    <input type="range" min="0" max="100" value={postMotivation} onChange={(e) => setPostMotivation(Number(e.target.value))} className="w-full accent-primary" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="flex-1 rounded-lg bg-primary py-3 font-bold text-on-primary hover:brightness-110 transition-all">Save</button>
                    <button type="button" onClick={() => setLoggingTask(null)} className="flex-1 rounded-lg bg-surface-container-high py-3 font-bold text-on-surface hover:bg-surface-variant transition-all">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
