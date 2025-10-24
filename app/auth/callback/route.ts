import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { ensureUserInDatabase } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createServerClient();
    
    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(new URL('/auth/signin?error=auth_failed', req.url));
    }

    if (data.user) {
      // Create user in database if not exists
      await ensureUserInDatabase(
        data.user.id,
        data.user.email!,
        data.user.user_metadata?.name
      );

      // Redirect to profile setup
      return NextResponse.redirect(new URL('/profile/setup', req.url));
    }
  }

  // If no code or error, redirect to signin
  return NextResponse.redirect(new URL('/auth/signin', req.url));
}

