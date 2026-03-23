// Handle Canvas OAuth callback
import { cookies } from 'next/headers';

export async function GET(request) {
  const searchParams = new URL(request.url).searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return new Response(
      `<html><body>Error: ${error}. <a href="/">Go back</a></body></html>`,
      { status: 400, headers: { 'Content-Type': 'text/html' } }
    );
  }

  if (!code) {
    return new Response('Missing authorization code', { status: 400 });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://canvas.instructure.com/login/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.CANVAS_OAUTH_CLIENT_ID,
        client_secret: process.env.CANVAS_OAUTH_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/canvas/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    const cookieStore = await cookies();

    // Store Canvas token securely in httpOnly cookie
    cookieStore.set('canvas_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenData.expires_in,
    });

    // Also store user info if available
    if (tokenData.user) {
      cookieStore.set('canvas_user', JSON.stringify(tokenData.user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    }

    // Redirect to dashboard with success message
    return new Response(
      `<html><body>Canvas account connected successfully! Redirecting...<script>window.location.href = '/dashboard?canvas_connected=true';</script></body></html>`,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    );
  } catch (error) {
    console.error('Canvas OAuth error:', error);
    return new Response(
      `<html><body>Error connecting Canvas account: ${error.message}. <a href="/">Go back</a></body></html>`,
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    );
  }
}
