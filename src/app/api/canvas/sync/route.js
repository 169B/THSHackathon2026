// Fetch and sync Canvas assignments
import { cookies } from 'next/headers';
import { getUpcomingAssignments, convertCanvasToTask } from '@/lib/canvas';
import { Client, Databases, ID, Query } from 'appwrite';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const canvasToken = cookieStore.get('canvas_token')?.value;
    const canvasBaseUrl = cookieStore.get('canvas_base_url')?.value;

    if (!canvasToken) {
      return new Response(
        JSON.stringify({ error: 'Canvas token not found. Save your personal token first.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing userId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch upcoming assignments from Canvas
    const assignments = await getUpcomingAssignments(canvasToken, canvasBaseUrl);

    if (!assignments || assignments.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No upcoming assignments found in next 7 days', assignments: [] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Convert to Estimately tasks
    const tasks = assignments.map(assignment => convertCanvasToTask(assignment, userId));

    // Initialize Appwrite client
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);
    const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '69bdf6a40036b8e0475e';
    const collectionId = 'tasks';

    const createdTasks = [];

    for (const task of tasks) {
      try {
        // Check if assignment already exists (avoid duplicates)
        const existing = await databases.listDocuments(dbId, collectionId, [
          Query.equal('canvas_assignment_id', String(task.canvas_assignment_id)),
          Query.equal('userId', userId),
        ]);

        if (existing.total > 0) {
          createdTasks.push({
            ...existing.documents[0],
            status: 'duplicate',
          });
          continue;
        }

        const created = await databases.createDocument(dbId, collectionId, ID.unique(), task);
        createdTasks.push(created);
      } catch (err) {
        console.error('Error creating task:', err);
        createdTasks.push({
          ...task,
          error: err.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Canvas assignments synced successfully',
        total: assignments.length,
        tasks: createdTasks,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Canvas sync error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// GET upcoming assignments preview (without syncing to DB)
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const canvasToken = cookieStore.get('canvas_token')?.value;
    const canvasBaseUrl = cookieStore.get('canvas_base_url')?.value;

    if (!canvasToken) {
      return new Response(
        JSON.stringify({ error: 'Canvas token not found. Save your personal token first.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const assignments = await getUpcomingAssignments(canvasToken, canvasBaseUrl);

    return new Response(
      JSON.stringify({
        upcoming: assignments,
        count: assignments.length,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Canvas preview error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
