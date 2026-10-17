import React, { useState, useEffect } from 'react';
import { 
  Rss, 
  Plus, 
  RefreshCw, 
  ExternalLink, 
  Sparkles, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { RssFeedSource, RssItem, Post } from '../types';
import { api } from '../services/api';

interface RssViewProps {
  workspaceId: string;
  onPostCreated: (post: Post) => void;
  onNavigateToQueue: () => void;
}

export const RssView: React.FC<RssViewProps> = ({
  workspaceId,
  onPostCreated,
  onNavigateToQueue
}) => {
  const [feeds, setFeeds] = useState<RssFeedSource[]>([]);
  const [items, setItems] = useState<RssItem[]>([]);
  const [selectedFeedId, setSelectedFeedId] = useState<string | null>(null);

  // New feed form
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [newFeedTitle, setNewFeedTitle] = useState('');
  const [isAddingFeed, setIsAddingFeed] = useState(false);

  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const f = await api.getRssFeeds(workspaceId);
      setFeeds(f);
      if (f.length > 0 && !selectedFeedId) {
        setSelectedFeedId(f[0].id);
      }
      const it = await api.getRssItems();
      setItems(it);
    } catch (err: any) {
      console.error('Failed to load RSS data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [workspaceId]);

  const handleAddFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedUrl) return;

    setIsAddingFeed(true);
    try {
      const feed = await api.addRssFeed({
        workspaceId,
        feedUrl: newFeedUrl,
        title: newFeedTitle || 'Custom Feed Source'
      });
      setNewFeedUrl('');
      setNewFeedTitle('');
      await api.syncRssFeed(feed.id);
      await loadData();
      setSelectedFeedId(feed.id);
      setStatusMessage('RSS feed added and initial articles indexed.');
    } catch (err: any) {
      alert(`Error adding feed: ${err.message}`);
    } finally {
      setIsAddingFeed(false);
    }
  };

  const handleSyncFeed = async (feedId: string) => {
    setIsSyncing(feedId);
    try {
      const res = await api.syncRssFeed(feedId);
      await loadData();
      setStatusMessage(`Polled feed: ${res.count} articles synced.`);
    } catch (err: any) {
      alert(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncing(null);
    }
  };

  const handleConvertToPost = async (itemId: string) => {
    setIsConverting(itemId);
    try {
      const res = await api.convertRssToPost(itemId, workspaceId);
      onPostCreated(res.post);
      setStatusMessage(`Article converted to multi-platform post: "${res.post.topic}"`);
      await loadData();
    } catch (err: any) {
      alert(`Conversion error: ${err.message}`);
    } finally {
      setIsConverting(null);
    }
  };

  const handleDeleteFeed = async (feedId: string) => {
    if (!confirm('Remove this RSS source?')) return;
    try {
      await api.deleteRssFeed(feedId);
      await loadData();
    } catch (err: any) {
      alert(`Error deleting feed: ${err.message}`);
    }
  };

  const currentItems = selectedFeedId ? items.filter(i => i.feedId === selectedFeedId) : items;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Rss className="h-6 w-6 text-amber-500" />
            <span>Website & RSS Auto Content</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Ingest articles from authorized news sources, company blogs, or RSS/Atom feeds and transform them into multi-channel posts.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main Grid: Feed Sources & Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Feeds & Add Feed Form */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Add Feed Card */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-indigo-400" />
              <span>Connect RSS Feed</span>
            </h3>

            <form onSubmit={handleAddFeed} className="space-y-2.5">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Feed Source URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/feed.xml"
                  value={newFeedUrl}
                  onChange={(e) => setNewFeedUrl(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Source Label</label>
                <input
                  type="text"
                  placeholder="e.g. Tech Blog"
                  value={newFeedTitle}
                  onChange={(e) => setNewFeedTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={isAddingFeed}
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition flex items-center justify-center gap-1.5"
              >
                {isAddingFeed ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                <span>Add Source</span>
              </button>
            </form>
          </div>

          {/* Connected Feeds List */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Content Feeds
            </h3>

            <div className="space-y-2">
              {feeds.map((feed) => {
                const isSelected = selectedFeedId === feed.id;
                const isSyncingThis = isSyncing === feed.id;

                return (
                  <div
                    key={feed.id}
                    onClick={() => setSelectedFeedId(feed.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-0.5 truncate mr-2">
                      <p className="text-xs font-bold truncate">{feed.title}</p>
                      <p className="text-[10px] text-slate-500 truncate font-mono">{feed.feedUrl}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSyncFeed(feed.id);
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-white"
                        title="Sync now"
                      >
                        <RefreshCw className={`h-3 w-3 ${isSyncingThis ? 'animate-spin' : ''}`} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFeed(feed.id);
                        }}
                        className="p-1 rounded-md text-slate-500 hover:text-rose-400"
                        title="Delete feed"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Ingested Feed Articles */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Ingested Articles</span>
                <span className="text-xs font-mono text-slate-400">({currentItems.length} items)</span>
              </h3>
            </div>

            {currentItems.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No articles found for this feed. Click Sync to poll the source.
              </div>
            ) : (
              <div className="space-y-3">
                {currentItems.map((item) => {
                  const isConv = isConverting === item.id;
                  const alreadyConverted = Boolean(item.convertedPostId);

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white leading-snug line-clamp-2">{item.title}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(item.pubDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 text-xs"
                            title="Open original article"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>

                          <button
                            disabled={isConv}
                            onClick={() => handleConvertToPost(item.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow ${
                              alreadyConverted
                                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                            }`}
                          >
                            <Sparkles className={`h-3 w-3 ${isConv ? 'animate-spin' : ''}`} />
                            <span>{alreadyConverted ? 'Regenerate Post' : 'AI Convert to Post'}</span>
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};
