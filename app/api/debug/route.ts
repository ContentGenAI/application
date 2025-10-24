import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    // Check client-side session
    const { data: clientData } = await supabase.auth.getSession();
    
    // Check server-side user
    const serverUser = await getUser();

    return NextResponse.json({
      serverUser: serverUser ? { id: serverUser.id, email: serverUser.email } : null,
      clientSession: clientData.session ? 'exists' : 'null',
      hasAuth: !!serverUser,
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      serverUser: null,
      clientSession: 'error',
    });
  }
}


