import crypto from 'crypto';
import { encryptSecret, decryptSecret } from './crypto-utils';
import { db } from './db';

const GRAPH_API_VERSION = 'v22.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

export interface FacebookPageInfo {
  id: string;
  name: string;
  category?: string;
  tasks: string[];
  pictureUrl?: string;
  canPublish: boolean;
  accessToken: string; // Internal on server only
}

export interface DiscoveredPagesSession {
  sessionId: string;
  workspaceId: string;
  createdAt: number;
  pages: FacebookPageInfo[];
}

export class FacebookService {
  // Ephemeral in-memory store for pending OAuth states and discovered pages
  private oauthStates: Map<string, { workspaceId: string; createdAt: number }> = new Map();
  private pageDiscoverySessions: Map<string, DiscoveredPagesSession> = new Map();

  // Clean up sessions older than 30 minutes
  private cleanupOldSessions() {
    const now = Date.now();
    for (const [state, data] of this.oauthStates.entries()) {
      if (now - data.createdAt > 1800000) {
        this.oauthStates.delete(state);
      }
    }
    for (const [id, session] of this.pageDiscoverySessions.entries()) {
      if (now - session.createdAt > 1800000) {
        this.pageDiscoverySessions.delete(id);
      }
    }
  }

  public getAppCredentials(): { appId: string; appSecret: string; isConfigured: boolean } {
    const appId = process.env.FACEBOOK_APP_ID || '';
    const appSecret = process.env.FACEBOOK_APP_SECRET || '';
    return {
      appId,
      appSecret,
      isConfigured: Boolean(appId && appSecret)
    };
  }

  public generateAuthUrl(workspaceId: string, redirectUri: string): { authUrl: string; state: string } {
    this.cleanupOldSessions();
    const { appId, isConfigured } = this.getAppCredentials();
    if (!isConfigured) {
      throw new Error('Meta App credentials are not configured. Please set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET.');
    }

    const state = crypto.randomBytes(24).toString('hex');
    this.oauthStates.set(state, { workspaceId, createdAt: Date.now() });

    // Official Meta Graph API v22.0 permissions
    // pages_show_list: to list managed pages
    // pages_read_engagement: to view page stats & posts
    // pages_manage_posts: to publish and manage feed posts
    const scopes = ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts'].join(',');

    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      state,
      scope: scopes,
      response_type: 'code'
    });

    return {
      authUrl: `https://www.facebook.com/${GRAPH_API_VERSION}/dialog/oauth?${params.toString()}`,
      state
    };
  }

  public validateState(state: string): { valid: boolean; workspaceId?: string } {
    const data = this.oauthStates.get(state);
    if (!data) return { valid: false };
    this.oauthStates.delete(state);
    return { valid: true, workspaceId: data.workspaceId };
  }

  public async exchangeCodeForPages(code: string, redirectUri: string, workspaceId: string): Promise<string> {
    const { appId, appSecret } = this.getAppCredentials();

    // 1. Exchange authorization code for User Access Token
    const tokenUrl = `${GRAPH_API_BASE}/oauth/access_token?${new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: redirectUri,
      code
    }).toString()}`;

    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || tokenData.error) {
      const err = tokenData.error?.message || 'Failed to exchange authorization code for access token';
      console.error('[Facebook OAuth Error]', tokenData);
      throw new Error(`Meta OAuth Exchange: ${err}`);
    }

    const shortLivedToken = tokenData.access_token;

    // 2. Exchange for Long-Lived User Access Token (typically 60-day expiry)
    let userAccessToken = shortLivedToken;
    try {
      const longTokenUrl = `${GRAPH_API_BASE}/oauth/access_token?${new URLSearchParams({
        grant_type: 'fb_exchange_token',
        client_id: appId,
        client_secret: appSecret,
        fb_exchange_token: shortLivedToken
      }).toString()}`;

      const longRes = await fetch(longTokenUrl);
      const longData = await longRes.json();
      if (longData.access_token) {
        userAccessToken = longData.access_token;
      }
    } catch (e) {
      console.warn('[Facebook Long-Lived Token Exchange Warning]', e);
    }

    // 3. Fetch user's managed Facebook Pages
    const accountsUrl = `${GRAPH_API_BASE}/me/accounts?${new URLSearchParams({
      fields: 'id,name,category,tasks,access_token,picture{url}',
      access_token: userAccessToken
    }).toString()}`;

    const accountsRes = await fetch(accountsUrl);
    const accountsData = await accountsRes.json();

    if (!accountsRes.ok || accountsData.error) {
      const err = accountsData.error?.message || 'Failed to retrieve Facebook Pages';
      console.error('[Facebook Pages Error]', accountsData);
      throw new Error(`Meta Graph API: ${err}`);
    }

    const rawPages: any[] = accountsData.data || [];
    if (rawPages.length === 0) {
      throw new Error('No Facebook Pages found. You must be an Administrator or Editor of at least one published Facebook Page.');
    }

    const pages: FacebookPageInfo[] = rawPages.map(p => {
      const tasks: string[] = p.tasks || [];
      const canPublish = tasks.includes('CREATE_CONTENT') || tasks.includes('MANAGE') || tasks.includes('PUBLISH');
      return {
        id: p.id,
        name: p.name,
        category: p.category || 'Page',
        tasks,
        pictureUrl: p.picture?.data?.url,
        canPublish,
        accessToken: p.access_token
      };
    });

    const sessionId = crypto.randomBytes(16).toString('hex');
    this.pageDiscoverySessions.set(sessionId, {
      sessionId,
      workspaceId,
      createdAt: Date.now(),
      pages
    });

    return sessionId;
  }

  public getDiscoveredPages(sessionId: string): { id: string; name: string; category?: string; tasks: string[]; pictureUrl?: string; canPublish: boolean }[] {
    const session = this.pageDiscoverySessions.get(sessionId);
    if (!session) {
      throw new Error('Discovery session expired or invalid. Please initiate Facebook connection again.');
    }

    // Strip out the raw access tokens before returning to client
    return session.pages.map(({ accessToken, ...safePage }) => safePage);
  }

  public async connectDiscoveredPage(sessionId: string, pageId: string, workspaceId: string) {
    const session = this.pageDiscoverySessions.get(sessionId);
    if (!session) {
      throw new Error('Session expired. Please reconnect with Facebook.');
    }

    const page = session.pages.find(p => p.id === pageId);
    if (!page) {
      throw new Error(`Page with ID ${pageId} not found in this authorization session.`);
    }

    // Verify Page Access Token live with Meta Graph API
    return this.verifyAndStorePage(page.id, page.name, page.accessToken, workspaceId, page.category, page.pictureUrl);
  }

  public async connectDirectToken(pageId: string, pageAccessToken: string, workspaceId: string) {
    // Direct verification against Meta Graph API
    const verifyUrl = `${GRAPH_API_BASE}/${pageId}?${new URLSearchParams({
      fields: 'id,name,category,is_published,tasks,picture{url}',
      access_token: pageAccessToken
    }).toString()}`;

    const res = await fetch(verifyUrl);
    const data = await res.json();

    if (!res.ok || data.error) {
      const err = data.error?.message || 'Invalid Page Token or Page ID';
      throw new Error(`Meta Graph API Verification Failed: ${err} (Error Code: ${data.error?.code || 'unknown'})`);
    }

    return this.verifyAndStorePage(
      data.id,
      data.name,
      pageAccessToken,
      workspaceId,
      data.category,
      data.picture?.data?.url
    );
  }

  private async verifyAndStorePage(
    pageId: string,
    pageName: string,
    pageToken: string,
    workspaceId: string,
    category?: string,
    pictureUrl?: string
  ) {
    // 1. Live probe check
    const probeUrl = `${GRAPH_API_BASE}/${pageId}?${new URLSearchParams({
      fields: 'id,name,is_published,tasks',
      access_token: pageToken
    }).toString()}`;

    const probeRes = await fetch(probeUrl);
    const probeData = await probeRes.json();

    if (!probeRes.ok || probeData.error) {
      const err = probeData.error?.message || 'Failed to verify Page Access Token';
      throw new Error(`Meta Graph API: ${err} (Code: ${probeData.error?.code})`);
    }

    const tasks: string[] = probeData.tasks || [];
    const hasPublishTask = tasks.length === 0 || tasks.includes('CREATE_CONTENT') || tasks.includes('MANAGE') || tasks.includes('PUBLISH');

    // 2. Encrypt the Page Access Token on the backend
    const encryptedPageToken = encryptSecret(pageToken);

    // 3. Save or update social account
    const existingAccounts = db.getSocialAccounts(workspaceId);
    const existing = existingAccounts.find(a => a.platform === 'facebook' && a.credentialsMetadata?.pageId === pageId);

    const accountData = {
      id: existing ? existing.id : `acc-fb-${Date.now().toString(36)}`,
      workspaceId,
      platform: 'facebook' as const,
      accountName: pageName,
      accountHandle: `@${pageId}`,
      avatarUrl: pictureUrl || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=150&auto=format&fit=crop&q=80',
      status: 'connected' as const,
      connectedAt: new Date().toISOString(),
      lastHealthCheckAt: new Date().toISOString(),
      credentialsMetadata: {
        pageId,
        category: category || 'Facebook Page',
        tasks,
        isPublished: probeData.is_published ?? true,
        encryptedPageToken,
        scopes: ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts']
      }
    };

    db.saveSocialAccount(accountData);

    db.addNotification({
      id: `notif-${Date.now()}`,
      workspaceId,
      type: 'system',
      title: 'Facebook Page Connected',
      message: `Successfully authorized and connected Page "${pageName}" (ID: ${pageId}) via official Meta Graph API v22.0.`,
      timestamp: new Date().toISOString(),
      read: false,
      link: '/app/accounts'
    });

    return {
      success: true,
      account: {
        id: accountData.id,
        accountName: accountData.accountName,
        accountHandle: accountData.accountHandle,
        pageId,
        category: accountData.credentialsMetadata.category,
        tasks,
        isPublished: accountData.credentialsMetadata.isPublished,
        status: accountData.status
      }
    };
  }

  public async testPageHealth(accountId: string): Promise<{
    healthy: boolean;
    pageId: string;
    pageName: string;
    isPublished: boolean;
    latencyMs: number;
    tasks: string[];
    error?: string;
  }> {
    const startTime = Date.now();
    const account = db.getSocialAccounts().find(a => a.id === accountId);
    if (!account || account.platform !== 'facebook') {
      throw new Error('Facebook account not found');
    }

    const pageId = account.credentialsMetadata?.pageId;
    const encryptedToken = account.credentialsMetadata?.encryptedPageToken;

    if (!pageId || !encryptedToken) {
      throw new Error('Account does not have valid stored credentials');
    }

    const pageToken = decryptSecret(encryptedToken);
    if (!pageToken) {
      throw new Error('Unable to decrypt stored Page Access Token');
    }

    const testUrl = `${GRAPH_API_BASE}/${pageId}?${new URLSearchParams({
      fields: 'id,name,is_published,tasks',
      access_token: pageToken
    }).toString()}`;

    const res = await fetch(testUrl);
    const data = await res.json();
    const latencyMs = Date.now() - startTime;

    if (!res.ok || data.error) {
      const errMsg = data.error?.message || 'Meta Graph API error';
      // Mark as token expired or error
      account.status = data.error?.code === 190 ? 'token_expired' : 'permission_required';
      account.lastHealthCheckAt = new Date().toISOString();
      db.saveSocialAccount(account);

      return {
        healthy: false,
        pageId,
        pageName: account.accountName,
        isPublished: false,
        latencyMs,
        tasks: [],
        error: `${errMsg} (Meta Code: ${data.error?.code || 'unknown'})`
      };
    }

    account.status = 'connected';
    account.lastHealthCheckAt = new Date().toISOString();
    account.accountName = data.name || account.accountName;
    if (account.credentialsMetadata) {
      account.credentialsMetadata.isPublished = data.is_published ?? true;
      account.credentialsMetadata.tasks = data.tasks || [];
    }
    db.saveSocialAccount(account);

    return {
      healthy: true,
      pageId: data.id,
      pageName: data.name,
      isPublished: data.is_published ?? true,
      latencyMs,
      tasks: data.tasks || []
    };
  }

  public async publishToPage(
    accountId: string,
    message: string,
    mediaUrls: string[] = []
  ): Promise<{ remoteId: string; postUrl: string; responsePayload: string }> {
    const account = db.getSocialAccounts().find(a => a.id === accountId);
    if (!account || account.platform !== 'facebook') {
      throw new Error('Facebook account not found');
    }

    const pageId = account.credentialsMetadata?.pageId;
    const encryptedToken = account.credentialsMetadata?.encryptedPageToken;

    if (!pageId || !encryptedToken) {
      throw new Error(`Facebook Page "${account.accountName}" has no authorized token.`);
    }

    const pageToken = decryptSecret(encryptedToken);
    if (!pageToken) {
      throw new Error('Failed to decrypt Facebook Page access token on server.');
    }

    let endpoint = `${GRAPH_API_BASE}/${pageId}/feed`;
    let body: any = {
      message,
      access_token: pageToken,
      published: true // Explicitly command Meta Graph API to make the post public immediately
    };

    // If media is attached, publish via Graph API /photos endpoint
    if (mediaUrls.length > 0) {
      endpoint = `${GRAPH_API_BASE}/${pageId}/photos`;
      body = {
        url: mediaUrls[0],
        caption: message,
        access_token: pageToken,
        published: true
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      const metaErr = result.error;
      const code = metaErr?.code;
      const subcode = metaErr?.error_subcode;
      const msg = metaErr?.message || 'Failed to publish post to Facebook Page';

      let userFriendlyMsg = msg;
      if (code === 190) {
        userFriendlyMsg = 'Your Facebook Page Access Token has expired. Please Reconnect your Facebook account in Social Accounts.';
      } else if (code === 200) {
        userFriendlyMsg = 'Permission denied or Page Unpublished: Ensure your Facebook Page is set to "Published" in Facebook Page Settings, and your Meta token has pages_manage_posts permission.';
      } else if (code === 10) {
        userFriendlyMsg = 'App Mode Restricted: For posts to be publicly visible, your Meta App must be in "Live" mode at developers.facebook.com (or your Facebook account must be added under App Roles > Roles).';
      }

      console.error('[Facebook Graph API Publish Error]', result);
      throw new Error(`Meta Graph API: ${userFriendlyMsg} (Code ${code}${subcode ? `:${subcode}` : ''})`);
    }

    const remotePostId = result.id || result.post_id;
    // Format Facebook direct URL
    const postUrl = `https://www.facebook.com/${remotePostId.replace('_', '/posts/')}`;

    return {
      remoteId: remotePostId,
      postUrl,
      responsePayload: JSON.stringify(result)
    };
  }
}

export const facebookService = new FacebookService();
