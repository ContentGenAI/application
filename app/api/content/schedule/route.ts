import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';

// Update scheduled date for content
export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { contentId, scheduledAt } = body;

    if (!contentId || !scheduledAt) {
      return NextResponse.json(
        { error: 'Content ID and scheduled date required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const content = await prisma.content.findUnique({
      where: { id: contentId },
    });

    if (!content || content.userId !== user.id) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Update schedule
    const updatedContent = await prisma.content.update({
      where: { id: contentId },
      data: { scheduledAt: new Date(scheduledAt) },
    });

    return NextResponse.json({ success: true, content: updatedContent });
  } catch (error: any) {
    console.error('Content schedule error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to schedule content' },
      { status: 500 }
    );
  }
}


