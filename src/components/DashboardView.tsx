import React from 'react';
import { 
  Sparkles, 
  Send, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Share2, 
  Key, 
  Play, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';
import { Post, SocialAccount, AnalyticsSummary, AiProviderConfig } from '../types';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
  analytics: AnalyticsSummary | null;
  posts: Post[];
  accounts: SocialAccount[];
  aiConfig: AiProviderConfig | null;
  onPublishNow: (id: string) => void;
  emergencyPaused: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  analytics,
  posts,
  accounts,
  aiConfig,
  onPublishNow,
  emergencyPaused
}) => {
  const scheduledPosts = posts.filter(p => p.status === 'scheduled' || p.status === 'queued');
  const recentPublished = posts.filter(p => p.status === 'published').slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Top Banner if Emergency Paused */}
      {emergencyPaused && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
            <div>
              <p className="text-sm font-bold">Emergency Publishing Stop is Engaged</p>
              <p className="text-xs text-rose-300/80">All automated background workers and scheduled queues are frozen. Click Resume in the top bar to re-enable.</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('settings-ws')}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
          >
            Manage Safety
          </button>
        </div>
      )}

      {/* Top Welcome & Quick Create Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Social Automation Command Center</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              v2.4
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Publishing autonomously to {accounts.filter(a => a.status === 'connected').length} connected official channels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('generator')}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition hover:scale-[1.02]"
          >
            <Sparkles className="h-4 w-4" />
            <span>AI Content Studio</span>
          </button>
          <button
            onClick={() => onNavigate('auto-mode')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm flex items-center gap-2 transition"
          >
            <Play className="h-4 w-4 text-emerald-400" />
            <span>Full Auto Mode</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Scheduled */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Queue / Scheduled</span>
            <Clock className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {scheduledPosts.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Ready for background daemon</p>
        </div>

        {/* Successfully Published */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Published Posts</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {analytics?.successfulPublications || 0}
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">Verified with remote IDs</p>
        </div>

        {/* Success Rate */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Publish Success Rate</span>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {analytics?.successRate || 100}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Zero duplicate guarantee</p>
        </div>

        {/* BYO AI Key Status */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">BYO Gemini Key</span>
            <Key className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-sm font-bold text-white font-mono truncate">
            {aiConfig?.hasKey ? aiConfig.maskedApiKey : 'Not Set'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {aiConfig?.isValid ? 'Verified 0% markup' : 'Configure key in Settings'}
          </p>
        </div>

      </div>

      {/* Main Grid: Scheduled Queue & Quick Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Scheduled Queue */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-400" />
              <span>Upcoming Scheduled Posts</span>
            </h2>
            <button
              onClick={() => onNavigate('calendar')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <span>View Full Calendar</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {scheduledPosts.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/30 border border-slate-800 text-center">
              <Clock className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No scheduled posts in queue</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Generate tailored posts using AI Content Studio or enable Full Auto Mode to schedule daily topics automatically.
              </p>
              <button
                onClick={() => onNavigate('generator')}
                className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Create Your First Post
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledPosts.slice(0, 4).map((post) => (
                <div key={post.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono ${
                          post.status === 'scheduled' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {post.status}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">{post.niche}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white line-clamp-1">{post.topic}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onPublishNow(post.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold transition flex items-center gap-1.5"
                      >
                        <Send className="h-3 w-3" />
                        <span>Publish Now</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2">
                    {post.platformContents.x?.caption || post.platformContents.linkedin?.caption || post.platformContents.telegram?.caption}
                  </p>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span>Destinations:</span>
                      {post.targetPlatforms.map(p => (
                        <span key={p} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold uppercase text-[10px]">
                          {p}
                        </span>
                      ))}
                    </div>
                    {post.scheduledTime && (
                      <span className="font-mono text-indigo-300">
                        {new Date(post.scheduledTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Connected Accounts & Recent Publications */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Connected Channels Widget */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Share2 className="h-3.5 w-3.5 text-indigo-400" />
                <span>Connected Channels</span>
              </h3>
              <button
                onClick={() => onNavigate('accounts')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Manage
              </button>
            </div>

            <div className="space-y-2">
              {accounts.map((acc) => (
                <div key={acc.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold uppercase text-indigo-400">
                      {acc.platform.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200 line-clamp-1">{acc.accountName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{acc.accountHandle}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    acc.status === 'connected' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {acc.status === 'connected' ? 'Active' : 'Auth'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Published Activity */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Recent Deliveries</span>
              </h3>
            </div>

            {recentPublished.length === 0 ? (
              <p className="text-xs text-slate-400">No published posts yet.</p>
            ) : (
              <div className="space-y-2.5">
                {recentPublished.map((post) => (
                  <div key={post.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <p className="font-semibold text-slate-200 line-clamp-1">{post.topic}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{post.targetPlatforms.join(', ')}</span>
                      <span className="text-emerald-400">Published</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
