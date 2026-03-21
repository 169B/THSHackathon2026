"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

function buildMonthDays(date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const startWeekDay = first.getDay();
  const daysInMonth = last.getDate();

  const cells = [];
  for (let i = 0; i < startWeekDay; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);
  return cells;
}

export default function TaskInputPage() {
  const router = useRouter();
  const [taskName, setTaskName] = useState("");
  const [courseProject, setCourseProject] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [motivation, setMotivation] = useState(7);
  const [uploadedFileName, setUploadedFileName] = useState("");

  const dateInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const monthDate = useMemo(() => (deadline ? new Date(deadline) : new Date()), [deadline]);
  const monthName = monthDate.toLocaleString("en-US", { month: "long", year: "numeric" });
  const monthCells = useMemo(() => buildMonthDays(monthDate), [monthDate]);
  const selectedDay = deadline ? new Date(deadline).getDate() : null;

  const onPickCalendar = () => {
    if (dateInputRef.current?.showPicker) {
      dateInputRef.current.showPicker();
      return;
    }
    dateInputRef.current?.focus();
  };

  const onUploadClick = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (event) => {
    const file = event.target.files?.[0];
    setUploadedFileName(file ? file.name : "");
  };

  const onSubmit = (event) => {
    event.preventDefault();
    router.push("/analysis-output");
  };

  return (
    <div className="flex min-h-screen bg-surface text-on-surface font-body">
      <aside className="h-[calc(100vh-1.5rem)] w-52 fixed left-3 top-3 bg-surface-container-low border border-outline-variant/20 flex flex-col py-6 z-40 rounded-2xl shadow-xl shadow-black/25 overflow-hidden">
        <div className="px-5 mb-8">
          <div className="flex items-center gap-3">
            <img
              src="/image2vector.svg"
              alt="Estimately logo"
              className="h-8 w-8 object-contain bg-transparent"
            />
            <div>
              <h1 className="text-lg font-bold text-primary font-headline">Estimately</h1>
              <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest mt-1">
                Task Suite
              </p>
            </div>
          </div>
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

      <main className="ml-56 w-full min-h-screen overflow-y-auto p-6 md:p-12 lg:p-16">
        <header className="max-w-6xl mx-auto mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-primary font-medium tracking-widest text-xs uppercase">
              <span className="w-8 h-[1px] bg-primary"></span>
              <span>Task Engine</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-extrabold font-headline text-on-surface tracking-tight">
              Task Input
            </h2>
          </div>
        </header>

        <form className="max-w-6xl mx-auto grid grid-cols-12 gap-8 lg:gap-12" onSubmit={onSubmit}>
          <div className="col-span-12 lg:col-span-7 space-y-8 lg:space-y-12">
            <section className="bg-surface-container-low p-8 md:p-10 rounded-xl space-y-8 border border-outline-variant/5">
              <div className="space-y-1">
                <h3 className="text-xl font-bold font-headline text-primary">Task Identification</h3>
                <p className="text-sm text-on-surface-variant">Define the scope of your task.</p>
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-primary">
                  Start Here: Upload Rubric File
                </p>
                <p className="text-sm text-on-surface-variant">
                  Upload a rubric first and the form below can be auto-filled for you.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={onFileChange}
                  accept=".pdf,.doc,.docx,.txt"
                />
                <button
                  className="flex items-center space-x-2 px-4 py-2 bg-surface-container-highest hover:bg-surface-variant text-on-surface text-xs font-bold uppercase tracking-wider rounded-lg border border-outline-variant/20 transition-all"
                  type="button"
                  onClick={onUploadClick}
                >
                  <span className="material-symbols-outlined text-sm">cloud_upload</span>
                  <span>Upload Rubric File</span>
                </button>
                <p className="text-xs text-on-surface-variant">
                  {uploadedFileName ? `Uploaded: ${uploadedFileName}` : "No file selected"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-outline">
                    Task Name
                  </label>
                  <input
                    className="w-full bg-surface-container-highest border-0 focus:ring-2 focus:ring-primary text-on-surface rounded-lg px-4 py-3 transition-all outline-none"
                    type="text"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-outline">
                    Class / Project
                  </label>
                  <input
                    className="w-full bg-surface-container-highest border-0 focus:ring-2 focus:ring-primary text-on-surface rounded-lg px-4 py-3 transition-all outline-none"
                    type="text"
                    value={courseProject}
                    onChange={(e) => setCourseProject(e.target.value)}
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-outline">
                    Hard Deadline
                  </label>
                  <div className="relative">
                    <input
                      ref={dateInputRef}
                      className="w-full bg-surface-container-highest border-0 focus:ring-2 focus:ring-primary text-on-surface rounded-lg px-4 py-3 transition-all outline-none"
                      type="datetime-local"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={onPickCalendar}
                      aria-label="Open calendar"
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-on-surface-variant hover:text-primary"
                    >
                      <span className="material-symbols-outlined text-sm">event</span>
                    </button>
                  </div>
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-outline">
                    Task Description / Rubric
                  </label>
                  <textarea
                    className="w-full bg-surface-container-highest border-0 focus:ring-2 focus:ring-primary text-on-surface rounded-lg px-4 py-3 transition-all outline-none min-h-[120px] resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>
              </div>
            </section>

            <section className="bg-surface-container-low p-8 md:p-10 rounded-xl space-y-8 border border-outline-variant/5">
              <div className="space-y-1">
                <h3 className="text-xl font-bold font-headline text-secondary">Motivation Calibration</h3>
                <p className="text-sm text-on-surface-variant">Adjust current focus and energy levels.</p>
              </div>
              <div className="py-4 px-2">
                <div className="flex justify-between mb-6 text-[10px] font-black tracking-widest uppercase text-outline">
                  <span>Low Focus</span>
                  <span className="text-primary">Equilibrium</span>
                  <span>Peak State</span>
                </div>
                <input
                  className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
                  max="10"
                  min="1"
                  step="1"
                  type="range"
                  value={motivation}
                  onChange={(e) => setMotivation(Number(e.target.value))}
                />
                <div className="flex justify-between mt-4 text-xs font-medium text-on-surface-variant">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <span key={n} className={n === motivation ? "text-primary font-bold" : ""}>
                      {n}
                    </span>
                  ))}
                </div>
              </div>

              <button
                className="flex w-full items-center justify-center gap-4 rounded-xl bg-primary px-8 py-5 font-headline font-bold text-on-primary shadow-lg shadow-primary/15 transition-all duration-200 hover:brightness-105 active:scale-[0.98]"
                type="submit"
              >
                <span>Generate Prediction</span>
                <span className="material-symbols-outlined font-bold">trending_flat</span>
              </button>
            </section>
          </div>

          <div className="col-span-12 lg:col-span-5">
            <div className="lg:sticky lg:top-12 space-y-8">
              <div className="bg-surface-container-high rounded-xl p-8 md:p-10 border border-outline-variant/5 space-y-8">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-outline">Calendar View</span>
                  <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-black rounded-full uppercase">
                    Live
                  </span>
                </div>

                <div className="rounded-lg bg-surface-container-lowest p-4 border border-outline-variant/10">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-on-surface">{monthName}</p>
                    <span className="text-xs text-on-surface-variant">Deadline preview</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-[10px] text-on-surface-variant mb-2 uppercase">
                    <span>Sun</span>
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {monthCells.map((day, idx) => (
                      <div
                        key={`${day ?? "empty"}-${idx}`}
                        className={`h-8 rounded flex items-center justify-center text-xs ${
                          day === selectedDay
                            ? "bg-primary text-on-primary font-bold"
                            : "text-on-surface-variant bg-surface-container"
                        } ${day ? "" : "opacity-0"}`}
                      >
                        {day ?? ""}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg bg-surface-container-lowest p-4 border border-outline-variant/10">
                  <p className="text-sm font-bold text-on-surface mb-2">Input Summary</p>
                  <div className="space-y-2 text-xs text-on-surface-variant">
                    <p>Task: {taskName || "--"}</p>
                    <p>Class/Project: {courseProject || "--"}</p>
                    <p>Deadline: {deadline || "--"}</p>
                    <p>Motivation: {motivation}/10</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
