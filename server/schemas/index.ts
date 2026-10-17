import { z } from 'zod';

export const UserProfileSchema = z.object({
  displayName: z.string().min(1).max(128).optional(),
  photoURL: z.string().url().max(1024).optional(),
  preferredLanguage: z.string().max(32).default('en'),
  timezone: z.string().max(64).default('UTC'),
  onboardingStatus: z.enum(['pending', 'completed', 'skipped']).default('completed')
});

export const WorkspaceCreateSchema = z.object({
  name: z.string().min(2).max(128),
  timezone: z.string().max(64).default('UTC'),
  defaultLanguage: z.string().max(32).default('en')
});

export const WorkspaceUpdateSchema = z.object({
  name: z.string().min(2).max(128).optional(),
  timezone: z.string().max(64).optional(),
  defaultLanguage: z.string().max(32).optional(),
  settings: z.record(z.string(), z.any()).optional()
});

export const AiProviderCredentialSchema = z.object({
  provider: z.enum(['gemini', 'openai', 'anthropic']),
  apiKey: z.string().min(10).max(512),
  selectedModel: z.string().min(2).max(64).default('gemini-2.5-flash')
});

export const AiGenerateSchema = z.object({
  topic: z.string().min(3).max(500),
  niche: z.string().max(100).default('General'),
  audience: z.string().max(100).optional(),
  region: z.string().max(100).optional(),
  language: z.string().max(50).default('English'),
  tone: z.string().max(50).default('Engaging & Professional'),
  format: z.string().max(50).default('Platform Tailored'),
  targetPlatforms: z.array(z.string()).min(1),
  brandVoice: z.object({
    name: z.string().max(100).optional(),
    description: z.string().max(500).optional(),
    keywords: z.array(z.string()).optional(),
    callToAction: z.string().max(200).optional()
  }).optional()
});

export const AiTransformSchema = z.object({
  text: z.string().min(1).max(10000),
  action: z.enum(['rewrite', 'shorten', 'expand', 'translate', 'hashtags']),
  targetLanguage: z.string().optional(),
  platform: z.string().optional()
});

export const PostCreateSchema = z.object({
  topic: z.string().min(1).max(512),
  niche: z.string().max(100).default('General'),
  language: z.string().max(50).default('English'),
  tone: z.string().max(50).default('Engaging'),
  format: z.string().max(50).default('Multi-Platform'),
  status: z.enum(['draft', 'awaiting_approval', 'scheduled', 'queued']).default('draft'),
  targetPlatforms: z.array(z.string()).min(1),
  targetAccountIds: z.array(z.string()).optional(),
  platformContents: z.record(z.string(), z.any()).default({}),
  mediaUrls: z.array(z.string().url()).max(10).default([]),
  scheduledTime: z.string().datetime().optional(),
  autoApproval: z.boolean().default(true),
  campaignId: z.string().optional()
});

export const PostUpdateSchema = PostCreateSchema.partial();

export const ScheduledJobCreateSchema = z.object({
  destinationId: z.string().min(1),
  scheduledAtUTC: z.string().datetime(),
  userTimezone: z.string().max(64).default('UTC'),
  idempotencyKey: z.string().min(8).max(128).optional()
});

export const AutomationRuleCreateSchema = z.object({
  name: z.string().min(2).max(128),
  topic: z.string().min(2).max(256),
  language: z.string().max(32).default('English'),
  targetPlatforms: z.array(z.string()).min(1),
  scheduleConfiguration: z.object({
    timesPerDay: z.number().int().min(1).max(24).default(3),
    preferredTimes: z.array(z.string()).default(['09:00', '14:00', '19:00']),
    daysOfWeek: z.array(z.number().min(0).max(6)).default([0, 1, 2, 3, 4, 5, 6])
  }),
  approvalMode: z.enum(['auto', 'require_approval']).default('auto'),
  autoPublishEnabled: z.boolean().default(true)
});

export const ContentSourceCreateSchema = z.object({
  sourceType: z.enum(['rss', 'atom', 'website']).default('rss'),
  sourceURL: z.string().url().max(1024),
  pollingIntervalMinutes: z.number().int().min(5).max(1440).default(60),
  enabled: z.boolean().default(true)
});

export const MediaUploadSessionSchema = z.object({
  fileName: z.string().min(1).max(256),
  mimeType: z.string().regex(/^(image|video)\/[a-zA-Z0-9\.\-\+]+$/),
  fileSizeBytes: z.number().int().positive().max(52428800) // 50MB max
});
