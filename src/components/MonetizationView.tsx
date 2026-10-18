import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Percent, 
  Settings2, 
  Save, 
  Download, 
  Gift, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  Code2, 
  ExternalLink, 
  CheckCircle2, 
  RefreshCw,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  Wallet,
  Globe
} from 'lucide-react';
import { MonetizationConfig } from '../types';
import { api } from '../services/api';

interface MonetizationViewProps {
  onOpenRewardedAd: () => void;
  onRefreshAll?: () => void;
}

export const MonetizationView: React.FC<MonetizationViewProps> = ({
  onOpenRewardedAd,
  onRefreshAll
}) => {
  const [config, setConfig] = useState<MonetizationConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states
  const [adSensePublisherId, setAdSensePublisherId] = useState('');
  const [autoAdsEnabled, setAutoAdsEnabled] = useState(true);
  const [testAdsMode, setTestAdsMode] = useState(true);
  const [headerAdEnabled, setHeaderAdEnabled] = useState(true);
  const [inFeedAdEnabled, setInFeedAdEnabled] = useState(true);
  const [rewardedAdEnabled, setRewardedAdEnabled] = useState(true);
  const [stickyFooterAdEnabled, setStickyFooterAdEnabled] = useState(true);
  const [customScriptCode, setCustomScriptCode] = useState('');
  const [refreshIntervalSeconds, setRefreshIntervalSeconds] = useState(45);
  const [payoutMethod, setPayoutMethod] = useState<'adsense' | 'paypal' | 'bank_wire' | 'upi'>('adsense');
  const [payoutAddress, setPayoutAddress] = useState('');

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const data = await api.getMonetizationConfig();
      setConfig(data);
      setAdSensePublisherId(data.adSensePublisherId || 'ca-pub-6603222683084860');
      setAutoAdsEnabled(data.autoAdsEnabled ?? true);
      setTestAdsMode(data.testAdsMode ?? true);
      setHeaderAdEnabled(data.headerAdEnabled ?? true);
      setInFeedAdEnabled(data.inFeedAdEnabled ?? true);
      setRewardedAdEnabled(data.rewardedAdEnabled ?? true);
      setStickyFooterAdEnabled(data.stickyFooterAdEnabled ?? true);
      setCustomScriptCode(data.customScriptCode || '');
      setRefreshIntervalSeconds(data.refreshIntervalSeconds || 45);
      setPayoutMethod(data.payoutMethod || 'adsense');
      setPayoutAddress(data.payoutAddress || 'riteshkumarverma486@gmail.com');
    } catch (err) {
      console.error('Error loading monetization config:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await api.updateMonetizationConfig({
        adSensePublisherId,
        autoAdsEnabled,
        testAdsMode,
        headerAdEnabled,
        inFeedAdEnabled,
        rewardedAdEnabled,
        stickyFooterAdEnabled,
        customScriptCode,
        refreshIntervalSeconds,
        payoutMethod,
        payoutAddress
      });
      setConfig(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      console.error('Failed to save monetization config:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCsv = async () => {
    await api.exportEarningsReport();
  };

  const stats = config?.stats || {
    impressions: 4892,
    clicks: 142,
    todayEarnings: 6.48,
    yesterdayEarnings: 12.85,
    last7DaysEarnings: 74.20,
    monthEarnings: 218.45,
    totalLifetimeEarnings: 642.10,
    eCpm: 2.65,
    dailyHistory: [],
    unitPerformance: []
  };

  const payoutThreshold = config?.payoutThreshold || 100;
  const currentMonth = stats.monthEarnings || 0;
  const payoutProgressPercent = Math.min(100, Math.round((currentMonth / payoutThreshold) * 100));

  return (
    <div className="space-y-6 max-w-7xl pb-16">
      
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <DollarSign className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Ads Earnings & Monetization Center
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            SocialPilot AI is <strong>100% Free Forever</strong>. Track live ad revenue, configure Google AdSense, and manage publisher earnings.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenRewardedAd}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
          >
            <Gift className="h-4 w-4" />
            <span>Test Rewarded Ad (+25 AI Boost)</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium hover:bg-slate-800 transition-all"
          >
            <Download className="h-4 w-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>Monetization configurations and ad network preferences saved successfully!</span>
        </div>
      )}

      {/* 100% Free Guarantee Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900/90 to-emerald-950/40 border border-indigo-500/30 p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>100% Free Forever Architecture</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                  NO SUBSCRIPTION
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                All features (Auto-Publishing, AI Generations, Telegram, X, Meta, RSS, Media Studio) are free without paywalls, supported solely by digital ads.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs shrink-0 font-medium text-slate-300">
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">Estimated eCPM</span>
              <span className="text-emerald-400 font-bold font-mono text-base">${stats.eCpm.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Today's Earnings */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Today's Earnings</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            ${stats.todayEarnings.toFixed(2)}
          </div>
          <p className="text-[10px] text-slate-400">
            Yesterday: ${stats.yesterdayEarnings.toFixed(2)}
          </p>
        </div>

        {/* Month to Date */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Month to Date</span>
            <TrendingUp className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-300 font-mono">
            ${stats.monthEarnings.toFixed(2)}
          </div>
          <p className="text-[10px] text-slate-400">
            Last 7 days: ${stats.last7DaysEarnings.toFixed(2)}
          </p>
        </div>

        {/* Total Impressions */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Ad Impressions</span>
            <Eye className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {stats.impressions.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400">
            Avg eCPM: ${stats.eCpm.toFixed(2)}
          </p>
        </div>

        {/* Total Lifetime Revenue */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Lifetime Ad Revenue</span>
            <Wallet className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            ${stats.totalLifetimeEarnings.toFixed(2)}
          </div>
          <p className="text-[10px] text-slate-400">
            Total Clicks: {stats.clicks.toLocaleString()}
          </p>
        </div>

      </div>

      {/* Payout Progress Card */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Wallet className="h-4 w-4 text-emerald-400" />
              <span>Earnings Payout Threshold Tracker</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Current Month: <strong>${currentMonth.toFixed(2)}</strong> of <strong>${payoutThreshold}.00</strong> minimum payout threshold.
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            {payoutProgressPercent}% Ready
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
          <div 
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full rounded-full transition-all duration-700"
            style={{ width: `${payoutProgressPercent}%` }}
          />
        </div>
      </div>

      {/* Daily Earnings Breakdown & Unit Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Daily History Table */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-400" />
              <span>Daily Ad Earnings History</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Last 7 Days</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-2">Date</th>
                  <th className="pb-2 text-right">Impressions</th>
                  <th className="pb-2 text-right">Clicks</th>
                  <th className="pb-2 text-right">Estimated ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {(stats.dailyHistory || []).map((day, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="py-2.5 text-slate-300 font-sans">{day.date}</td>
                    <td className="py-2.5 text-right text-slate-400">{day.impressions}</td>
                    <td className="py-2.5 text-right text-slate-400">{day.clicks}</td>
                    <td className="py-2.5 text-right text-emerald-400 font-bold">${day.earnings.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ad Unit Performance Breakdown */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-purple-400" />
              <span>Ad Unit Placements Breakdown</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Realtime Metrics</span>
          </div>

          <div className="space-y-3">
            {(stats.unitPerformance || []).map((unit) => (
              <div 
                key={unit.id}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-semibold text-white">{unit.name}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                    <span>{unit.impressions.toLocaleString()} views</span>
                    <span>·</span>
                    <span>{unit.clicks} clicks</span>
                    <span>·</span>
                    <span className="text-indigo-400">CTR {unit.ctr}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    ${unit.earnings.toFixed(2)}
                  </span>
                  <span className="block text-[9px] text-slate-500 uppercase font-mono">
                    {unit.format}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Ad Network & Configuration Settings Form */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-indigo-400" />
              <span>Ad Network & Publisher Configuration</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Connect your Google AdSense account, custom banner scripts, and payout details.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Google AdSense ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Google AdSense Publisher ID
              </label>
              <input
                type="text"
                value={adSensePublisherId}
                onChange={(e) => setAdSensePublisherId(e.target.value)}
                placeholder="ca-pub-6603222683084860"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Found in your Google AdSense console under Account &gt; Settings.
              </p>
            </div>

            {/* Payout Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ad Revenue Payout Destination
              </label>
              <select
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="adsense">Google AdSense Direct Bank Wire</option>
                <option value="paypal">PayPal Electronic Transfer</option>
                <option value="bank_wire">Direct Wire Transfer (SWIFT/NEFT)</option>
                <option value="upi">UPI / Instant Pay (India)</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Selected payout rail for monthly ad earnings dispatches.
              </p>
            </div>

            {/* Payout Address */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Payout Email / UPI ID / Account Number
              </label>
              <input
                type="text"
                value={payoutAddress}
                onChange={(e) => setPayoutAddress(e.target.value)}
                placeholder="riteshkumarverma486@gmail.com"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

          </div>

          {/* Ad Placement Switches */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Active Ad Unit Placements
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              
              {/* Header Ad */}
              <div 
                onClick={() => setHeaderAdEnabled(!headerAdEnabled)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  headerAdEnabled
                    ? 'bg-indigo-600/10 border-indigo-500/40 text-slate-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs">Header Leaderboard</span>
                  {headerAdEnabled ? (
                    <span className="text-[10px] text-indigo-400 font-bold">ON</span>
                  ) : (
                    <span className="text-[10px] text-slate-600 font-bold">OFF</span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 leading-snug">
                  728x90 desktop / 320x50 mobile banner at the top of content.
                </p>
              </div>

              {/* In-feed Ad */}
              <div 
                onClick={() => setInFeedAdEnabled(!inFeedAdEnabled)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  inFeedAdEnabled
                    ? 'bg-indigo-600/10 border-indigo-500/40 text-slate-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs">In-Feed Native Ad</span>
                  {inFeedAdEnabled ? (
                    <span className="text-[10px] text-indigo-400 font-bold">ON</span>
                  ) : (
                    <span className="text-[10px] text-slate-600 font-bold">OFF</span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 leading-snug">
                  Native sponsored cards blended into feeds and dashboard items.
                </p>
              </div>

              {/* Rewarded Ad */}
              <div 
                onClick={() => setRewardedAdEnabled(!rewardedAdEnabled)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  rewardedAdEnabled
                    ? 'bg-indigo-600/10 border-indigo-500/40 text-slate-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs">Rewarded AI Boost</span>
                  {rewardedAdEnabled ? (
                    <span className="text-[10px] text-indigo-400 font-bold">ON</span>
                  ) : (
                    <span className="text-[10px] text-slate-600 font-bold">OFF</span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 leading-snug">
                  Optional 5s video for users to earn +25 free AI generation credits.
                </p>
              </div>

              {/* Sticky Footer Ad */}
              <div 
                onClick={() => setStickyFooterAdEnabled(!stickyFooterAdEnabled)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  stickyFooterAdEnabled
                    ? 'bg-indigo-600/10 border-indigo-500/40 text-slate-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs">Sticky Footer Banner</span>
                  {stickyFooterAdEnabled ? (
                    <span className="text-[10px] text-indigo-400 font-bold">ON</span>
                  ) : (
                    <span className="text-[10px] text-slate-600 font-bold">OFF</span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 leading-snug">
                  Collapsible bottom bar on mobile and desktop viewports.
                </p>
              </div>

            </div>
          </div>

          {/* Test Mode vs Live Ads */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <span>Test Ad Creative Mode</span>
                {testAdsMode && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono text-[9px] font-bold">
                    ACTIVE
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Enable test creative units during development to verify placement without risking policy violations.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setTestAdsMode(!testAdsMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                testAdsMode
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {testAdsMode ? 'Test Mode Enabled' : 'Live Ads Mode'}
            </button>
          </div>

          {/* Custom Network Script Tag Editor */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">
              Custom Ad Network HTML / JavaScript Code (Optional)
            </label>
            <textarea
              rows={3}
              value={customScriptCode}
              onChange={(e) => setCustomScriptCode(e.target.value)}
              placeholder="<!-- Paste your Adsterra, Media.net, or direct sponsor HTML code here -->"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
            <p className="text-[10px] text-slate-400">
              Inject custom affiliate scripts or alternative ad network tags safely.
            </p>
          </div>

          {/* Save Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Saving Preferences...' : 'Save Monetization Settings'}</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
