import React, { useState } from 'react';
import { 
  Zap, 
  Play, 
  Pause, 
  ShieldAlert, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  Layers, 
  AlertTriangle,
  Sliders
} from 'lucide-react';
import { FullAutoConfig, SocialPlatform, Post } from '../types';
import { api } from '../services/api';

interface AutoModeViewProps {
  autoConfig: FullAutoConfig | null;
  onRefreshConfig: () => void;
  workspaceId: string;
  hasAiKey: boolean;
  onNavigateToSettings: () => void;
}

export const AutoModeView: React.FC<AutoModeViewProps> = ({
  autoConfig,
  onRefreshConfig,
  workspaceId,
  hasAiKey,
  onNavigateToSettings
}) => {
  const [enabled, setEnabled] = useState(autoConfig?.enabled ?? true);
  const [topicNiche, setTopicNiche] = useState(autoConfig?.topicNiche || 'AI Agents, Software Engineering & Cloud Architecture');
  const [targetAudience, setTargetAudience] = useState(autoConfig?.targetAudience || 'Founders, CTOs, and Senior Developers');
  const [brandVoice, setBrandVoice] = useState(autoConfig?.brandVoice || 'Authoritative, tactical, insightful without hype');
  const [language, setLanguage] = useState(autoConfig?.language || 'English');
  const [postsPerDay, setPostsPerDay] = useState(autoConfig?.postsPerDay || 2);
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(autoConfig?.selectedPlatforms || ['x', 'linkedin', 'telegram']);
  const [autoApprove, setAutoApprove] = useState(autoConfig?.autoApprove ?? false);
  const [requiredPhrases, setRequiredPhrases] = useState(autoConfig?.requiredPhrases?.join(', ') || 'Real-world example, Key takeaway');
  const [forbiddenPhrases, setForbiddenPhrases] = useState(autoConfig?.forbiddenPhrases?.join(', ') || 'Mind-blowing, Game changer, Revolutionary');

  const [isSaving, setIsSaving] = useState(false);
  const [isRunningNow, setIsRunningNow] = useState(false);
  const [lastGeneratedPost, setLastGeneratedPost] = useState<Post | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const availablePlatforms: SocialPlatform[] = ['x', 'linkedin', 'telegram', 'instagram', 'facebook', 'youtube', 'pinterest', 'tiktok'];

  const togglePlatform = (p: SocialPlatform) => {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter(item => item !== p));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const updated: FullAutoConfig = {
        id: autoConfig?.id || `auto-${Date.now()}`,
        workspaceId,
        enabled,
        topicNiche,
        targetAudience,
        brandVoice,
        language,
        postsPerDay,
        preferredTimeWindows: ['09:30', '16:00'],
        selectedPlatforms,
        autoApprove,
        requiredPhrases: requiredPhrases.split(',').map(s => s.trim()).filter(Boolean),
        forbiddenPhrases: forbiddenPhrases.split(',').map(s => s.trim()).filter(Boolean),
        totalGenerated: autoConfig?.totalGenerated || 0,
        totalPublished: autoConfig?.totalPublished || 0
      };

      await api.saveAutoConfig(updated);
      setStatusMessage('Full Auto configuration saved successfully.');
      onRefreshConfig();
    } catch (err: any) {
      alert(`Error saving configuration: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTriggerRunNow = async () => {
    if (!hasAiKey) {
      alert('Please configure your Gemini API Key in Settings first.');
      onNavigateToSettings();
      return;
    }

    setIsRunningNow(true);
    setStatusMessage(null);
    try {
      const res = await api.triggerAutoModeNow(workspaceId);
      setLastGeneratedPost(res.post);
      setStatusMessage(`Full Auto cycle completed! New post generated: "${res.post.topic}"`);
      onRefreshConfig();
    } catch (err: any) {
      alert(`Auto run error: ${err.message}`);
    } finally {
      setIsRunningNow(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Zap className="h-6 w-6 text-emerald-400" />
              <span>Full Auto Autonomous Engine</span>
            </h1>
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
              enabled
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-slate-800 text-slate-400'
            }`}>
              <span className={`h-2 w-2 rounded-full ${enabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              {enabled ? 'SYSTEM RUNNING' : 'PAUSED'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Define your content rules, frequency, and approval threshold. SocialPilot AI automatically ideates and queues posts.
          </p>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setEnabled(!enabled)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              enabled
                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
            }`}
          >
            {enabled ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{enabled ? 'Pause Auto Mode' : 'Resume Auto Mode'}</span>
          </button>

          <button
            disabled={isRunningNow}
            onClick={handleTriggerRunNow}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRunningNow ? 'animate-spin' : ''}`} />
            <span>Run Auto Cycle Now</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Rules & Criteria */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-indigo-400" />
              <span>Autonomous Workflow Parameters</span>
            </h3>

            {/* Niche Theme */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Core Topic / Niche Focus <span className="text-indigo-400">*</span>
              </label>
              <input
                type="text"
                value={topicNiche}
                onChange={(e) => setTopicNiche(e.target.value)}
                placeholder="e.g. AI Tools, SaaS Growth Hacks & High-Performance Engineering"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Target Audience & Brand Voice */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Audience</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Brand Voice</label>
                <input
                  type="text"
                  value={brandVoice}
                  onChange={(e) => setBrandVoice(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200"
                />
              </div>
            </div>

            {/* Frequency & Language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Daily Publishing Cadence
                </label>
                <select
                  value={postsPerDay}
                  onChange={(e) => setPostsPerDay(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value={1}>1 post per day (Morning Window)</option>
                  <option value={2}>2 posts per day (Morning + Evening)</option>
                  <option value={3}>3 posts per day (Morning + Afternoon + Evening)</option>
                  <option value={4}>4 posts per day (Aggressive Omni-Channel)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Hinglish">Hinglish</option>
                  <option value="Spanish">Spanish</option>
                </select>
              </div>
            </div>

            {/* Destination Channels */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Publishing Channels
              </label>
              <div className="flex flex-wrap gap-2">
                {availablePlatforms.map((p) => {
                  const isChecked = selectedPlatforms.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePlatform(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition border ${
                        isChecked
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-slate-950 border-slate-800 text-slate-500'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Auto-Approval Mode Toggle */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Approval Policy</h4>
                  <p className="text-[11px] text-slate-400">
                    Choose whether posts require human confirmation before broadcast.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAutoApprove(false)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      !autoApprove ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    Require Approval (Mode B)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAutoApprove(true)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      autoApprove ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    Full Auto Direct (Mode C)
                  </button>
                </div>
              </div>
            </div>

            {/* Phrase Safeguards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Required Phrases</label>
                <input
                  type="text"
                  value={requiredPhrases}
                  onChange={(e) => setRequiredPhrases(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Forbidden Phrases / Hype</label>
                <input
                  type="text"
                  value={forbiddenPhrases}
                  onChange={(e) => setForbiddenPhrases(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                disabled={isSaving}
                onClick={handleSaveConfig}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5"
              >
                {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                <span>Save Automation Rules</span>
              </button>
            </div>

          </div>
        </div>

        {/* Right Column: Execution Stats & Last Generated Card */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Stats Card */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-indigo-400" />
              <span>Automation Telemetry</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Total Autonomous Posts:</span>
                <span className="font-mono font-bold text-white">{autoConfig?.totalGenerated || 0}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Successfully Broadcast:</span>
                <span className="font-mono font-bold text-emerald-400">{autoConfig?.totalPublished || 0}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Last Execution:</span>
                <span className="font-mono text-slate-300">
                  {autoConfig?.lastRunAt ? new Date(autoConfig.lastRunAt).toLocaleTimeString() : 'Pending tick'}
                </span>
              </div>
            </div>
          </div>

          {/* Last Generated Preview Card */}
          {lastGeneratedPost && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                Latest Auto Generation
              </span>
              <h4 className="text-xs font-bold text-white line-clamp-1">{lastGeneratedPost.topic}</h4>
              <p className="text-[11px] text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 line-clamp-3">
                {lastGeneratedPost.platformContents.x?.caption || lastGeneratedPost.platformContents.telegram?.caption}
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
