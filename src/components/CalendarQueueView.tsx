import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Filter, 
  Layers, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Play
} from 'lucide-react';
import { Post, SocialPlatform } from '../types';
import { api } from '../services/api';

interface CalendarQueueViewProps {
  posts: Post[];
  onRefreshPosts: () => void;
  timezone: string;
}

export const CalendarQueueView: React.FC<CalendarQueueViewProps> = ({
  posts,
  onRefreshPosts,
  timezone
}) => {
  const [viewMode, setViewMode] = useState<'queue' | 'calendar'>('queue');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [statusBanner, setStatusBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filteredPosts = posts.filter(p => {
    if (statusFilter === 'all') return true;
    return p.status === statusFilter;
  });

  const handlePublishNow = async (postId: string) => {
    setActionInProgress(postId);
    setStatusBanner(null);
    try {
      const res = await api.publishPostNow(postId);
      if (res && res.success === false) {
        setStatusBanner({
          type: 'error',
          text: 'Publication encountered platform restrictions. Check destination error details below.'
        });
      } else {
        setStatusBanner({
          type: 'success',
          text: 'Post broadcasted successfully across connected destinations!'
        });
      }
      onRefreshPosts();
    } catch (err: any) {
      setStatusBanner({ type: 'error', text: `Publishing failed: ${err.message}` });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleApprove = async (postId: string) => {
    setActionInProgress(postId);
    setStatusBanner(null);
    try {
      await api.approvePost(postId);
      setStatusBanner({ type: 'success', text: 'Post approved and moved to active queue.' });
      onRefreshPosts();
    } catch (err: any) {
      setStatusBanner({ type: 'error', text: `Approval error: ${err.message}` });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRetry = async (postId: string) => {
    setActionInProgress(postId);
    setStatusBanner(null);
    try {
      await api.retryPost(postId);
      setStatusBanner({ type: 'success', text: 'Retrying broadcast job...' });
      onRefreshPosts();
    } catch (err: any) {
      setStatusBanner({ type: 'error', text: `Retry failed: ${err.message}` });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await api.deletePost(postId);
      setStatusBanner({ type: 'success', text: 'Post removed from queue.' });
      onRefreshPosts();
    } catch (err: any) {
      setStatusBanner({ type: 'error', text: `Deletion error: ${err.message}` });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Status Banner */}
      {statusBanner && (
        <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-medium animate-fade-in ${
          statusBanner.type === 'success'
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center gap-2.5">
            {statusBanner.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            )}
            <span>{statusBanner.text}</span>
          </div>
          <button onClick={() => setStatusBanner(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-indigo-400" />
            <span>Publishing Queue & Calendar</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Server-side durable jobs executing via background workers in <span className="font-mono text-indigo-300 font-semibold">{timezone}</span>.
          </p>
        </div>

        {/* View Mode & Filter Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1">
            <button
              onClick={() => setViewMode('queue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'queue' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Timeline Queue
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'calendar' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Month View
            </button>
          </div>

          <button
            onClick={onRefreshPosts}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
            title="Refresh Queue State"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 font-semibold flex items-center gap-1 mr-1">
          <Filter className="h-3.5 w-3.5" />
          Filter:
        </span>
        {['all', 'scheduled', 'queued', 'published', 'awaiting_approval', 'failed', 'draft'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition whitespace-nowrap ${
              statusFilter === status
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'bg-slate-900/50 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      {viewMode === 'queue' ? (
        <div className="space-y-3">
          {filteredPosts.length === 0 ? (
            <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center">
              <Clock className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-200">No posts match the current filter</h3>
              <p className="text-xs text-slate-400 mt-1">
                Check other status filters or generate new content from the AI Content Studio.
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const isWorking = actionInProgress === post.id;
              const snippet = post.platformContents.x?.caption || post.platformContents.linkedin?.caption || post.platformContents.telegram?.caption || '';

              return (
                <div
                  key={post.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono ${
                          post.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          post.status === 'scheduled' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                          post.status === 'queued' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                          post.status === 'awaiting_approval' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' :
                          post.status === 'failed' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {post.status.replace('_', ' ')}
                        </span>

                        <span className="text-xs text-slate-400 font-medium">{post.niche}</span>
                        <span className="text-xs text-slate-600">&bull;</span>
                        <span className="text-xs text-slate-400">{post.language}</span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">{post.topic}</h3>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-2">
                      {post.status === 'awaiting_approval' && (
                        <button
                          disabled={isWorking}
                          onClick={() => handleApprove(post.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Approve & Schedule</span>
                        </button>
                      )}

                      {post.status === 'failed' && (
                        <button
                          disabled={isWorking}
                          onClick={() => handleRetry(post.id)}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow"
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${isWorking ? 'animate-spin' : ''}`} />
                          <span>Retry Broadcast</span>
                        </button>
                      )}

                      {(post.status === 'scheduled' || post.status === 'queued' || post.status === 'draft') && (
                        <button
                          disabled={isWorking}
                          onClick={() => handlePublishNow(post.id)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold transition flex items-center gap-1.5"
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span>Publish Now</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-1.5 rounded-lg bg-slate-950 text-slate-500 hover:text-rose-400 border border-slate-800 transition"
                        title="Delete Post"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                  </div>

                  {/* Snippet */}
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                    {snippet}
                  </p>

                  {/* Destination platforms & Execution timestamp */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-400">Destinations:</span>
                      <div className="flex flex-wrap gap-1">
                        {post.targetPlatforms.map((plat) => {
                          const remoteId = post.remotePostIds?.[plat];
                          return (
                            <span 
                              key={plat} 
                              className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[10px] uppercase flex items-center gap-1"
                              title={remoteId ? `Remote ID: ${remoteId}` : 'Awaiting publication'}
                            >
                              <span>{plat}</span>
                              {remoteId && <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 font-mono">
                      {post.scheduledTime && (
                        <span className="text-indigo-300 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(post.scheduledTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      )}
                      {post.publishedTime && (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Delivered: {new Date(post.publishedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Interactive Calendar Month Grid */
        <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 overflow-x-auto">
          <div className="min-w-[580px] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Calendar Schedule Overview</h3>
              <span className="text-xs text-indigo-400 font-mono">{timezone}</span>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase text-slate-400 pb-2 border-b border-slate-800">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 28 }).map((_, i) => {
              const dayNum = i + 1;
              const dayPosts = posts.filter(p => {
                if (!p.scheduledTime) return false;
                const date = new Date(p.scheduledTime);
                return date.getDate() === dayNum;
              });

              return (
                <div key={i} className="min-h-[90px] p-2 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col justify-between hover:border-slate-700 transition">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-400">{dayNum}</span>
                    {dayPosts.length > 0 && (
                      <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                    )}
                  </div>

                  <div className="space-y-1 my-1">
                    {dayPosts.slice(0, 2).map((dp) => (
                      <div
                        key={dp.id}
                        className="px-1.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-900/50 text-[10px] text-indigo-200 truncate font-sans"
                        title={dp.topic}
                      >
                        {dp.topic}
                      </div>
                    ))}
                    {dayPosts.length > 2 && (
                      <span className="text-[9px] text-slate-500 font-mono">+{dayPosts.length - 2} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        </div>
      )}

    </div>
  );
};
