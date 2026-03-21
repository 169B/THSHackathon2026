import { NextResponse } from "next/server";
import { createAdminClient, DATABASE_ID, COLLECTION, ID } from "@/lib/appwrite-server";

/**
 * POST /api/auth
 * Body: { action: "signup" | "signin", email, password, name? }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, email, password, name } = body;

    if (!action || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields: action, email, password" },
        { status: 400 },
      );
    }

    const { account, databases } = createAdminClient();

    if (action === "signup") {
      const userId = ID.unique();

      // Create auth account
      const user = await account.create(userId, email, password, name || email.split("@")[0]);

      // Create user data profile document
      await databases.createDocument(DATABASE_ID, COLLECTION.USERS_DATA, ID.unique(), {
        user_id: user.$id,
        motivation: 50,
        class_type: "general",
        created_at: new Date().toISOString(),
      });

      return NextResponse.json(
        { success: true, userId: user.$id, email: user.email, name: user.name },
        { status: 201 },
      );
    }

    if (action === "signin") {
      // Use Users API to verify credentials (admin client approach)
      const session = await account.createEmailPasswordSession(email, password);
      return NextResponse.json(
        { success: true, sessionId: session.$id, userId: session.userId },
        { status: 200 },
      );
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err) {
    const status = err?.code ?? 500;
    return NextResponse.json({ error: err.message ?? "Internal server error" }, { status });
  }
}
