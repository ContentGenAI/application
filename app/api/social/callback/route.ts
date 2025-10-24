import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  exchangeMetaCode,
  getLongLivedToken,
  getMetaPages,
  getInstagramAccountId,
} from '@/lib/social/meta';
import { exchangeLinkedInCode, getLinkedInProfile } from '@/lib/social/linkedin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL(`/dashboard/accounts?error=${error}`, req.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard/accounts?error=missing_params', req.url)
      );
    }

    // Decode state to get user ID and platform
    const { userId, platform } = JSON.parse(Buffer.from(state, 'base64').toString());

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/social/callback`;

    let accountId: string | null = null;
    let accountName: string | null = null;
    let accessToken: string;
    let expiresAt: Date | null = null;

    switch (platform) {
      case 'facebook':
      case 'instagram': {
        // Exchange code for short-lived token
        const shortToken = await exchangeMetaCode(
          {
            clientId: process.env.META_APP_ID!,
            clientSecret: process.env.META_APP_SECRET!,
            redirectUri,
          },
          code
        );

        // Get long-lived token (60 days)
        const longToken = await getLongLivedToken(
          {
            clientId: process.env.META_APP_ID!,
            clientSecret: process.env.META_APP_SECRET!,
            redirectUri,
          },
          shortToken.access_token
        );

        accessToken = longToken.access_token;
        expiresAt = new Date(Date.now() + longToken.expires_in * 1000);

        // Get user's pages
        const pages = await getMetaPages(accessToken);
        
        if (pages.length === 0) {
          return NextResponse.redirect(
            new URL('/dashboard/accounts?error=no_pages', req.url)
          );
        }

        // Use first page (or let user choose later)
        const page = pages[0];
        accountId = page.id;
        accountName = page.name;
        accessToken = page.access_token; // Use page token for posting

        // If Instagram, get Instagram Business Account
        if (platform === 'instagram') {
          const igAccountId = await getInstagramAccountId(page.access_token, page.id);
          if (!igAccountId) {
            return NextResponse.redirect(
              new URL('/dashboard/accounts?error=no_instagram', req.url)
            );
          }
          accountId = igAccountId;
        }
        break;
      }

      case 'linkedin': {
        const token = await exchangeLinkedInCode(
          {
            clientId: process.env.LINKEDIN_CLIENT_ID!,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
            redirectUri,
          },
          code
        );

        accessToken = token.access_token;
        expiresAt = new Date(Date.now() + token.expires_in * 1000);

        // Get user profile
        const profile = await getLinkedInProfile(accessToken);
        accountId = profile.sub; // LinkedIn ID
        accountName = profile.name;
        break;
      }

      default:
        return NextResponse.redirect(
          new URL('/dashboard/accounts?error=invalid_platform', req.url)
        );
    }

    // Save to database
    await prisma.socialAccount.upsert({
      where: {
        userId_platform: {
          userId,
          platform,
        },
      },
      update: {
        accountId,
        accountName,
        accessToken,
        expiresAt,
        updatedAt: new Date(),
      },
      create: {
        userId,
        platform,
        accountId,
        accountName,
        accessToken,
        expiresAt,
      },
    });

    return NextResponse.redirect(
      new URL('/dashboard/accounts?success=true', req.url)
    );
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(`/dashboard/accounts?error=${encodeURIComponent(error.message)}`, req.url)
    );
  }
}


