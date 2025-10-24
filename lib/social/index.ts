/**
 * Social Media Integration Hub
 * Unified interface for all social platforms
 */

import { publishToFacebook, publishToInstagram } from './meta';
import { publishToLinkedIn } from './linkedin';

export interface PublishOptions {
  platform: 'facebook' | 'instagram' | 'linkedin';
  accessToken: string;
  accountId: string;
  content: {
    text: string;
    hashtags?: string[];
    imageUrl?: string;
  };
}

/**
 * Publish content to any platform
 */
export async function publishToPlatform(options: PublishOptions): Promise<{ id: string; platform: string }> {
  const { platform, accessToken, accountId, content } = options;

  // Combine text and hashtags
  const message = content.hashtags && content.hashtags.length > 0
    ? `${content.text}\n\n${content.hashtags.join(' ')}`
    : content.text;

  try {
    let result;

    switch (platform) {
      case 'facebook':
        result = await publishToFacebook({
          accessToken,
          accountId,
          message,
          imageUrl: content.imageUrl,
        });
        break;

      case 'instagram':
        if (!content.imageUrl) {
          throw new Error('Instagram posts require an image');
        }
        result = await publishToInstagram({
          accessToken,
          accountId,
          message,
          imageUrl: content.imageUrl,
        });
        break;

      case 'linkedin':
        result = await publishToLinkedIn({
          accessToken,
          authorId: accountId,
          text: message,
          imageUrl: content.imageUrl,
        });
        break;

      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    return {
      id: result.id,
      platform,
    };
  } catch (error: any) {
    console.error(`[${platform}] Publish error:`, error);
    throw new Error(`Failed to publish to ${platform}: ${error.message}`);
  }
}

/**
 * Validate if a platform is supported
 */
export function isSupportedPlatform(platform: string): boolean {
  return ['facebook', 'instagram', 'linkedin'].includes(platform.toLowerCase());
}

/**
 * Get platform display name
 */
export function getPlatformDisplayName(platform: string): string {
  const names: Record<string, string> = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
  };
  return names[platform.toLowerCase()] || platform;
}

/**
 * Check if platform requires an image
 */
export function platformRequiresImage(platform: string): boolean {
  return platform.toLowerCase() === 'instagram';
}

export * from './meta';
export * from './linkedin';


