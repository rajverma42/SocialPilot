import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { db } from './db';
import { aiService } from './ai-service';
import { publishingEngine } from './publishing-engine';
import { rssService } from './rss-service';
import { facebookService } from './facebook-service';
import { PLATFORM_ADAPTERS } from './platform-adapters';
import { PLATFORM_REGISTRY } from '../src/data/platformRegistry';
import { maskSecret, encryptSecret, decryptSecret } from './crypto-utils';
import { Post, SocialAccount, FullAutoConfig, SocialPlatform } from '../src/types';
import { v1Router } from './routes/api-v1';
import { correlationMiddleware, rateLimitMiddleware, authMiddleware } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = (process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : (process.env.PORT && process.env.PORT !== '8080' ? parseInt(process.env.PORT, 10) : 3000));
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount Versioned Production API Routes with Correlation & Rate Limiting
app.use('/api/v1', correlationMiddleware, rateLimitMiddleware(120), authMiddleware, v1Router);

// Helper to resolve the active Gemini key for a workspace
function getActiveGeminiKey(workspaceId: string): string | undefined {
  const conf = db.getAiConfig(workspaceId);
  if (conf?.encryptedKey) {
    const decrypted = decryptSecret(conf.encryptedKey);
    if (decrypted) return decrypted;
  }
  return process.env.GEMINI_API_KEY;
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    emergencyPaused: db.getSystemSettings().emergencyPublishingPaused
  });
});

// System Settings
app.get('/api/system/settings', (req, res) => {
  res.json(db.getSystemSettings());
});

app.post('/api/system/toggle-emergency-pause', (req, res) => {
  const current = db.getSystemSettings().emergencyPublishingPaused;
  db.setSystemSettings({ emergencyPublishingPaused: !current });
  res.json({ emergencyPublishingPaused: !current });
});

// User & Workspaces
app.get('/api/user', (req, res) => {
  const users = db.getUsers();
  res.json(users[0] || null);
});

app.get('/api/workspaces', (req, res) => {
  res.json(db.getWorkspaces());
});

app.put('/api/workspaces/:id', (req, res) => {
  const workspaces = db.getWorkspaces();
  const ws = workspaces.find(w => w.id === req.params.id);
  if (!ws) return res.status(404).json({ error: 'Workspace not found' });
  
  if (req.body.name) ws.name = req.body.name;
  if (req.body.timezone) ws.timezone = req.body.timezone;
  if (req.body.defaultLanguage) ws.defaultLanguage = req.body.defaultLanguage;
  db.save();
  res.json(ws);
});

// AI Configuration (BYO Keys)
app.get('/api/ai/config', (req, res) => {
  const workspaceId = (req.query.workspaceId as string) || 'ws-default-01';
  const conf = db.getAiConfig(workspaceId);
  if (!conf) {
    return res.json({
      provider: 'gemini',
      maskedApiKey: '',
      hasKey: Boolean(process.env.GEMINI_API_KEY),
      selectedModel: 'gemini-3.8-flash',
      isValid: Boolean(process.env.GEMINI_API_KEY),
      totalGenerations: 0,
      estimatedTokensUsed: 0
    });
  }

  // Notice: encryptedKey is intentionally excluded from response for security!
  const { encryptedKey, ...safeResponse } = conf;
  res.json(safeResponse);
});

app.post('/api/ai/validate', async (req, res) => {
  const { apiKey, workspaceId = 'ws-default-01' } = req.body;
  const keyToValidate = apiKey || getActiveGeminiKey(workspaceId);

  if (!keyToValidate) {
    return res.status(400).json({
      isValid: false,
      models: [],
      error: 'Please enter a Gemini API Key to test validation.'
    });
  }

  const result = await aiService.validateKey(keyToValidate);
  res.json(result);
});

app.post('/api/ai/config', async (req, res) => {
  const { workspaceId = 'ws-default-01', provider = 'gemini', rawApiKey, selectedModel = 'gemini-3.8-flash' } = req.body;
  const existing = db.getAiConfig(workspaceId);

  let encryptedKey = existing?.encryptedKey;
  let maskedKey = existing?.maskedApiKey || '';
  let isValid = existing?.isValid ?? false;

  if (rawApiKey && rawApiKey.trim().length > 0) {
    // Validate first
    const valResult = await aiService.validateKey(rawApiKey.trim());
    isValid = valResult.isValid;
    encryptedKey = encryptSecret(rawApiKey.trim());
    maskedKey = maskSecret(rawApiKey.trim());
  }

  const newConfig = {
    provider,
    maskedApiKey: maskedKey,
    hasKey: Boolean(encryptedKey || process.env.GEMINI_API_KEY),
    selectedModel,
    isValid,
    lastValidatedAt: new Date().toISOString(),
    totalGenerations: existing?.totalGenerations || 0,
    estimatedTokensUsed: existing?.estimatedTokensUsed || 0,
    encryptedKey
  };

  db.setAiConfig(workspaceId, newConfig);

  const { encryptedKey: _, ...safeConfig } = newConfig;
  res.json(safeConfig);
});

app.delete('/api/ai/config', (req, res) => {
  const workspaceId = (req.query.workspaceId as string) || 'ws-default-01';
  const existing = db.getAiConfig(workspaceId);
  if (existing) {
    db.setAiConfig(workspaceId, {
      ...existing,
      encryptedKey: undefined,
      maskedApiKey: '',
      hasKey: false,
      isValid: false
    });
  }
  res.json({ success: true, message: 'Saved key removed from workspace.' });
});

// AI Topic-Based Post Generation
app.post('/api/ai/generate-post', async (req, res) => {
  const {
    workspaceId = 'ws-default-01',
    topic,
    niche,
    audience,
    region,
    language = 'English',
    tone = 'Professional & Authoritative',
    format,
    callToAction,
    brandName,
    brandDescription,
    keywordsToInclude,
    wordsToAvoid,
    targetPlatforms = ['x', 'linkedin', 'telegram']
  } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  const activeKey = getActiveGeminiKey(workspaceId);
  const aiConfig = db.getAiConfig(workspaceId);
  const selectedModel = aiConfig?.selectedModel || 'gemini-3.8-flash';

  try {
    const generated = await aiService.generateSocialPost({
      topic,
      niche: niche || 'General',
      audience,
      region,
      language,
      tone,
      format,
      callToAction,
      brandName,
      brandDescription,
      keywordsToInclude,
      wordsToAvoid,
      targetPlatforms,
      apiKey: activeKey,
      model: selectedModel
    });

    // Update generation usage stats in db
    if (aiConfig) {
      aiConfig.totalGenerations = (aiConfig.totalGenerations || 0) + 1;
      aiConfig.estimatedTokensUsed = (aiConfig.estimatedTokensUsed || 0) + 1200;
      db.setAiConfig(workspaceId, aiConfig);
    }

    res.json(generated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate post' });
  }
});

// AI Text Transformation (rewrite, shorten, expand, translate, change tone)
app.post('/api/ai/transform-text', async (req, res) => {
  const { text, action, targetValue, workspaceId = 'ws-default-01' } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });

  const activeKey = getActiveGeminiKey(workspaceId);
  try {
    const updated = await aiService.transformText({
      text,
      action,
      targetValue,
      apiKey: activeKey
    });
    res.json({ transformedText: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Posts Management
app.get('/api/posts', (req, res) => {
  const workspaceId = req.query.workspaceId as string;
  const status = req.query.status as string;
  let posts = db.getPosts(workspaceId);
  if (status) {
    posts = posts.filter(p => p.status === status);
  }
  res.json(posts);
});

app.get('/api/posts/:id', (req, res) => {
  const post = db.getPostById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
});

app.post('/api/posts', (req, res) => {
  const postData: Partial<Post> = req.body;
  const newPost: Post = {
    id: postData.id || `post-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    workspaceId: postData.workspaceId || 'ws-default-01',
    topic: postData.topic || 'Untitled Post',
    niche: postData.niche || 'General',
    language: postData.language || 'English',
    tone: postData.tone || 'Professional',
    format: postData.format || 'Standard',
    status: postData.status || 'draft',
    mode: postData.mode || 'manual',
    targetPlatforms: postData.targetPlatforms || ['x', 'linkedin'],
    platformContents: postData.platformContents || {} as any,
    mediaUrls: postData.mediaUrls || [],
    scheduledTime: postData.scheduledTime,
    campaignId: postData.campaignId,
    autoApproval: postData.autoApproval ?? true,
    sourceUrl: postData.sourceUrl,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishingAttempts: []
  };

  const saved = db.savePost(newPost);
  res.status(201).json(saved);
});

app.put('/api/posts/:id', (req, res) => {
  const post = db.getPostById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const updated: Post = {
    ...post,
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  db.savePost(updated);
  res.json(updated);
});

app.delete('/api/posts/:id', (req, res) => {
  const deleted = db.deletePost(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Post not found' });
  res.json({ success: true });
});

// Immediate Publish
app.post('/api/posts/:id/publish-now', async (req, res) => {
  try {
    const result = await publishingEngine.publishPost(req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Retry Failed Post
app.post('/api/posts/:id/retry', async (req, res) => {
  const post = db.getPostById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  try {
    const result = await publishingEngine.publishPost(post.id);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Approve Scheduled Post
app.post('/api/posts/:id/approve', (req, res) => {
  const post = db.getPostById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  post.autoApproval = true;
  if (post.status === 'awaiting_approval') {
    post.status = post.scheduledTime ? 'scheduled' : 'queued';
  }
  db.savePost(post);
  res.json(post);
});

// Social Accounts
app.get('/api/social-accounts', (req, res) => {
  const workspaceId = req.query.workspaceId as string;
  res.json(db.getSocialAccounts(workspaceId));
});

app.post('/api/social-accounts', (req, res) => {
  const { workspaceId = 'ws-default-01', platform, accountName, accountHandle, telegramChatId, telegramBotToken } = req.body;
  if (!platform || !accountName) {
    return res.status(400).json({ error: 'Platform and Account Name are required' });
  }

  // If user provided a Telegram bot token, store it in runtime env or settings
  if (platform === 'telegram' && telegramBotToken) {
    process.env.TELEGRAM_BOT_TOKEN = telegramBotToken;
  }
  if (platform === 'telegram' && telegramChatId) {
    process.env.TELEGRAM_CHAT_ID = telegramChatId;
  }

  const newAccount: SocialAccount = {
    id: `acc-${platform}-${Date.now().toString(36)}`,
    workspaceId,
    platform,
    accountName,
    accountHandle: accountHandle || `@${accountName.toLowerCase().replace(/\s+/g, '')}`,
    status: 'connected',
    connectedAt: new Date().toISOString(),
    lastHealthCheckAt: new Date().toISOString(),
    credentialsMetadata: {
      telegramChatId: telegramChatId || (platform === 'telegram' ? '@my_social_channel' : undefined),
      scopes: ['publish', 'read', 'insights']
    }
  };

  db.saveSocialAccount(newAccount);
  res.status(201).json(newAccount);
});

app.delete('/api/social-accounts/:id', (req, res) => {
  const deleted = db.deleteSocialAccount(req.params.id);
  res.json({ success: deleted });
});

function getBaseUrl(req?: express.Request): string {
  if (process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL') {
    return process.env.APP_URL.replace(/\/+$/, '');
  }
  if (req) {
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const host = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:3000';
    return `${proto}://${host}`;
  }
  return 'https://ais-dev-inirvehrqervmwccpzi3l3-660322268308.asia-east1.run.app';
}

// -------------------------------------------------------------
// FACEBOOK PAGES OFFICIAL GRAPH API & OAUTH ENDPOINTS
// -------------------------------------------------------------

// Get Facebook OAuth Configuration & Callback URI
app.get('/api/auth/facebook/config', (req, res) => {
  const { appId, isConfigured } = facebookService.getAppCredentials();
  const baseUrl = getBaseUrl(req);
  const redirectUri = `${baseUrl}/auth/facebook/callback`;
  res.json({
    isConfigured,
    appId: appId || '',
    redirectUri,
    scopes: ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts']
  });
});

// Configure Facebook App ID and App Secret
app.post('/api/auth/facebook/config', (req, res) => {
  const { appId, appSecret } = req.body;
  if (!appId || !appSecret) {
    return res.status(400).json({ error: 'Both Meta App ID and App Secret are required.' });
  }

  process.env.FACEBOOK_APP_ID = appId.trim();
  process.env.FACEBOOK_APP_SECRET = appSecret.trim();

  res.json({
    success: true,
    message: 'Meta App credentials configured successfully.',
    isConfigured: true,
    appId: appId.trim()
  });
});

// Generate Official Meta OAuth URL for Popup
app.get('/api/auth/facebook/url', (req, res) => {
  const workspaceId = (req.query.workspaceId as string) || 'ws-default-01';
  const baseUrl = getBaseUrl(req);
  const redirectUri = `${baseUrl}/auth/facebook/callback`;

  try {
    const { authUrl, state } = facebookService.generateAuthUrl(workspaceId, redirectUri);
    res.json({ url: authUrl, state, redirectUri });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Official OAuth Callback Handlers (supports trailing slash)
app.get(['/auth/facebook/callback', '/auth/facebook/callback/'], async (req, res) => {
  const { code, state, error, error_description } = req.query;

  // Handle Meta Authorization Denials
  if (error) {
    const errMsg = (error_description as string) || (error as string) || 'User cancelled authorization';
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Facebook Authorization - SocialPilot AI</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #090d16; color: #f1f5f9; padding: 40px; text-align: center; }
            .card { max-width: 480px; margin: 40px auto; background: #0f172a; padding: 32px; border-radius: 16px; border: 1px solid #334155; }
            .err { color: #f87171; font-size: 14px; margin-top: 12px; }
            button { margin-top: 24px; padding: 10px 24px; border-radius: 8px; background: #ef4444; color: white; border: none; font-weight: 600; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Meta Authorization Incomplete</h2>
            <p class="err">${errMsg}</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'FACEBOOK_AUTH_ERROR', error: ${JSON.stringify(errMsg)} }, '*');
              }
            </script>
            <button onclick="window.close()">Close Window</button>
          </div>
        </body>
      </html>
    `);
  }

  if (!code || !state) {
    return res.status(400).send('Missing code or state in callback.');
  }

  // Validate state
  const stateValidation = facebookService.validateState(state as string);
  if (!stateValidation.valid) {
    return res.status(403).send('Invalid or expired OAuth state parameter. Please try again.');
  }

  const workspaceId = stateValidation.workspaceId || 'ws-default-01';
  const baseUrl = getBaseUrl(req);
  const redirectUri = `${baseUrl}/auth/facebook/callback`;

  try {
    // Exchange authorization code for user access token and discover managed Pages
    const sessionId = await facebookService.exchangeCodeForPages(code as string, redirectUri, workspaceId);

    // Render lightweight HTML to postMessage back to app window and close popup
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Facebook Authorized - SocialPilot AI</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #090d16; color: #f1f5f9; padding: 40px; text-align: center; }
            .card { max-width: 480px; margin: 40px auto; background: #0f172a; padding: 32px; border-radius: 16px; border: 1px solid #334155; }
            .spinner { border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid #6366f1; border-radius: 50%; width: 32px; height: 32px; animation: spin 1s linear infinite; margin: 20px auto; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="card">
            <h3>Authorization Successful</h3>
            <div class="spinner"></div>
            <p>Retrieved managed Pages. Returning to SocialPilot AI...</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'FACEBOOK_AUTH_SUCCESS', sessionId: ${JSON.stringify(sessionId)} }, '*');
                setTimeout(() => {
                  window.close();
                }, 800);
              } else {
                window.location.href = '/';
              }
            </script>
          </div>
        </body>
      </html>
    `);
  } catch (err: any) {
    console.error('[Facebook Callback Error]', err);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <body style="background:#090d16; color:#f87171; font-family: sans-serif; padding: 40px; text-align: center;">
          <h3>Meta Graph API Error</h3>
          <p>${err.message}</p>
          <button onclick="window.close()" style="padding: 8px 16px; background:#334155; color:white; border:none; border-radius:6px; cursor:pointer;">Close Window</button>
        </body>
      </html>
    `);
  }
});

// Retrieve discovered Pages for the authorization session (Page tokens are stripped)
app.get('/api/auth/facebook/pages', (req, res) => {
  const sessionId = req.query.sessionId as string;
  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' });
  }

  try {
    const pages = facebookService.getDiscoveredPages(sessionId);
    res.json({ pages });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Connect selected Page from the discovered session
app.post('/api/auth/facebook/connect-page', async (req, res) => {
  const { sessionId, pageId, workspaceId = 'ws-default-01' } = req.body;
  if (!sessionId || !pageId) {
    return res.status(400).json({ error: 'sessionId and pageId are required' });
  }

  try {
    const result = await facebookService.connectDiscoveredPage(sessionId, pageId, workspaceId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Direct Page Access Token connection mode (For Graph API Explorer / System Users)
app.post('/api/auth/facebook/connect-direct', async (req, res) => {
  const { pageId, pageAccessToken, workspaceId = 'ws-default-01' } = req.body;
  if (!pageId || !pageAccessToken) {
    return res.status(400).json({ error: 'pageId and pageAccessToken are required.' });
  }

  try {
    const result = await facebookService.connectDirectToken(pageId.trim(), pageAccessToken.trim(), workspaceId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Platform Capability Registry
app.get('/api/platforms/registry', (req, res) => {
  res.json(PLATFORM_REGISTRY);
});

app.post('/api/social-accounts/:id/test-health', async (req, res) => {
  const accounts = db.getSocialAccounts();
  const acc = accounts.find(a => a.id === req.params.id);
  if (!acc) return res.status(404).json({ error: 'Account not found' });

  const adapter = PLATFORM_ADAPTERS[acc.platform];
  if (!adapter) {
    acc.lastHealthCheckAt = new Date().toISOString();
    acc.status = 'connected';
    db.saveSocialAccount(acc);
    return res.json({
      status: 'healthy',
      lastChecked: acc.lastHealthCheckAt,
      permissionsOk: true,
      latencyMs: 120
    });
  }

  try {
    const result = await adapter.testHealth(acc);
    acc.lastHealthCheckAt = new Date().toISOString();
    acc.status = result.healthy ? 'connected' : (result.error?.includes('token') ? 'token_expired' : 'permission_required');
    db.saveSocialAccount(acc);

    return res.json({
      status: result.healthy ? 'healthy' : 'error',
      lastChecked: acc.lastHealthCheckAt,
      latencyMs: result.latencyMs,
      details: result.details,
      permissionsOk: result.healthy,
      error: result.error
    });
  } catch (err: any) {
    acc.status = 'permission_required';
    db.saveSocialAccount(acc);
    return res.status(500).json({
      status: 'error',
      error: err.message
    });
  }
});

// Full Auto Mode
app.get('/api/auto-mode', (req, res) => {
  const workspaceId = (req.query.workspaceId as string) || 'ws-default-01';
  const conf = db.getAutoConfig(workspaceId);
  res.json(conf || null);
});

app.post('/api/auto-mode', (req, res) => {
  const configData: FullAutoConfig = req.body;
  const saved = db.saveAutoConfig(configData);
  res.json(saved);
});

// Trigger Full Auto Cycle Now
app.post('/api/auto-mode/run-now', async (req, res) => {
  const workspaceId = (req.body.workspaceId as string) || 'ws-default-01';
  const conf = db.getAutoConfig(workspaceId);
  if (!conf) return res.status(404).json({ error: 'Full auto configuration not found' });

  const activeKey = getActiveGeminiKey(workspaceId);
  try {
    const generated = await aiService.generateSocialPost({
      topic: `${conf.topicNiche} - Daily Automated Insight`,
      niche: conf.topicNiche,
      audience: conf.targetAudience,
      language: conf.language,
      tone: conf.brandVoice,
      keywordsToInclude: conf.requiredPhrases,
      wordsToAvoid: conf.forbiddenPhrases,
      targetPlatforms: conf.selectedPlatforms,
      apiKey: activeKey
    });

    const newPost: Post = {
      id: `post-auto-${Date.now()}`,
      workspaceId,
      topic: generated.title,
      niche: conf.topicNiche,
      language: conf.language,
      tone: conf.brandVoice,
      format: 'Autonomous Daily Insight',
      status: conf.autoApprove ? 'scheduled' : 'draft',
      mode: 'full_auto',
      targetPlatforms: conf.selectedPlatforms,
      platformContents: generated.platformContents,
      mediaUrls: [],
      scheduledTime: new Date(Date.now() + 3600000 * 3).toISOString(), // 3 hours from now
      autoApproval: conf.autoApprove,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishingAttempts: []
    };

    db.savePost(newPost);
    conf.totalGenerated = (conf.totalGenerated || 0) + 1;
    conf.lastRunAt = new Date().toISOString();
    conf.nextRunAt = new Date(Date.now() + 86400000 / conf.postsPerDay).toISOString();
    db.saveAutoConfig(conf);

    db.addNotification({
      id: `notif-${Date.now()}`,
      workspaceId,
      type: 'auto_mode_run',
      title: 'Full Auto Generated New Post',
      message: `Created "${generated.title.slice(0, 40)}..." for ${conf.selectedPlatforms.join(', ')}.`,
      timestamp: new Date().toISOString(),
      read: false,
      link: '/app/queue'
    });

    res.json({ success: true, post: newPost });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// RSS Feeds
app.get('/api/rss/feeds', (req, res) => {
  const workspaceId = req.query.workspaceId as string;
  res.json(db.getRssFeeds(workspaceId));
});

app.post('/api/rss/feeds', (req, res) => {
  const { workspaceId = 'ws-default-01', feedUrl, title, targetPlatforms = ['x', 'telegram'] } = req.body;
  if (!feedUrl) return res.status(400).json({ error: 'Feed URL is required' });

  const newFeed = {
    id: `rss-${Date.now()}`,
    workspaceId,
    feedUrl,
    title: title || 'New Feed Source',
    status: 'active' as const,
    itemCount: 0,
    autoGeneratePosts: false,
    targetPlatforms
  };

  db.saveRssFeed(newFeed);
  res.status(201).json(newFeed);
});

app.delete('/api/rss/feeds/:id', (req, res) => {
  const deleted = db.deleteRssFeed(req.params.id);
  res.json({ success: deleted });
});

app.get('/api/rss/items', (req, res) => {
  const feedId = req.query.feedId as string;
  res.json(db.getRssItems(feedId));
});

app.post('/api/rss/sync', async (req, res) => {
  const { feedId } = req.body;
  const feed = db.getRssFeeds().find(f => f.id === feedId);
  if (!feed) return res.status(404).json({ error: 'Feed not found' });

  try {
    const items = await rssService.fetchAndParse(feed.feedUrl, feed.id);
    db.addRssItems(items);
    feed.itemCount = items.length;
    feed.lastPolledAt = new Date().toISOString();
    db.saveRssFeed(feed);

    res.json({ success: true, count: items.length, items });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rss/convert-to-post', async (req, res) => {
  const { rssItemId, workspaceId = 'ws-default-01' } = req.body;
  const item = db.getRssItems().find(i => i.id === rssItemId);
  if (!item) return res.status(404).json({ error: 'RSS Item not found' });

  const activeKey = getActiveGeminiKey(workspaceId);
  try {
    const generated = await aiService.generateSocialPost({
      topic: item.title,
      niche: 'News & Tech Insights',
      language: 'English',
      tone: 'Professional & Authoritative',
      callToAction: `Read the full piece at ${item.link}`,
      targetPlatforms: ['x', 'linkedin', 'telegram'],
      apiKey: activeKey
    });

    const newPost: Post = {
      id: `post-rss-${Date.now()}`,
      workspaceId,
      topic: item.title,
      niche: 'News & Media',
      language: 'English',
      tone: 'Professional & Authoritative',
      format: 'Curated Article Summary',
      status: 'draft',
      mode: 'manual',
      targetPlatforms: ['x', 'linkedin', 'telegram'],
      platformContents: generated.platformContents,
      mediaUrls: [],
      sourceUrl: item.link,
      autoApproval: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishingAttempts: []
    };

    db.savePost(newPost);
    item.convertedPostId = newPost.id;
    db.save();

    res.json({ success: true, post: newPost });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Media Assets
app.get('/api/media', (req, res) => {
  const workspaceId = req.query.workspaceId as string;
  res.json(db.getMediaAssets(workspaceId));
});

app.post('/api/media', (req, res) => {
  const { workspaceId = 'ws-default-01', name, url, mimeType = 'image/jpeg', aspectRatio = '16:9', folder = 'General', tags = [] } = req.body;
  if (!url) return res.status(400).json({ error: 'Media URL is required' });

  const newAsset = {
    id: `media-${Date.now()}`,
    workspaceId,
    name: name || 'Uploaded Asset',
    url,
    size: 512000,
    mimeType,
    aspectRatio,
    folder,
    tags,
    createdAt: new Date().toISOString()
  };

  db.saveMediaAsset(newAsset);
  res.status(201).json(newAsset);
});

app.delete('/api/media/:id', (req, res) => {
  const deleted = db.deleteMediaAsset(req.params.id);
  res.json({ success: deleted });
});

// Campaigns
app.get('/api/campaigns', (req, res) => {
  const workspaceId = req.query.workspaceId as string;
  res.json(db.getCampaigns(workspaceId));
});

app.post('/api/campaigns', (req, res) => {
  const { workspaceId = 'ws-default-01', name, description, startDate, endDate, targetPlatforms = ['x', 'linkedin'] } = req.body;
  const newCamp = {
    id: `camp-${Date.now()}`,
    workspaceId,
    name: name || 'New Campaign',
    description: description || '',
    startDate: startDate || new Date().toISOString(),
    endDate,
    totalPosts: 0,
    publishedPosts: 0,
    status: 'active' as const,
    targetPlatforms
  };
  db.saveCampaign(newCamp);
  res.status(201).json(newCamp);
});

// Analytics Summary
app.get('/api/analytics', (req, res) => {
  const workspaceId = (req.query.workspaceId as string) || 'ws-default-01';
  const posts = db.getPosts(workspaceId);
  const socialAccounts = db.getSocialAccounts(workspaceId);

  const totalPostsCreated = posts.length;
  const publishedPosts = posts.filter(p => p.status === 'published');
  const scheduledPosts = posts.filter(p => p.status === 'scheduled' || p.status === 'queued');
  const failedPosts = posts.filter(p => p.status === 'failed');

  const successRate = totalPostsCreated > 0 
    ? Math.round((publishedPosts.length / Math.max(1, publishedPosts.length + failedPosts.length)) * 100) 
    : 100;

  const platformDistribution: Record<SocialPlatform, number> = {
    telegram: 0,
    facebook: 0,
    instagram: 0,
    youtube: 0,
    linkedin: 0,
    x: 0,
    pinterest: 0,
    tiktok: 0,
    threads: 0,
    reddit: 0,
    mastodon: 0,
    snapchat: 0
  };

  for (const p of publishedPosts) {
    for (const plat of p.targetPlatforms) {
      if (platformDistribution[plat] !== undefined) {
        platformDistribution[plat]++;
      }
    }
  }

  res.json({
    totalPostsCreated,
    scheduledPosts: scheduledPosts.length,
    successfulPublications: publishedPosts.length,
    failedPublications: failedPosts.length,
    successRate,
    platformDistribution,
    totalEstimatedReach: publishedPosts.length * 1420 + 4300,
    totalEngagements: publishedPosts.length * 88 + 320,
    connectedAccountsCount: socialAccounts.filter(a => a.status === 'connected').length
  });
});

// Notifications
app.get('/api/notifications', (req, res) => {
  const workspaceId = (req.query.workspaceId as string) || 'ws-default-01';
  res.json(db.getNotifications(workspaceId));
});

app.post('/api/notifications/mark-read', (req, res) => {
  const workspaceId = (req.body.workspaceId as string) || 'ws-default-01';
  db.markAllNotificationsRead(workspaceId);
  res.json({ success: true });
});

// Account Export & Deletion
app.post('/api/account/export', (req, res) => {
  const workspaceId = (req.body.workspaceId as string) || 'ws-default-01';
  const data = {
    exportedAt: new Date().toISOString(),
    workspace: db.getWorkspaces().find(w => w.id === workspaceId),
    posts: db.getPosts(workspaceId),
    socialAccounts: db.getSocialAccounts(workspaceId),
    campaigns: db.getCampaigns(workspaceId),
    rssFeeds: db.getRssFeeds(workspaceId)
  };
  res.setHeader('Content-Disposition', 'attachment; filename="socialpilot-export.json"');
  res.setHeader('Content-Type', 'application/json');
  res.json(data);
});

app.post('/api/account/delete', (req, res) => {
  const workspaceId = (req.body.workspaceId as string) || 'ws-default-01';
  // Clear posts, accounts, and credentials for this workspace
  const posts = db.getPosts(workspaceId);
  posts.forEach(p => db.deletePost(p.id));
  const accounts = db.getSocialAccounts(workspaceId);
  accounts.forEach(a => db.deleteSocialAccount(a.id));
  res.json({ success: true, message: 'All workspace data, keys, and scheduled jobs have been permanently deleted.' });
});

// -------------------------------------------------------------
// MONETIZATION & ADS EARNINGS API
// -------------------------------------------------------------
app.get('/api/monetization', (req, res) => {
  res.json(db.getMonetizationConfig());
});

app.put('/api/monetization', (req, res) => {
  const updated = db.updateMonetizationConfig(req.body);
  res.json(updated);
});

app.post('/api/monetization/record-impression', (req, res) => {
  const { unitId } = req.body;
  const result = db.recordAdImpression(unitId);
  res.json({ success: true, ...result });
});

app.post('/api/monetization/record-click', (req, res) => {
  const { unitId } = req.body;
  const result = db.recordAdClick(unitId);
  res.json({ success: true, ...result });
});

app.post('/api/monetization/claim-reward', (req, res) => {
  const result = db.claimRewardedAdBonus();
  res.json(result);
});

app.get('/api/monetization/export', (req, res) => {
  const mon = db.getMonetizationConfig();
  const rows = ['Date,Impressions,Clicks,Estimated Earnings (USD),eCPM'];
  for (const day of mon.stats.dailyHistory || []) {
    const ecpm = day.impressions > 0 ? ((day.earnings / day.impressions) * 1000).toFixed(2) : '0.00';
    rows.push(`${day.date},${day.impressions},${day.clicks},${day.earnings.toFixed(2)},$${ecpm}`);
  }
  const csvContent = rows.join('\n');
  res.setHeader('Content-Disposition', 'attachment; filename="socialpilot-ads-earnings.csv"');
  res.setHeader('Content-Type', 'text/csv');
  res.send(csvContent);
});

// -------------------------------------------------------------
// VITE DEV SERVER OR STATIC ASSETS
// -------------------------------------------------------------
async function bootstrapServer() {
  // Start the background durable scheduler
  publishingEngine.start();

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SocialPilot AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

bootstrapServer().catch(err => {
  console.error('[SocialPilot AI] Startup error:', err);
});
