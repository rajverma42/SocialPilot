import fs from 'fs';
import path from 'path';
import { 
  User, 
  Workspace, 
  AiProviderConfig, 
  Post, 
  SocialAccount, 
  FullAutoConfig, 
  RssFeedSource, 
  RssItem, 
  MediaAsset, 
  Campaign, 
  InAppNotification,
  MonetizationConfig 
} from '../src/types';
import { maskSecret } from './crypto-utils';

interface DatabaseSchema {
  users: User[];
  workspaces: Workspace[];
  aiConfigs: Record<string, AiProviderConfig & { encryptedKey?: string }>;
  posts: Post[];
  socialAccounts: SocialAccount[];
  autoConfigs: Record<string, FullAutoConfig>;
  rssFeeds: RssFeedSource[];
  rssItems: RssItem[];
  mediaAssets: MediaAsset[];
  campaigns: Campaign[];
  notifications: InAppNotification[];
  systemSettings: {
    emergencyPublishingPaused: boolean;
    lastWorkerRunAt?: string;
  };
  monetization: MonetizationConfig;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

export const defaultMonetization: MonetizationConfig = {
  enabled: true,
  adSensePublisherId: 'ca-pub-6603222683084860',
  autoAdsEnabled: true,
  testAdsMode: true,
  headerAdEnabled: true,
  inFeedAdEnabled: true,
  rewardedAdEnabled: true,
  stickyFooterAdEnabled: true,
  customScriptCode: '',
  refreshIntervalSeconds: 45,
  payoutThreshold: 100,
  payoutMethod: 'adsense',
  payoutAddress: 'contact@socialpilot.ai',
  stats: {
    impressions: 4892,
    clicks: 142,
    todayEarnings: 6.48,
    yesterdayEarnings: 12.85,
    last7DaysEarnings: 74.20,
    monthEarnings: 218.45,
    totalLifetimeEarnings: 642.10,
    eCpm: 2.65,
    dailyHistory: [
      { date: 'Oct 11', impressions: 620, clicks: 18, earnings: 9.80 },
      { date: 'Oct 12', impressions: 710, clicks: 22, earnings: 11.40 },
      { date: 'Oct 13', impressions: 680, clicks: 19, earnings: 10.20 },
      { date: 'Oct 14', impressions: 830, clicks: 26, earnings: 13.90 },
      { date: 'Oct 15', impressions: 790, clicks: 21, earnings: 12.10 },
      { date: 'Oct 16', impressions: 740, clicks: 20, earnings: 11.20 },
      { date: 'Oct 17', impressions: 522, clicks: 16, earnings: 8.60 }
    ],
    unitPerformance: [
      { id: 'unit-header', name: 'Header Top Leaderboard', format: 'leaderboard', impressions: 2120, clicks: 68, earnings: 32.50, ctr: '3.2%' },
      { id: 'unit-infeed', name: 'Dashboard In-Feed Sponsor', format: 'infeed', impressions: 1450, clicks: 42, earnings: 21.80, ctr: '2.9%' },
      { id: 'unit-sticky', name: 'Mobile Sticky Footer Banner', format: 'sticky', impressions: 980, clicks: 24, earnings: 12.60, ctr: '2.4%' },
      { id: 'unit-rewarded', name: 'Rewarded AI Boost Video', format: 'rewarded', impressions: 342, clicks: 8, earnings: 7.30, ctr: '2.3%' }
    ]
  }
};

function getInitialData(): DatabaseSchema {
  const defaultWorkspaceId = 'ws-default-01';
  const defaultUserId = 'usr-admin-01';

  return {
    users: [
      {
        id: defaultUserId,
        name: 'Velocity Media Lead',
        email: 'creator@socialpilot.ai',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'owner',
        createdAt: new Date().toISOString(),
      }
    ],
    workspaces: [
      {
        id: defaultWorkspaceId,
        name: 'Velocity Tech Media',
        slug: 'velocity-tech',
        ownerId: defaultUserId,
        timezone: 'Asia/Kolkata',
        defaultLanguage: 'English',
        createdAt: new Date().toISOString(),
        membersCount: 3,
        plan: 'free'
      }
    ],
    aiConfigs: {
      [defaultWorkspaceId]: {
        provider: 'gemini',
        maskedApiKey: process.env.GEMINI_API_KEY ? maskSecret(process.env.GEMINI_API_KEY) : 'AIzaSy...EnvActive',
        hasKey: Boolean(process.env.GEMINI_API_KEY),
        selectedModel: 'gemini-3.8-flash',
        isValid: true,
        lastValidatedAt: new Date().toISOString(),
        totalGenerations: 42,
        estimatedTokensUsed: 128500
      }
    },
    socialAccounts: [
      {
        id: 'acc-tg-01',
        workspaceId: defaultWorkspaceId,
        platform: 'telegram',
        accountName: 'TechRadar Official Broadcast',
        accountHandle: '@techradar_daily',
        avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
        status: 'connected',
        connectedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        lastHealthCheckAt: new Date().toISOString(),
        credentialsMetadata: {
          telegramChatId: '@techradar_channel',
          telegramBotUsername: '@SocialPilotBot',
          scopes: ['sendMessage', 'sendPhoto', 'postMessages']
        }
      },
      {
        id: 'acc-x-01',
        workspaceId: defaultWorkspaceId,
        platform: 'x',
        accountName: 'Velocity Media Official',
        accountHandle: '@velocity_media',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        status: 'connected',
        connectedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
        lastHealthCheckAt: new Date().toISOString(),
        credentialsMetadata: {
          scopes: ['tweet.read', 'tweet.write', 'users.read']
        }
      },
      {
        id: 'acc-li-01',
        workspaceId: defaultWorkspaceId,
        platform: 'linkedin',
        accountName: 'Velocity Growth Labs',
        accountHandle: 'company/velocity-growth',
        avatarUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150&auto=format&fit=crop&q=80',
        status: 'connected',
        connectedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
        lastHealthCheckAt: new Date().toISOString(),
        credentialsMetadata: {
          scopes: ['w_member_social', 'r_liteprofile']
        }
      },
      {
        id: 'acc-fb-01',
        workspaceId: defaultWorkspaceId,
        platform: 'facebook',
        accountName: 'Tech Creators Hub',
        accountHandle: 'fb.com/techcreatorshub',
        avatarUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=150&auto=format&fit=crop&q=80',
        status: 'permission_required',
        connectedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        lastHealthCheckAt: new Date().toISOString(),
        credentialsMetadata: {
          scopes: ['pages_show_list', 'pages_read_engagement']
        }
      },
      {
        id: 'acc-ig-01',
        workspaceId: defaultWorkspaceId,
        platform: 'instagram',
        accountName: 'velocity_creators',
        accountHandle: '@velocity_creators',
        avatarUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=150&auto=format&fit=crop&q=80',
        status: 'connected',
        connectedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        lastHealthCheckAt: new Date().toISOString(),
        credentialsMetadata: {
          scopes: ['instagram_basic', 'instagram_content_publish']
        }
      },
      {
        id: 'acc-yt-01',
        workspaceId: defaultWorkspaceId,
        platform: 'youtube',
        accountName: 'Velocity AI Insights',
        accountHandle: '@VelocityAI',
        avatarUrl: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=150&auto=format&fit=crop&q=80',
        status: 'connected',
        connectedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        lastHealthCheckAt: new Date().toISOString(),
        credentialsMetadata: {
          scopes: ['https://www.googleapis.com/auth/youtube.upload']
        }
      }
    ],
    posts: [
      {
        id: 'post-demo-01',
        workspaceId: defaultWorkspaceId,
        topic: 'AI Agents in 2026: From Chatbots to Autonomous Co-workers',
        niche: 'Technology',
        language: 'English',
        tone: 'Professional & Authoritative',
        format: 'Multi-Platform Breakdown',
        status: 'published',
        mode: 'manual',
        targetPlatforms: ['x', 'linkedin', 'telegram'],
        platformContents: {
          x: {
            caption: 'AI agents are no longer just answering questions—they are actively negotiating APIs, managing multi-step workflows, and deploying code. The shift from conversational AI to autonomous execution is the single biggest unlock of 2026. What routine tasks have you automated this quarter?',
            hashtags: ['#AIAgents', '#Automation', '#TechTrends2026'],
            characterCount: 268,
            isValid: true
          },
          linkedin: {
            title: 'The Shift from Passive LLMs to Autonomous Execution',
            caption: 'For the last 3 years, enterprise AI was primarily "chat with your docs".\n\nIn 2026, the paradigm has completely inverted:\n1. Agents orchestrate distributed microservices.\n2. Autonomous retry budgets and state machines prevent hallucinatory drift.\n3. Human-in-the-loop validation acts as an escalation gate rather than a manual bottleneck.\n\nThe real ROI is in autonomous workflows. Where is your team deploying agents first?',
            hashtags: ['#ArtificialIntelligence', '#EnterpriseAI', '#Productivity', '#FutureOfWork'],
            characterCount: 520,
            isValid: true
          },
          telegram: {
            caption: '🚀 <b>AI Agents in 2026: Autonomous Co-workers are Here</b>\n\nThe landscape has evolved beyond simple chatbots. Modern agents now handle:\n• Multi-tool orchestration\n• Error auto-recovery\n• Scheduled proactive alerts\n\nJoin the discussion in our tech channel!',
            hashtags: ['#AIAgents', '#TelegramTech'],
            characterCount: 284,
            isValid: true
          },
          facebook: { caption: '', hashtags: [], characterCount: 0, isValid: true },
          instagram: { caption: '', hashtags: [], characterCount: 0, isValid: true },
          youtube: { caption: '', hashtags: [], characterCount: 0, isValid: true },
          pinterest: { caption: '', hashtags: [], characterCount: 0, isValid: true },
          tiktok: { caption: '', hashtags: [], characterCount: 0, isValid: true }
        },
        mediaUrls: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'],
        scheduledTime: new Date(Date.now() - 3600000 * 2).toISOString(),
        publishedTime: new Date(Date.now() - 3600000 * 2).toISOString(),
        autoApproval: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        remotePostIds: {
          x: 'x-tweet-1847192837',
          linkedin: 'urn:li:share:71982736192',
          telegram: 'msg-94812'
        },
        publishingAttempts: [
          {
            id: 'att-1',
            postId: 'post-demo-01',
            platform: 'x',
            timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
            status: 'success',
            remotePostId: 'x-tweet-1847192837'
          },
          {
            id: 'att-2',
            postId: 'post-demo-01',
            platform: 'linkedin',
            timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
            status: 'success',
            remotePostId: 'urn:li:share:71982736192'
          },
          {
            id: 'att-3',
            postId: 'post-demo-01',
            platform: 'telegram',
            timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
            status: 'success',
            remotePostId: 'msg-94812'
          }
        ]
      },
      {
        id: 'post-demo-02',
        workspaceId: defaultWorkspaceId,
        topic: 'Mastering Time-Zone Publishing for Global SaaS Engagement',
        niche: 'Business',
        language: 'English',
        tone: 'Engaging & Viral',
        format: 'Tips & Strategy',
        status: 'scheduled',
        mode: 'approval_required',
        targetPlatforms: ['x', 'linkedin'],
        platformContents: {
          x: {
            caption: 'Posting at the wrong time cuts your reach by up to 60%.\n\nHere is how we schedule across 3 continents:\n⏰ US East: 08:30 AM EST\n⏰ Europe: 13:30 CET\n⏰ Asia-Pacific: 19:30 IST\n\nConsistency beats frequency every single week. When do you see your peak metrics?',
            hashtags: ['#SaaSGrowth', '#ContentMarketing', '#SocialMediaTips'],
            characterCount: 275,
            isValid: true
          },
          linkedin: {
            title: 'Global Social Scheduling: The 3-Window Formula',
            caption: 'If your audience spans San Francisco to Singapore, one daily post will miss 2/3 of your potential viewers.\n\nHere is our tested 3-window scheduling cadence:\n• Window A (Asia Evening / Europe Noon): Focus on educational case studies\n• Window B (US Morning): Tactical breakdowns & product announcements\n• Window C (US Afternoon / APAC Morning): Engaging community questions\n\nTest each window for 14 days and audit your impression curve.',
            hashtags: ['#GrowthStrategy', '#SocialMediaStrategy', '#B2BMarketing'],
            characterCount: 489,
            isValid: true
          },
          telegram: { caption: '', hashtags: [], characterCount: 0, isValid: true },
          facebook: { caption: '', hashtags: [], characterCount: 0, isValid: true },
          instagram: { caption: '', hashtags: [], characterCount: 0, isValid: true },
          youtube: { caption: '', hashtags: [], characterCount: 0, isValid: true },
          pinterest: { caption: '', hashtags: [], characterCount: 0, isValid: true },
          tiktok: { caption: '', hashtags: [], characterCount: 0, isValid: true }
        },
        mediaUrls: [],
        scheduledTime: new Date(Date.now() + 3600000 * 5).toISOString(),
        autoApproval: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishingAttempts: []
      },
      {
        id: 'post-demo-03',
        workspaceId: defaultWorkspaceId,
        topic: '5 Modern CSS Tricks Every Web Developer Should Know',
        niche: 'Technology',
        language: 'English',
        tone: 'Educational & Deep',
        format: 'Carousel Breakdown',
        status: 'queued',
        mode: 'full_auto',
        targetPlatforms: ['telegram', 'instagram'],
        platformContents: {
          telegram: {
            caption: '🎨 <b>5 CSS Superpowers You Can Use Right Now</b>\n\n1. <code>@starting-style</code> for enter animations\n2. Native CSS Nesting without Sass\n3. <code>subgrid</code> for pixel-perfect card layouts\n4. <code>text-wrap: balance</code> for titles\n5. Container Queries for component-level responsiveness\n\nSave this for your next project!',
            hashtags: ['#WebDev', '#CSS', '#Frontend'],
            characterCount: 320,
            isValid: true
          },
          instagram: {
            caption: 'Level up your frontend game in 2026! 🔥\n\nModern CSS has evolved faster than ever. From subgrid to @starting-style, writing clean styles has never felt better.\n\nSwipe through the carousel to see code snippets and live examples. Which one do you use most often in your projects?\n\nDrop a comment below! 👇',
            hashtags: ['#FrontendDeveloper', '#WebDesign', '#CSS3', '#TechTips', '#CodingLife'],
            characterCount: 380,
            isValid: true
          },
          x: { caption: '', hashtags: [], characterCount: 0, isValid: true },
          linkedin: { caption: '', hashtags: [], characterCount: 0, isValid: true },
          facebook: { caption: '', hashtags: [], characterCount: 0, isValid: true },
          youtube: { caption: '', hashtags: [], characterCount: 0, isValid: true },
          pinterest: { caption: '', hashtags: [], characterCount: 0, isValid: true },
          tiktok: { caption: '', hashtags: [], characterCount: 0, isValid: true }
        },
        mediaUrls: ['https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80'],
        scheduledTime: new Date(Date.now() + 3600000 * 18).toISOString(),
        autoApproval: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishingAttempts: []
      }
    ],
    autoConfigs: {
      [defaultWorkspaceId]: {
        id: 'auto-01',
        workspaceId: defaultWorkspaceId,
        enabled: true,
        topicNiche: 'AI Tools, SaaS Innovations & Developer Productivity',
        targetAudience: 'Software Engineers, Tech Founders & Agency Marketers',
        brandVoice: 'Authoritative, tactical, insightful without hype',
        language: 'English',
        postsPerDay: 2,
        preferredTimeWindows: ['09:30', '16:00'],
        selectedPlatforms: ['telegram', 'x', 'linkedin'],
        autoApprove: false,
        requiredPhrases: ['Practical takeaway', 'Real-world example'],
        forbiddenPhrases: ['Game changer', 'Mind-blowing', 'Revolutionary'],
        lastRunAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        nextRunAt: new Date(Date.now() + 3600000 * 6).toISOString(),
        totalGenerated: 18,
        totalPublished: 14
      }
    },
    rssFeeds: [
      {
        id: 'rss-01',
        workspaceId: defaultWorkspaceId,
        feedUrl: 'https://news.ycombinator.com/rss',
        title: 'Hacker News Frontpage',
        status: 'active',
        lastPolledAt: new Date().toISOString(),
        itemCount: 15,
        autoGeneratePosts: false,
        targetPlatforms: ['x', 'telegram']
      },
      {
        id: 'rss-02',
        workspaceId: defaultWorkspaceId,
        feedUrl: 'https://techcrunch.com/feed/',
        title: 'TechCrunch Feed',
        status: 'active',
        lastPolledAt: new Date(Date.now() - 7200000).toISOString(),
        itemCount: 20,
        autoGeneratePosts: false,
        targetPlatforms: ['linkedin', 'facebook']
      }
    ],
    rssItems: [
      {
        id: 'item-01',
        feedId: 'rss-01',
        title: 'DeepSeek announces open-source distributed model orchestration',
        link: 'https://example.com/deepseek-distributed',
        pubDate: new Date(Date.now() - 3600000 * 3).toISOString(),
        description: 'New research paper details sparse attention mechanisms for scalable multi-node inference with reduced latency.'
      },
      {
        id: 'item-02',
        feedId: 'rss-02',
        title: 'Why B2B SaaS Founders are investing in user-owned AI API Keys',
        link: 'https://example.com/saas-byo-keys',
        pubDate: new Date(Date.now() - 3600000 * 6).toISOString(),
        description: 'Platforms shifting toward transparent billing models let enterprise customers bring their own Gemini and cloud credentials.'
      }
    ],
    mediaAssets: [
      {
        id: 'media-01',
        workspaceId: defaultWorkspaceId,
        name: 'ai-architecture-diagram.jpg',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        size: 482000,
        mimeType: 'image/jpeg',
        aspectRatio: '16:9',
        folder: 'Infographics',
        tags: ['AI', 'Architecture', 'Diagram'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'media-02',
        workspaceId: defaultWorkspaceId,
        name: 'coding-setup-workspace.jpg',
        url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
        size: 720000,
        mimeType: 'image/jpeg',
        aspectRatio: '1:1',
        folder: 'Creator Shots',
        tags: ['Developer', 'Code', 'Clean'],
        createdAt: new Date().toISOString()
      }
    ],
    campaigns: [
      {
        id: 'camp-01',
        workspaceId: defaultWorkspaceId,
        name: 'Q4 AI Product Launch Campaign',
        description: 'Promoting the next-gen autonomous automation workflows across Telegram, LinkedIn and X.',
        startDate: new Date(Date.now() - 86400000 * 7).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 14).toISOString(),
        totalPosts: 8,
        publishedPosts: 5,
        status: 'active',
        targetPlatforms: ['telegram', 'x', 'linkedin']
      }
    ],
    notifications: [
      {
        id: 'notif-01',
        workspaceId: defaultWorkspaceId,
        type: 'post_published',
        title: 'Post Published Successfully',
        message: 'Your post "AI Agents in 2026" was published to X, LinkedIn, and Telegram.',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        read: false,
        link: '/app/queue'
      },
      {
        id: 'notif-02',
        workspaceId: defaultWorkspaceId,
        type: 'auto_mode_run',
        title: 'Full Auto Generated 2 Drafts',
        message: 'Daily auto-generation created 2 new posts awaiting your review.',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        read: false,
        link: '/app/auto'
      }
    ],
    systemSettings: {
      emergencyPublishingPaused: false,
      lastWorkerRunAt: new Date().toISOString()
    },
    monetization: { ...defaultMonetization }
  };
}

class JsonDatabase {
  private data: DatabaseSchema;
  private isSaving = false;

  constructor() {
    this.ensureDirectory();
    this.data = this.load();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed: DatabaseSchema = JSON.parse(raw);
        if (!parsed.monetization) {
          parsed.monetization = { ...defaultMonetization };
        }
        return parsed;
      }
    } catch (err) {
      console.error('Failed to parse database.json, initializing fresh data:', err);
    }
    const initial = getInitialData();
    this.persist(initial);
    return initial;
  }

  private persist(dataToSave: DatabaseSchema) {
    if (this.isSaving) return;
    this.isSaving = true;
    try {
      const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2), 'utf8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Error writing to database.json:', err);
    } finally {
      this.isSaving = false;
    }
  }

  public save() {
    this.persist(this.data);
  }

  // Getters & User Management
  public getUsers(): User[] { return this.data.users; }
  public getUser(): User { return this.data.users[0]; }
  public getUserByEmail(email: string): User | undefined {
    if (!email) return undefined;
    return this.data.users.find(u => u.email && u.email.toLowerCase() === email.trim().toLowerCase());
  }
  public getUserById(id: string): User | undefined {
    if (!id) return undefined;
    return this.data.users.find(u => u.id === id);
  }
  public saveUser(user: User): User {
    const idx = this.data.users.findIndex(u => u.id === user.id || (u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase()));
    if (idx >= 0) {
      this.data.users[idx] = { ...this.data.users[idx], ...user };
      this.save();
      return this.data.users[idx];
    } else {
      this.data.users.unshift(user);
      this.save();
      return user;
    }
  }
  public getWorkspaces(): Workspace[] { return this.data.workspaces; }
  public saveWorkspace(ws: Workspace): Workspace {
    const idx = this.data.workspaces.findIndex(w => w.id === ws.id);
    if (idx >= 0) {
      this.data.workspaces[idx] = ws;
    } else {
      this.data.workspaces.push(ws);
    }
    this.save();
    return ws;
  }
  public getAiConfig(workspaceId: string): (AiProviderConfig & { encryptedKey?: string }) | undefined {
    return this.data.aiConfigs[workspaceId];
  }
  public setAiConfig(workspaceId: string, config: AiProviderConfig & { encryptedKey?: string }) {
    this.data.aiConfigs[workspaceId] = config;
    this.save();
  }
  public incrementAiUsage(workspaceId: string, tokens: number = 500) {
    const config = this.data.aiConfigs[workspaceId];
    if (config) {
      config.totalGenerations = (config.totalGenerations || 0) + 1;
      config.estimatedTokensUsed = (config.estimatedTokensUsed || 0) + tokens;
      this.save();
    }
  }
  public getPosts(workspaceId?: string): Post[] {
    if (!workspaceId) return this.data.posts;
    return this.data.posts.filter(p => p.workspaceId === workspaceId);
  }
  public getPostById(id: string): Post | undefined {
    return this.data.posts.find(p => p.id === id);
  }
  public savePost(post: Post): Post {
    const idx = this.data.posts.findIndex(p => p.id === post.id);
    if (idx >= 0) {
      this.data.posts[idx] = { ...post, updatedAt: new Date().toISOString() };
    } else {
      this.data.posts.unshift(post);
    }
    this.save();
    return post;
  }
  public deletePost(id: string): boolean {
    const lenBefore = this.data.posts.length;
    this.data.posts = this.data.posts.filter(p => p.id !== id);
    const changed = this.data.posts.length !== lenBefore;
    if (changed) this.save();
    return changed;
  }
  public getSocialAccounts(workspaceId?: string): SocialAccount[] {
    if (!workspaceId) return this.data.socialAccounts;
    return this.data.socialAccounts.filter(a => a.workspaceId === workspaceId);
  }
  public saveSocialAccount(account: SocialAccount): SocialAccount {
    const idx = this.data.socialAccounts.findIndex(a => a.id === account.id);
    if (idx >= 0) {
      this.data.socialAccounts[idx] = account;
    } else {
      this.data.socialAccounts.push(account);
    }
    this.save();
    return account;
  }
  public deleteSocialAccount(id: string): boolean {
    const len = this.data.socialAccounts.length;
    this.data.socialAccounts = this.data.socialAccounts.filter(a => a.id !== id);
    const changed = this.data.socialAccounts.length !== len;
    if (changed) this.save();
    return changed;
  }
  public getAutoConfig(workspaceId: string): FullAutoConfig | undefined {
    return this.data.autoConfigs[workspaceId];
  }
  public saveAutoConfig(config: FullAutoConfig): FullAutoConfig {
    this.data.autoConfigs[config.workspaceId] = config;
    this.save();
    return config;
  }
  public getRssFeeds(workspaceId?: string): RssFeedSource[] {
    if (!workspaceId) return this.data.rssFeeds;
    return this.data.rssFeeds.filter(f => f.workspaceId === workspaceId);
  }
  public saveRssFeed(feed: RssFeedSource): RssFeedSource {
    const idx = this.data.rssFeeds.findIndex(f => f.id === feed.id);
    if (idx >= 0) {
      this.data.rssFeeds[idx] = feed;
    } else {
      this.data.rssFeeds.push(feed);
    }
    this.save();
    return feed;
  }
  public deleteRssFeed(id: string): boolean {
    const len = this.data.rssFeeds.length;
    this.data.rssFeeds = this.data.rssFeeds.filter(f => f.id !== id);
    const changed = this.data.rssFeeds.length !== len;
    if (changed) this.save();
    return changed;
  }
  public getRssItems(feedId?: string): RssItem[] {
    if (!feedId) return this.data.rssItems;
    return this.data.rssItems.filter(i => i.feedId === feedId);
  }
  public addRssItems(items: RssItem[]) {
    for (const item of items) {
      if (!this.data.rssItems.some(i => i.link === item.link)) {
        this.data.rssItems.unshift(item);
      }
    }
    this.save();
  }
  public getMediaAssets(workspaceId?: string): MediaAsset[] {
    if (!workspaceId) return this.data.mediaAssets;
    return this.data.mediaAssets.filter(m => m.workspaceId === workspaceId);
  }
  public saveMediaAsset(asset: MediaAsset): MediaAsset {
    this.data.mediaAssets.unshift(asset);
    this.save();
    return asset;
  }
  public deleteMediaAsset(id: string): boolean {
    const len = this.data.mediaAssets.length;
    this.data.mediaAssets = this.data.mediaAssets.filter(m => m.id !== id);
    const changed = this.data.mediaAssets.length !== len;
    if (changed) this.save();
    return changed;
  }
  public getCampaigns(workspaceId?: string): Campaign[] {
    if (!workspaceId) return this.data.campaigns;
    return this.data.campaigns.filter(c => c.workspaceId === workspaceId);
  }
  public saveCampaign(campaign: Campaign): Campaign {
    const idx = this.data.campaigns.findIndex(c => c.id === campaign.id);
    if (idx >= 0) {
      this.data.campaigns[idx] = campaign;
    } else {
      this.data.campaigns.push(campaign);
    }
    this.save();
    return campaign;
  }
  public getNotifications(workspaceId?: string): InAppNotification[] {
    if (!workspaceId) return this.data.notifications;
    return this.data.notifications.filter(n => n.workspaceId === workspaceId);
  }
  public addNotification(notification: InAppNotification) {
    this.data.notifications.unshift(notification);
    // keep max 50
    if (this.data.notifications.length > 50) {
      this.data.notifications = this.data.notifications.slice(0, 50);
    }
    this.save();
  }
  public markAllNotificationsRead(workspaceId: string) {
    this.data.notifications.forEach(n => {
      if (n.workspaceId === workspaceId) n.read = true;
    });
    this.save();
  }
  public getSystemSettings() {
    return this.data.systemSettings;
  }
  public setSystemSettings(settings: Partial<DatabaseSchema['systemSettings']>) {
    this.data.systemSettings = { ...this.data.systemSettings, ...settings };
    this.save();
  }

  // Monetization & Ads Earnings Methods
  public getMonetizationConfig(): MonetizationConfig {
    if (!this.data.monetization) {
      this.data.monetization = { ...defaultMonetization };
      this.save();
    }
    return this.data.monetization;
  }

  public updateMonetizationConfig(updates: Partial<MonetizationConfig>): MonetizationConfig {
    const current = this.getMonetizationConfig();
    this.data.monetization = {
      ...current,
      ...updates,
      stats: {
        ...current.stats,
        ...(updates.stats || {})
      }
    };
    this.save();
    return this.data.monetization;
  }

  public recordAdImpression(unitId?: string) {
    const mon = this.getMonetizationConfig();
    const cpmRate = (mon.stats.eCpm || 2.65) / 1000;
    mon.stats.impressions += 1;
    mon.stats.todayEarnings = Number((mon.stats.todayEarnings + cpmRate).toFixed(4));
    mon.stats.monthEarnings = Number((mon.stats.monthEarnings + cpmRate).toFixed(4));
    mon.stats.totalLifetimeEarnings = Number((mon.stats.totalLifetimeEarnings + cpmRate).toFixed(4));

    if (unitId && mon.stats.unitPerformance) {
      const u = mon.stats.unitPerformance.find(p => p.id === unitId);
      if (u) {
        u.impressions += 1;
        u.earnings = Number((u.earnings + cpmRate).toFixed(3));
        u.ctr = ((u.clicks / Math.max(1, u.impressions)) * 100).toFixed(1) + '%';
      }
    }
    this.save();
    return { impressions: mon.stats.impressions, todayEarnings: mon.stats.todayEarnings };
  }

  public recordAdClick(unitId?: string) {
    const mon = this.getMonetizationConfig();
    const clickRev = 0.22; // Typical search/native CTR value
    mon.stats.clicks += 1;
    mon.stats.todayEarnings = Number((mon.stats.todayEarnings + clickRev).toFixed(3));
    mon.stats.monthEarnings = Number((mon.stats.monthEarnings + clickRev).toFixed(3));
    mon.stats.totalLifetimeEarnings = Number((mon.stats.totalLifetimeEarnings + clickRev).toFixed(3));

    if (unitId && mon.stats.unitPerformance) {
      const u = mon.stats.unitPerformance.find(p => p.id === unitId);
      if (u) {
        u.clicks += 1;
        u.earnings = Number((u.earnings + clickRev).toFixed(3));
        u.ctr = ((u.clicks / Math.max(1, u.impressions)) * 100).toFixed(1) + '%';
      }
    }
    this.save();
    return { clicks: mon.stats.clicks, todayEarnings: mon.stats.todayEarnings };
  }

  public claimRewardedAdBonus() {
    const mon = this.getMonetizationConfig();
    const rewardedRev = 0.18;
    mon.stats.impressions += 1;
    mon.stats.todayEarnings = Number((mon.stats.todayEarnings + rewardedRev).toFixed(3));
    mon.stats.monthEarnings = Number((mon.stats.monthEarnings + rewardedRev).toFixed(3));
    mon.stats.totalLifetimeEarnings = Number((mon.stats.totalLifetimeEarnings + rewardedRev).toFixed(3));

    const rewardedUnit = mon.stats.unitPerformance?.find(p => p.id === 'unit-rewarded');
    if (rewardedUnit) {
      rewardedUnit.impressions += 1;
      rewardedUnit.earnings = Number((rewardedUnit.earnings + rewardedRev).toFixed(3));
    }

    // Add +25 generation quota to aiConfigs
    const defaultWs = 'ws-default-01';
    if (this.data.aiConfigs[defaultWs]) {
      this.data.aiConfigs[defaultWs].totalGenerations = Math.max(0, (this.data.aiConfigs[defaultWs].totalGenerations || 0) + 25);
    }

    // Add InAppNotification
    this.addNotification({
      id: `notif-reward-${Date.now()}`,
      workspaceId: defaultWs,
      type: 'system',
      title: '🎁 Rewarded Sponsor Bonus Claimed!',
      message: 'You completed watching a sponsor ad. +25 Free AI Generations added to your balance!',
      timestamp: new Date().toISOString(),
      read: false
    });

    this.save();
    return {
      success: true,
      bonusCredits: 25,
      todayEarnings: mon.stats.todayEarnings,
      totalLifetimeEarnings: mon.stats.totalLifetimeEarnings
    };
  }
}

export const db = new JsonDatabase();
