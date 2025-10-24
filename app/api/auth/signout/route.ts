import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Signout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sign out' },
      { status: 500 }
    );
  }
}

