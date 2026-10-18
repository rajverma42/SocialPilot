import React, { useState, useEffect } from 'react';
import { Gift, Sparkles, X, CheckCircle2, Play, Award, ExternalLink } from 'lucide-react';
import { api } from '../../services/api';

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (bonusCredits: number) => void;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [countdown, setCountdown] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      setIsPlaying(false);
      setIsCompleted(false);
      setIsClaiming(false);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isPlaying || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsCompleted(true);
          setIsPlaying(false);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, countdown]);

  if (!isOpen) return null;

  const handleStartAd = () => {
    setIsPlaying(true);
    setCountdown(5);
  };

  const handleClaimReward = async () => {
    setIsClaiming(true);
    try {
      const res = await api.claimRewardedBonus();
      onSuccess(res.bonusCredits || 25);
      onClose();
    } catch (err) {
      console.error('Error claiming reward bonus:', err);
      onSuccess(25);
      onClose();
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-indigo-500/30 p-6 shadow-2xl text-slate-100 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Gift className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Rewarded Sponsor Bonus</h3>
              <p className="text-[11px] text-slate-400">100% Free AI Credits via Ad Network</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Ad Video / Creative Player Container */}
        <div className="relative aspect-video rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col items-center justify-center text-center p-6">
          {!isPlaying && !isCompleted && (
            <div className="space-y-4">
              <div className="h-14 w-14 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center mx-auto text-indigo-400">
                <Sparkles className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-base">Watch 5s Sponsor Spotlight</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Support the free platform by watching a quick sponsor message and immediately earn <strong>+25 Free AI Generations</strong>!
                </p>
              </div>
              <button
                onClick={handleStartAd}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>Start Sponsor Spotlight (5s)</span>
              </button>
            </div>
          )}

          {isPlaying && (
            <div className="space-y-4 w-full">
              {/* Countdown badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-mono font-bold">
                <span>Reward unlocks in:</span>
                <span className="text-white text-sm font-black">{countdown}s</span>
              </div>

              {/* Sponsor Creative Content */}
              <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/20 max-w-sm mx-auto text-left space-y-2">
                <span className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase">
                  Featured Sponsor
                </span>
                <h5 className="font-bold text-white text-sm">
                  ⚡ HyperSpeed Cloud Database
                </h5>
                <p className="text-xs text-slate-400">
                  Global serverless database with 10ms latency. Zero cold starts, 100% uptime SLA for AI applications.
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full transition-all duration-1000"
                  style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                />
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="space-y-3 animate-fadeIn">
              <div className="h-12 w-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-base">Spotlight Completed!</h4>
                <p className="text-xs text-slate-400">
                  Thank you for supporting SocialPilot AI! Your free bonus is ready to claim.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Reward Value & Claim Footer */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <Award className="h-4 w-4" />
            <span className="font-semibold">+25 AI Generations Reward</span>
          </div>

          {isCompleted ? (
            <button
              onClick={handleClaimReward}
              disabled={isClaiming}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
            >
              <Gift className="h-4 w-4" />
              <span>{isClaiming ? 'Claiming...' : 'Claim +25 Free Generations'}</span>
            </button>
          ) : (
            <button
              disabled
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 font-semibold text-xs cursor-not-allowed opacity-60"
            >
              Watch Video to Claim
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
