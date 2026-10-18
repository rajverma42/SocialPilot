import React, { useEffect, useState } from 'react';
import { ExternalLink, Info, X, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

interface AdLeaderboardProps {
  onAdClick?: () => void;
  publisherId?: string;
  testMode?: boolean;
}

export const AdLeaderboard: React.FC<AdLeaderboardProps> = ({
  onAdClick,
  publisherId = 'ca-pub-6603222683084860',
  testMode = true
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    // Record impression once mounted
    api.recordAdImpression('unit-header').catch(() => {});
  }, []);

  if (!isVisible) return null;

  const handleClick = () => {
    api.recordAdClick('unit-header').catch(() => {});
    if (onAdClick) onAdClick();
  };

  return (
    <div className="w-full mb-4 px-2 sm:px-0">
      <div className="relative mx-auto max-w-5xl rounded-xl border border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-2 sm:p-2.5 shadow-lg overflow-hidden">
        {/* Ad disclosure header */}
        <div className="flex items-center justify-between px-2 pb-1 text-[10px] text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 font-semibold uppercase tracking-wider text-[9px] border border-indigo-500/20">
              Sponsored
            </span>
            <span>Google AdSense Network</span>
            {testMode && (
              <span className="text-amber-400 font-bold bg-amber-500/10 px-1 rounded text-[9px]">
                TEST AD
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="hover:text-indigo-300 transition-colors flex items-center gap-0.5 text-[9px]"
              title="Why do I see this ad?"
            >
              <Info className="h-2.5 w-2.5" />
              <span className="hidden sm:inline">Ad Choices</span>
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="hover:text-white transition-colors"
              title="Close banner"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Ad info popup */}
        {showInfo && (
          <div className="p-2 mb-2 rounded-lg bg-slate-950/90 border border-slate-800 text-[11px] text-slate-300 animate-fadeIn">
            SocialPilot AI is <strong>100% Free Forever</strong> for everyone. Non-intrusive sponsor ads allow us to maintain 24/7 background servers, multi-platform publishing, and free AI workflows with zero subscription fees.
          </div>
        )}

        {/* Responsive Ad Creative Container */}
        <div 
          onClick={handleClick}
          className="cursor-pointer group flex flex-col sm:flex-row items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/40 transition-all hover:bg-slate-950"
        >
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white group-hover:scale-110 transition-transform" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                  CloudScale VPS — Fast NVMe Cloud for Creators & Devs
                </h4>
                <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-indigo-400 shrink-0" />
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                Deploy 24/7 background daemons, autonomous bots, and webhooks in 30 seconds. Get $100 free credit today.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-800">
            <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
              ID: {publisherId.slice(0, 14)}...
            </span>
            <button className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all text-center">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
