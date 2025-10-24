import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { ensureUserInDatabase } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    console.log('=== SIGNUP STARTED ===');
    
    const body = await req.json();
    const { email, password, name } = body;
    console.log('Signup request for:', email);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('Creating Supabase client...');
    // Create Supabase server client
    const supabase = await createServerClient();
    console.log('Supabase client created');

    console.log('Calling Supabase signup...');
    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('Supabase signup error:', error);
      throw error;
    }
    console.log('Supabase signup successful, user ID:', data.user?.id);

    // Create user in database
    if (data.user) {
      console.log('Creating user in database...');
      await ensureUserInDatabase(data.user.id, data.user.email!, name);
      console.log('User created in database successfully');
    }

    // Check if email confirmation is required
    const emailConfirmationRequired = !data.session && data.user;
    console.log('Email confirmation required:', emailConfirmationRequired);

    console.log('=== SIGNUP COMPLETED ===');
    return NextResponse.json({
      success: true,
      user: data.user,
      session: data.session,
      emailConfirmationRequired,
    });
  } catch (error: any) {
    console.error('!!! SIGNUP ERROR !!!');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json(
      { error: error.message || 'Failed to sign up' },
      { status: 500 }
    );
  }
}

