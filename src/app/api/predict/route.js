import { NextResponse } from 'next/server';

export async function POST(request) {
  const { task, completedTasks, mode } = await request.json();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
  }

  // Build history with speed ratios for AI context
  const historyByClass = {};
  const speedRatios = [];
  for (const t of completedTasks) {
    if (!historyByClass[t.class_type]) historyByClass[t.class_type] = [];
    const entry = {
      task_type: t.task_type,
      difficulty: t.difficulty,
      complexity: t.complexity,
      motivation: t.motivation,
      avg_person_estimate: t.estimated_length,
      actual_time: t.actual_time,
      post_motivation: t.post_motivation,
      set_size: t.set_size,
    };
    if (t.actual_time > 0 && t.estimated_length > 0) {
      entry.speed_ratio = Math.round((t.actual_time / t.estimated_length) * 100) / 100;
      speedRatios.push({ class: t.class_type, type: t.task_type, ratio: entry.speed_ratio });
    }
    historyByClass[t.class_type].push(entry);
  }

  // Compute overall speed ratio
  const avgSpeedRatio = speedRatios.length > 0
    ? Math.round((speedRatios.reduce((s, r) => s + r.ratio, 0) / speedRatios.length) * 100) / 100
    : null;

  let prompt;

  if (mode === 'formula') {
    // Formula mode: AI only estimates average student time
    prompt = `You are a student task time estimation engine. Your ONLY job is to estimate how long an AVERAGE student would take to complete this task. Do NOT try to predict this specific student's time — the formula engine handles that.

TASK:
- Title: ${task.title}
- Description: ${task.description || 'none'}
- Subject: ${task.class_type}
- Type: ${task.task_type} (${task.task_type === 'problem' ? `${task.set_size} problems` : 'writing assignment'})
- Difficulty: ${task.difficulty}/5
- Complexity: ${task.complexity}/5

Respond ONLY with valid JSON (no markdown, no backticks):
{
  "avg_person_minutes": <number: your estimate of how long an average student would take>,
  "reasoning": "<1-2 sentences: how you calculated the average time>",
  "tips": ["<tip 1>", "<tip 2>"],
  "suggested_approach": "<brief strategy for this task>"
}

Rules for avg_person_minutes:
- Writing: ~30-45 min for a short response, 60-120 for an essay, 120-240 for a research paper. Scale with difficulty and complexity.
- Problem sets: ~3-8 min per problem depending on subject and difficulty. Multiply by set_size.
- Higher difficulty = more time. Complexity amplifies it further.
- Consider the subject: math problems are typically faster per-problem than science lab reports.
- Be realistic and specific about WHY you chose the number.`;
  } else {
    // AI mode: AI estimates avg time AND predicts student's personal time
    prompt = `You are a student productivity prediction engine. You have two jobs:
1. ESTIMATE how long an AVERAGE student would take to complete this task
2. PREDICT how long THIS SPECIFIC student will take, based on their personal speed ratio vs average

KEY CONCEPT:
- You must first calculate "avg_person_minutes" — how long a typical student would take this task
- Then compare to this student's history: speed_ratio = actual_time / avg_person_estimate
- ratio < 1.0 = student is faster than average, > 1.0 = slower than average
${avgSpeedRatio ? `- This student's overall speed ratio from past tasks: ${avgSpeedRatio}x (${avgSpeedRatio < 1 ? 'faster' : avgSpeedRatio > 1 ? 'slower' : 'same as'} average)` : '- No history yet — new user.'}

NEW TASK TO PREDICT:
- Title: ${task.title}
- Description: ${task.description || 'none'}
- Subject: ${task.class_type}
- Type: ${task.task_type} (${task.task_type === 'problem' ? `${task.set_size} problems` : 'writing assignment'})
- Difficulty: ${task.difficulty}/5
- Complexity: ${task.complexity}/5
- Student's current motivation: ${task.motivation}/100

STUDENT HISTORY (completed tasks with speed ratios vs average estimates):
${completedTasks.length === 0
  ? 'No history — first-time user.'
  : JSON.stringify(historyByClass, null, 2)}

Respond ONLY with valid JSON (no markdown, no backticks):
{
  "avg_person_minutes": <number: YOUR estimate of how long an average student would take — this is critical, calculate it carefully based on subject, type, difficulty, complexity, and set_size>,
  "predicted_minutes": <number: your prediction for THIS student = avg_person_minutes × student's speed_ratio, adjusted for motivation>,
  "speed_comparison": "<faster|slower|similar> than average",
  "confidence": "<low|medium|high>",
  "reasoning": "<1-2 sentences: what's the avg estimate, what's the student's ratio, how you adjusted>",
  "tips": ["<tip 1>", "<tip 2>"],
  "suggested_approach": "<brief strategy for this specific task>",
  "motivation_insight": "<observation about motivation patterns or encouragement>"
}

Rules for avg_person_minutes:
- Writing: ~30-45 min for a short response, 60-120 for an essay, 120-240 for a research paper. Scale with difficulty and complexity.
- Problem sets: ~3-8 min per problem depending on subject and difficulty. Multiply by set_size.
- Higher difficulty = more time. Complexity amplifies it further.
- Consider the subject: math problems are typically faster per-problem than science lab reports.

Rules for predicted_minutes:
- predicted_minutes = avg_person_minutes × student's speed_ratio (from history)
- If no history, predicted_minutes = avg_person_minutes × 1.2 (slight buffer) and confidence "low"
- Prefer speed ratios for SAME subject and task type. Fall back to overall ratio.
- Low motivation (<30) adds ~20% time, high motivation (>70) saves ~10%
- Be specific about WHY you chose both numbers`;
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `Gemini API error: ${res.status}`, details: errText }, { status: 502 });
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse the JSON from Gemini's response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Could not parse AI response', raw: text }, { status: 500 });
    }

    const prediction = JSON.parse(jsonMatch[0]);
    return NextResponse.json(prediction);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
