"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const CLASS_TYPES = ["math", "science", "english", "history", "art", "music", "pe", "general"];
const TASK_TYPES = [
  "homework",
  "project",
  "exam prep",
  "essay",
  "reading",
  "lab",
  "presentation",
  "other",
];

export default function DashboardPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [userId, setUserId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // New task form state
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    task_type: "homework",
    class_type: "math",
    complexity: 5,
    motivation: 50,
    use_ai: false,
  });
  const [savingTask, setSavingTask] = useState(false);
  const [taskError, setTaskError] = useState("");

  // Rubric upload state
  const [rubricText, setRubricText] = useState("");
  const [uploadingRubric, setUploadingRubric] = useState(false);
  const [rubricError, setRubricError] = useState("");
  const [rubricFileName, setRubricFileName] = useState("");

  // Prediction state
  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState("");

  useEffect(() => {
    const uid = sessionStorage.getItem("user_id");
    if (!uid) {
      router.push("/auth/email");
      return;
    }
    setUserId(uid);
    fetchTasks(uid);
  }, [router]);

  async function fetchTasks(uid) {
    setLoadingTasks(true);
    try {
      const res = await fetch(`/api/tasks?userId=${encodeURIComponent(uid)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTasks(data.tasks ?? []);
    } catch {
      // Silently handle — tasks will just be empty
    } finally {
      setLoadingTasks(false);
    }
  }

  async function handleAddTask(e) {
    e.preventDefault();
    setTaskError("");
    setSavingTask(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...taskForm, userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTasks((prev) => [data.task, ...prev]);
      setShowAddTask(false);
      setTaskForm({
        title: "",
        description: "",
        task_type: "homework",
        class_type: "math",
        complexity: 5,
        motivation: 50,
        use_ai: false,
      });
    } catch (err) {
      setTaskError(err.message);
    } finally {
      setSavingTask(false);
    }
  }

  async function handleDeleteTask(taskId) {
    try {
      await fetch(`/api/tasks?taskId=${encodeURIComponent(taskId)}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.$id !== taskId));
    } catch {
      // Silently ignore
    }
  }

  async function handleRubricUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setRubricError("");
    setUploadingRubric(true);
    setRubricText("");
    setRubricFileName(file.name);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/rubric", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRubricText(data.text ?? "");
    } catch (err) {
      setRubricError(err.message);
      setRubricFileName("");
    } finally {
      setUploadingRubric(false);
    }
  }

  async function handlePredict() {
    setPredictionError("");
    setPredicting(true);
    setPrediction(null);
    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: { ...taskForm, user_id: userId },
          rubric_text: rubricText,
          use_ai: taskForm.use_ai,
          save: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPrediction(data);
    } catch (err) {
      setPredictionError(err.message);
    } finally {
      setPredicting(false);
    }
  }

  function handleSignOut() {
    sessionStorage.clear();
    router.push("/auth/email");
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-surface">
      {/* Nav */}
      <header className="z-50 w-full bg-[#111411] font-['Manrope'] text-sm tracking-wide antialiased">
        <div className="flex w-full max-w-none items-center justify-between px-12 py-6">
          <div className="text-2xl font-bold tracking-tighter text-[#b4cdb8]">Estimately</div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAddTask(true)}
              className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-primary transition hover:bg-primary/20"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Add Task
            </button>
            <button
              onClick={handleSignOut}
              className="text-on-surface-variant transition hover:text-on-surface text-xs uppercase tracking-wider"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow px-6 py-10 max-w-4xl mx-auto w-full">
        <h1 className="mb-8 text-3xl font-extrabold tracking-tight">Your Tasks</h1>

        {/* Task list */}
        {loadingTasks ? (
          <p className="text-on-surface-variant">Loading…</p>
        ) : tasks.length === 0 ? (
          <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-10 text-center">
            <span className="material-symbols-outlined text-5xl text-primary/40">
              assignment
            </span>
            <p className="mt-4 text-on-surface-variant">
              No tasks yet. Add your first task to get started.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li
                key={task.$id}
                className="flex items-center justify-between rounded-xl border border-outline-variant/15 bg-surface-container-low px-6 py-4"
              >
                <div>
                  <p className="font-semibold">{task.title}</p>
                  <p className="text-xs text-on-surface-variant">
                    {task.class_type} · {task.task_type} · complexity {task.complexity}/10 ·
                    motivation {task.motivation}/100
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteTask(task.$id)}
                  className="ml-4 text-on-surface-variant transition hover:text-error"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Add Task Panel */}
        {showAddTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-surface-container-low p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold">Add New Task</h2>
                <button onClick={() => setShowAddTask(false)}>
                  <span className="material-symbols-outlined text-on-surface-variant">close</span>
                </button>
              </div>

              {taskError && (
                <div className="mb-4 rounded-lg bg-error-container/20 px-4 py-3 text-sm text-error">
                  {taskError}
                </div>
              )}

              <form onSubmit={handleAddTask} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                    Title *
                  </label>
                  <input
                    className="mt-1 w-full rounded-lg border border-outline-variant/20 bg-surface-container-highest px-4 py-3 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Chapter 5 Homework"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                    Description
                  </label>
                  <textarea
                    className="mt-1 w-full rounded-lg border border-outline-variant/20 bg-surface-container-highest px-4 py-3 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    rows={2}
                    value={taskForm.description}
                    onChange={(e) => setTaskForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Optional details"
                  />
                </div>

                {/* Subject and Task Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                      Subject *
                    </label>
                    <select
                      className="mt-1 w-full rounded-lg border border-outline-variant/20 bg-surface-container-highest px-4 py-3 text-on-surface focus:border-primary focus:outline-none"
                      value={taskForm.class_type}
                      onChange={(e) => setTaskForm((f) => ({ ...f, class_type: e.target.value }))}
                    >
                      {CLASS_TYPES.map((c) => (
                        <option key={c} value={c}>
                          {c.charAt(0).toUpperCase() + c.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                      Task Type *
                    </label>
                    <select
                      className="mt-1 w-full rounded-lg border border-outline-variant/20 bg-surface-container-highest px-4 py-3 text-on-surface focus:border-primary focus:outline-none"
                      value={taskForm.task_type}
                      onChange={(e) => setTaskForm((f) => ({ ...f, task_type: e.target.value }))}
                    >
                      {TASK_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Complexity */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                    Complexity: {taskForm.complexity}/10
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={taskForm.complexity}
                    onChange={(e) =>
                      setTaskForm((f) => ({ ...f, complexity: Number(e.target.value) }))
                    }
                    className="mt-1 w-full accent-primary"
                  />
                </div>

                {/* Motivation */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                    Motivation: {taskForm.motivation}/100
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={taskForm.motivation}
                    onChange={(e) =>
                      setTaskForm((f) => ({ ...f, motivation: Number(e.target.value) }))
                    }
                    className="mt-1 w-full accent-primary"
                  />
                </div>

                {/* Rubric Upload */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                    Rubric (PDF or DOCX — optional)
                  </label>
                  <div className="mt-1 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 rounded-lg border border-outline-variant/20 bg-surface-container-highest px-4 py-2.5 text-sm transition hover:border-primary"
                    >
                      <span className="material-symbols-outlined text-base">upload_file</span>
                      {uploadingRubric ? "Parsing…" : "Upload Rubric"}
                    </button>
                    {rubricFileName && !uploadingRubric && (
                      <span className="text-xs text-on-surface-variant truncate max-w-[150px]">
                        {rubricFileName}
                      </span>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc"
                    className="hidden"
                    onChange={handleRubricUpload}
                  />
                  {rubricError && (
                    <p className="mt-1 text-xs text-error">{rubricError}</p>
                  )}
                  {rubricText && (
                    <p className="mt-1 text-xs text-primary">
                      ✓ Rubric extracted ({rubricText.length} characters)
                    </p>
                  )}
                </div>

                {/* AI Toggle */}
                <div className="flex items-center justify-between rounded-xl border border-outline-variant/15 bg-surface-container-highest px-4 py-3">
                  <div>
                    <p className="font-semibold text-sm">
                      {taskForm.use_ai ? "AI Estimate" : "Formula Estimate"}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {taskForm.use_ai
                        ? "Uses GPT to analyze task details and rubric"
                        : "Uses a built-in heuristic formula"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTaskForm((f) => ({ ...f, use_ai: !f.use_ai }))}
                    className={`relative h-7 w-14 rounded-full transition-colors duration-200 ${
                      taskForm.use_ai ? "bg-primary" : "bg-surface-variant"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-on-primary shadow transition-transform duration-200 ${
                        taskForm.use_ai ? "translate-x-8" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Estimate Preview */}
                <div>
                  <button
                    type="button"
                    onClick={handlePredict}
                    disabled={predicting || !taskForm.title}
                    className="w-full rounded-lg border border-primary/30 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10 disabled:opacity-50"
                  >
                    {predicting ? "Estimating…" : "Preview Time Estimate"}
                  </button>
                  {predictionError && (
                    <p className="mt-2 text-xs text-error">{predictionError}</p>
                  )}
                  {prediction && (
                    <div className="mt-3 rounded-xl bg-primary/10 px-5 py-4">
                      <p className="text-lg font-bold text-primary">
                        ~{prediction.estimated_minutes} min
                      </p>
                      <p className="text-xs text-on-surface-variant mt-1">
                        Method: {prediction.method}
                      </p>
                      {prediction.reasoning && (
                        <p className="text-xs text-on-surface-variant mt-1">
                          {prediction.reasoning}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddTask(false)}
                    className="flex-1 rounded-lg border border-outline-variant/20 py-3 text-sm font-semibold transition hover:bg-surface-container"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingTask}
                    className="flex-1 rounded-lg bg-gradient-to-br from-primary to-primary-container py-3 text-sm font-bold text-on-primary shadow disabled:opacity-60"
                  >
                    {savingTask ? "Saving…" : "Save Task"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
