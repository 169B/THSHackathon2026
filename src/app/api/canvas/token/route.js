import { cookies } from 'next/headers';

function normalizeCanvasBaseUrl(rawBaseUrl) {
  const fallback = 'https://canvas.instructure.com/api/v1';
  if (!rawBaseUrl) return fallback;

  const trimmed = rawBaseUrl.trim().replace(/\/+$/, '');
  if (!trimmed) return fallback;

  const lower = trimmed.toLowerCase();
  if (!lower.startsWith('http://') && !lower.startsWith('https://')) {
    throw new Error('Canvas base URL must start with http:// or https://');
  }

  return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const token = body?.token?.trim();
    const baseUrl = normalizeCanvasBaseUrl(body?.baseUrl);

    if (!token) {
      return new Response(JSON.stringify({ error: 'Token is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cookieStore = await cookies();
    cookieStore.set('canvas_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    cookieStore.set('canvas_base_url', baseUrl, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('canvas_token');
  cookieStore.delete('canvas_base_url');

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
