import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { getMetaAuthUrl } from '@/lib/social/meta';
import { getLinkedInAuthUrl } from '@/lib/social/linkedin';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { platform } = await req.json();

    if (!['facebook', 'instagram', 'linkedin'].includes(platform)) {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/social/callback`;
    
    // Use user ID as state for security
    const state = Buffer.from(JSON.stringify({ userId: user.id, platform })).toString('base64');

    let authUrl: string;

    switch (platform) {
      case 'facebook':
      case 'instagram': // Instagram uses Facebook OAuth
        authUrl = getMetaAuthUrl(
          {
            clientId: process.env.META_APP_ID!,
            clientSecret: process.env.META_APP_SECRET!,
            redirectUri,
          },
          state
        );
        break;

      case 'linkedin':
        authUrl = getLinkedInAuthUrl(
          {
            clientId: process.env.LINKEDIN_CLIENT_ID!,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
            redirectUri,
          },
          state
        );
        break;

      default:
        return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 });
    }

    return NextResponse.json({ authUrl });
  } catch (error: any) {
    console.error('Connect error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initiate OAuth' },
      { status: 500 }
    );
  }
}


