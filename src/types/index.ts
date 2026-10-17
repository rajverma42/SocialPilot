export type SocialPlatform = 
  | 'facebook' 
  | 'instagram' 
  | 'youtube' 
  | 'telegram' 
  | 'linkedin' 
  | 'pinterest' 
  | 'x' 
  | 'tiktok' 
  | 'threads' 
  | 'reddit' 
  | 'mastodon' 
  | 'snapchat';

export type PostStatus = 
  | 'draft' 
  | 'scheduled' 
  | 'queued' 
  | 'publishing' 
  | 'published' 
  | 'failed' 
  | 'cancelled' 
  | 'awaiting_approval';

export type DestinationStatus =
  | 'draft'
  | 'awaiting_approval'
  | 'scheduled'
  | 'queued'
  | 'publishing'
  | 'published'
  | 'failed'
  | 'cancelled'
  | 'authorization_required';

export type PublishingMode = 'manual' | 'approval_required' | 'full_auto';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  timezone: string;
  defaultLanguage: string;
  createdAt: string;
  membersCount: number;
  plan: 'free' | 'creator' | 'pro' | 'agency';
}

export interface AiProviderConfig {
  provider: 'gemini' | 'openai' | 'anthropic';
  maskedApiKey: string;
  hasKey: boolean;
  selectedModel: string;
  isValid: boolean;
  lastValidatedAt?: string;
  totalGenerations: number;
  estimatedTokensUsed: number;
}

export interface PlatformContent {
  title?: string;
  caption: string;
  shortCaption?: string;
  longCaption?: string;
  hashtags: string[];
  callToAction?: string;
  mediaConcept?: string;
  characterCount: number;
  isValid: boolean;
  validationErrors?: string[];
  targetSubreddit?: string;
  mediaUrls?: string[];
}

export interface DestinationPublishingState {
  accountId: string;
  platform: SocialPlatform;
  destinationName: string;
  status: DestinationStatus;
  scheduledTime?: string;
  publishedTime?: string;
  remotePostId?: string;
  remoteUrl?: string;
  errorMessage?: string;
  responsePayload?: string;
  attemptsCount: number;
  lastAttemptAt?: string;
}

export interface Post {
  id: string;
  workspaceId: string;
  topic: string;
  niche: string;
  language: string;
  tone: string;
  format: string;
  status: PostStatus;
  mode: PublishingMode;
  targetPlatforms: SocialPlatform[];
  targetAccountIds?: string[]; // Specific connected accounts targeted
  platformContents: Partial<Record<SocialPlatform, PlatformContent>>;
  destinationStates?: Record<string, DestinationPublishingState>; // AccountId -> State
  mediaUrls: string[];
  scheduledTime?: string; // ISO UTC
  publishedTime?: string;
  campaignId?: string;
  autoApproval: boolean;
  sourceUrl?: string;
  createdAt: string;
  updatedAt: string;
  remotePostIds?: Record<string, string>;
  publishingAttempts?: PublishingAttempt[];
}

export interface PublishingAttempt {
  id: string;
  postId: string;
  accountId?: string;
  platform: SocialPlatform;
  timestamp: string;
  status: 'success' | 'failed';
  responsePayload?: string;
  remotePostId?: string;
  remoteUrl?: string;
  errorMessage?: string;
}

export interface SocialAccount {
  id: string;
  workspaceId: string;
  platform: SocialPlatform;
  accountName: string;
  accountHandle: string;
  accountType?: string; // e.g. "Facebook Page", "Instagram Business Account", "Telegram Channel"
  avatarUrl?: string;
  status: 'connected' | 'not_connected' | 'permission_required' | 'token_expired' | 'pending_approval' | 'reconnection_required';
  connectedAt: string;
  lastHealthCheckAt: string;
  capabilities?: {
    text: boolean;
    images: boolean;
    video: boolean;
    carousels: boolean;
    links: boolean;
    scheduling: boolean;
    analytics: boolean;
  };
  credentialsMetadata?: {
    telegramChatId?: string;
    telegramBotUsername?: string;
    pageId?: string;
    channelId?: string;
    scopes?: string[];
    encryptedPageToken?: string;
    encryptedAccessToken?: string;
    encryptedRefreshToken?: string;
    tokenExpiresAt?: string;
    category?: string;
    tasks?: string[];
    isPublished?: boolean;
    appId?: string;
    // Instagram
    instagramBusinessId?: string;
    // YouTube
    youtubeChannelId?: string;
    youtubeCustomUrl?: string;
    // LinkedIn
    linkedinUrn?: string;
    // Pinterest
    pinterestBoardId?: string;
    pinterestBoardName?: string;
    // Threads
    threadsUserId?: string;
    // Reddit
    subreddit?: string;
    // Mastodon
    mastodonInstance?: string;
    // Snapchat
    snapchatOrgId?: string;
  };
}

export interface PlatformCapability {
  platform: SocialPlatform;
  displayName: string;
  iconName: string;
  brandColor: string;
  category: 'social_network' | 'video' | 'broadcast' | 'community' | 'messaging';
  authMethod: 'oauth2' | 'bot_token' | 'bearer_token' | 'custom_api';
  accountTypeLabel: string;
  supportedDestinationsLabel: string;
  supportsMultipleAccounts: boolean;
  capabilities: {
    text: boolean;
    images: boolean;
    video: boolean;
    carousels: boolean;
    links: boolean;
    scheduling: boolean;
    analytics: boolean;
  };
  characterLimit: number;
  mediaLimits: {
    maxImages: number;
    maxVideoDurationSeconds?: number;
    maxFileSizeMb: number;
    preferredAspectRatios: string[];
  };
  requiredScopes: string[];
  accountRequirements: string;
  apiLimitations: string;
  appReviewRequirements: string;
  usageLimits: string;
  readinessStatus: 'production_ready' | 'setup_required' | 'testing' | 'awaiting_approval';
  developerPortalUrl: string;
  developerPortalName: string;
  envVarKeys: string[];
}

export interface FullAutoConfig {
  id: string;
  workspaceId: string;
  enabled: boolean;
  topicNiche: string;
  targetAudience: string;
  brandVoice: string;
  language: string;
  postsPerDay: number;
  preferredTimeWindows: string[];
  selectedPlatforms: SocialPlatform[];
  autoApprove: boolean;
  requiredPhrases: string[];
  forbiddenPhrases: string[];
  lastRunAt?: string;
  nextRunAt?: string;
  totalGenerated: number;
  totalPublished: number;
}

export interface RssFeedSource {
  id: string;
  workspaceId: string;
  feedUrl: string;
  title: string;
  status: 'active' | 'paused' | 'error';
  lastPolledAt?: string;
  itemCount: number;
  autoGeneratePosts: boolean;
  targetPlatforms: SocialPlatform[];
}

export interface RssItem {
  id: string;
  feedId: string;
  title: string;
  link: string;
  pubDate: string;
  description: string;
  convertedPostId?: string;
}

export interface MediaAsset {
  id: string;
  workspaceId: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:5' | '2:3';
  folder: string;
  tags: string[];
  createdAt: string;
}

export interface Campaign {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  totalPosts: number;
  publishedPosts: number;
  status: 'active' | 'completed' | 'draft';
  targetPlatforms: SocialPlatform[];
}

export interface InAppNotification {
  id: string;
  workspaceId: string;
  type: 'post_published' | 'post_failed' | 'scheduled_approaching' | 'key_invalid' | 'auto_mode_run' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface AnalyticsSummary {
  totalPostsCreated: number;
  scheduledPosts: number;
  successfulPublications: number;
  failedPublications: number;
  successRate: number;
  platformDistribution: Record<SocialPlatform, number>;
  totalEstimatedReach: number;
  totalEngagements: number;
  dailyActivity?: { date: string; published: number; scheduled: number }[];
  connectedAccountsCount?: number;
}
