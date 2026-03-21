import { NextResponse } from "next/server";
import {
  createAdminClient,
  DATABASE_ID,
  COLLECTION,
  ID,
  Query,
} from "@/lib/appwrite-server";

/**
 * GET /api/tasks?userId=<id>
 * Returns all tasks for a user.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId query parameter" }, { status: 400 });
    }

    const { databases } = createAdminClient();
    const result = await databases.listDocuments(DATABASE_ID, COLLECTION.TASKS, [
      Query.equal("user_id", userId),
      Query.orderDesc("$createdAt"),
    ]);

    return NextResponse.json({ tasks: result.documents }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message ?? "Failed to fetch tasks" },
      { status: err?.code ?? 500 },
    );
  }
}

/**
 * POST /api/tasks
 * Body: {
 *   userId, title, description?, task_type, class_type,
 *   complexity (1-10), motivation (1-100), estimated_time?,
 *   actual_time?, use_ai
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();

    const {
      userId,
      title,
      description = "",
      task_type,
      class_type,
      complexity,
      motivation,
      estimated_time = null,
      actual_time = null,
      use_ai = false,
    } = body;

    if (!userId || !title || !task_type || !class_type) {
      return NextResponse.json(
        { error: "Missing required fields: userId, title, task_type, class_type" },
        { status: 400 },
      );
    }

    if (
      complexity !== undefined &&
      (typeof complexity !== "number" || complexity < 1 || complexity > 10)
    ) {
      return NextResponse.json(
        { error: "complexity must be a number between 1 and 10" },
        { status: 400 },
      );
    }

    if (
      motivation !== undefined &&
      (typeof motivation !== "number" || motivation < 1 || motivation > 100)
    ) {
      return NextResponse.json(
        { error: "motivation must be a number between 1 and 100" },
        { status: 400 },
      );
    }

    const { databases } = createAdminClient();

    const doc = await databases.createDocument(DATABASE_ID, COLLECTION.TASKS, ID.unique(), {
      user_id: userId,
      title,
      description,
      task_type,
      class_type,
      complexity: complexity ?? 5,
      motivation: motivation ?? 50,
      estimated_time,
      actual_time,
      use_ai,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ task: doc }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message ?? "Failed to create task" },
      { status: err?.code ?? 500 },
    );
  }
}

/**
 * PATCH /api/tasks
 * Body: { taskId, ...fields to update }
 */
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { taskId, ...updates } = body;

    if (!taskId) {
      return NextResponse.json({ error: "Missing taskId" }, { status: 400 });
    }

    // Validate types if present
    if (
      updates.complexity !== undefined &&
      (typeof updates.complexity !== "number" || updates.complexity < 1 || updates.complexity > 10)
    ) {
      return NextResponse.json(
        { error: "complexity must be a number between 1 and 10" },
        { status: 400 },
      );
    }

    if (
      updates.motivation !== undefined &&
      (typeof updates.motivation !== "number" ||
        updates.motivation < 1 ||
        updates.motivation > 100)
    ) {
      return NextResponse.json(
        { error: "motivation must be a number between 1 and 100" },
        { status: 400 },
      );
    }

    const { databases } = createAdminClient();
    const doc = await databases.updateDocument(DATABASE_ID, COLLECTION.TASKS, taskId, updates);

    return NextResponse.json({ task: doc }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message ?? "Failed to update task" },
      { status: err?.code ?? 500 },
    );
  }
}

/**
 * DELETE /api/tasks?taskId=<id>
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json({ error: "Missing taskId query parameter" }, { status: 400 });
    }

    const { databases } = createAdminClient();
    await databases.deleteDocument(DATABASE_ID, COLLECTION.TASKS, taskId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message ?? "Failed to delete task" },
      { status: err?.code ?? 500 },
    );
  }
}
