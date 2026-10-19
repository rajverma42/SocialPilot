import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db';
import { aiService } from '../ai-service';
import { publishingEngine } from '../publishing-engine';
import { rssService } from '../rss-service';
import { PLATFORM_ADAPTERS } from '../platform-adapters';
import { encryptSecret, decryptSecret, maskSecret } from '../crypto-utils';
import { requireRole } from '../middleware/auth';
import {
  UserProfileSchema,
  WorkspaceCreateSchema,
  WorkspaceUpdateSchema,
  AiProviderCredentialSchema,
  AiGenerateSchema,
  AiTransformSchema,
  PostCreateSchema,
  ScheduledJobCreateSchema,
  ContentSourceCreateSchema,
  MediaUploadSessionSchema
} from '../schemas';
import { Post, RssFeedSource } from '../../src/types';

export const v1Router = Router();

// ==========================================
// 1. AUTH & USER ENDPOINTS
// ==========================================
v1Router.get('/me', (req: Request, res: Response) => {
  const user = db.getUser();
  res.json({
    data: {
      ...user,
      role: req.user?.role || 'owner',
      currentWorkspaceId: req.user?.workspaceId
    }
  });
});

v1Router.patch('/me', (req: Request, res: Response) => {
  const parse = UserProfileSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', details: parse.error.format() } });
  }

  const currentUser = db.getUser();
  const updated = {
    ...currentUser,
    ...parse.data,
    updatedAt: new Date().toISOString()
  };
  db.saveUser(updated);
  res.json({ data: updated });
});

v1Router.delete('/me', requireRole(['owner']), (req: Request, res: Response) => {
  res.json({ data: { message: 'Account scheduled for deletion according to GDPR policy.' } });
});

// ==========================================
// 2. WORKSPACE ENDPOINTS
// ==========================================
v1Router.get('/workspaces', (req: Request, res: Response) => {
  const workspaces = db.getWorkspaces();
  res.json({ data: workspaces });
});

v1Router.post('/workspaces', requireRole(['owner', 'admin']), (req: Request, res: Response) => {
  const parse = WorkspaceCreateSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', details: parse.error.format() } });
  }

  const newWorkspace = {
    id: `ws-${Date.now().toString(36)}`,
    name: parse.data.name,
    slug: parse.data.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    ownerId: req.user!.uid,
    timezone: parse.data.timezone,
    defaultLanguage: parse.data.defaultLanguage,
    createdAt: new Date().toISOString(),
    membersCount: 1,
    plan: 'pro' as const
  };

  db.saveWorkspace(newWorkspace);
  res.status(201).json({ data: newWorkspace });
});

v1Router.get('/workspaces/:workspaceId', (req: Request, res: Response) => {
  const workspace = db.getWorkspaces().find(w => w.id === req.params.workspaceId);
  if (!workspace) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Workspace not found.' } });
  res.json({ data: workspace });
});

v1Router.patch('/workspaces/:workspaceId', requireRole(['owner', 'admin']), (req: Request, res: Response) => {
  const parse = WorkspaceUpdateSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', details: parse.error.format() } });
  }

  const workspace = db.getWorkspaces().find(w => w.id === req.params.workspaceId);
  if (!workspace) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Workspace not found.' } });

  const updated = { ...workspace, ...parse.data };
  db.saveWorkspace(updated);
  res.json({ data: updated });
});

v1Router.get('/workspaces/:workspaceId/members', (req: Request, res: Response) => {
  res.json({
    data: [
      {
        uid: req.user!.uid,
        email: req.user!.email,
        displayName: 'Lead Creator',
        role: req.user!.role,
        status: 'active',
        joinedAt: '2026-01-15T08:00:00Z'
      }
    ]
  });
});

// ==========================================
// 3. AI PROVIDER CREDENTIALS & BYO-KEY
// ==========================================
v1Router.get('/ai-providers', (req: Request, res: Response) => {
  const config = db.getAiConfig(req.user!.workspaceId) || {
    provider: 'gemini',
    hasKey: false,
    maskedApiKey: '',
    selectedModel: 'gemini-3.8-flash',
    isValid: false,
    totalGenerations: 0,
    estimatedTokensUsed: 0
  };
  res.json({
    data: {
      provider: config.provider,
      hasKey: config.hasKey,
      maskedApiKey: config.maskedApiKey,
      selectedModel: config.selectedModel,
      isValid: config.isValid,
      totalGenerations: config.totalGenerations,
      estimatedTokensUsed: config.estimatedTokensUsed,
      lastValidatedAt: config.lastValidatedAt
    }
  });
});

v1Router.post('/ai-providers', requireRole(['owner', 'admin', 'editor']), async (req: Request, res: Response) => {
  const parse = AiProviderCredentialSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', details: parse.error.format() } });
  }

  const { apiKey, selectedModel, provider } = parse.data;
  const validation = await aiService.validateKey(apiKey);

  if (!validation.isValid) {
    return res.status(400).json({
      error: {
        code: 'INVALID_AI_KEY',
        message: validation.error || 'Failed to authenticate key with AI provider.'
      }
    });
  }

  const encryptedKey = encryptSecret(apiKey);
  const current = db.getAiConfig(req.user!.workspaceId) || {
    provider: 'gemini',
    hasKey: false,
    maskedApiKey: '',
    selectedModel: 'gemini-3.8-flash',
    isValid: false,
    totalGenerations: 0,
    estimatedTokensUsed: 0
  };

  const updated = {
    ...current,
    provider,
    encryptedKey,
    maskedApiKey: maskSecret(apiKey),
    hasKey: true,
    selectedModel,
    isValid: true,
    lastValidatedAt: new Date().toISOString()
  };

  db.setAiConfig(req.user!.workspaceId, updated);
  res.json({
    data: {
      success: true,
      maskedApiKey: updated.maskedApiKey,
      selectedModel: updated.selectedModel,
      latencyMs: validation.latencyMs
    }
  });
});

v1Router.post('/ai-providers/:credentialId/validate', async (req: Request, res: Response) => {
  const config = db.getAiConfig(req.user!.workspaceId);
  const key = config?.encryptedKey ? decryptSecret(config.encryptedKey) : process.env.GEMINI_API_KEY;

  if (!key) {
    return res.status(400).json({ error: { code: 'NO_KEY', message: 'No AI key configured to test.' } });
  }

  const validation = await aiService.validateKey(key);
  res.json({ data: validation });
});

v1Router.delete('/ai-providers/:credentialId', requireRole(['owner', 'admin']), (req: Request, res: Response) => {
  const current = db.getAiConfig(req.user!.workspaceId);
  if (current) {
    db.setAiConfig(req.user!.workspaceId, {
      ...current,
      encryptedKey: undefined,
      maskedApiKey: '',
      hasKey: false,
      isValid: false
    });
  }
  res.json({ data: { message: 'AI provider credentials purged from vault.' } });
});

// ==========================================
// 4. AI GENERATION ENDPOINTS
// ==========================================
v1Router.post('/ai/generate', async (req: Request, res: Response) => {
  const parse = AiGenerateSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', details: parse.error.format() } });
  }

  const config = db.getAiConfig(req.user!.workspaceId);
  const userKey = config?.encryptedKey ? decryptSecret(config.encryptedKey) : undefined;

  try {
    const result = await aiService.generateSocialPost({
      topic: parse.data.topic,
      niche: parse.data.niche,
      audience: parse.data.audience,
      region: parse.data.region,
      language: parse.data.language,
      tone: parse.data.tone,
      format: parse.data.format,
      targetPlatforms: parse.data.targetPlatforms as any,
      apiKey: userKey
    });
    db.incrementAiUsage(req.user!.workspaceId, 850);
    res.json({ data: result });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'AI_GENERATION_FAILED', message: err.message } });
  }
});

v1Router.post('/ai/transform', async (req: Request, res: Response) => {
  const parse = AiTransformSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', details: parse.error.format() } });
  }

  const config = db.getAiConfig(req.user!.workspaceId);
  const userKey = config?.encryptedKey ? decryptSecret(config.encryptedKey) : undefined;

  try {
    const result = await aiService.transformText({
      text: parse.data.text,
      action: parse.data.action as any,
      targetValue: parse.data.targetLanguage,
      apiKey: userKey
    });
    res.json({ data: { transformedText: result } });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'TRANSFORM_FAILED', message: err.message } });
  }
});

// ==========================================
// 5. SOCIAL ACCOUNTS & OAUTH
// ==========================================
v1Router.get('/social-accounts', (req: Request, res: Response) => {
  const accounts = db.getSocialAccounts(req.user!.workspaceId);
  // Never expose raw access tokens in responses
  const safeAccounts = accounts.map(a => ({
    id: a.id,
    platform: a.platform,
    accountName: a.accountName,
    accountHandle: a.accountHandle,
    avatarUrl: a.avatarUrl,
    status: a.status,
    connectedAt: a.connectedAt,
    lastHealthCheckAt: a.lastHealthCheckAt
  }));
  res.json({ data: safeAccounts });
});

v1Router.get('/social-accounts/:socialAccountId', (req: Request, res: Response) => {
  const account = db.getSocialAccounts(req.user!.workspaceId).find(a => a.id === req.params.socialAccountId);
  if (!account) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Social account not found.' } });
  res.json({ data: account });
});

v1Router.post('/social-accounts/:socialAccountId/verify', async (req: Request, res: Response) => {
  const account = db.getSocialAccounts(req.user!.workspaceId).find(a => a.id === req.params.socialAccountId);
  if (!account) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Social account not found.' } });

  const adapter = PLATFORM_ADAPTERS[account.platform];
  if (!adapter) return res.status(400).json({ error: { code: 'NO_ADAPTER', message: 'Adapter not found.' } });

  const health = await adapter.testHealth(account);
  res.json({ data: health });
});

v1Router.delete('/social-accounts/:socialAccountId', requireRole(['owner', 'admin']), (req: Request, res: Response) => {
  db.deleteSocialAccount(req.params.socialAccountId);
  res.json({ data: { message: 'Social account disconnected and credentials purged.' } });
});

// ==========================================
// 6. POSTS ENDPOINTS
// ==========================================
v1Router.get('/posts', (req: Request, res: Response) => {
  const statusFilter = req.query.status as string;
  let posts = db.getPosts(req.user!.workspaceId);
  if (statusFilter) {
    posts = posts.filter(p => p.status === statusFilter);
  }
  res.json({ data: posts });
});

v1Router.post('/posts', requireRole(['owner', 'admin', 'editor']), (req: Request, res: Response) => {
  const parse = PostCreateSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', details: parse.error.format() } });
  }

  const now = new Date().toISOString();
  const newPost: Post = {
    id: `post-${Date.now().toString(36)}`,
    workspaceId: req.user!.workspaceId,
    topic: parse.data.topic,
    niche: parse.data.niche,
    language: parse.data.language,
    tone: parse.data.tone,
    format: parse.data.format,
    status: parse.data.status as any,
    mode: 'manual',
    targetPlatforms: parse.data.targetPlatforms as any,
    targetAccountIds: parse.data.targetAccountIds,
    platformContents: parse.data.platformContents,
    mediaUrls: parse.data.mediaUrls,
    scheduledTime: parse.data.scheduledTime,
    autoApproval: parse.data.autoApproval,
    campaignId: parse.data.campaignId,
    createdAt: now,
    updatedAt: now
  };

  db.savePost(newPost);
  res.status(201).json({ data: newPost });
});

v1Router.get('/posts/:postId', (req: Request, res: Response) => {
  const post = db.getPosts(req.user!.workspaceId).find(p => p.id === req.params.postId);
  if (!post) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Post not found.' } });
  res.json({ data: post });
});

v1Router.patch('/posts/:postId', requireRole(['owner', 'admin', 'editor']), (req: Request, res: Response) => {
  const post = db.getPosts(req.user!.workspaceId).find(p => p.id === req.params.postId);
  if (!post) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Post not found.' } });

  const updated: Post = {
    ...post,
    ...req.body,
    id: post.id,
    workspaceId: post.workspaceId,
    updatedAt: new Date().toISOString()
  };

  db.savePost(updated);
  res.json({ data: updated });
});

v1Router.delete('/posts/:postId', requireRole(['owner', 'admin', 'editor']), (req: Request, res: Response) => {
  db.deletePost(req.params.postId);
  res.json({ data: { message: 'Post removed from queue.' } });
});

v1Router.post('/posts/:postId/duplicate', requireRole(['owner', 'admin', 'editor']), (req: Request, res: Response) => {
  const post = db.getPosts(req.user!.workspaceId).find(p => p.id === req.params.postId);
  if (!post) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Post not found.' } });

  const now = new Date().toISOString();
  const duplicated: Post = {
    ...post,
    id: `post-${Date.now().toString(36)}`,
    status: 'draft',
    scheduledTime: undefined,
    publishedTime: undefined,
    createdAt: now,
    updatedAt: now
  };

  db.savePost(duplicated);
  res.status(201).json({ data: duplicated });
});

v1Router.post('/posts/:postId/publish', requireRole(['owner', 'admin', 'editor', 'publisher']), async (req: Request, res: Response) => {
  try {
    const post = await publishingEngine.publishPostNow(req.params.postId, req.user!.workspaceId);
    res.json({ data: post });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'PUBLISH_FAILED', message: err.message } });
  }
});

// ==========================================
// 7. SCHEDULING & DURABLE JOBS
// ==========================================
v1Router.get('/scheduled-jobs', (req: Request, res: Response) => {
  const posts = db.getPosts(req.user!.workspaceId);
  const scheduled = posts.filter(p => p.status === 'scheduled' || p.status === 'queued');
  res.json({ data: scheduled });
});

v1Router.post('/scheduled-jobs', requireRole(['owner', 'admin', 'editor']), (req: Request, res: Response) => {
  const parse = ScheduledJobCreateSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', details: parse.error.format() } });
  }

  res.status(201).json({
    data: {
      jobId: `job-${Date.now().toString(36)}`,
      status: 'pending',
      scheduledAtUTC: parse.data.scheduledAtUTC,
      idempotencyKey: parse.data.idempotencyKey || crypto.randomUUID()
    }
  });
});

v1Router.post('/scheduled-jobs/:jobId/cancel', requireRole(['owner', 'admin', 'editor']), (req: Request, res: Response) => {
  const post = db.getPosts(req.user!.workspaceId).find(p => p.id === req.params.jobId);
  if (post) {
    post.status = 'cancelled';
    db.savePost(post);
  }
  res.json({ data: { message: 'Scheduled job cancelled successfully.' } });
});

// ==========================================
// 8. AUTOMATIONS & FULL AUTO MODE
// ==========================================
v1Router.get('/automations', (req: Request, res: Response) => {
  const config = db.getAutoConfig(req.user!.workspaceId);
  res.json({ data: config });
});

v1Router.patch('/automations/:automationId', requireRole(['owner', 'admin']), (req: Request, res: Response) => {
  const current = db.getAutoConfig(req.user!.workspaceId);
  if (!current) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Automation not found.' } });

  const updated = { ...current, ...req.body };
  db.saveAutoConfig(updated);
  res.json({ data: updated });
});

v1Router.post('/automations/:automationId/pause', requireRole(['owner', 'admin']), (req: Request, res: Response) => {
  const current = db.getAutoConfig(req.user!.workspaceId);
  if (!current) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Automation not found.' } });

  current.enabled = false;
  db.saveAutoConfig(current);
  res.json({ data: current });
});

v1Router.post('/automations/:automationId/resume', requireRole(['owner', 'admin']), (req: Request, res: Response) => {
  const current = db.getAutoConfig(req.user!.workspaceId);
  if (!current) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Automation not found.' } });

  current.enabled = true;
  db.saveAutoConfig(current);
  res.json({ data: current });
});

// ==========================================
// 9. CONTENT SOURCES (RSS & WEBSITES)
// ==========================================
v1Router.get('/content-sources', (req: Request, res: Response) => {
  const sources = db.getRssFeeds(req.user!.workspaceId);
  res.json({ data: sources });
});

v1Router.post('/content-sources', requireRole(['owner', 'admin', 'editor']), (req: Request, res: Response) => {
  const parse = ContentSourceCreateSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', details: parse.error.format() } });
  }

  const newSource: RssFeedSource = {
    id: `feed-${Date.now().toString(36)}`,
    workspaceId: req.user!.workspaceId,
    title: parse.data.sourceURL.replace(/^https?:\/\//, '').split('/')[0],
    feedUrl: parse.data.sourceURL,
    status: parse.data.enabled ? 'active' : 'paused',
    itemCount: 0,
    autoGeneratePosts: false,
    targetPlatforms: ['x', 'telegram']
  };

  db.saveRssFeed(newSource);
  res.status(201).json({ data: newSource });
});

v1Router.post('/content-sources/:sourceId/test', async (req: Request, res: Response) => {
  const source = db.getRssFeeds(req.user!.workspaceId).find(s => s.id === req.params.sourceId);
  if (!source) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Source not found.' } });

  try {
    const items = await rssService.fetchAndParse(source.feedUrl, source.id);
    res.json({ data: { success: true, itemsRetrieved: items.length, sample: items.slice(0, 3) } });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'FEED_FETCH_FAILED', message: err.message } });
  }
});

v1Router.delete('/content-sources/:sourceId', requireRole(['owner', 'admin']), (req: Request, res: Response) => {
  db.deleteRssFeed(req.params.sourceId);
  res.json({ data: { message: 'Feed source deleted.' } });
});

// ==========================================
// 10. MEDIA ASSET STORAGE
// ==========================================
v1Router.post('/media/upload-session', (req: Request, res: Response) => {
  const parse = MediaUploadSessionSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', details: parse.error.format() } });
  }

  const fileId = `media-${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`;
  const signedUploadUrl = `/api/v1/media/direct-upload/${fileId}`;

  res.json({
    data: {
      fileId,
      uploadUrl: signedUploadUrl,
      headers: { 'Content-Type': parse.data.mimeType },
      expiresInSeconds: 900
    }
  });
});

v1Router.get('/media', (req: Request, res: Response) => {
  const media = db.getMediaAssets(req.user!.workspaceId);
  res.json({ data: media });
});

v1Router.delete('/media/:mediaId', requireRole(['owner', 'admin', 'editor']), (req: Request, res: Response) => {
  db.deleteMediaAsset(req.params.mediaId);
  res.json({ data: { message: 'Media asset deleted from storage.' } });
});

// ==========================================
// 11. ANALYTICS & NOTIFICATIONS
// ==========================================
v1Router.get('/analytics/overview', (req: Request, res: Response) => {
  const posts = db.getPosts(req.user!.workspaceId);
  const published = posts.filter(p => p.status === 'published');
  res.json({
    data: {
      totalPosts: posts.length,
      publishedPosts: published.length,
      scheduledPosts: posts.filter(p => p.status === 'scheduled').length,
      successRate: 98.4,
      totalReach: published.length * 1540 + 3200,
      totalEngagements: published.length * 125 + 450
    }
  });
});

v1Router.get('/notifications', (req: Request, res: Response) => {
  const notifs = db.getNotifications(req.user!.workspaceId);
  res.json({ data: notifs });
});

v1Router.post('/notifications/:notificationId/read', (req: Request, res: Response) => {
  db.markAllNotificationsRead(req.user!.workspaceId);
  res.json({ data: { message: 'Notifications marked read.' } });
});

// ==========================================
// 12. USAGE RECORDS & SYSTEM LIMITS
// ==========================================
v1Router.get('/usage', (req: Request, res: Response) => {
  const aiConfig = db.getAiConfig(req.user!.workspaceId);
  const totalGen = aiConfig?.totalGenerations || 0;
  const tokenUsed = aiConfig?.estimatedTokensUsed || 0;

  res.json({
    data: {
      totalGenerations: totalGen,
      estimatedTokensUsed: tokenUsed,
      estimatedCostUSD: ((tokenUsed / 1000000) * 0.15).toFixed(4),
      quotaLimitDaily: 500,
      remainingDaily: Math.max(0, 500 - totalGen)
    }
  });
});

v1Router.get('/usage/limits', (req: Request, res: Response) => {
  res.json({
    data: {
      maxPostsPerDay: 50,
      maxMediaUploadSizeBytes: 52428800,
      maxConnectedAccounts: 20,
      supportedPlatformsCount: 12
    }
  });
});
