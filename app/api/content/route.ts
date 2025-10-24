import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';

// GET all content for the user
export async function GET(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contents = await prisma.content.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ contents });
  } catch (error: any) {
    console.error('Content fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

// DELETE content
export async function DELETE(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const contentId = searchParams.get('id');

    if (!contentId) {
      return NextResponse.json({ error: 'Content ID required' }, { status: 400 });
    }

    // Verify ownership
    const content = await prisma.content.findUnique({
      where: { id: contentId },
    });

    if (!content || content.userId !== user.id) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    await prisma.content.delete({
      where: { id: contentId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Content delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete content' },
      { status: 500 }
    );
  }
}


