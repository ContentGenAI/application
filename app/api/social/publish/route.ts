import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { prisma } from '@/lib/prisma';
import { publishToPlatform } from '@/lib/social';

/**
 * POST - Publish content to a connected social account
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { contentId, platform } = await req.json();

    if (!contentId || !platform) {
      return NextResponse.json(
        { error: 'contentId and platform are required' },
        { status: 400 }
      );
    }

    // Get content
    const content = await prisma.content.findFirst({
      where: {
        id: contentId,
        userId: user.id,
      },
    });

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Get social account
    const socialAccount = await prisma.socialAccount.findFirst({
      where: {
        userId: user.id,
        platform,
      },
    });

    if (!socialAccount) {
      return NextResponse.json(
        { error: `No ${platform} account connected` },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (socialAccount.expiresAt && socialAccount.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Access token expired. Please reconnect your account.' },
        { status: 401 }
      );
    }

    // Publish to platform
    const result = await publishToPlatform({
      platform: platform as any,
      accessToken: socialAccount.accessToken,
      accountId: socialAccount.accountId!,
      content: {
        text: content.text,
        hashtags: content.hashtags,
        imageUrl: content.imageUrl || undefined,
      },
    });

    // Update content status
    await prisma.content.update({
      where: { id: contentId },
      data: {
        status: 'published',
        publishedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      postId: result.id,
      platform: result.platform,
    });
  } catch (error: any) {
    console.error('Publish error:', error);
    
    // Update content status to failed
    const { contentId } = await req.json();
    if (contentId) {
      await prisma.content.update({
        where: { id: contentId },
        data: { status: 'failed' },
      });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to publish content' },
      { status: 500 }
    );
  }
}


