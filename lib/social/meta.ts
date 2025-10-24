/**
 * Meta Graph API Integration
 * For Facebook & Instagram publishing and analytics
 */

const META_API_VERSION = 'v21.0';
const META_GRAPH_URL = `https://graph.facebook.com/${META_API_VERSION}`;

export interface MetaPublishOptions {
  accessToken: string;
  accountId: string;
  message: string;
  imageUrl?: string;
}

export interface MetaOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

/**
 * Get Meta OAuth authorization URL
 */
export function getMetaAuthUrl(config: MetaOAuthConfig, state: string): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    state,
    scope: 'pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish,business_management',
  });

  return `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeMetaCode(
  config: MetaOAuthConfig,
  code: string
): Promise<{ access_token: string; expires_in: number }> {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    client_secret: config.clientSecret,
    code,
  });

  const response = await fetch(
    `${META_GRAPH_URL}/oauth/access_token?${params.toString()}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Meta OAuth error: ${error.error?.message || 'Unknown error'}`);
  }

  return await response.json();
}

/**
 * Get long-lived access token (60 days)
 */
export async function getLongLivedToken(
  config: MetaOAuthConfig,
  shortToken: string
): Promise<{ access_token: string; expires_in: number }> {
  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: config.clientId,
    client_secret: config.clientSecret,
    fb_exchange_token: shortToken,
  });

  const response = await fetch(
    `${META_GRAPH_URL}/oauth/access_token?${params.toString()}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Meta token exchange error: ${error.error?.message}`);
  }

  return await response.json();
}

/**
 * Get user's Facebook pages
 */
export async function getMetaPages(accessToken: string) {
  const response = await fetch(
    `${META_GRAPH_URL}/me/accounts?access_token=${accessToken}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to fetch pages: ${error.error?.message}`);
  }

  const data = await response.json();
  return data.data || [];
}

/**
 * Publish post to Facebook Page
 */
export async function publishToFacebook(options: MetaPublishOptions): Promise<{ id: string }> {
  const { accessToken, accountId, message, imageUrl } = options;

  const body: any = { message };
  
  if (imageUrl) {
    body.url = imageUrl;
  }

  const response = await fetch(
    `${META_GRAPH_URL}/${accountId}/${imageUrl ? 'photos' : 'feed'}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Facebook publish error: ${error.error?.message || 'Unknown error'}`);
  }

  return await response.json();
}

/**
 * Get Instagram Business Account ID from Facebook Page
 */
export async function getInstagramAccountId(
  accessToken: string,
  pageId: string
): Promise<string | null> {
  const response = await fetch(
    `${META_GRAPH_URL}/${pageId}?fields=instagram_business_account&access_token=${accessToken}`
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.instagram_business_account?.id || null;
}

/**
 * Publish post to Instagram (2-step process)
 */
export async function publishToInstagram(options: MetaPublishOptions): Promise<{ id: string }> {
  const { accessToken, accountId, message, imageUrl } = options;

  if (!imageUrl) {
    throw new Error('Instagram posts require an image');
  }

  // Step 1: Create media container
  const containerResponse = await fetch(
    `${META_GRAPH_URL}/${accountId}/media`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: imageUrl,
        caption: message,
      }),
    }
  );

  if (!containerResponse.ok) {
    const error = await containerResponse.json();
    throw new Error(`Instagram container error: ${error.error?.message}`);
  }

  const containerData = await containerResponse.json();
  const creationId = containerData.id;

  // Step 2: Publish media container
  const publishResponse = await fetch(
    `${META_GRAPH_URL}/${accountId}/media_publish`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        creation_id: creationId,
      }),
    }
  );

  if (!publishResponse.ok) {
    const error = await publishResponse.json();
    throw new Error(`Instagram publish error: ${error.error?.message}`);
  }

  return await publishResponse.json();
}

/**
 * Get Facebook Page insights
 */
export async function getFacebookInsights(
  accessToken: string,
  pageId: string,
  metrics: string[] = ['page_impressions', 'page_engaged_users']
) {
  const metricsParam = metrics.join(',');
  const response = await fetch(
    `${META_GRAPH_URL}/${pageId}/insights?metric=${metricsParam}&access_token=${accessToken}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to fetch insights: ${error.error?.message}`);
  }

  return await response.json();
}


