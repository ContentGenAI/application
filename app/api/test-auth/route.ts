import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  // Get Authorization header
  const authHeader = req.headers.get('authorization');

  return NextResponse.json({
    hasCookies: allCookies.length > 0,
    cookieNames: allCookies.map(c => c.name),
    hasAuthHeader: !!authHeader,
    authHeaderPreview: authHeader ? authHeader.substring(0, 20) + '...' : null,
    supabaseCookies: allCookies
      .filter(c => c.name.includes('supabase') || c.name.includes('sb-'))
      .map(c => ({ name: c.name, hasValue: !!c.value })),
  });
}


