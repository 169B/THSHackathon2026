const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const MAX_RETRIES = 3;

/**
 * Call Gemini API with retry logic for rate limits.
 * Returns parsed JSON from the AI response.
 * Throws on failure with a descriptive error.
 */
export async function callGemini(apiKey, prompt, { temperature = 0.3, maxOutputTokens = 8192 } = {}) {
  let res;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature, maxOutputTokens, thinkingConfig: { thinkingBudget: 0 } },
      }),
    });

    if (res.status !== 429) break;
    await new Promise(r => setTimeout(r, 2000 * Math.pow(2, attempt)));
  }

  if (!res.ok) {
    const errText = await res.text();
    const err = new Error(`Gemini API error: ${res.status} — ${errText.slice(0, 200)}`);
    err.status = 502;
    throw err;
  }

  const data = await res.json();
  const candidate = data.candidates?.[0];
  if (!candidate?.content?.parts?.length) {
    const reason = candidate?.finishReason || 'no candidates';
    const err = new Error(`Gemini returned no content (${reason})`);
    err.status = 502;
    throw err;
  }

  // 2.5-flash returns thinking parts (thought=true) before the answer — skip them
  const parts = candidate.content.parts;
  const answerParts = parts.filter(p => !p.thought);
  const text = (answerParts.length ? answerParts : parts).map(p => p.text || '').join('');

  // Strip markdown code fences if present (```json ... ```)
  const stripped = text.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();

  const jsonMatch = stripped.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    const err = new Error(`Could not parse AI response: ${text.slice(0, 200)}`);
    err.status = 500;
    throw err;
  }

  return JSON.parse(jsonMatch[0]);
}
