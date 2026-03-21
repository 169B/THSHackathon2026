"use client";

import { useState, useEffect } from "react";
import {
  login, logout, getCurrentUser,
  addTask, getTasks, getCompletedTasks, updateTask, deleteTask,
  predictTask, savePrediction,
} from "@/lib/appwrite";

export default function TasksPage() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [message, setMessage] = useState("");

  // Login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // New task fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [classType, setClassType] = useState("math");
  const [taskType, setTaskType] = useState("problem");
  const [difficulty, setDifficulty] = useState(3);
  const [complexity, setComplexity] = useState(3);
  const [motivation, setMotivation] = useState(50);
  const [setSize, setSetSize] = useState(10);
  const [daysUntilDue, setDaysUntilDue] = useState(7);

  // Rubric analysis
  const [rubricMode, setRubricMode] = useState(null); // null, 'upload', 'paste'
  const [rubricText, setRubricText] = useState("");
  const [rubricFile, setRubricFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [rubricResult, setRubricResult] = useState(null);

  // Prediction result
  const [prediction, setPrediction] = useState(null);
  const [predMode, setPredMode] = useState('ai'); // 'ai' = full AI prediction, 'formula' = formula + AI avg only

  // Post-task modal
  const [loggingTask, setLoggingTask] = useState(null);
  const [actualTime, setActualTime] = useState("");
  const [postMotivation, setPostMotivation] = useState(50);

  useEffect(() => {
    getCurrentUser()
      .then((me) => { setUser(me); return getTasks(); })
      .then(setTasks)
      .catch(() => {});
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    try {
      await login(email, password);
      const me = await getCurrentUser();
      setUser(me);
      setTasks(await getTasks());
      setMessage(`Logged in as ${me.name}`);
    } catch (err) { setMessage(`Error: ${err.message}`); }
  }

  async function handleLogout() {
    await logout();
    setUser(null); setTasks([]); setPrediction(null);
    setMessage("Logged out");
  }

  async function handleAnalyzeRubric() {
    setAnalyzing(true);
    try {
      const form = new FormData();
      form.append('class_type', classType);
      form.append('task_type', taskType);
      if (rubricMode === 'paste') {
        form.append('text', rubricText);
      } else if (rubricFile) {
        form.append('file', rubricFile);
      }
      const res = await fetch('/api/analyze-rubric', { method: 'POST', body: form });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setRubricResult(data);
      // Auto-fill form fields from AI analysis
      if (data.suggested_title) setTitle(data.suggested_title);
      if (data.summary) setDescription(data.summary);
      if (data.complexity) setComplexity(data.complexity);
      if (data.difficulty) setDifficulty(data.difficulty);
      if (data.task_type_detected) setTaskType(data.task_type_detected);
      if (data.set_size > 0) setSetSize(data.set_size);
      setMessage('Rubric analyzed! Fields auto-filled.');
    } catch (err) {
      setMessage(`Rubric analysis error: ${err.message}`);
    }
    setAnalyzing(false);
  }

  async function handleAddTask(e) {
    e.preventDefault();
    try {
      const taskData = {
        title,
        description,
        class_type: classType,
        task_type: taskType,
        difficulty: parseInt(difficulty),
        complexity: parseInt(complexity),
        motivation: parseInt(motivation),
        estimated_length: 0, // AI will calculate this
        set_size: taskType === 'problem' ? parseInt(setSize) || 0 : 0,
      };

      // Step 1: Ask AI for avg person estimate (+ full prediction if in AI mode)
      const completed = await getCompletedTasks();
      const aiRes = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: taskData, completedTasks: completed, mode: predMode }),
      }).then(r => r.json()).catch(() => null);

      // Step 2: Save task with AI's avg person estimate
      const avgEstimate = aiRes?.avg_person_minutes || 60;
      taskData.estimated_length = avgEstimate;
      const newTask = await addTask(taskData);

      // Step 3: Run formula prediction (uses avg estimate + speed ratio)
      const formulaPred = await predictTask(newTask, parseInt(daysUntilDue) || 7);
      await savePrediction(newTask.$id, formulaPred);

      setPrediction({
        ...formulaPred,
        taskTitle: title,
        mode: predMode,
        ai: aiRes && !aiRes.error ? aiRes : null,
      });

      // Reset form
      setTitle(""); setDescription(""); setMotivation(50);
      setTasks(await getTasks());
      setMessage("Task added with prediction!");
    } catch (err) { setMessage(`Error: ${err.message}`); }
  }

  async function handleToggleStatus(task) {
    if (task.status === 'pending') {
      await updateTask(task.$id, { status: 'in-progress' });
    } else if (task.status === 'in-progress') {
      // Open post-task logger instead of marking done directly
      setLoggingTask(task);
      setActualTime("");
      setPostMotivation(50);
      return;
    } else {
      await updateTask(task.$id, { status: 'pending' });
    }
    setTasks(await getTasks());
  }

  async function handleLogCompletion(e) {
    e.preventDefault();
    try {
      await updateTask(loggingTask.$id, {
        status: 'done',
        actual_time: parseInt(actualTime) || 0,
        post_motivation: parseInt(postMotivation),
      });
      setLoggingTask(null);
      setTasks(await getTasks());
      setMessage("Task completed & logged!");
    } catch (err) { setMessage(`Error: ${err.message}`); }
  }

  async function handleDelete(taskId) {
    await deleteTask(taskId);
    setTasks(await getTasks());
  }

  async function handleShowPrediction(task) {
    const completed = await getCompletedTasks();
    const [formulaPred, aiRes] = await Promise.all([
      predictTask(task, 7),
      fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, completedTasks: completed, mode: predMode }),
      }).then(r => r.json()).catch(() => null),
    ]);
    setPrediction({
      ...formulaPred,
      taskTitle: task.title,
      mode: predMode,
      ai: aiRes && !aiRes.error ? aiRes : null,
    });
  }

  // ── Styles ──
  const s = {
    page: { padding: "2rem", fontFamily: "sans-serif", maxWidth: "700px", margin: "0 auto" },
    input: { padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px", width: "100%" },
    btn: (bg) => ({ padding: "0.5rem 1rem", background: bg, color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }),
    card: { padding: "1rem", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "0.75rem", background: "#fff" },
    label: { fontSize: "0.8rem", color: "#666", marginBottom: "0.25rem" },
    row: { display: "flex", gap: "0.5rem", alignItems: "center" },
    section: { marginBottom: "2rem", padding: "1rem", border: "1px solid #ddd", borderRadius: "8px" },
  };

  const statusColors = { pending: "#f59e0b", "in-progress": "#3b82f6", done: "#10b981" };
  const statusLabels = { pending: "Not Started", "in-progress": "In Progress", done: "Done" };
  const confidenceColors = { low: "#ef4444", medium: "#f59e0b", high: "#10b981" };

  // ── Login ──
  if (!user) {
    return (
      <div style={s.page}>
        <h1>Tasks — Log In</h1>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem" }}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={s.input} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={s.input} />
          <button type="submit" style={s.btn("#333")}>Log In</button>
        </form>
        {message && <p style={{ marginTop: "1rem", color: "#c00" }}>{message}</p>}
      </div>
    );
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={{ ...s.row, justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <h1 style={{ margin: 0 }}>Task Planner</h1>
        <div style={s.row}>
          <span style={{ color: "#666" }}>{user.name}</span>
          <button onClick={handleLogout} style={s.btn("#999")}>Log Out</button>
        </div>
      </div>

      {/* ── Add Task Form ── */}
      <form onSubmit={handleAddTask} style={{ ...s.section, background: "#fafafa" }}>
        <h3 style={{ margin: "0 0 0.75rem" }}>New Task</h3>

        {/* Rubric Upload/Paste */}
        <div style={{ marginBottom: "0.75rem", padding: "0.75rem", background: "#f5f0ff", borderRadius: "8px", border: "1px solid #d8b4fe" }}>
          <div style={{ ...s.row, marginBottom: "0.5rem" }}>
            <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#7c3aed" }}>Import Rubric</span>
            <button type="button" onClick={() => { setRubricMode(rubricMode === 'upload' ? null : 'upload'); setRubricResult(null); }} style={{ ...s.btn(rubricMode === 'upload' ? '#7c3aed' : '#a78bfa'), padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}>Upload PDF/DOCX</button>
            <button type="button" onClick={() => { setRubricMode(rubricMode === 'paste' ? null : 'paste'); setRubricResult(null); }} style={{ ...s.btn(rubricMode === 'paste' ? '#7c3aed' : '#a78bfa'), padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}>Paste Text</button>
          </div>

          {rubricMode === 'upload' && (
            <div style={{ ...s.row, marginBottom: "0.5rem" }}>
              <input type="file" accept=".pdf,.docx" onChange={(e) => setRubricFile(e.target.files[0])} style={{ fontSize: "0.85rem" }} />
              <button type="button" onClick={handleAnalyzeRubric} disabled={!rubricFile || analyzing} style={s.btn(analyzing ? '#999' : '#7c3aed')}>
                {analyzing ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
          )}

          {rubricMode === 'paste' && (
            <div>
              <textarea
                placeholder="Paste your rubric or assignment description here..."
                value={rubricText}
                onChange={(e) => setRubricText(e.target.value)}
                rows={4}
                style={{ ...s.input, resize: "vertical", marginBottom: "0.5rem" }}
              />
              <button type="button" onClick={handleAnalyzeRubric} disabled={!rubricText.trim() || analyzing} style={s.btn(analyzing ? '#999' : '#7c3aed')}>
                {analyzing ? 'Analyzing...' : 'Analyze Rubric'}
              </button>
            </div>
          )}

          {rubricResult && (
            <div style={{ marginTop: "0.5rem", padding: "0.5rem", background: "#ede9fe", borderRadius: "6px", fontSize: "0.85rem" }}>
              <strong>AI Analysis:</strong> {rubricResult.summary}
              {rubricResult.key_requirements && (
                <ul style={{ margin: "0.25rem 0 0", paddingLeft: "1.2rem" }}>
                  {rubricResult.key_requirements.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Class + Task Type */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <div>
            <div style={s.label}>Subject</div>
            <select value={classType} onChange={(e) => setClassType(e.target.value)} style={s.input}>
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
          <div>
            <div style={s.label}>Task Type</div>
            <select value={taskType} onChange={(e) => setTaskType(e.target.value)} style={s.input}>
              <option value="writing">Writing</option>
              <option value="problem">Problem Set</option>
            </select>
          </div>
        </div>

        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ ...s.input, marginBottom: "0.5rem" }} />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} style={{ ...s.input, resize: "vertical", marginBottom: "0.5rem" }} />

        {/* Type-specific fields */}
        <div style={{ display: "grid", gridTemplateColumns: taskType === 'problem' ? '1fr 1fr 1fr' : '1fr 1fr', gap: "0.5rem", marginBottom: "0.5rem" }}>
          {taskType === 'problem' && (
            <div>
              <div style={s.label}>Set Size (# of problems)</div>
              <input type="number" value={setSize} onChange={(e) => setSetSize(e.target.value)} min={1} style={s.input} />
            </div>
          )}
          <div>
            <div style={s.label}>Difficulty (1-5)</div>
            <input type="range" min={1} max={5} value={difficulty} onChange={(e) => setDifficulty(e.target.value)} />
            <span style={{ fontSize: "0.8rem", color: "#666" }}> {difficulty}/5</span>
          </div>
          <div>
            <div style={s.label}>Complexity (1-5)</div>
            <input type="range" min={1} max={5} value={complexity} onChange={(e) => setComplexity(e.target.value)} />
            <span style={{ fontSize: "0.8rem", color: "#666" }}> {complexity}/5</span>
          </div>
        </div>

        {/* Shared fields */}
        <div style={{ marginBottom: "0.5rem" }}>
          <div style={{ ...s.label, ...s.row, justifyContent: "space-between" }}><span>Motivation</span><span>{motivation}/100</span></div>
          <input type="range" min={0} max={100} value={motivation} onChange={(e) => setMotivation(e.target.value)} style={{ width: "100%" }} />
        </div>

        <div style={{ marginBottom: "0.75rem" }}>
          <div style={s.label}>Days Until Due</div>
          <input type="number" value={daysUntilDue} onChange={(e) => setDaysUntilDue(e.target.value)} min={1} style={{ ...s.input, maxWidth: "200px" }} />
        </div>

        <button type="submit" style={s.btn("#FD366E")}>Add Task & Get Prediction</button>

        {/* Prediction Mode Toggle */}
        <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.8rem", color: "#666" }}>Prediction Mode:</span>
          <button type="button" onClick={() => setPredMode('ai')} style={{ padding: "0.3rem 0.7rem", borderRadius: "4px", border: predMode === 'ai' ? '2px solid #4f46e5' : '1px solid #ccc', background: predMode === 'ai' ? '#eef2ff' : '#fff', color: predMode === 'ai' ? '#4f46e5' : '#666', fontWeight: predMode === 'ai' ? 600 : 400, fontSize: "0.8rem", cursor: "pointer" }}>AI Compares</button>
          <button type="button" onClick={() => setPredMode('formula')} style={{ padding: "0.3rem 0.7rem", borderRadius: "4px", border: predMode === 'formula' ? '2px solid #059669' : '1px solid #ccc', background: predMode === 'formula' ? '#ecfdf5' : '#fff', color: predMode === 'formula' ? '#059669' : '#666', fontWeight: predMode === 'formula' ? 600 : 400, fontSize: "0.8rem", cursor: "pointer" }}>Formula</button>
          <span style={{ fontSize: "0.7rem", color: "#999" }}>{predMode === 'ai' ? 'AI predicts your time using history comparison' : 'Formula calculates your time, AI only estimates average'}</span>
        </div>
      </form>

      {/* ── Prediction Output ── */}
      {prediction && (
        <div style={{ ...s.section, background: "#f0f4ff", borderColor: "#93c5fd" }}>
          <h3 style={{ margin: "0 0 0.5rem" }}>Prediction: {prediction.taskTitle}
            <span style={{ fontSize: "0.7rem", fontWeight: 400, marginLeft: "0.5rem", padding: "0.15rem 0.4rem", borderRadius: "4px", background: prediction.mode === 'ai' ? '#eef2ff' : '#ecfdf5', color: prediction.mode === 'ai' ? '#4f46e5' : '#059669' }}>
              {prediction.mode === 'ai' ? 'AI Compares' : 'Formula'}
            </span>
          </h3>

          {/* Comparison-based stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#94a3b8" }}>
                {prediction.ai?.avg_person_minutes || prediction.avg_person_minutes || '—'}
              </div>
              <div style={s.label}>Avg Person</div>
              <div style={{ fontSize: "0.7rem", color: "#aaa" }}>minutes</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#4f46e5" }}>
                {prediction.mode === 'ai' && prediction.ai ? prediction.ai.predicted_minutes : prediction.predicted_minutes}
              </div>
              <div style={s.label}>Your Prediction</div>
              <div style={{ fontSize: "0.7rem", color: "#888" }}>{prediction.mode === 'ai' ? 'from AI' : `+${prediction.buffer_percent}% buffer`}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: "bold", color: prediction.speed_ratio < 1 ? '#10b981' : prediction.speed_ratio > 1 ? '#ef4444' : '#f59e0b' }}>
                {prediction.speed_ratio}x
              </div>
              <div style={s.label}>Your Speed</div>
              <div style={{ fontSize: "0.7rem", color: "#888" }}>{prediction.speed_ratio < 1 ? 'Faster than avg' : prediction.speed_ratio > 1 ? 'Slower than avg' : 'Average'}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: "bold", color: confidenceColors[prediction.ai?.confidence || prediction.confidence] }}>
                {(prediction.ai?.confidence || prediction.confidence).toUpperCase()}
              </div>
              <div style={s.label}>Confidence</div>
            </div>
          </div>

          {/* Speed comparison bar */}
          {prediction.speed_ratio && prediction.speed_ratio !== 1 && (
            <div style={{ marginBottom: "1rem", padding: "0.5rem 0.75rem", background: prediction.speed_ratio < 1 ? '#ecfdf5' : '#fef2f2', borderRadius: "6px", fontSize: "0.85rem", color: prediction.speed_ratio < 1 ? '#065f46' : '#991b1b' }}>
              {prediction.speed_ratio < 1
                ? `You're ${Math.round((1 - prediction.speed_ratio) * 100)}% faster than the average student! 🚀`
                : `You tend to take ${Math.round((prediction.speed_ratio - 1) * 100)}% longer than average for these tasks.`}
              {prediction.ai?.speed_comparison && ` AI says: ${prediction.ai.speed_comparison} than average.`}
            </div>
          )}

          {/* AI Insights */}
          {prediction.ai && (
            <div style={{ background: "#e0e7ff", borderRadius: "8px", padding: "1rem", marginBottom: "1rem" }}>
              <div style={{ fontWeight: 600, marginBottom: "0.5rem", color: "#4338ca" }}>AI Insights</div>
              {prediction.ai.reasoning && (
                <p style={{ margin: "0 0 0.5rem", fontSize: "0.9rem" }}>{prediction.ai.reasoning}</p>
              )}
              {prediction.ai.suggested_approach && (
                <div style={{ marginBottom: "0.5rem" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#555" }}>Strategy</div>
                  <p style={{ margin: 0, fontSize: "0.9rem" }}>{prediction.ai.suggested_approach}</p>
                </div>
              )}
              {prediction.ai.motivation_insight && (
                <div style={{ marginBottom: "0.5rem" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#555" }}>Motivation</div>
                  <p style={{ margin: 0, fontSize: "0.9rem" }}>{prediction.ai.motivation_insight}</p>
                </div>
              )}
              {prediction.ai.tips && prediction.ai.tips.length > 0 && (
                <div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#555" }}>Tips</div>
                  <ul style={{ margin: "0.25rem 0 0", paddingLeft: "1.2rem", fontSize: "0.85rem" }}>
                    {prediction.ai.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {prediction.daily_blocks.length > 0 && (
            <div>
              <div style={{ ...s.label, marginBottom: "0.5rem" }}>Suggested Daily Blocks</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {prediction.daily_blocks.map((b, i) => (
                  <div key={i} style={{ padding: "0.4rem 0.6rem", background: "#dbeafe", borderRadius: "6px", fontSize: "0.8rem" }}>
                    {b.date}: <strong>{b.minutes} min</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
          <button onClick={() => setPrediction(null)} style={{ ...s.btn("#94a3b8"), marginTop: "0.75rem", fontSize: "0.8rem" }}>Dismiss</button>
        </div>
      )}

      {message && <div style={{ padding: "0.75rem", background: "#f0f0f0", borderRadius: "4px", marginBottom: "1rem" }}>{message}</div>}

      {/* ── Task List ── */}
      <h3>Your Tasks</h3>
      {tasks.length === 0 ? (
        <p style={{ color: "#999" }}>No tasks yet. Add one above!</p>
      ) : (
        tasks.map((task) => (
          <div key={task.$id} style={{ ...s.card, opacity: task.status === "done" ? 0.6 : 1, borderLeft: `4px solid ${statusColors[task.status] || "#ccc"}` }}>
            <div style={{ ...s.row, justifyContent: "space-between" }}>
              <div style={s.row}>
                <input
                  type="checkbox"
                  checked={task.status === "done"}
                  onChange={() => handleToggleStatus(task)}
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                />
                <div>
                  <strong style={{ textDecoration: task.status === "done" ? "line-through" : "none" }}>{task.title}</strong>
                  <div style={{ fontSize: "0.75rem", color: statusColors[task.status], fontWeight: 600 }}>{statusLabels[task.status]}</div>
                </div>
              </div>
              <div style={s.row}>
                {task.status !== 'done' && (
                  <button onClick={() => handleShowPrediction(task)} style={{ ...s.btn("#6366f1"), padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}>Predict</button>
                )}
                <button onClick={() => handleDelete(task.$id)} style={{ ...s.btn("#e00"), padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}>Delete</button>
              </div>
            </div>
            {task.description && <p style={{ margin: "0.5rem 0 0", color: "#444", fontSize: "0.9rem" }}>{task.description}</p>}
            <div style={{ ...s.row, marginTop: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ background: "#eef", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem" }}>{task.class_type}</span>
              <span style={{ background: "#efe", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem" }}>{task.task_type}</span>
              <span style={{ background: "#fee", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem" }}>Avg: {task.estimated_length}m</span>
              {task.task_type === 'problem' && <span style={{ background: "#fef", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem" }}>{task.set_size} problems</span>}
              <span style={{ background: "#ffe", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem" }}>Difficulty: {task.difficulty}/5</span>
              <span style={{ background: "#eee", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem" }}>Motivation: {task.motivation}%</span>
            </div>
            {task.status === 'done' && task.actual_time > 0 && (
              <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "#666" }}>
                Avg estimate: {task.estimated_length}m → Your time: {task.actual_time}m |
                Speed: {task.estimated_length > 0 ? `${Math.round((task.actual_time / task.estimated_length) * 100) / 100}x` : '?'} |
                {task.estimated_length > 0 && task.actual_time < task.estimated_length ? ' Faster than avg ✅' : task.estimated_length > 0 && task.actual_time > task.estimated_length ? ' Slower than avg' : ' Same as avg'} |
                Post-motivation: {task.post_motivation}%
              </div>
            )}
          </div>
        ))
      )}

      {/* ── Post-Task Logger Modal ── */}
      {loggingTask && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <form onSubmit={handleLogCompletion} style={{ background: "white", padding: "2rem", borderRadius: "12px", maxWidth: "400px", width: "90%" }}>
            <h3 style={{ marginTop: 0 }}>Complete: {loggingTask.title}</h3>
            <div style={{ marginBottom: "1rem" }}>
              <div style={s.label}>How long did it actually take? (minutes)</div>
              <input type="number" value={actualTime} onChange={(e) => setActualTime(e.target.value)} min={1} required style={s.input} placeholder="Actual minutes spent" />
              {actualTime && loggingTask.estimated_length > 0 && (
                <div style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.25rem" }}>
                  Avg person: {loggingTask.estimated_length}m → You: {actualTime}m
                  ({actualTime < loggingTask.estimated_length 
                    ? `${Math.round((1 - actualTime / loggingTask.estimated_length) * 100)}% faster than avg 🚀` 
                    : actualTime > loggingTask.estimated_length 
                      ? `${Math.round((actualTime / loggingTask.estimated_length - 1) * 100)}% slower than avg`
                      : 'Same as average'})
                </div>
              )}
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ ...s.label, ...s.row, justifyContent: "space-between" }}>
                <span>How motivated were you actually?</span>
                <span>{postMotivation}/100</span>
              </div>
              <input type="range" min={0} max={100} value={postMotivation} onChange={(e) => setPostMotivation(e.target.value)} style={{ width: "100%" }} />
              <div style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.25rem" }}>
                Pre-task: {loggingTask.motivation}% → Post: {postMotivation}% ({postMotivation > loggingTask.motivation ? '📈' : postMotivation < loggingTask.motivation ? '📉' : '➡️'})
              </div>
            </div>
            <div style={{ ...s.row, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setLoggingTask(null)} style={s.btn("#999")}>Cancel</button>
              <button type="submit" style={s.btn("#10b981")}>Log & Complete</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

