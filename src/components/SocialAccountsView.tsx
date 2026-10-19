import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  ShieldCheck, 
  Trash2, 
  RefreshCw, 
  ExternalLink,
  Bot,
  Key,
  Info,
  Copy,
  Check,
  Settings,
  HelpCircle,
  Layers,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Twitter,
  Video,
  AtSign,
  MessageSquare,
  Radio,
  Camera,
  Pin,
  Clock,
  Sparkles,
  Sliders,
  CheckSquare
} from 'lucide-react';
import { SocialAccount, SocialPlatform, PlatformCapability } from '../types';
import { PLATFORM_REGISTRY } from '../data/platformRegistry';
import { api } from '../services/api';

interface SocialAccountsViewProps {
  accounts: SocialAccount[];
  onRefresh: () => void;
  workspaceId: string;
}

interface DiscoveredPage {
  id: string;
  name: string;
  category?: string;
  tasks: string[];
  pictureUrl?: string;
  canPublish: boolean;
}

export const SocialAccountsView: React.FC<SocialAccountsViewProps> = ({
  accounts,
  onRefresh,
  workspaceId
}) => {
  // Category / filter states
  const [activeCategory, setActiveCategory] = useState<'all' | 'connected' | 'social_network' | 'video' | 'broadcast' | 'community'>('all');
  
  // Developer Setup & Approval Center Modal
  const [isDevCenterOpen, setIsDevCenterOpen] = useState(false);
  const [selectedDevPlatform, setSelectedDevPlatform] = useState<SocialPlatform>('facebook');

  // Generic & Platform-Specific Connection Modals
  const [connectModalPlatform, setConnectModalPlatform] = useState<SocialPlatform | null>(null);
  const [accountName, setAccountName] = useState('');
  const [accountHandle, setAccountHandle] = useState('');
  const [accountSubreddit, setAccountSubreddit] = useState('r/technology');
  const [mastodonInstance, setMastodonInstance] = useState('mastodon.social');
  const [mastodonToken, setMastodonToken] = useState('');

  // Telegram wizard states
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [telegramStep, setTelegramStep] = useState<1 | 2 | 3>(1);

  // Facebook specific flow state
  const [isFbConfigModalOpen, setIsFbConfigModalOpen] = useState(false);
  const [fbConfigTab, setFbConfigTab] = useState<'oauth' | 'direct' | 'guide'>('oauth');
  const [fbAppIdInput, setFbAppIdInput] = useState('');
  const [fbAppSecretInput, setFbAppSecretInput] = useState('');
  const [fbDirectPageId, setFbDirectPageId] = useState('');
  const [fbDirectPageToken, setFbDirectPageToken] = useState('');
  const [fbConfig, setFbConfig] = useState<{ isConfigured: boolean; appId: string; redirectUri: string; scopes: string[] } | null>(null);

  // Facebook Page Selection Modal
  const [isPageSelectModalOpen, setIsPageSelectModalOpen] = useState(false);
  const [discoveredPages, setDiscoveredPages] = useState<DiscoveredPage[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isConnectingPage, setIsConnectingPage] = useState(false);

  // Status & loaders
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStartingOAuth, setIsStartingOAuth] = useState(false);
  const [healthCheckingId, setHealthCheckingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedRedirectUri, setCopiedRedirectUri] = useState(false);

  // Load Meta App Config
  const loadFbConfig = async () => {
    try {
      const cfg = await api.getFacebookConfig();
      setFbConfig(cfg);
      if (cfg.appId) setFbAppIdInput(cfg.appId);
    } catch (err) {
      console.warn('Failed to load Facebook config:', err);
    }
  };

  useEffect(() => {
    loadFbConfig();
  }, []);

  // Listen for OAuth popup postMessage
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }

      if (event.data?.type === 'FACEBOOK_AUTH_SUCCESS') {
        const sessionId = event.data.sessionId;
        if (sessionId) {
          setActiveSessionId(sessionId);
          setIsStartingOAuth(false);
          setStatusMessage(null);
          try {
            const res = await api.getFacebookPages(sessionId);
            setDiscoveredPages(res.pages);
            if (res.pages.length > 0) {
              setSelectedPageId(res.pages[0].id);
            }
            setIsPageSelectModalOpen(true);
          } catch (err: any) {
            setStatusMessage({ type: 'error', text: err.message || 'Failed to retrieve Facebook Pages.' });
          }
        }
      } else if (event.data?.type === 'FACEBOOK_AUTH_ERROR') {
        setIsStartingOAuth(false);
        setStatusMessage({
          type: 'error',
          text: `Meta Authorization Error: ${event.data.error || 'Access Denied'}`
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Initiate Facebook OAuth Popup Flow
  const handleStartFacebookOAuth = async () => {
    setStatusMessage(null);
    setIsStartingOAuth(true);

    try {
      const config = await api.getFacebookConfig();
      setFbConfig(config);

      if (!config.isConfigured) {
        setIsStartingOAuth(false);
        setIsFbConfigModalOpen(true);
        return;
      }

      const { url } = await api.getFacebookAuthUrl(workspaceId);
      const authWindow = window.open(
        url,
        'fb_oauth_popup',
        'width=650,height=750,scrollbars=yes,status=yes'
      );

      if (!authWindow) {
        setIsStartingOAuth(false);
        setStatusMessage({ type: 'error', text: 'Popup was blocked by your browser. Please allow popups for this site to complete Meta authorization.' });
      }
    } catch (err: any) {
      setIsStartingOAuth(false);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to start Facebook authorization' });
    }
  };

  // Connect chosen Facebook Page from the discovery modal
  const handleConfirmPageConnect = async () => {
    if (!selectedPageId || !activeSessionId) return;

    setIsConnectingPage(true);
    setStatusMessage(null);

    try {
      await api.connectFacebookPage(activeSessionId, selectedPageId, workspaceId);
      setIsPageSelectModalOpen(false);
      setSelectedPageId(null);
      setActiveSessionId(null);
      setStatusMessage({
        type: 'success',
        text: 'Facebook Page successfully verified and connected via official Meta Graph API v22.0!'
      });
      onRefresh();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to connect selected Page' });
    } finally {
      setIsConnectingPage(false);
    }
  };

  // Save Meta App Credentials
  const handleSaveAppCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbAppIdInput || !fbAppSecretInput) {
      setStatusMessage({ type: 'error', text: 'Please provide both Meta App ID and App Secret.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.saveFacebookConfig(fbAppIdInput, fbAppSecretInput);
      await loadFbConfig();
      setIsFbConfigModalOpen(false);
      setStatusMessage({
        type: 'success',
        text: 'Meta App credentials saved. You can now click "Connect Facebook" to initiate authorization.'
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Error saving Meta credentials: ${err.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Connect via Direct Page Token
  const handleConnectDirectPageToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbDirectPageId || !fbDirectPageToken) {
      setStatusMessage({ type: 'error', text: 'Please enter both Facebook Page ID and Page Access Token.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.connectFacebookDirect(fbDirectPageId, fbDirectPageToken, workspaceId);
      setIsFbConfigModalOpen(false);
      setFbDirectPageId('');
      setFbDirectPageToken('');
      setStatusMessage({
        type: 'success',
        text: 'Facebook Page connected and verified live against Meta Graph API!'
      });
      onRefresh();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Connection failed: ${err.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyRedirectUri = (uri: string) => {
    navigator.clipboard.writeText(uri);
    setCopiedRedirectUri(true);
    setTimeout(() => setCopiedRedirectUri(false), 2500);
  };

  // Test Health for any account
  const handleTestHealth = async (id: string) => {
    setHealthCheckingId(id);
    setStatusMessage(null);
    try {
      const res: any = await api.testAccountHealth(id);
      if (res.status === 'healthy') {
        setStatusMessage({
          type: 'success',
          text: `Verified Live: Responded in ${res.latencyMs}ms. Permissions & tokens active.`
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: `Health Check Alert: ${res.error || 'Token expired or permission missing'}`
        });
      }
      onRefresh();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Health check failed: ${err.message}` });
    } finally {
      setHealthCheckingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteSocialAccount(id);
      setStatusMessage({ type: 'success', text: 'Social channel disconnected successfully.' });
      onRefresh();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Error disconnecting: ${err.message}` });
    }
  };

  // Generic channel connect handler
  const handleConnectChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectModalPlatform || !accountName) return;

    setIsSubmitting(true);
    try {
      let metadata: any = {};

      if (connectModalPlatform === 'telegram') {
        metadata = {
          telegramBotToken,
          telegramChatId: telegramChatId || '@my_channel',
          scopes: ['sendMessage', 'sendPhoto', 'sendVideo']
        };
      } else if (connectModalPlatform === 'reddit') {
        metadata = {
          subreddit: accountSubreddit || 'r/technology',
          scopes: ['identity', 'submit']
        };
      } else if (connectModalPlatform === 'mastodon') {
        metadata = {
          mastodonInstance: mastodonInstance || 'mastodon.social',
          scopes: ['read', 'write']
        };
      }

      await api.connectAccount({
        workspaceId,
        platform: connectModalPlatform,
        accountName,
        accountHandle: accountHandle || `@${accountName.toLowerCase().replace(/\s+/g, '')}`,
        telegramChatId: metadata.telegramChatId,
        telegramBotToken: metadata.telegramBotToken
      });

      setConnectModalPlatform(null);
      setAccountName('');
      setAccountHandle('');
      setTelegramBotToken('');
      setTelegramChatId('');
      setStatusMessage({
        type: 'success',
        text: `Successfully connected ${PLATFORM_REGISTRY[connectModalPlatform].displayName} account!`
      });
      onRefresh();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Connection failed: ${err.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to render platform icon
  const renderPlatformIcon = (platform: SocialPlatform, className = "h-5 w-5") => {
    switch (platform) {
      case 'facebook': return <Facebook className={className} />;
      case 'instagram': return <Instagram className={className} />;
      case 'youtube': return <Youtube className={className} />;
      case 'telegram': return <Send className={className} />;
      case 'linkedin': return <Linkedin className={className} />;
      case 'pinterest': return <Pin className={className} />;
      case 'x': return <Twitter className={className} />;
      case 'tiktok': return <Video className={className} />;
      case 'threads': return <AtSign className={className} />;
      case 'reddit': return <MessageSquare className={className} />;
      case 'mastodon': return <Radio className={className} />;
      case 'snapchat': return <Camera className={className} />;
      default: return <Share2 className={className} />;
    }
  };

  const allPlatformKeys = Object.keys(PLATFORM_REGISTRY) as SocialPlatform[];

  // Filter platforms by category
  const filteredPlatformKeys = allPlatformKeys.filter(key => {
    if (activeCategory === 'connected') {
      return accounts.some(a => a.platform === key);
    }
    if (activeCategory === 'all') return true;
    return PLATFORM_REGISTRY[key].category === activeCategory;
  });

  const connectedAccountsCount = accounts.filter(a => a.status === 'connected').length;

  return (
    <div className="space-y-6">
      
      {/* Header & KPI Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Share2 className="h-6 w-6 text-indigo-400" />
            <span>Social Media Integration Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Connect, authenticate, and manage official social broadcasting accounts across 12 platforms.
          </p>
        </div>

        {/* Global Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsDevCenterOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
            title="Inspect official developer portals, OAuth redirect URIs, scopes, and app review requirements"
          >
            <HelpCircle className="h-4 w-4 text-indigo-400" />
            <span>Developer Setup & Approval Center</span>
          </button>

          <button
            onClick={handleStartFacebookOAuth}
            disabled={isStartingOAuth}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-600/30 transition hover:scale-[1.02]"
          >
            {isStartingOAuth ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Facebook className="h-4 w-4 fill-white" />
            )}
            <span>Connect Facebook Page</span>
          </button>
        </div>
      </div>

      {/* Top Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Connected Channels</span>
          <p className="text-xl font-extrabold text-white font-mono mt-0.5">{connectedAccountsCount}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Supported Platforms</span>
          <p className="text-xl font-extrabold text-indigo-400 font-mono mt-0.5">12 Official</p>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Multi-Account Support</span>
          <p className="text-xl font-extrabold text-emerald-400 font-mono mt-0.5">Enabled</p>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">AES-256-GCM Vault</span>
          <p className="text-xl font-extrabold text-purple-400 font-mono mt-0.5">Active</p>
        </div>
      </div>

      {/* Status Banner */}
      {statusMessage && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-xs sm:text-sm font-medium ${
          statusMessage.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
        }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'All 12 Platforms' },
          { id: 'connected', label: `Connected Only (${connectedAccountsCount})` },
          { id: 'social_network', label: 'Social Networks' },
          { id: 'video', label: 'Video Channels' },
          { id: 'broadcast', label: 'Broadcast Channels' },
          { id: 'community', label: 'Communities' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
              activeCategory === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid of 12 Platform Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPlatformKeys.map((platformKey) => {
          const registry = PLATFORM_REGISTRY[platformKey];
          const platformAccounts = accounts.filter(a => a.platform === platformKey);
          const hasConnected = platformAccounts.length > 0;

          return (
            <div
              key={platformKey}
              className={`p-5 rounded-2xl border transition flex flex-col justify-between space-y-4 ${
                hasConnected
                  ? 'bg-slate-900/80 border-indigo-500/30 shadow-lg shadow-indigo-950/20'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3.5">
                
                {/* Platform Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-md"
                      style={{ backgroundColor: registry.brandColor }}
                    >
                      {renderPlatformIcon(platformKey)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{registry.displayName}</h3>
                      <p className="text-[11px] text-slate-400 font-medium">{registry.accountTypeLabel}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full font-mono ${
                    hasConnected
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : registry.readinessStatus === 'production_ready'
                      ? 'bg-slate-800 text-slate-300'
                      : registry.readinessStatus === 'testing'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  }`}>
                    {hasConnected ? `${platformAccounts.length} Connected` : registry.readinessStatus.replace('_', ' ')}
                  </span>
                </div>

                {/* Connected Accounts List (Supports Multiple Accounts per Platform) */}
                {hasConnected ? (
                  <div className="space-y-2 pt-1">
                    {platformAccounts.map((acc) => {
                      const isTesting = healthCheckingId === acc.id;
                      return (
                        <div
                          key={acc.id}
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img
                                src={acc.avatarUrl || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=150&auto=format&fit=crop&q=80'}
                                alt=""
                                className="h-6 w-6 rounded-full object-cover border border-slate-800"
                              />
                              <span className="font-bold text-white line-clamp-1">{acc.accountName}</span>
                            </div>
                            <span className="font-mono text-[10px] text-slate-400">{acc.accountHandle}</span>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[11px]">
                            <button
                              disabled={isTesting}
                              onClick={() => handleTestHealth(acc.id)}
                              className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                            >
                              <RefreshCw className={`h-3 w-3 ${isTesting ? 'animate-spin' : ''}`} />
                              <span>Test</span>
                            </button>

                            <button
                              onClick={() => handleDelete(acc.id)}
                              className="text-slate-500 hover:text-rose-400 transition"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Capability Summary when not connected */
                  <div className="space-y-2 text-xs text-slate-400">
                    <p className="text-[11px] leading-relaxed line-clamp-2">
                      {registry.accountRequirements}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 pt-1">
                      {registry.capabilities.text && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-950 text-[10px] text-slate-300 font-mono">Text</span>
                      )}
                      {registry.capabilities.images && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-950 text-[10px] text-slate-300 font-mono">Images</span>
                      )}
                      {registry.capabilities.video && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-950 text-[10px] text-slate-300 font-mono">Video</span>
                      )}
                      {registry.capabilities.scheduling && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-950 text-[10px] text-emerald-400 font-mono">24/7 Queue</span>
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setSelectedDevPlatform(platformKey);
                    setIsDevCenterOpen(true);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200 font-medium flex items-center gap-1"
                >
                  <Info className="h-3.5 w-3.5" />
                  <span>Specs</span>
                </button>

                {platformKey === 'facebook' ? (
                  <button
                    onClick={handleStartFacebookOAuth}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition"
                  >
                    {hasConnected ? '+ Add Another Page' : 'Connect Facebook'}
                  </button>
                ) : platformKey === 'telegram' ? (
                  <button
                    onClick={() => {
                      setConnectModalPlatform('telegram');
                      setTelegramStep(1);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow transition"
                  >
                    {hasConnected ? '+ Add Another Channel' : 'Launch Bot Wizard'}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setConnectModalPlatform(platformKey);
                      setAccountName(`${registry.displayName} Channel`);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
                  >
                    {hasConnected ? `+ Add Account` : `Connect ${registry.displayName}`}
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* DEVELOPER SETUP & APPROVAL CENTER MODAL                   */}
      {/* ======================================================== */}
      {isDevCenterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5 max-h-[88vh] overflow-hidden flex flex-col">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Developer Setup & Production Approval Center</h3>
              </div>
              <button onClick={() => setIsDevCenterOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            {/* Platform Selector Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 text-xs">
              {allPlatformKeys.map((pKey) => {
                const reg = PLATFORM_REGISTRY[pKey];
                const isSelected = selectedDevPlatform === pKey;
                return (
                  <button
                    key={pKey}
                    onClick={() => setSelectedDevPlatform(pKey)}
                    className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {reg.displayName}
                  </button>
                );
              })}
            </div>

            {/* Specification Body */}
            {(() => {
              const spec = PLATFORM_REGISTRY[selectedDevPlatform];
              const redirectUri = fbConfig?.redirectUri || 'https://ais-dev-inirvehrqervmwccpzi3l3-660322268308.asia-east1.run.app/auth/facebook/callback';

              return (
                <div className="space-y-4 overflow-y-auto pr-1 text-xs text-slate-300">
                  
                  {/* Status Banner */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div>
                      <span className="font-bold text-white text-sm">{spec.displayName}</span>
                      <p className="text-slate-400">{spec.accountTypeLabel}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full font-mono font-bold uppercase text-[10px] ${
                      spec.readinessStatus === 'production_ready'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {spec.readinessStatus.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Requirements Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                      <span className="font-bold text-slate-400 uppercase text-[10px]">Official Developer Portal</span>
                      <a
                        href={spec.developerPortalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                      >
                        <span>{spec.developerPortalName}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                      <span className="font-bold text-slate-400 uppercase text-[10px]">Auth Protocol</span>
                      <p className="font-mono text-slate-200 uppercase">{spec.authMethod}</p>
                    </div>
                  </div>

                  {/* Valid OAuth Redirect URI */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-300">OAuth Callback Redirect URI:</span>
                      <button
                        onClick={() => handleCopyRedirectUri(redirectUri)}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                      >
                        {copiedRedirectUri ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedRedirectUri ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <code className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-indigo-300 font-mono block break-all">
                      {redirectUri}
                    </code>
                  </div>

                  {/* Scopes & Limitations */}
                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Required Permissions (Scopes):</span>
                      <div className="flex flex-wrap gap-1.5">
                        {spec.requiredScopes.map(sc => (
                          <span key={sc} className="px-2 py-0.5 rounded bg-slate-900 text-indigo-300 font-mono text-[10px]">
                            {sc}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="font-bold text-slate-400 uppercase text-[10px]">Account Requirements:</span>
                      <p className="text-slate-300">{spec.accountRequirements}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="font-bold text-slate-400 uppercase text-[10px]">API Limitations & Policy:</span>
                      <p className="text-slate-300">{spec.apiLimitations}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="font-bold text-slate-400 uppercase text-[10px]">App Review & Testing Workflow:</span>
                      <p className="text-slate-300">{spec.appReviewRequirements}</p>
                    </div>
                  </div>

                </div>
              );
            })()}

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsDevCenterOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
              >
                Close Center
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TELEGRAM BOT SETUP WIZARD                                 */}
      {/* ======================================================== */}
      {connectModalPlatform === 'telegram' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">Telegram Channel Connection Wizard</h3>
              </div>
              <button onClick={() => setConnectModalPlatform(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Steps Navigation */}
              <div className="flex items-center justify-between px-2 text-[11px] font-bold text-slate-400">
                <span className={telegramStep === 1 ? 'text-sky-400' : ''}>1. Create Bot</span>
                <span>&rarr;</span>
                <span className={telegramStep === 2 ? 'text-sky-400' : ''}>2. Add as Admin</span>
                <span>&rarr;</span>
                <span className={telegramStep === 3 ? 'text-sky-400' : ''}>3. Verify & Save</span>
              </div>

              {telegramStep === 1 && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <p className="font-semibold text-white">Step 1: Open @BotFather on Telegram</p>
                  <p className="text-slate-400 leading-relaxed">
                    Open Telegram and message <b>@BotFather</b>. Send <code>/newbot</code> and follow instructions to name your bot. Copy the generated HTTP API token.
                  </p>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Bot HTTP API Token</label>
                    <input
                      type="password"
                      placeholder="e.g. 7123456789:AAH..."
                      value={telegramBotToken}
                      onChange={(e) => setTelegramBotToken(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 font-mono"
                    />
                  </div>
                  <button
                    onClick={() => setTelegramStep(2)}
                    disabled={!telegramBotToken}
                    className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold transition"
                  >
                    Next: Add Bot to Channel
                  </button>
                </div>
              )}

              {telegramStep === 2 && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <p className="font-semibold text-white">Step 2: Add Bot as Channel Administrator</p>
                  <p className="text-slate-400 leading-relaxed">
                    1. Open your Telegram Channel or Supergroup.<br />
                    2. Go to <b>Channel Settings &gt; Administrators &gt; Add Admin</b>.<br />
                    3. Search for your bot username and enable <b>Post Messages</b> and <b>Edit Messages</b>.
                  </p>
                  <button
                    onClick={() => setTelegramStep(3)}
                    className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold transition"
                  >
                    Next: Set Target Handle
                  </button>
                </div>
              )}

              {telegramStep === 3 && (
                <form onSubmit={handleConnectChannel} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <p className="font-semibold text-white">Step 3: Enter Broadcast Destination</p>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Channel Handle or Chat ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. @tech_broadcast or -100..."
                      value={telegramChatId}
                      onChange={(e) => setTelegramChatId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Display Label</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tech Radar Official"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold transition"
                  >
                    {isSubmitting ? 'Verifying Telegram Bot...' : 'Verify & Authorize Channel'}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* OTHER PROVIDERS MODAL (Reddit, Mastodon, X, YouTube)      */}
      {/* ======================================================== */}
      {connectModalPlatform && connectModalPlatform !== 'telegram' && connectModalPlatform !== 'facebook' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                {renderPlatformIcon(connectModalPlatform)}
                <h3 className="text-base font-bold text-white">
                  Connect {PLATFORM_REGISTRY[connectModalPlatform].displayName}
                </h3>
              </div>
              <button onClick={() => setConnectModalPlatform(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleConnectChannel} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  {PLATFORM_REGISTRY[connectModalPlatform].accountTypeLabel} Name
                </label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g. Official Feed"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Handle / ID</label>
                <input
                  type="text"
                  value={accountHandle}
                  onChange={(e) => setAccountHandle(e.target.value)}
                  placeholder="e.g. @account"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono"
                />
              </div>

              {connectModalPlatform === 'reddit' && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Default Target Subreddit</label>
                  <input
                    type="text"
                    value={accountSubreddit}
                    onChange={(e) => setAccountSubreddit(e.target.value)}
                    placeholder="e.g. r/technology"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono"
                  />
                </div>
              )}

              {connectModalPlatform === 'mastodon' && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Instance Domain</label>
                  <input
                    type="text"
                    value={mastodonInstance}
                    onChange={(e) => setMastodonInstance(e.target.value)}
                    placeholder="e.g. mastodon.social"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono"
                  />
                </div>
              )}

              <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                Authorized via {PLATFORM_REGISTRY[connectModalPlatform].authMethod.toUpperCase()}. In production, OAuth token exchange securely verifies permission scopes.
              </p>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setConnectModalPlatform(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow"
                >
                  Authorize Destination
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* FACEBOOK PAGE SELECTION MODAL */}
      {isPageSelectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Facebook className="h-5 w-5 text-blue-400 fill-blue-400" />
                <span>Select Facebook Page to Connect</span>
              </h3>
              <button onClick={() => setIsPageSelectModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto">
              {discoveredPages.map((page) => (
                <div
                  key={page.id}
                  onClick={() => setSelectedPageId(page.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    selectedPageId === page.id ? 'bg-blue-600/15 border-blue-500' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src={page.pictureUrl || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=150&auto=format&fit=crop&q=80'} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    <div>
                      <p className="font-bold text-white text-sm">{page.name}</p>
                      <p className="text-xs text-slate-400 font-mono">ID: {page.id}</p>
                    </div>
                  </div>
                  <input type="radio" checked={selectedPageId === page.id} onChange={() => setSelectedPageId(page.id)} />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => setIsPageSelectModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs">Cancel</button>
              <button
                disabled={!selectedPageId || isConnectingPage}
                onClick={handleConfirmPageConnect}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                {isConnectingPage ? 'Saving...' : 'Connect Selected Page'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* META APP CREDENTIALS MODAL */}
      {isFbConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Meta Developer App & Facebook Pages Setup</h3>
              <button onClick={() => setIsFbConfigModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
              <button onClick={() => setFbConfigTab('oauth')} className={`px-3 py-1.5 rounded-lg ${fbConfigTab === 'oauth' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>1. App OAuth Keys</button>
              <button onClick={() => setFbConfigTab('direct')} className={`px-3 py-1.5 rounded-lg ${fbConfigTab === 'direct' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>2. Direct Token</button>
            </div>

            {fbConfigTab === 'oauth' ? (
              <form onSubmit={handleSaveAppCredentials} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Meta App ID</label>
                  <input type="text" required value={fbAppIdInput} onChange={(e) => setFbAppIdInput(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono" />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Meta App Secret</label>
                  <input type="password" required value={fbAppSecretInput} onChange={(e) => setFbAppSecretInput(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold">Save Meta Credentials</button>
              </form>
            ) : (
              <form onSubmit={handleConnectDirectPageToken} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Page ID</label>
                  <input type="text" required value={fbDirectPageId} onChange={(e) => setFbDirectPageId(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono" />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Page Access Token</label>
                  <textarea rows={3} required value={fbDirectPageToken} onChange={(e) => setFbDirectPageToken(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-semibold">Verify & Connect Page</button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
