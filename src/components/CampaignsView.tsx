import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Plus, 
  Download, 
  Upload, 
  Calendar, 
  Share2, 
  CheckCircle2, 
  RefreshCw,
  Repeat
} from 'lucide-react';
import { Campaign, SocialPlatform, Post } from '../types';
import { api } from '../services/api';

interface CampaignsViewProps {
  workspaceId: string;
  posts: Post[];
  onRefreshPosts: () => void;
}

export const CampaignsView: React.FC<CampaignsViewProps> = ({
  workspaceId,
  posts,
  onRefreshPosts
}) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [campName, setCampName] = useState('');
  const [campDesc, setCampDesc] = useState('');
  const [campPlatforms, setCampPlatforms] = useState<SocialPlatform[]>(['x', 'linkedin', 'telegram']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCampaigns = async () => {
    try {
      const data = await api.getCampaigns(workspaceId);
      setCampaigns(data);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, [workspaceId]);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campName) return;

    setIsSubmitting(true);
    try {
      await api.createCampaign({
        workspaceId,
        name: campName,
        description: campDesc,
        startDate: new Date().toISOString(),
        targetPlatforms: campPlatforms
      });
      setCampName('');
      setCampDesc('');
      setIsModalOpen(false);
      await loadCampaigns();
    } catch (err: any) {
      alert(`Error creating campaign: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Topic', 'Niche', 'Status', 'ScheduledTime', 'Platforms'];
    const rows = posts.map(p => [
      p.id,
      `"${p.topic.replace(/"/g, '""')}"`,
      p.niche,
      p.status,
      p.scheduledTime || '',
      `"${p.targetPlatforms.join(';')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `socialpilot-posts-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const handleImportSampleCSV = () => {
    alert('CSV Bulk Import template downloaded. You can upload batches of post topics with platform schedules.');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Layers className="h-6 w-6 text-indigo-400" />
            <span>Campaigns & Content Recycling</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Group multi-platform content into structured initiatives and repurpose evergreen top-performers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Campaign</span>
          </button>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((camp) => (
          <div
            key={camp.id}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono">
                  {camp.status}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(camp.startDate).toLocaleDateString()}
                </span>
              </div>

              <h3 className="font-bold text-white text-base">{camp.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{camp.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1">
                {camp.targetPlatforms.map(p => (
                  <span key={p} className="px-1.5 py-0.5 rounded bg-slate-950 font-mono text-[10px] uppercase">
                    {p}
                  </span>
                ))}
              </div>
              <span className="font-mono text-indigo-400 font-bold">{camp.publishedPosts} Posts Published</span>
            </div>
          </div>
        ))}
      </div>

      {/* Evergreen Recycling Engine Notice */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Repeat className="h-4 w-4 text-emerald-400" />
          <span>Evergreen Post Repurposing Algorithm</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
          Evergreen posts automatically rotate after 30 to 45 days with newly synthesized headline hooks to prevent social algorithmic fatigue while preserving the core insight.
        </p>
      </div>

      {/* Create Campaign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Create Multi-Platform Campaign</h3>
            <form onSubmit={handleCreateCampaign} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Campaign Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Global AI Launch"
                  value={campName}
                  onChange={(e) => setCampName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Objectives, key takeaways, and hashtags..."
                  value={campDesc}
                  onChange={(e) => setCampDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow"
                >
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
