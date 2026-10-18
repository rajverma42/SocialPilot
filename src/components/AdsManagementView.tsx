import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Settings2, 
  Save, 
  Eye, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink, 
  Smartphone, 
  Monitor, 
  ShieldCheck, 
  Globe, 
  Layout, 
  Code2
} from 'lucide-react';
import { api } from '../services/api';
import { AdLeaderboard } from './ads/AdLeaderboard';
import { InFeedAd } from './ads/InFeedAd';

interface AdsManagementViewProps {
  onRefreshAll?: () => void;
}

export const AdsManagementView: React.FC<AdsManagementViewProps> = ({ onRefreshAll }) => {
  const [adSensePublisherId, setAdSensePublisherId] = useState('ca-pub-6603222683084860');
  const [websiteAdsEnabled, setWebsiteAdsEnabled] = useState(true);
  const [webappAdsEnabled, setWebappAdsEnabled] = useState(true);
  const [headerAdEnabled, setHeaderAdEnabled] = useState(true);
  const [inFeedAdEnabled, setInFeedAdEnabled] = useState(true);
  const [stickyFooterAdEnabled, setStickyFooterAdEnabled] = useState(true);
  const [customScriptCode, setCustomScriptCode] = useState('');
  const [testMode, setTestMode] = useState(true);

  // Custom Ad creative configuration
  const [adTitle, setAdTitle] = useState('CloudScale VPS — Fast NVMe Cloud for Creators & Devs');
  const [adSubtitle, setAdSubtitle] = useState('Deploy 24/7 background daemons, autonomous bots, and webhooks in 30 seconds. Get $100 free credit.');
  const [adUrl, setAdUrl] = useState('https://cloudscale.example.com');
  const [adButtonText, setAdButtonText] = useState('Learn More');

  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Load existing settings
    api.getMonetizationConfig().then((cfg) => {
      if (cfg) {
        setAdSensePublisherId(cfg.adSensePublisherId || 'ca-pub-6603222683084860');
        setHeaderAdEnabled(cfg.headerAdEnabled ?? true);
        setInFeedAdEnabled(cfg.inFeedAdEnabled ?? true);
        setStickyFooterAdEnabled(cfg.stickyFooterAdEnabled ?? true);
        setCustomScriptCode(cfg.customScriptCode || '');
        setTestMode(cfg.testAdsMode ?? true);
      }
    }).catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateMonetizationConfig({
        adSensePublisherId,
        headerAdEnabled,
        inFeedAdEnabled,
        stickyFooterAdEnabled,
        customScriptCode,
        testAdsMode: testMode
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      console.error('Error saving ad settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl pb-16 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Megaphone className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Website & Web App Ads Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure sponsor spaces, Google AdSense units, and display ads across your website and web app.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTestMode(!testMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              testMode 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}
          >
            {testMode ? 'Test Ads Active' : 'Live Ads Active'}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>Ads settings and display preferences saved successfully!</span>
        </div>
      )}

      {/* Overview Status Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900/70 to-purple-950/40 border border-indigo-500/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Cross-Platform Ad Integration</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Display ads are enabled across all devices (Desktop, Mobile Phone, Tablet, and PWA).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
              100% Free Platform
            </span>
          </div>
        </div>
      </div>

      {/* Ad Spaces Placement Toggles */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layout className="h-4 w-4 text-indigo-400" />
              <span>Ad Spaces & Placement Toggles</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose which ad locations are active in your Website and Web App.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          
          {/* Header Banner */}
          <div 
            onClick={() => setHeaderAdEnabled(!headerAdEnabled)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              headerAdEnabled 
                ? 'bg-indigo-600/10 border-indigo-500/50 text-white' 
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-xs">Top Header Banner</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                headerAdEnabled ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-500'
              }`}>
                {headerAdEnabled ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              728x90 desktop / 320x50 mobile responsive top banner in the webapp & website hero.
            </p>
          </div>

          {/* In-Feed Native Ad */}
          <div 
            onClick={() => setInFeedAdEnabled(!inFeedAdEnabled)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              inFeedAdEnabled 
                ? 'bg-indigo-600/10 border-indigo-500/50 text-white' 
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-xs">In-Feed Native Sponsor</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                inFeedAdEnabled ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-500'
              }`}>
                {inFeedAdEnabled ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Native sponsor cards blended seamlessly into the content queue and dashboard feeds.
            </p>
          </div>

          {/* Sticky Bottom Footer */}
          <div 
            onClick={() => setStickyFooterAdEnabled(!stickyFooterAdEnabled)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              stickyFooterAdEnabled 
                ? 'bg-indigo-600/10 border-indigo-500/50 text-white' 
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-xs">Sticky Mobile/Desktop Footer</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                stickyFooterAdEnabled ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-500'
              }`}>
                {stickyFooterAdEnabled ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Collapsible bottom ad bar with close/minimize controls, optimized for mobile devices.
            </p>
          </div>

        </div>
      </div>

      {/* Ad Network & Script Setup Form */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
        <div className="pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-indigo-400" />
            <span>Ad Network Settings</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure your Google AdSense Publisher ID or insert custom HTML/JS ad tags.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Google AdSense Publisher ID
            </label>
            <input
              type="text"
              value={adSensePublisherId}
              onChange={(e) => setAdSensePublisherId(e.target.value)}
              placeholder="ca-pub-6603222683084860"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Connects Google Auto-Ads and programmatic banner inventory automatically.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Custom Ad Title (for Native Sponsor Slot)
            </label>
            <input
              type="text"
              value={adTitle}
              onChange={(e) => setAdTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Custom HTML / JavaScript Ad Tag (Optional)
            </label>
            <textarea
              rows={3}
              value={customScriptCode}
              onChange={(e) => setCustomScriptCode(e.target.value)}
              placeholder="<!-- Paste your custom banner HTML or script tag here -->"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Supports any 3rd-party ad network (Media.net, Adsterra, PropellerAds, or direct partner banners).
            </p>
          </div>

        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Saving...' : 'Save Ads Options'}</span>
          </button>
        </div>
      </form>

      {/* Live Ad Space Preview */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Eye className="h-4 w-4 text-emerald-400" />
              <span>Live Ad Creative Preview</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verify how your ads appear to visitors on desktop and mobile viewports.
            </p>
          </div>

          {/* Device Preview Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                previewDevice === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>Desktop (728px)</span>
            </button>
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                previewDevice === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Mobile (320px)</span>
            </button>
          </div>
        </div>

        {/* Preview Frame */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col items-center justify-center">
          <div className={previewDevice === 'mobile' ? 'max-w-xs w-full' : 'w-full'}>
            <div className="mb-2 text-center text-[10px] text-slate-500 font-mono">
              [Top Leaderboard Banner Ad]
            </div>
            <AdLeaderboard testMode={testMode} publisherId={adSensePublisherId} />

            <div className="my-4 text-center text-[10px] text-slate-500 font-mono">
              [In-Feed Native Sponsor Ad]
            </div>
            <InFeedAd />
          </div>
        </div>
      </div>

    </div>
  );
};
