/**
 * LinkedIn Marketing API Integration
 * For LinkedIn publishing and analytics
 */

const LINKEDIN_API_URL = 'https://api.linkedin.com/v2';
const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2';

export interface LinkedInPublishOptions {
  accessToken: string;
  authorId: string; // urn:li:person:xxxxx
  text: string;
  imageUrl?: string;
}

export interface LinkedInOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

/**
 * Get LinkedIn OAuth authorization URL
 */
export function getLinkedInAuthUrl(config: LinkedInOAuthConfig, state: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    state,
    scope: 'openid profile email w_member_social',
  });

  return `${LINKEDIN_AUTH_URL}/authorization?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeLinkedInCode(
  config: LinkedInOAuthConfig,
  code: string
): Promise<{ access_token: string; expires_in: number; refresh_token?: string }> {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
  });

  const response = await fetch(`${LINKEDIN_AUTH_URL}/accessToken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LinkedIn OAuth error: ${error}`);
  }

  return await response.json();
}

/**
 * Get LinkedIn user profile
 */
export async function getLinkedInProfile(accessToken: string) {
  const response = await fetch(`${LINKEDIN_API_URL}/userinfo`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  return await response.json();
}

/**
 * Publish post to LinkedIn
 */
export async function publishToLinkedIn(options: LinkedInPublishOptions): Promise<{ id: string }> {
  const { accessToken, authorId, text, imageUrl } = options;

  // Basic text post
  const postData: any = {
    author: authorId,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text,
        },
        shareMediaCategory: imageUrl ? 'IMAGE' : 'NONE',
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  };

  // If image is provided, add media
  if (imageUrl) {
    postData.specificContent['com.linkedin.ugc.ShareContent'].media = [
      {
        status: 'READY',
        originalUrl: imageUrl,
      },
    ];
  }

  const response = await fetch(`${LINKEDIN_API_URL}/ugcPosts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`LinkedIn publish error: ${error.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return { id: data.id };
}

/**
 * Upload image to LinkedIn (for better quality)
 * Note: Requires additional setup for binary uploads
 */
// export async function uploadImageToLinkedIn(
//   accessToken: string,
//   authorId: string,
//   imageBuffer: ArrayBuffer
// ): Promise<string> {
//   // Implementation for advanced image upload
//   // Requires binary data handling
//   throw new Error('Not implemented yet');
// }

/**
 * Get LinkedIn post analytics
 */
export async function getLinkedInAnalytics(accessToken: string, postId: string) {
  const response = await fetch(
    `${LINKEDIN_API_URL}/socialActions/${postId}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to fetch analytics: ${error.message}`);
  }

  return await response.json();
}

