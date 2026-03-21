import { NextResponse } from 'next/server';
import mammoth from 'mammoth';
import { callGemini } from '@/lib/gemini';

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    let formData;
    try {
      formData = await request.formData();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid form data: ' + e.message }, { status: 400 });
    }

    const file = formData.get('file');
    const pastedText = formData.get('text');
    const classType = formData.get('class_type') || 'general';
    const taskType = formData.get('task_type') || 'writing';

    let rubricText = '';

    if (pastedText) {
      rubricText = pastedText;
    } else if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const name = file.name.toLowerCase();

      if (name.endsWith('.pdf')) {
        let pdf;
        try {
          pdf = (await import('pdf-parse/lib/pdf-parse.js')).default;
        } catch (e) {
          return NextResponse.json({ error: 'PDF parsing is not available: ' + e.message }, { status: 500 });
        }
        const data = await pdf(buffer);
        rubricText = data.text;
      } else if (name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ buffer });
        rubricText = result.value;
      } else {
        return NextResponse.json({ error: 'Unsupported file type. Use PDF or DOCX.' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'No file or text provided' }, { status: 400 });
    }

    if (rubricText.length > 8000) {
      rubricText = rubricText.substring(0, 8000);
    }

    const prompt = `You are an academic task analyzer. Analyze this rubric/assignment description and determine the complexity and difficulty for a student.

SUBJECT: ${classType}
TASK TYPE: ${taskType}

RUBRIC/ASSIGNMENT TEXT:
${rubricText}

Respond ONLY with valid JSON (no markdown, no backticks):
{
  "complexity": <number 1-5, where 1=very simple, 5=extremely complex>,
  "difficulty": <number 1-5, where 1=very easy, 5=very hard>,
  "estimated_minutes": <number: estimated time in minutes for an average student>,
  "task_type_detected": "<writing|problem>",
  "set_size": <number: if problem set, how many problems/questions detected, otherwise 0>,
  "summary": "<1-2 sentence summary of what the assignment requires>",
  "key_requirements": ["<requirement 1>", "<requirement 2>", "<requirement 3>"],
  "suggested_title": "<short title for this task>"
}

Rules:
- Analyze the actual content depth, not just length
- Factor in research requirements, critical thinking, and synthesis
- For writing tasks: consider page/word requirements, source requirements, analysis depth
- For problem sets: count distinct problems/questions
- Be realistic about student time estimates`;

    const analysis = await callGemini(apiKey, prompt, { temperature: 0.2 });
    return NextResponse.json(analysis);
  } catch (err) {
    const status = err.status || 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
