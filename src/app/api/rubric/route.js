import { NextResponse } from "next/server";

/**
 * POST /api/rubric
 * Accepts a multipart form with:
 *  - file: PDF or DOCX rubric file
 * Returns the extracted plain text from the document.
 *
 * The JSON-parse errors seen previously were caused by webpack bundling
 * pdf-parse and mammoth into the edge runtime. They are now excluded via
 * serverExternalPackages in next.config.mjs so they run in the Node.js
 * runtime and import correctly.
 */

// Force Node.js runtime so that pdf-parse / mammoth can use the fs module.
export const runtime = "nodejs";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileName = file.name ?? "";
    const ext = fileName.split(".").pop().toLowerCase();

    if (!["pdf", "docx", "doc"].includes(ext)) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF or DOCX file." },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let text = "";

    if (ext === "pdf") {
      // Dynamic import keeps this out of the edge-runtime bundle
      const pdfParse = (await import("pdf-parse")).default;
      const data = await pdfParse(buffer);
      text = data.text;
    } else {
      // DOCX / DOC
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    }

    return NextResponse.json({ text: text.trim() }, { status: 200 });
  } catch (err) {
    console.error("Rubric parse error:", err);
    return NextResponse.json(
      { error: err.message ?? "Failed to parse rubric file" },
      { status: 500 },
    );
  }
}
