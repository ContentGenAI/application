import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeader } from '@/lib/auth-header';
import { getUser, ensureUserInDatabase } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Ensures user exists in database
 * Call this after signup to create the database record
 */
export async function POST(req: NextRequest) {
  try {
    // Get user from Supabase
    let supabaseUser = await getUserFromHeader(req);
    if (!supabaseUser) supabaseUser = await getUser();

    if (!supabaseUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('Ensuring user exists:', supabaseUser.id);

    // Check if user exists in our database
    let dbUser = await prisma.user.findUnique({
      where: { id: supabaseUser.id },
      include: { subscription: true },
    });

    // If not, create them
    if (!dbUser) {
      console.log('User not found in DB, creating...');
      await ensureUserInDatabase(
        supabaseUser.id,
        supabaseUser.email!,
        supabaseUser.user_metadata?.name
      );
      
      dbUser = await prisma.user.findUnique({
        where: { id: supabaseUser.id },
        include: { subscription: true },
      });
      console.log('User created in database');
    } else {
      console.log('User already exists in database');
    }

    return NextResponse.json({
      success: true,
      user: {
        id: dbUser!.id,
        email: dbUser!.email,
        hasSubscription: !!dbUser!.subscription,
      },
    });
  } catch (error: any) {
    console.error('Error ensuring user exists:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to ensure user exists' },
      { status: 500 }
    );
  }
}

