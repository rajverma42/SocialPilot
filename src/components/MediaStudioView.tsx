import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Sparkles, 
  Trash2, 
  Layers, 
  Check, 
  Maximize2,
  Tag,
  Folder
} from 'lucide-react';
import { MediaAsset } from '../types';
import { api } from '../services/api';

interface MediaStudioViewProps {
  workspaceId: string;
}

export const MediaStudioView: React.FC<MediaStudioViewProps> = ({ workspaceId }) => {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  
  // Upload modal / URL form
  const [assetName, setAssetName] = useState('');
  const [assetUrl, setAssetUrl] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:5' | '2:3'>('16:9');
  const [folder, setFolder] = useState('Marketing');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Creative prompt builder
  const [creativePromptTopic, setCreativePromptTopic] = useState('');
  const [suggestedPrompt, setSuggestedPrompt] = useState('');

  const aspectRatios = [
    { id: '1:1', label: 'Square (1:1)', useCase: 'Instagram Feed, LinkedIn Post' },
    { id: '16:9', label: 'Landscape (16:9)', useCase: 'YouTube Thumbnail, X (Twitter) Card, Facebook' },
    { id: '9:16', label: 'Vertical (9:16)', useCase: 'Instagram Reels, TikTok, YouTube Shorts' },
    { id: '4:5', label: 'Portrait (4:5)', useCase: 'Instagram Carousel, Facebook Mobile' },
    { id: '2:3', label: 'Pin Standard (2:3)', useCase: 'Pinterest Pin Graphic' },
  ];

  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const loadAssets = async () => {
    try {
      const data = await api.getMediaAssets(workspaceId);
      setAssets(data);
    } catch (err) {
      console.error('Failed to load media assets:', err);
    }
  };

  useEffect(() => {
    loadAssets();
  }, [workspaceId]);

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetUrl) return;

    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      await api.addMediaAsset({
        workspaceId,
        name: assetName || 'Creative Graphic',
        url: assetUrl,
        aspectRatio,
        folder,
        tags: [folder, aspectRatio]
      });

      setAssetName('');
      setAssetUrl('');
      setStatusMessage({ text: 'Media asset uploaded and indexed to library.' });
      await loadAssets();
    } catch (err: any) {
      setStatusMessage({ text: `Upload error: ${err.message}`, isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setStatusMessage(null);
    try {
      await api.deleteMediaAsset(id);
      await loadAssets();
      if (selectedAsset?.id === id) setSelectedAsset(null);
      setStatusMessage({ text: 'Asset removed from library.' });
    } catch (err: any) {
      setStatusMessage({ text: `Deletion error: ${err.message}`, isError: true });
    }
  };

  const handleGeneratePromptIdea = () => {
    if (!creativePromptTopic) return;
    setSuggestedPrompt(`High-contrast editorial 3D render illustrating "${creativePromptTopic}", vibrant neon violet and amber volumetric lighting, hyper-detailed minimalist aesthetic, clean negative space for typography overlay, 8k resolution, shot on Hasselblad.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Status Banner */}
      {statusMessage && (
        <div className={`p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between gap-2 animate-fadeIn ${
          statusMessage.isError
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
        }`}>
          <div className="flex items-center gap-2">
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-indigo-400" />
            <span>Media Studio & Creative Assets</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Organize creatives, validate platform aspect ratios, and generate high-impact AI creative prompts.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Asset Library */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Asset Library</span>
                <span className="text-xs font-mono text-slate-400">({assets.length} items)</span>
              </h3>
            </div>

            {assets.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No media assets found. Upload an image or enter a URL on the right.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className="group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 cursor-pointer hover:border-indigo-500 transition aspect-video flex items-center justify-center"
                  >
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                      <p className="text-xs font-bold text-white truncate">{asset.name}</p>
                      <span className="text-[10px] font-mono text-indigo-300">{asset.aspectRatio}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Asset Details */}
            {selectedAsset && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={selectedAsset.url} alt="" className="h-14 w-14 rounded-lg object-cover border border-slate-800" />
                  <div>
                    <h4 className="text-sm font-bold text-white">{selectedAsset.name}</h4>
                    <p className="text-xs text-slate-400 font-mono">
                      Ratio: <span className="text-indigo-400 font-bold">{selectedAsset.aspectRatio}</span> &bull; Folder: {selectedAsset.folder}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(selectedAsset.id)}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Asset</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* AI Creative Prompt Ideation Tool */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>AI Graphic Prompt Synthesizer</span>
            </h3>
            <p className="text-xs text-slate-400">
              Generate photorealistic image prompts formatted for high-converting social thumbnails and post attachments.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="E.g., Quantum Computing cloud servers in a futuristic datacenter"
                value={creativePromptTopic}
                onChange={(e) => setCreativePromptTopic(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleGeneratePromptIdea}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0"
              >
                Synthesize Prompt
              </button>
            </div>

            {suggestedPrompt && (
              <div className="p-3 rounded-xl bg-slate-950 border border-indigo-900/40 text-xs text-indigo-200 select-all font-mono leading-relaxed">
                {suggestedPrompt}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Upload / Add Media & Aspect Ratio Guide */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Add Media Form */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Upload className="h-4 w-4 text-indigo-400" />
              <span>Add Media Asset</span>
            </h3>

            <form onSubmit={handleAddMedia} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Image / Asset URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={assetUrl}
                  onChange={(e) => setAssetUrl(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Asset Name</label>
                <input
                  type="text"
                  placeholder="e.g. Hero Graphic Q4"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Aspect Ratio</label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200"
                >
                  {aspectRatios.map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Folder</label>
                <input
                  type="text"
                  placeholder="e.g. Infographics, Launches"
                  value={folder}
                  onChange={(e) => setFolder(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
              >
                Save to Library
              </button>
            </form>
          </div>

          {/* Aspect Ratio Guide */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Platform Aspect Ratio Rules
            </h4>
            <div className="space-y-2 text-xs">
              {aspectRatios.map(r => (
                <div key={r.id} className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                  <p className="font-bold text-slate-200">{r.label}</p>
                  <p className="text-[10px] text-slate-400">{r.useCase}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
