import React, { useEffect } from 'react';
import { ExternalLink, Star, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';

interface InFeedAdProps {
  category?: string;
  onAdClick?: () => void;
}

export const InFeedAd: React.FC<InFeedAdProps> = ({
  category = 'Developer Tools & SaaS',
  onAdClick
}) => {
  useEffect(() => {
    api.recordAdImpression('unit-infeed').catch(() => {});
  }, []);

  const handleClick = () => {
    api.recordAdClick('unit-infeed').catch(() => {});
    if (onAdClick) onAdClick();
  };

  return (
    <div 
      onClick={handleClick}
      className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/20 via-slate-900/60 to-purple-950/20 border border-indigo-500/30 hover:border-indigo-500/50 transition-all cursor-pointer group shadow-sm my-3"
    >
      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-bold uppercase text-[9px] border border-indigo-500/30">
            Sponsored Partner
          </span>
          <span className="text-slate-400">·</span>
          <span>{category}</span>
        </div>
        <div className="flex items-center gap-1 text-amber-400">
          <Star className="h-3 w-3 fill-amber-400" />
          <span className="text-[10px] font-bold">4.9/5</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors flex items-center gap-2">
            <span>DevPulse Monitor — Realtime API Health & Status Badges</span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-400 shrink-0" />
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Monitor API webhooks, background queues, and latency with automated Slack & Telegram alerts. Free tier included for developers.
          </p>
        </div>

        <button className="shrink-0 w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all text-center">
          Claim Free Tier
        </button>
      </div>
    </div>
  );
};
