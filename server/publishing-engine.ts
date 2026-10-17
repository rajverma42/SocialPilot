import { db } from './db';
import { Post, SocialPlatform, PublishingAttempt, DestinationPublishingState } from '../src/types';
import { PLATFORM_ADAPTERS } from './platform-adapters';

export class PublishingEngine {
  private isProcessing = false;
  private intervalHandle: NodeJS.Timeout | null = null;

  public start() {
    if (this.intervalHandle) return;
    console.log('[PublishingEngine] Durable multi-social scheduler daemon started (tick interval: 20s)');
    
    // Immediate initial check
    this.tick();
    // Run every 20 seconds
    this.intervalHandle = setInterval(() => {
      this.tick();
    }, 20000);
  }

  public stop() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  public async tick() {
    if (this.isProcessing) return;
    const settings = db.getSystemSettings();
    if (settings.emergencyPublishingPaused) {
      return;
    }

    this.isProcessing = true;
    try {
      db.setSystemSettings({ lastWorkerRunAt: new Date().toISOString() });
      const now = new Date();
      const allPosts = db.getPosts();

      // Find posts ready to publish
      const duePosts = allPosts.filter(p => {
        if (p.status === 'scheduled' || p.status === 'queued') {
          if (!p.scheduledTime) return true; // immediate queue
          const schedTime = new Date(p.scheduledTime);
          return schedTime <= now;
        }
        return false;
      });

      for (const post of duePosts) {
        // If post requires approval and is not auto-approved, mark as awaiting approval
        if (!post.autoApproval && post.mode === 'approval_required' && post.status !== 'awaiting_approval') {
          post.status = 'awaiting_approval';
          db.savePost(post);
          db.addNotification({
            id: `notif-${Date.now()}`,
            workspaceId: post.workspaceId,
            type: 'scheduled_approaching',
            title: 'Approval Required',
            message: `Post "${post.topic}" is scheduled but requires manual approval before broadcast.`,
            timestamp: new Date().toISOString(),
            read: false,
            link: '/app/queue'
          });
          continue;
        }

        await this.publishPost(post.id);
      }
    } catch (err) {
      console.error('[PublishingEngine] Worker tick error:', err);
    } finally {
      this.isProcessing = false;
    }
  }

  public async publishPost(postId: string): Promise<{ success: boolean; results: PublishingAttempt[] }> {
    const post = db.getPostById(postId);
    if (!post) {
      throw new Error(`Post ${postId} not found`);
    }

    const settings = db.getSystemSettings();
    if (settings.emergencyPublishingPaused) {
      throw new Error('Publishing is currently blocked by Emergency Pause. Resume publishing to proceed.');
    }

    // Set post status to publishing (idempotency lock)
    post.status = 'publishing';
    db.savePost(post);

    const attempts: PublishingAttempt[] = [];
    const remotePostIds: Record<string, string> = post.remotePostIds || {};
    const destinationStates: Record<string, DestinationPublishingState> = post.destinationStates || {};

    const workspaceAccounts = db.getSocialAccounts(post.workspaceId);

    // Resolve target accounts: if specific account IDs specified use them, otherwise map 1:1 with targetPlatforms
    const targetAccounts = post.targetAccountIds && post.targetAccountIds.length > 0
      ? workspaceAccounts.filter(a => post.targetAccountIds!.includes(a.id))
      : post.targetPlatforms.map(p => workspaceAccounts.find(a => a.platform === p)).filter(Boolean) as typeof workspaceAccounts;

    let allSucceeded = true;
    let anyPublishedThisRun = false;

    for (const platform of post.targetPlatforms) {
      const content = post.platformContents[platform] || {
        caption: post.topic,
        hashtags: [],
        characterCount: post.topic.length,
        isValid: true
      };

      const matchingAccounts = targetAccounts.filter(a => a.platform === platform);
      const accountsToPublish = matchingAccounts.length > 0 ? matchingAccounts : [{
        id: `virtual-${platform}-01`,
        workspaceId: post.workspaceId,
        platform,
        accountName: `${platform} Channel`,
        accountHandle: `@${platform}`,
        status: 'connected' as const,
        connectedAt: new Date().toISOString(),
        lastHealthCheckAt: new Date().toISOString()
      }];

      for (const account of accountsToPublish) {
        const destKey = account.id;
        const existingState = destinationStates[destKey];

        // Idempotency: Reconcile before retrying! If already published to this destination, DO NOT re-publish!
        if (existingState?.status === 'published') {
          console.log(`[PublishingEngine] Destination ${account.accountName} (${account.platform}) is already published. Skipping duplicate broadcast.`);
          continue;
        }

        destinationStates[destKey] = {
          accountId: account.id,
          platform,
          destinationName: account.accountName,
          status: 'publishing',
          attemptsCount: (existingState?.attemptsCount || 0) + 1,
          lastAttemptAt: new Date().toISOString()
        };

        const adapter = PLATFORM_ADAPTERS[platform] || PLATFORM_ADAPTERS.x;

        try {
          const result = await adapter.publish(account, content, post.mediaUrls);
          
          destinationStates[destKey] = {
            ...destinationStates[destKey],
            status: 'published',
            publishedTime: new Date().toISOString(),
            remotePostId: result.remoteId,
            remoteUrl: result.remoteUrl,
            responsePayload: result.responsePayload
          };

          const attempt: PublishingAttempt = {
            id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            postId: post.id,
            accountId: account.id,
            platform,
            timestamp: new Date().toISOString(),
            status: 'success',
            responsePayload: result.responsePayload,
            remotePostId: result.remoteId,
            remoteUrl: result.remoteUrl
          };
          attempts.push(attempt);
          remotePostIds[platform] = result.remoteId;
          anyPublishedThisRun = true;
        } catch (err: any) {
          allSucceeded = false;
          const isAuthError = err.message.toLowerCase().includes('token') || err.message.toLowerCase().includes('permission') || err.message.toLowerCase().includes('authorize');

          destinationStates[destKey] = {
            ...destinationStates[destKey],
            status: isAuthError ? 'authorization_required' : 'failed',
            errorMessage: err.message || 'Platform publication error'
          };

          const attempt: PublishingAttempt = {
            id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            postId: post.id,
            accountId: account.id,
            platform,
            timestamp: new Date().toISOString(),
            status: 'failed',
            errorMessage: err.message || 'Platform publication error'
          };
          attempts.push(attempt);
        }
      }
    }

    post.publishingAttempts = [...(post.publishingAttempts || []), ...attempts];
    post.remotePostIds = remotePostIds;
    post.destinationStates = destinationStates;

    // Determine overall post status based on destination states
    const allStates = Object.values(destinationStates);
    const hasAnyFailed = allStates.some(s => s.status === 'failed' || s.status === 'authorization_required');
    const isEveryDestPublished = allStates.length > 0 && allStates.every(s => s.status === 'published');

    if (isEveryDestPublished) {
      post.status = 'published';
      post.publishedTime = new Date().toISOString();
      db.savePost(post);

      db.addNotification({
        id: `notif-${Date.now()}`,
        workspaceId: post.workspaceId,
        type: 'post_published',
        title: 'Multi-Destination Post Published',
        message: `Successfully broadcasted "${post.topic.slice(0, 40)}..." to ${post.targetPlatforms.join(', ')}.`,
        timestamp: new Date().toISOString(),
        read: false,
        link: '/app/queue'
      });
      return { success: true, results: attempts };
    } else {
      post.status = hasAnyFailed ? 'failed' : 'published';
      db.savePost(post);

      const failedDestNames = allStates.filter(s => s.status === 'failed' || s.status === 'authorization_required').map(s => s.destinationName);
      db.addNotification({
        id: `notif-${Date.now()}`,
        workspaceId: post.workspaceId,
        type: 'post_failed',
        title: 'Partial Broadcast Alert',
        message: `Failed to deliver "${post.topic.slice(0, 30)}..." to: ${failedDestNames.join(', ')}. Click Retry in Queue to re-attempt only failed destinations.`,
        timestamp: new Date().toISOString(),
        read: false
      });
      return { success: false, results: attempts };
    }
  }

  public async publishPostNow(postId: string, workspaceId?: string): Promise<Post> {
    const post = db.getPostById(postId);
    if (!post) {
      throw new Error(`Post with ID "${postId}" not found`);
    }
    await this.publishPost(postId);
    const updated = db.getPostById(postId);
    return updated || post;
  }
}

export const publishingEngine = new PublishingEngine();
