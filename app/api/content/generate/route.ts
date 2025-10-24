import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';
import { getUserFromHeader } from '@/lib/auth-header';
import { canGeneratePost } from '@/lib/plans';

export async function POST(req: NextRequest) {
  try {
    let user = await getUserFromHeader(req);
    if (!user) user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check subscription and limits
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    const canGenerate = canGeneratePost(subscription);
    if (!canGenerate.allowed) {
      return NextResponse.json(
        {
          error: canGenerate.reason,
          upgradeRequired: true,
          remaining: canGenerate.remaining,
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { platform, topic, customPrompt } = body;

    // Get user's business profile for context
    const businessProfile = await prisma.businessProfile.findUnique({
      where: { userId: user.id },
    });

    if (!businessProfile) {
      return NextResponse.json(
        { error: 'Please set up your business profile first' },
        { status: 400 }
      );
    }

    // Create AI prompt based on business profile
    const systemPrompt = `You are a social media content creator specializing in ${businessProfile.industry}. 
Create engaging content for ${platform} with a ${businessProfile.tone} tone.
Target audience: ${businessProfile.targetAudience}
Keywords to include: ${businessProfile.keywords.join(', ')}`;

    const userPrompt = customPrompt || `Create a ${platform} post about ${topic || 'our business'}. 
Include a catchy caption and relevant hashtags.`;

    // Generate content using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    const generatedText = completion.choices[0].message.content || '';

    // Extract hashtags from the generated content
    const hashtagRegex = /#\w+/g;
    const hashtags = generatedText.match(hashtagRegex) || [];
    const textWithoutHashtags = generatedText.replace(hashtagRegex, '').trim();

    // Create a title from the first 50 characters
    const title = topic || textWithoutHashtags.substring(0, 50) + '...';

    // Save to database
    const content = await prisma.content.create({
      data: {
        userId: user.id,
        title,
        text: textWithoutHashtags,
        hashtags,
        platform,
      },
    });

    // Increment post counter
    await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        postsThisMonth: { increment: 1 },
      },
    });

    return NextResponse.json({
      success: true,
      content,
      fullText: generatedText,
      remaining: (canGenerate.remaining || 1) - 1,
    });
  } catch (error: any) {
    console.error('Content generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate content' },
      { status: 500 }
    );
  }
}

