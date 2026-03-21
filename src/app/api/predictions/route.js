import { NextResponse } from "next/server";
import {
  createAdminClient,
  DATABASE_ID,
  COLLECTION,
  ID,
  Query,
} from "@/lib/appwrite-server";

export const runtime = "nodejs";

// --- Formula-based time estimator ---
// Heuristic: base_minutes * (complexity/5) * (1 + (100 - motivation) / 200)
const CLASS_BASE_MINUTES = {
  math: 45,
  science: 60,
  english: 40,
  history: 50,
  art: 30,
  music: 30,
  pe: 20,
  general: 45,
};

const TASK_TYPE_MULTIPLIER = {
  homework: 1.0,
  project: 2.5,
  "exam prep": 3.0,
  essay: 2.0,
  reading: 0.8,
  lab: 1.5,
  presentation: 2.0,
  other: 1.0,
};

function formulaEstimate(task) {
  const base = CLASS_BASE_MINUTES[task.class_type?.toLowerCase()] ?? 45;
  const typeMultiplier = TASK_TYPE_MULTIPLIER[task.task_type?.toLowerCase()] ?? 1.0;
  const complexity = task.complexity ?? 5;
  const motivation = task.motivation ?? 50;

  const minutes = base * typeMultiplier * (complexity / 5) * (1 + (100 - motivation) / 200);
  return Math.round(minutes * 10) / 10; // round to 1 decimal
}

// --- AI-based estimator via OpenAI ---
async function aiEstimate(task, rubricText = "") {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const prompt = [
    `You are an expert academic time estimator. Given the following task details, estimate how many minutes a student will need to complete it.`,
    ``,
    `Task: ${task.title}`,
    `Description: ${task.description || "N/A"}`,
    `Subject: ${task.class_type}`,
    `Task type: ${task.task_type}`,
    `Complexity (1-10): ${task.complexity}`,
    `Student motivation (1-100): ${task.motivation}`,
    rubricText ? `Rubric:\n${rubricText}` : "",
    ``,
    `Respond with ONLY a JSON object in this exact format (no other text):`,
    `{"estimated_minutes": <number>, "reasoning": "<brief explanation>"}`,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 256,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${errText}`);
  }

  const json = await response.json();
  const content = json.choices?.[0]?.message?.content ?? "";

  // Safely parse the JSON the model returned
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error(`AI response was not valid JSON: ${content}`);
  }

  return JSON.parse(match[0]);
}

/**
 * POST /api/predictions
 * Body: {
 *   task: { user_id, title, description?, task_type, class_type, complexity, motivation },
 *   rubric_text?: string,
 *   use_ai: boolean,
 *   save?: boolean   // persist to Appwrite predictions collection
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { task, rubric_text = "", use_ai = false, save = false } = body;

    if (!task) {
      return NextResponse.json({ error: "Missing task object in request body" }, { status: 400 });
    }

    let estimated_minutes;
    let method;
    let reasoning = "";

    if (use_ai) {
      const aiResult = await aiEstimate(task, rubric_text);
      estimated_minutes = aiResult.estimated_minutes;
      reasoning = aiResult.reasoning ?? "";
      method = "ai";
    } else {
      estimated_minutes = formulaEstimate(task);
      method = "formula";
      reasoning = `Formula estimate based on subject (${task.class_type}), task type (${task.task_type}), complexity ${task.complexity}/10, and motivation ${task.motivation}/100.`;
    }

    const result = { estimated_minutes, method, reasoning };

    if (save && task.user_id && task.$id) {
      try {
        const { databases } = createAdminClient();
        const doc = await databases.createDocument(
          DATABASE_ID,
          COLLECTION.PREDICTIONS,
          ID.unique(),
          {
            task_id: task.$id,
            user_id: task.user_id,
            predicted_time: estimated_minutes,
            method,
            rubric_text: rubric_text.slice(0, 5000), // cap to Appwrite string attribute max length
            reasoning,
            created_at: new Date().toISOString(),
          },
        );
        result.predictionId = doc.$id;
      } catch (saveErr) {
        // Non-fatal — return the estimate even if saving fails
        console.error("Failed to save prediction:", saveErr.message);
        result.saveError = saveErr.message;
      }
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("Prediction error:", err);
    return NextResponse.json(
      { error: err.message ?? "Failed to generate prediction" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/predictions?userId=<id>&taskId=<id>
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const taskId = searchParams.get("taskId");

    if (!userId && !taskId) {
      return NextResponse.json(
        { error: "Provide at least one of: userId, taskId" },
        { status: 400 },
      );
    }

    const { databases } = createAdminClient();

    const filters = [];
    if (userId) filters.push(Query.equal("user_id", userId));
    if (taskId) filters.push(Query.equal("task_id", taskId));

    const result = await databases.listDocuments(DATABASE_ID, COLLECTION.PREDICTIONS, filters);

    return NextResponse.json({ predictions: result.documents }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message ?? "Failed to fetch predictions" },
      { status: err?.code ?? 500 },
    );
  }
}
