import { 
  Post, 
  SocialAccount, 
  FullAutoConfig, 
  RssFeedSource, 
  RssItem, 
  MediaAsset, 
  Campaign, 
  InAppNotification, 
  AnalyticsSummary, 
  AiProviderConfig,
  Workspace,
  User,
  SocialPlatform,
  MonetizationConfig
} from '../types';

export const api = {
  // System
  async getSystemSettings() {
    const res = await fetch('/api/system/settings');
    return res.json();
  },
  async toggleEmergencyPause() {
    const res = await fetch('/api/system/toggle-emergency-pause', { method: 'POST' });
    return res.json();
  },

  // User & Workspace
  async getUser(email?: string): Promise<User | null> {
    const query = email ? `?email=${encodeURIComponent(email)}` : '';
    const res = await fetch(`/api/user${query}`);
    return res.json();
  },
  async registerUser(userData: Partial<User>): Promise<{ success: boolean; user: User }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return res.json();
  },
  async loginUser(email: string): Promise<{ success: boolean; user: User }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return res.json();
  },
  async logoutUser(): Promise<{ success: boolean }> {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    return res.json();
  },
  async getWorkspaces(): Promise<Workspace[]> {
    const res = await fetch('/api/workspaces');
    return res.json();
  },
  async updateWorkspace(id: string, data: Partial<Workspace>): Promise<Workspace> {
    const res = await fetch(`/api/workspaces/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // AI Configuration
  async getAiConfig(workspaceId?: string): Promise<AiProviderConfig> {
    const res = await fetch(`/api/ai/config?workspaceId=${workspaceId || ''}`);
    return res.json();
  },
  async saveAiConfig(params: { workspaceId?: string; provider?: string; rawApiKey?: string; selectedModel?: string }): Promise<AiProviderConfig> {
    const res = await fetch('/api/ai/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  },
  async validateAiKey(apiKey?: string, workspaceId?: string): Promise<{ isValid: boolean; models: string[]; latencyMs: number; error?: string }> {
    const res = await fetch('/api/ai/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, workspaceId })
    });
    return res.json();
  },
  async removeAiConfig(workspaceId?: string) {
    const res = await fetch(`/api/ai/config?workspaceId=${workspaceId || ''}`, { method: 'DELETE' });
    return res.json();
  },

  // AI Generation & Transformation
  async generatePost(params: {
    workspaceId?: string;
    topic: string;
    niche?: string;
    audience?: string;
    region?: string;
    language?: string;
    tone?: string;
    format?: string;
    callToAction?: string;
    brandName?: string;
    brandDescription?: string;
    keywordsToInclude?: string[];
    wordsToAvoid?: string[];
    targetPlatforms: SocialPlatform[];
  }) {
    const res = await fetch('/api/ai/generate-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Generation failed');
    }
    return res.json();
  },
  async transformText(params: {
    text: string;
    action: 'rewrite' | 'shorten' | 'expand' | 'translate' | 'change_tone';
    targetValue?: string;
    workspaceId?: string;
  }): Promise<{ transformedText: string }> {
    const res = await fetch('/api/ai/transform-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Transformation failed');
    }
    return res.json();
  },

  // Posts & Queue
  async getPosts(workspaceId?: string, status?: string): Promise<Post[]> {
    const q = new URLSearchParams();
    if (workspaceId) q.append('workspaceId', workspaceId);
    if (status) q.append('status', status);
    const res = await fetch(`/api/posts?${q.toString()}`);
    return res.json();
  },
  async getPostById(id: string): Promise<Post> {
    const res = await fetch(`/api/posts/${id}`);
    return res.json();
  },
  async createPost(post: Partial<Post>): Promise<Post> {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post)
    });
    return res.json();
  },
  async updatePost(id: string, post: Partial<Post>): Promise<Post> {
    const res = await fetch(`/api/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post)
    });
    return res.json();
  },
  async deletePost(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    return res.json();
  },
  async publishPostNow(id: string) {
    const res = await fetch(`/api/posts/${id}/publish-now`, { method: 'POST' });
    return res.json();
  },
  async retryPost(id: string) {
    const res = await fetch(`/api/posts/${id}/retry`, { method: 'POST' });
    return res.json();
  },
  async approvePost(id: string): Promise<Post> {
    const res = await fetch(`/api/posts/${id}/approve`, { method: 'POST' });
    return res.json();
  },

  // Social Accounts
  async getSocialAccounts(workspaceId?: string): Promise<SocialAccount[]> {
    const res = await fetch(`/api/social-accounts?workspaceId=${workspaceId || ''}`);
    return res.json();
  },
  async connectAccount(data: {
    workspaceId?: string;
    platform: SocialPlatform;
    accountName: string;
    accountHandle?: string;
    telegramChatId?: string;
    telegramBotToken?: string;
  }): Promise<SocialAccount> {
    const res = await fetch('/api/social-accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteSocialAccount(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/social-accounts/${id}`, { method: 'DELETE' });
    return res.json();
  },
  async testAccountHealth(id: string) {
    const res = await fetch(`/api/social-accounts/${id}/test-health`, { method: 'POST' });
    return res.json();
  },

  // Facebook Pages Official Graph API & OAuth
  async getFacebookConfig(): Promise<{ isConfigured: boolean; appId: string; redirectUri: string; scopes: string[] }> {
    const res = await fetch('/api/auth/facebook/config');
    return res.json();
  },
  async saveFacebookConfig(appId: string, appSecret: string): Promise<{ success: boolean; message: string; isConfigured: boolean; appId: string }> {
    const res = await fetch('/api/auth/facebook/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appId, appSecret })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save Meta App credentials');
    }
    return res.json();
  },
  async getFacebookAuthUrl(workspaceId?: string): Promise<{ url: string; state: string; redirectUri: string }> {
    const res = await fetch(`/api/auth/facebook/url?workspaceId=${workspaceId || ''}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to generate Facebook authorization URL');
    }
    return res.json();
  },
  async getFacebookPages(sessionId: string): Promise<{ pages: Array<{ id: string; name: string; category?: string; tasks: string[]; pictureUrl?: string; canPublish: boolean }> }> {
    const res = await fetch(`/api/auth/facebook/pages?sessionId=${sessionId}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to fetch Facebook Pages');
    }
    return res.json();
  },
  async connectFacebookPage(sessionId: string, pageId: string, workspaceId?: string): Promise<{ success: boolean; account: any }> {
    const res = await fetch('/api/auth/facebook/connect-page', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, pageId, workspaceId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to connect selected Facebook Page');
    }
    return res.json();
  },
  async connectFacebookDirect(pageId: string, pageAccessToken: string, workspaceId?: string): Promise<{ success: boolean; account: any }> {
    const res = await fetch('/api/auth/facebook/connect-direct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageId, pageAccessToken, workspaceId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to connect Facebook Page via Direct Token');
    }
    return res.json();
  },
  async getPlatformRegistry(): Promise<Record<string, any>> {
    const res = await fetch('/api/platforms/registry');
    return res.json();
  },

  // Full Auto Mode
  async getAutoConfig(workspaceId?: string): Promise<FullAutoConfig | null> {
    const res = await fetch(`/api/auto-mode?workspaceId=${workspaceId || ''}`);
    return res.json();
  },
  async saveAutoConfig(config: FullAutoConfig): Promise<FullAutoConfig> {
    const res = await fetch('/api/auto-mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return res.json();
  },
  async triggerAutoModeNow(workspaceId?: string): Promise<{ success: boolean; post: Post }> {
    const res = await fetch('/api/auto-mode/run-now', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to run auto mode');
    }
    return res.json();
  },

  // RSS Feeds
  async getRssFeeds(workspaceId?: string): Promise<RssFeedSource[]> {
    const res = await fetch(`/api/rss/feeds?workspaceId=${workspaceId || ''}`);
    return res.json();
  },
  async addRssFeed(data: { workspaceId?: string; feedUrl: string; title?: string; targetPlatforms?: SocialPlatform[] }): Promise<RssFeedSource> {
    const res = await fetch('/api/rss/feeds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteRssFeed(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/rss/feeds/${id}`, { method: 'DELETE' });
    return res.json();
  },
  async getRssItems(feedId?: string): Promise<RssItem[]> {
    const res = await fetch(`/api/rss/items?feedId=${feedId || ''}`);
    return res.json();
  },
  async syncRssFeed(feedId: string) {
    const res = await fetch('/api/rss/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedId })
    });
    return res.json();
  },
  async convertRssToPost(rssItemId: string, workspaceId?: string): Promise<{ success: boolean; post: Post }> {
    const res = await fetch('/api/rss/convert-to-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rssItemId, workspaceId })
    });
    return res.json();
  },

  // Media
  async getMediaAssets(workspaceId?: string): Promise<MediaAsset[]> {
    const res = await fetch(`/api/media?workspaceId=${workspaceId || ''}`);
    return res.json();
  },
  async addMediaAsset(data: Partial<MediaAsset>): Promise<MediaAsset> {
    const res = await fetch('/api/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteMediaAsset(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Campaigns
  async getCampaigns(workspaceId?: string): Promise<Campaign[]> {
    const res = await fetch(`/api/campaigns?workspaceId=${workspaceId || ''}`);
    return res.json();
  },
  async createCampaign(data: Partial<Campaign>): Promise<Campaign> {
    const res = await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Analytics
  async getAnalytics(workspaceId?: string): Promise<AnalyticsSummary> {
    const res = await fetch(`/api/analytics?workspaceId=${workspaceId || ''}`);
    return res.json();
  },

  // Notifications
  async getNotifications(workspaceId?: string): Promise<InAppNotification[]> {
    const res = await fetch(`/api/notifications?workspaceId=${workspaceId || ''}`);
    return res.json();
  },
  async markNotificationsRead(workspaceId?: string) {
    const res = await fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId })
    });
    return res.json();
  },

  // Account Export & Deletion
  async exportAccountData(workspaceId?: string) {
    const res = await fetch('/api/account/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId })
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `socialpilot-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  },
  async deleteAccountData(workspaceId?: string) {
    const res = await fetch('/api/account/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId })
    });
    return res.json();
  },

  // Monetization & Ads Earnings
  async getMonetizationConfig(): Promise<MonetizationConfig> {
    const res = await fetch('/api/monetization');
    return res.json();
  },
  async updateMonetizationConfig(data: Partial<MonetizationConfig>): Promise<MonetizationConfig> {
    const res = await fetch('/api/monetization', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async recordAdImpression(unitId?: string) {
    const res = await fetch('/api/monetization/record-impression', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unitId })
    });
    return res.json();
  },
  async recordAdClick(unitId?: string) {
    const res = await fetch('/api/monetization/record-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unitId })
    });
    return res.json();
  },
  async claimRewardedBonus(): Promise<{ success: boolean; bonusCredits: number; todayEarnings: number; totalLifetimeEarnings: number }> {
    const res = await fetch('/api/monetization/claim-reward', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return res.json();
  },
  async exportEarningsReport() {
    const res = await fetch('/api/monetization/export');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `socialpilot-ads-earnings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }
};
