import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { publishToPlatform } from '@/lib/social';

/**
 * CRON JOB - Automatically publish scheduled posts
 * 
 * Configure in vercel.json to run every 30 minutes
 */
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret (security)
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Publisher] Starting scheduled posts check...');

    const now = new Date();
    
    // Find posts that are scheduled and due
    const duePosts = await prisma.content.findMany({
      where: {
        status: 'scheduled',
        scheduledAt: {
          lte: now,
        },
      },
      include: {
        user: {
          include: {
            socialAccounts: true,
          },
        },
      },
      take: 50, // Process in batches
    });

    console.log(`[Publisher] Found ${duePosts.length} posts to publish`);

    const results = {
      successCount: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const post of duePosts) {
      try {
        // Find matching social account
        const socialAccount = post.user.socialAccounts.find(
          (acc: any) => acc.platform === post.platform
        );

        if (!socialAccount) {
          console.error(`[Publisher] No ${post.platform} account for user ${post.userId}`);
          await prisma.content.update({
            where: { id: post.id },
            data: { status: 'failed' },
          });
          results.failed++;
          results.errors.push(`No ${post.platform} account connected for post ${post.id}`);
          continue;
        }

        // Check token expiry
        if (socialAccount.expiresAt && socialAccount.expiresAt < now) {
          console.error(`[Publisher] Expired token for ${post.platform} - user ${post.userId}`);
          await prisma.content.update({
            where: { id: post.id },
            data: { status: 'failed' },
          });
          results.failed++;
          results.errors.push(`Expired token for post ${post.id}`);
          continue;
        }

        // Publish
        console.log(`[Publisher] Publishing post ${post.id} to ${post.platform}`);
        
        const result = await publishToPlatform({
          platform: post.platform as any,
          accessToken: socialAccount.accessToken,
          accountId: socialAccount.accountId!,
          content: {
            text: post.text,
            hashtags: post.hashtags,
            imageUrl: post.imageUrl || undefined,
          },
        });

        // Mark as published
        await prisma.content.update({
          where: { id: post.id },
          data: {
            status: 'published',
            publishedAt: now,
          },
        });

        console.log(`[Publisher] ✅ Published post ${post.id} successfully`);
        results.successCount++;
      } catch (error: any) {
        console.error(`[Publisher] ❌ Failed to publish post ${post.id}:`, error);
        
        await prisma.content.update({
          where: { id: post.id },
          data: { status: 'failed' },
        });

        results.failed++;
        results.errors.push(`Post ${post.id}: ${error.message}`);
      }
    }

    console.log('[Publisher] Completed:', results);

    return NextResponse.json({
      success: true,
      processed: duePosts.length,
      published: results.successCount,
      failed: results.failed,
      errors: results.errors,
    });
  } catch (error: any) {
    console.error('[Publisher] Fatal error:', error);
    return NextResponse.json(
      { error: error.message || 'Publisher failed' },
      { status: 500 }
    );
  }
}

// Allow POST as well (for manual trigger)
export async function POST(req: NextRequest) {
  return GET(req);
}

