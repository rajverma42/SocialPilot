# Cloud Firestore Database Schema & Relational Specifications

## 1. Relational Entity Diagram

```
[ users ]
    |
    v (ownerUid)
[ workspaces ]
    |
    +---> [ workspaceMembers ]
    +---> [ aiProviders ] (Encrypted BYO-Key References)
    +---> [ socialAccounts ] ---> [ socialCredentials ] (Encrypted Vault)
    +---> [ posts ]
    |       |
    |       +---> [ postDestinations ]
    |       +---> [ scheduledJobs ] ---> [ publishingAttempts ]
    +---> [ automationRules ] ---> [ automationRuns ]
    +---> [ contentSources ] ---> [ processedSourceItems ]
    +---> [ mediaAssets ]
    +---> [ notifications ]
    +---> [ analyticsSnapshots ]
    +---> [ usageRecords ]
    +---> [ subscriptions ]

[ auditLogs ] (System-wide append-only)
```

---

## 2. Collection Schemas

### A. `users`
- `uid`: string (Primary Key, matches `request.auth.uid`)
- `email`: string (User login email)
- `displayName`: string
- `photoURL`: string
- `preferredLanguage`: string (Default: `en`)
- `timezone`: string (Default: `UTC`)
- `onboardingStatus`: `'pending' | 'completed' | 'skipped'`
- `accountStatus`: `'active' | 'suspended' | 'deactivated'`
- `createdAt`: ISO 8601 Timestamp
- `updatedAt`: ISO 8601 Timestamp

### B. `workspaces`
- `workspaceId`: string (Primary Key)
- `name`: string
- `ownerUid`: string (Foreign Key -> `users.uid`)
- `timezone`: string
- `defaultLanguage`: string
- `settings`: map (Branding, auto-approval toggles, notification thresholds)
- `createdAt`: ISO 8601 Timestamp
- `updatedAt`: ISO 8601 Timestamp

### C. `workspaces/{workspaceId}/members/{uid}`
- `workspaceId`: string
- `uid`: string
- `role`: `'owner' | 'admin' | 'editor' | 'publisher' | 'viewer'`
- `status`: `'active' | 'invited' | 'removed'`
- `createdAt`: ISO 8601 Timestamp

### D. `workspaces/{workspaceId}/aiProviders/{credentialId}`
- `credentialId`: string
- `ownerUid`: string
- `workspaceId`: string
- `provider`: `'gemini' | 'openai' | 'anthropic'`
- `encryptedCredentialReference`: string (AES-256-GCM cipher payload)
- `selectedModel`: string (e.g., `gemini-2.5-flash`)
- `connectionStatus`: `'valid' | 'invalid' | 'untested' | 'quota_exceeded'`
- `lastValidatedAt`: ISO 8601 Timestamp
- `totalGenerations`: number
- `estimatedTokensUsed`: number
- `createdAt`: ISO 8601 Timestamp
- `updatedAt`: ISO 8601 Timestamp

### E. `workspaces/{workspaceId}/socialAccounts/{socialAccountId}`
- `socialAccountId`: string
- `ownerUid`: string
- `workspaceId`: string
- `provider`: `'facebook' | 'instagram' | 'youtube' | 'telegram' | 'linkedin' | 'pinterest' | 'x' | 'tiktok' | 'threads' | 'reddit' | 'mastodon' | 'snapchat'`
- `providerAccountId`: string (e.g. Facebook Page ID)
- `accountName`: string
- `accountHandle`: string
- `profileImageURL`: string
- `grantedCapabilities`: map
- `connectionStatus`: `'connected' | 'disconnected' | 'token_expired' | 'permission_required'`
- `tokenExpiryAt`: ISO 8601 Timestamp
- `lastVerifiedAt`: ISO 8601 Timestamp
- `createdAt`: ISO 8601 Timestamp
- `updatedAt`: ISO 8601 Timestamp

### F. `socialCredentials` (Secure Server-Only Vault Collection)
- `credentialId`: string
- `socialAccountId`: string
- `encryptedAccessTokenReference`: string
- `encryptedRefreshTokenReference`: string
- `encryptionVersion`: string (`v1-aes256gcm`)
- `tokenExpiryAt`: ISO 8601 Timestamp
- `updatedAt`: ISO 8601 Timestamp

### G. `workspaces/{workspaceId}/posts/{postId}`
- `postId`: string
- `ownerUid`: string
- `workspaceId`: string
- `title`: string
- `topic`: string
- `niche`: string
- `language`: string
- `tone`: string
- `format`: string
- `content`: string
- `status`: `'draft' | 'awaiting_approval' | 'scheduled' | 'queued' | 'publishing' | 'published' | 'failed' | 'cancelled'`
- `targetPlatforms`: list of strings
- `mediaUrls`: list of strings
- `scheduledTime`: ISO 8601 Timestamp
- `publishedTime`: ISO 8601 Timestamp
- `createdAt`: ISO 8601 Timestamp
- `updatedAt`: ISO 8601 Timestamp

### H. `workspaces/{workspaceId}/posts/{postId}/destinations/{destinationId}`
- `destinationId`: string
- `postId`: string
- `socialAccountId`: string
- `provider`: string
- `platformSpecificContent`: map (caption, title, tags, mediaUrls)
- `scheduledAtUTC`: ISO 8601 Timestamp
- `userTimezone`: string
- `status`: `'draft' | 'awaiting_approval' | 'scheduled' | 'queued' | 'publishing' | 'published' | 'failed' | 'cancelled' | 'authorization_required'`
- `remotePostId`: string
- `lastAttemptAt`: ISO 8601 Timestamp
- `publishedAt`: ISO 8601 Timestamp
- `safeErrorCode`: string
- `safeErrorMessage`: string
- `updatedAt`: ISO 8601 Timestamp

### I. `scheduledJobs`
- `jobId`: string
- `ownerUid`: string
- `workspaceId`: string
- `destinationId`: string
- `scheduledAtUTC`: ISO 8601 Timestamp
- `status`: `'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'`
- `attemptCount`: number
- `idempotencyKey`: string
- `leaseExpiresAt`: ISO 8601 Timestamp
- `nextAttemptAt`: ISO 8601 Timestamp
- `createdAt`: ISO 8601 Timestamp
- `updatedAt`: ISO 8601 Timestamp

### J. `publishingAttempts`
- `attemptId`: string
- `jobId`: string
- `destinationId`: string
- `provider`: string
- `startedAt`: ISO 8601 Timestamp
- `completedAt`: ISO 8601 Timestamp
- `resultStatus`: `'success' | 'failed' | 'rate_limited' | 'auth_error'`
- `remotePostId`: string
- `safeErrorCode`: string
- `safeErrorMessage`: string

### K. `automationRules`
- `automationId`: string
- `ownerUid`: string
- `workspaceId`: string
- `name`: string
- `topic`: string
- `language`: string
- `targetPlatforms`: list of strings
- `scheduleConfiguration`: map (timesPerDay, preferredTimes, daysOfWeek)
- `frequencyLimits`: map (maxDailyPosts)
- `approvalMode`: `'auto' | 'require_approval'`
- `autoPublishEnabled`: boolean
- `status`: `'active' | 'paused' | 'stopped'`
- `createdAt`: ISO 8601 Timestamp
- `updatedAt`: ISO 8601 Timestamp

### L. `automationRuns`
- `runId`: string
- `automationId`: string
- `startedAt`: ISO 8601 Timestamp
- `completedAt`: ISO 8601 Timestamp
- `status`: `'success' | 'partial' | 'failed'`
- `generatedPostIds`: list of strings
- `publishedDestinationIds`: list of strings
- `failureSummary`: string

### M. `contentSources`
- `sourceId`: string
- `ownerUid`: string
- `workspaceId`: string
- `sourceType`: `'rss' | 'atom' | 'website'`
- `sourceURL`: string
- `pollingInterval`: number (minutes)
- `enabled`: boolean
- `lastCheckedAt`: ISO 8601 Timestamp
- `lastSuccessfulCheckAt`: ISO 8601 Timestamp
- `lastErrorCode`: string
- `createdAt`: ISO 8601 Timestamp

### N. `processedSourceItems`
- `sourceId`: string
- `canonicalURL`: string
- `sourceItemId`: string (hash of canonical URL)
- `processedAt`: ISO 8601 Timestamp
- `resultingPostId`: string

### O. `mediaAssets`
- `mediaId`: string
- `ownerUid`: string
- `workspaceId`: string
- `storagePath`: string
- `mediaType`: `'image' | 'video'`
- `fileSize`: number
- `mimeType`: string
- `width`: number
- `height`: number
- `checksum`: string (SHA-256)
- `createdAt`: ISO 8601 Timestamp

### P. `notifications`
- `notificationId`: string
- `ownerUid`: string
- `workspaceId`: string
- `eventType`: string
- `title`: string
- `message`: string
- `readAt`: ISO 8601 Timestamp
- `createdAt`: ISO 8601 Timestamp

### Q. `analyticsSnapshots`
- `snapshotId`: string
- `ownerUid`: string
- `workspaceId`: string
- `socialAccountId`: string
- `postId`: string
- `metricType`: string
- `metricValue`: number
- `collectedAt`: ISO 8601 Timestamp
- `dataAvailabilityStatus`: string

### R. `usageRecords`
- `usageRecordId`: string
- `ownerUid`: string
- `workspaceId`: string
- `provider`: string
- `operation`: string
- `requestCount`: number
- `tokenUsageWhenAvailable`: number
- `estimatedCostWhenAvailable`: number
- `createdAt`: ISO 8601 Timestamp

### S. `auditLogs`
- `auditLogId`: string
- `actorUid`: string
- `workspaceId`: string
- `action`: string
- `resourceType`: string
- `resourceId`: string
- `timestamp`: ISO 8601 Timestamp
- `safeMetadata`: map

### T. `subscriptions`
- `subscriptionId`: string
- `ownerUid`: string
- `workspaceId`: string
- `planId`: `'creator' | 'pro' | 'agency'`
- `status`: `'active' | 'past_due' | 'canceled' | 'trialing'`
- `providerSubscriptionId`: string
- `currentPeriodEnd`: ISO 8601 Timestamp
- `createdAt`: ISO 8601 Timestamp
- `updatedAt`: ISO 8601 Timestamp
