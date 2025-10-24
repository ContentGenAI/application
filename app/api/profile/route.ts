import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';
import { getUserFromHeader } from '@/lib/auth-header';

// GET business profile
export async function GET(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.businessProfile.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// POST/PUT business profile (create or update)
export async function POST(req: NextRequest) {
  try {
    // Try header-based auth first (more reliable), then fall back to cookies
    let user = await getUserFromHeader(req);
    
    if (!user) {
      console.log('No user from header, trying cookies...');
      user = await getUser();
    }
    
    console.log('Profile API - User:', user);
    
    if (!user) {
      console.error('Profile API - No user found from header or cookies');
      return NextResponse.json({ error: 'Unauthorized - Please sign in again' }, { status: 401 });
    }

    // Verify user exists in database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      console.error('Profile API - User not found in database:', user.id);
      return NextResponse.json(
        { error: 'User not found in database. Please refresh and try again.' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { businessName, industry, tone, keywords, targetAudience } = body;

    // Validate required fields
    if (!businessName || !industry || !tone || !targetAudience) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if profile exists
    const existingProfile = await prisma.businessProfile.findUnique({
      where: { userId: user.id },
    });

    let profile;
    if (existingProfile) {
      // Update existing profile
      profile = await prisma.businessProfile.update({
        where: { userId: user.id },
        data: {
          businessName,
          industry,
          tone,
          keywords: keywords || [],
          targetAudience,
        },
      });
    } else {
      // Create new profile
      profile = await prisma.businessProfile.create({
        data: {
          userId: user.id,
          businessName,
          industry,
          tone,
          keywords: keywords || [],
          targetAudience,
        },
      });
    }

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error('Profile save error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save profile' },
      { status: 500 }
    );
  }
}

