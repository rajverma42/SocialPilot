import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Sparkles, X } from 'lucide-react';
import { api } from '../../services/api';

interface StickyAdFooterProps {
  onAdClick?: () => void;
}

export const StickyAdFooter: React.FC<StickyAdFooterProps> = ({ onAdClick }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    api.recordAdImpression('unit-sticky').catch(() => {});
  }, []);

  if (isDismissed) return null;

  const handleClick = () => {
    api.recordAdClick('unit-sticky').catch(() => {});
    if (onAdClick) onAdClick();
  };

  return (
    <div className="fixed bottom-14 md:bottom-2 left-2 right-2 md:left-auto md:right-4 z-30 md:max-w-md transition-all">
      <div className="rounded-xl border border-indigo-500/30 bg-slate-950/95 backdrop-blur-md shadow-2xl p-2.5 text-xs text-slate-200">
        <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-800 text-[10px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 font-bold uppercase text-[8px]">
              Ad
            </span>
            <span>Supports 100% Free SocialPilot AI</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 hover:text-white text-slate-400 rounded"
              title={isCollapsed ? 'Expand' : 'Minimize'}
            >
              {isCollapsed ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 hover:text-white text-slate-400 rounded"
              title="Dismiss for this session"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <div 
            onClick={handleClick}
            className="pt-2 flex items-center justify-between gap-3 cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white group-hover:text-indigo-300 transition-colors truncate text-xs">
                  AI Copywriting Pro Suite
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  Try 1,000+ viral hooks & social templates
                </p>
              </div>
            </div>

            <button className="shrink-0 px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] flex items-center gap-1">
              <span>View</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
