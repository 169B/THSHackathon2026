"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getCurrentUser, addTask, getCompletedTasks, predictTask, savePrediction,
} from "@/lib/appwrite";

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

  // Backend-specific fields
  const [classType, setClassType] = useState("other");
  const [taskType, setTaskType] = useState("writing");
  const [difficulty, setDifficulty] = useState(3);
  const [complexity, setComplexity] = useState(3);
  const [setSize, setSetSize] = useState(10);

  // Rubric analysis state
  const [rubricFile, setRubricFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [rubricResult, setRubricResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const dateInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const monthDate = useMemo(() => (deadline ? new Date(deadline) : new Date()), [deadline]);
  const monthName = monthDate.toLocaleString("en-US", { month: "long", year: "numeric" });
  const monthCells = useMemo(() => buildMonthDays(monthDate), [monthDate]);
  const selectedDay = deadline ? new Date(deadline).getDate() : null;

  // Auth guard
  useEffect(() => {
    getCurrentUser().catch(() => router.replace("/"));
  }, [router]);

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
    setRubricFile(file || null);
  };

  const handleAnalyzeRubric = async () => {
    if (!rubricFile) return;
    setAnalyzing(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", rubricFile);
      form.append("class_type", classType);
      form.append("task_type", taskType);
      const res = await fetch("/api/analyze-rubric", { method: "POST", body: form });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { throw new Error("Server returned invalid response"); }
      if (data.error) throw new Error(data.error);
      setRubricResult(data);
      // Auto-fill from AI analysis
      if (data.suggested_title) setTaskName(data.suggested_title);
      if (data.summary) setDescription(data.summary);
      if (data.complexity) setComplexity(data.complexity);
      if (data.difficulty) setDifficulty(data.difficulty);
      if (data.task_type_detected) setTaskType(data.task_type_detected);
      if (data.set_size > 0) setSetSize(data.set_size);
    } catch (err) {
      setError(`Rubric analysis error: ${err.message}`);
    }
    setAnalyzing(false);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      // Calculate days until due
      const daysUntilDue = deadline
        ? Math.max(1, Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)))
        : 7;

      const taskData = {
        title: taskName,
        description,
        class_type: classType,
        task_type: taskType,
        difficulty: parseInt(difficulty),
        complexity: parseInt(complexity),
        motivation: motivation * 10, // Convert 1-10 to 0-100
        estimated_length: 0,
        set_size: taskType === "problem" ? parseInt(setSize) || 0 : 0,
        due_date: deadline ? new Date(deadline).toISOString() : null,
      };

      // Get AI estimate for avg person
      const completed = await getCompletedTasks();
      const aiRes = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: taskData, completedTasks: completed, mode: "ai" }),
      }).then(r => r.json()).catch(() => null);

      const avgEstimate = aiRes?.avg_person_minutes || 60;
      taskData.estimated_length = avgEstimate;

      // Save task
      const newTask = await addTask(taskData);

      // Run formula prediction
      const formulaPred = await predictTask(newTask, daysUntilDue);
      await savePrediction(newTask.$id, formulaPred);

      // Store prediction for analysis-output page
      const prediction = {
        ...formulaPred,
        taskTitle: taskName,
        ai: aiRes && !aiRes.error ? aiRes : null,
      };
      sessionStorage.setItem("lastPrediction", JSON.stringify(prediction));
      router.push("/analysis-output");
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
    setSubmitting(false);
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
                <div className="flex items-center gap-3">
                  <p className="text-xs text-on-surface-variant">
                    {uploadedFileName ? `Uploaded: ${uploadedFileName}` : "No file selected"}
                  </p>
                  {rubricFile && (
                    <button
                      className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-lg hover:bg-primary/30 transition-all disabled:opacity-50"
                      type="button"
                      onClick={handleAnalyzeRubric}
                      disabled={analyzing}
                    >
                      {analyzing ? "Analyzing..." : "Analyze"}
                    </button>
                  )}
                </div>
                {rubricResult && (
                  <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 text-xs text-on-surface">
                    <span className="font-bold text-primary">AI Analysis:</span> {rubricResult.summary}
                    {rubricResult.key_requirements?.length > 0 && (
                      <ul className="mt-1 ml-4 list-disc text-on-surface-variant">
                        {rubricResult.key_requirements.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    )}
                  </div>
                )}
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
                    Subject
                  </label>
                  <select
                    className="w-full bg-surface-container-highest border-0 focus:ring-2 focus:ring-primary text-on-surface rounded-lg px-4 py-3 transition-all outline-none appearance-none cursor-pointer"
                    value={classType}
                    onChange={(e) => setClassType(e.target.value)}
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

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-outline">
                    Task Type
                  </label>
                  <select
                    className="w-full bg-surface-container-highest border-0 focus:ring-2 focus:ring-primary text-on-surface rounded-lg px-4 py-3 transition-all outline-none appearance-none cursor-pointer"
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value)}
                  >
                    <option value="writing">Writing</option>
                    <option value="reading">Reading</option>
                    <option value="problem">Problem Set</option>
                    <option value="other">Other</option>

                  </select>
                </div>

                {taskType === "problem" && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-outline">
                      Set Size (# of problems)
                    </label>
                    <input
                      className="w-full bg-surface-container-highest border-0 focus:ring-2 focus:ring-primary text-on-surface rounded-lg px-4 py-3 transition-all outline-none"
                      type="number"
                      value={setSize}
                      onChange={(e) => setSetSize(e.target.value)}
                      min={1}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-outline">
                    Difficulty: {difficulty}/5
                  </label>
                  <input
                    className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
                    type="range" min="1" max="5" value={difficulty}
                    onChange={(e) => setDifficulty(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-outline">
                    Complexity: {complexity}/5
                  </label>
                  <input
                    className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
                    type="range" min="1" max="5" value={complexity}
                    onChange={(e) => setComplexity(Number(e.target.value))}
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

              {error && (
                <div className="rounded-lg bg-error-container/20 border border-error/30 px-4 py-3 text-sm text-error">
                  {error}
                </div>
              )}

              <button
                className="flex w-full items-center justify-center gap-4 rounded-xl bg-primary px-8 py-5 font-headline font-bold text-on-primary shadow-lg shadow-primary/15 transition-all duration-200 hover:brightness-105 active:scale-[0.98] disabled:opacity-50"
                type="submit"
                disabled={submitting}
              >
                <span>{submitting ? "Generating..." : "Generate Prediction"}</span>
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
                    <p>Subject: <span className="capitalize">{classType}</span></p>
                    <p>Type: <span className="capitalize">{taskType}</span></p>
                    <p>Difficulty: {difficulty}/5 · Complexity: {complexity}/5</p>
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
