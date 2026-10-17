import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Calendar, 
  Save, 
  RefreshCw, 
  Languages, 
  Minimize2, 
  Maximize2, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  Hash, 
  Image as ImageIcon,
  Key,
  Layers,
  ChevronDown
} from 'lucide-react';
import { SocialPlatform, PlatformContent, Post } from '../types';
import { api } from '../services/api';

interface GeneratorViewProps {
  onPostCreated: (post: Post) => void;
  workspaceId: string;
  hasAiKey: boolean;
  onNavigateToSettings: () => void;
}

export const GeneratorView: React.FC<GeneratorViewProps> = ({
  onPostCreated,
  workspaceId,
  hasAiKey,
  onNavigateToSettings
}) => {
  // Input parameters
  const [topic, setTopic] = useState('');
  const [niche, setNiche] = useState('Technology');
  const [audience, setAudience] = useState('Tech Founders, Developers & Agency Marketers');
  const [region, setRegion] = useState('Global');
  const [language, setLanguage] = useState('English');
  const [tone, setTone] = useState('Professional & Authoritative');
  const [format, setFormat] = useState('Standard Post');
  const [callToAction, setCallToAction] = useState('Share your thoughts in the comments');
  const [brandName, setBrandName] = useState('');
  const [keywordsToInclude, setKeywordsToInclude] = useState('');
  const [wordsToAvoid, setWordsToAvoid] = useState('');
  const [targetPlatforms, setTargetPlatforms] = useState<SocialPlatform[]>(['x', 'linkedin', 'telegram', 'instagram']);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePlatformTab, setActivePlatformTab] = useState<SocialPlatform>('x');
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [masterMediaConcept, setMasterMediaConcept] = useState('');
  const [platformContents, setPlatformContents] = useState<Record<SocialPlatform, PlatformContent>>({} as any);

  // Scheduling state
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Text transformation state
  const [isTransforming, setIsTransforming] = useState(false);

  const niches = [
    'Technology', 'Business', 'Education', 'Motivation', 'Entertainment',
    'Festival Content', 'News Summaries', 'Travel', 'Food', 'Lifestyle',
    'Product Promotions', 'Creator Content', 'Custom'
  ];

  const languages = ['English', 'Hindi', 'Hinglish', 'Spanish', 'French', 'German', 'Japanese'];
  const tones = [
    'Professional & Authoritative', 'Engaging & Viral', 'Casual & Friendly',
    'Witty & Humorous', 'Bold & Provocative', 'Educational & Deep', 'Storytelling'
  ];
  const formats = ['Standard Post', 'Carousel Breakdown', 'Video/Reel Script', 'Thread/X Series', 'Channel Announcement'];

  const allAvailablePlatforms: { id: SocialPlatform; label: string; maxChars?: number }[] = [
    { id: 'x', label: 'X (Twitter)', maxChars: 280 },
    { id: 'linkedin', label: 'LinkedIn', maxChars: 3000 },
    { id: 'telegram', label: 'Telegram', maxChars: 4096 },
    { id: 'instagram', label: 'Instagram', maxChars: 2200 },
    { id: 'facebook', label: 'Facebook', maxChars: 5000 },
    { id: 'youtube', label: 'YouTube', maxChars: 5000 },
    { id: 'pinterest', label: 'Pinterest', maxChars: 500 },
    { id: 'tiktok', label: 'TikTok', maxChars: 2200 },
  ];

  const togglePlatform = (p: SocialPlatform) => {
    if (targetPlatforms.includes(p)) {
      if (targetPlatforms.length > 1) {
        setTargetPlatforms(targetPlatforms.filter(item => item !== p));
      }
    } else {
      setTargetPlatforms([...targetPlatforms, p]);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter a topic or concept headline.' });
      return;
    }

    setIsGenerating(true);
    setStatusMessage(null);

    try {
      const result = await api.generatePost({
        workspaceId,
        topic,
        niche,
        audience,
        region,
        language,
        tone,
        format,
        callToAction,
        brandName,
        keywordsToInclude: keywordsToInclude ? keywordsToInclude.split(',').map(s => s.trim()) : [],
        wordsToAvoid: wordsToAvoid ? wordsToAvoid.split(',').map(s => s.trim()) : [],
        targetPlatforms
      });

      setGeneratedTitle(result.title);
      setMasterMediaConcept(result.mediaConcept);
      setPlatformContents(result.platformContents);
      setActivePlatformTab(targetPlatforms[0] || 'x');
      setStatusMessage({ type: 'success', text: 'AI synthesized native post variations across all selected destinations.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Generation failed. Check your API key.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTransform = async (action: 'rewrite' | 'shorten' | 'expand' | 'translate' | 'change_tone', targetValue?: string) => {
    const current = platformContents[activePlatformTab];
    if (!current?.caption) return;

    setIsTransforming(true);
    try {
      const res = await api.transformText({
        text: current.caption,
        action,
        targetValue,
        workspaceId
      });

      const updated = {
        ...current,
        caption: res.transformedText,
        characterCount: res.transformedText.length + (current.hashtags?.join(' ').length || 0)
      };

      setPlatformContents({
        ...platformContents,
        [activePlatformTab]: updated
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Transformation failed: ${err.message}` });
    } finally {
      setIsTransforming(false);
    }
  };

  const handleSaveOrPublish = async (actionType: 'draft' | 'schedule' | 'queue' | 'publish_now') => {
    if (!topic) {
      setStatusMessage({ type: 'error', text: 'Topic is missing.' });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      let status: any = 'draft';
      let schedTime: string | undefined = undefined;

      if (actionType === 'schedule') {
        if (!scheduledDateTime) {
          setStatusMessage({ type: 'error', text: 'Please pick a scheduled date and time.' });
          setIsSaving(false);
          return;
        }
        status = 'scheduled';
        schedTime = new Date(scheduledDateTime).toISOString();
      } else if (actionType === 'queue') {
        status = 'queued';
        // assign 4 hours in future for queue slot
        schedTime = new Date(Date.now() + 3600000 * 4).toISOString();
      } else if (actionType === 'publish_now') {
        status = 'scheduled'; // will be immediately executed
      }

      const postPayload: Partial<Post> = {
        workspaceId,
        topic: generatedTitle || topic,
        niche,
        language,
        tone,
        format,
        status,
        mode: 'manual',
        targetPlatforms,
        platformContents,
        scheduledTime: schedTime,
        autoApproval: true
      };

      const saved = await api.createPost(postPayload);

      if (actionType === 'publish_now') {
        const pubResult = await api.publishPostNow(saved.id);
        if (pubResult.success) {
          setStatusMessage({ type: 'success', text: `Successfully published to ${targetPlatforms.join(', ')}!` });
        } else {
          setStatusMessage({ type: 'error', text: 'Publication attempted but encountered platform errors. See Queue for details.' });
        }
      } else {
        setStatusMessage({ type: 'success', text: `Post saved as ${status}.` });
      }

      onPostCreated(saved);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Operation failed.' });
    } finally {
      setIsSaving(false);
    }
  };

  const currentContent = platformContents[activePlatformTab] || {
    caption: '',
    hashtags: [],
    characterCount: 0,
    isValid: true
  };

  const currentPlatformMeta = allAvailablePlatforms.find(p => p.id === activePlatformTab);
  const isOverCharLimit = currentPlatformMeta?.maxChars && currentContent.characterCount > currentPlatformMeta.maxChars;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-400" />
            <span>AI Content Studio</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Craft high-converting, platform-native social content with your user-owned Gemini key.
          </p>
        </div>

        {!hasAiKey && (
          <button
            onClick={onNavigateToSettings}
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-2 hover:bg-amber-500/20 transition"
          >
            <Key className="h-4 w-4" />
            <span>Configure Gemini Key</span>
          </button>
        )}
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-xs sm:text-sm font-medium ${
          statusMessage.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
        }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Topic & Configuration Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            
            {/* Topic Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Topic, Premise or Article Concept <span className="text-indigo-400">*</span>
              </label>
              <textarea
                rows={3}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="E.g., How modern SaaS founders are saving 40% on AI margins with BYO-API keys..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* Target Destinations */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Target Social Destinations
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {allAvailablePlatforms.map((p) => {
                  const isSelected = targetPlatforms.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePlatform(p.id)}
                      className={`px-2.5 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-between border ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <span className="truncate">{p.label}</span>
                      {isSelected && <CheckCircle2 className="h-3 w-3 text-indigo-400 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Niche & Tone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Niche / Category</label>
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {niches.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Tone & Voice</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {tones.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Language & Format */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {languages.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Format Type</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {formats.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>

            {/* Audience & CTA */}
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Target Audience</label>
                <input
                  type="text"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Call to Action (CTA)</label>
                <input
                  type="text"
                  value={callToAction}
                  onChange={(e) => setCallToAction(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200"
                />
              </div>
            </div>

            {/* Keywords to include / avoid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Include Keywords</label>
                <input
                  type="text"
                  placeholder="e.g. autonomy, ROI"
                  value={keywordsToInclude}
                  onChange={(e) => setKeywordsToInclude(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Avoid Words / Hype</label>
                <input
                  type="text"
                  placeholder="e.g. game changer, revolutionary"
                  value={wordsToAvoid}
                  onChange={(e) => setWordsToAvoid(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:opacity-95 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Synthesizing Native Variations with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Multi-Platform Post</span>
                </>
              )}
            </button>

          </div>
        </div>

        {/* Right Column: Multi-Platform Native Preview & Editor */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between min-h-[580px]">
            
            <div className="space-y-4">
              
              {/* Platform Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
                {targetPlatforms.map((p) => {
                  const meta = allAvailablePlatforms.find(item => item.id === p);
                  const isTabActive = activePlatformTab === p;
                  return (
                    <button
                      key={p}
                      onClick={() => setActivePlatformTab(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition shrink-0 ${
                        isTabActive
                          ? 'bg-indigo-600 text-white shadow'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {meta?.label || p}
                    </button>
                  );
                })}
              </div>

              {/* Title & Media Concept Preview */}
              {generatedTitle && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold uppercase tracking-wider">Synthesized Headline</span>
                    <span className="font-mono text-indigo-400">Gemini 3.8 Flash</span>
                  </div>
                  <p className="text-sm font-bold text-white">{generatedTitle}</p>
                </div>
              )}

              {/* Main Content Editable Area */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <label className="font-semibold text-slate-300">
                    {activePlatformTab === 'x' && 'Twitter Card (Must be < 280 chars)'}
                    {activePlatformTab === 'linkedin' && 'LinkedIn Professional Post'}
                    {activePlatformTab === 'telegram' && 'Telegram HTML Channel Broadcast'}
                    {activePlatformTab === 'instagram' && 'Instagram Caption'}
                    {activePlatformTab === 'facebook' && 'Facebook Page Post'}
                    {activePlatformTab === 'youtube' && 'YouTube Title & Description'}
                    {activePlatformTab === 'pinterest' && 'Pinterest Pin Description'}
                    {activePlatformTab === 'tiktok' && 'TikTok Caption & Script Hook'}
                  </label>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className={isOverCharLimit ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                      {currentContent.characterCount} {currentPlatformMeta?.maxChars ? `/ ${currentPlatformMeta.maxChars}` : 'chars'}
                    </span>
                    {isOverCharLimit && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold">
                        OVER LIMIT
                      </span>
                    )}
                  </div>
                </div>

                <textarea
                  rows={8}
                  value={currentContent.caption}
                  onChange={(e) => {
                    const newText = e.target.value;
                    const hashtagsStr = (currentContent.hashtags || []).join(' ');
                    setPlatformContents({
                      ...platformContents,
                      [activePlatformTab]: {
                        ...currentContent,
                        caption: newText,
                        characterCount: newText.length + hashtagsStr.length
                      }
                    });
                  }}
                  placeholder="Click Generate with Gemini on the left or type your custom copy here..."
                  className={`w-full p-3.5 rounded-xl bg-slate-950 border text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition leading-relaxed ${
                    isOverCharLimit ? 'border-rose-500/70 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                  }`}
                />
              </div>

              {/* Quick AI Refine Toolbar */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
                <span className="text-[11px] font-bold uppercase text-slate-400 mr-1">AI Refine:</span>
                <button
                  type="button"
                  disabled={isTransforming || !currentContent.caption}
                  onClick={() => handleTransform('rewrite')}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800 transition flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3 text-indigo-400" />
                  <span>Rewrite</span>
                </button>
                <button
                  type="button"
                  disabled={isTransforming || !currentContent.caption}
                  onClick={() => handleTransform('shorten')}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800 transition flex items-center gap-1"
                >
                  <Minimize2 className="h-3 w-3 text-amber-400" />
                  <span>Shorten</span>
                </button>
                <button
                  type="button"
                  disabled={isTransforming || !currentContent.caption}
                  onClick={() => handleTransform('expand')}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800 transition flex items-center gap-1"
                >
                  <Maximize2 className="h-3 w-3 text-emerald-400" />
                  <span>Expand</span>
                </button>
                <button
                  type="button"
                  disabled={isTransforming || !currentContent.caption}
                  onClick={() => handleTransform('translate', 'Hindi')}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800 transition flex items-center gap-1"
                >
                  <Languages className="h-3 w-3 text-purple-400" />
                  <span>To Hindi</span>
                </button>
                <button
                  type="button"
                  disabled={isTransforming || !currentContent.caption}
                  onClick={() => handleTransform('change_tone', 'Humorous and Witty')}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800 transition flex items-center gap-1"
                >
                  <Sliders className="h-3 w-3 text-pink-400" />
                  <span>Make Witty</span>
                </button>
              </div>

              {/* Hashtags Section */}
              {currentContent.hashtags && currentContent.hashtags.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1">
                    <Hash className="h-3 w-3 text-indigo-400" />
                    <span>Target Hashtags</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentContent.hashtags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-xs text-indigo-300 font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Media Concept Advice */}
              {masterMediaConcept && (
                <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-900/30 flex items-start gap-2.5 text-xs text-indigo-300">
                  <ImageIcon className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-200 block">Suggested Media / Creative Concept:</span>
                    <span>{masterMediaConcept}</span>
                  </div>
                </div>
              )}

            </div>

            {/* Scheduling & Publish Action Bar */}
            <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-semibold text-slate-300">Schedule Time:</span>
                  <input
                    type="datetime-local"
                    value={scheduledDateTime}
                    onChange={(e) => setScheduledDateTime(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSaveOrPublish('draft')}
                    className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Draft</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSaveOrPublish('queue')}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    <Layers className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Add to Queue</span>
                  </button>

                  {scheduledDateTime ? (
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => handleSaveOrPublish('schedule')}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Schedule Post</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => handleSaveOrPublish('publish_now')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Publish Now</span>
                    </button>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
