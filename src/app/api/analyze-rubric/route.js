import { NextResponse } from 'next/server';
import mammoth from 'mammoth';

export async function POST(request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
  }

  const formData = await request.formData();
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
      const pdf = (await import('pdf-parse')).default;
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

  // Truncate to avoid hitting token limits
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

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 500 },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `Gemini API error: ${res.status}`, details: errText }, { status: 502 });
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Could not parse AI response', raw: text }, { status: 500 });
    }

    const analysis = JSON.parse(jsonMatch[0]);
    return NextResponse.json(analysis);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
