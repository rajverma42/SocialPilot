import React from 'react';
import { 
  Bell, 
  ShieldAlert, 
  Key, 
  ExternalLink, 
  LayoutDashboard, 
  Globe, 
  Sparkles,
  ChevronDown,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { Workspace, User, AiProviderConfig } from '../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  workspace: Workspace | null;
  user: User | null;
  aiConfig: AiProviderConfig | null;
  emergencyPaused: boolean;
  onToggleEmergencyPause: () => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  isAppMode: boolean;
  onToggleAppMode: (appMode: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  workspace,
  user,
  aiConfig,
  emergencyPaused,
  onToggleEmergencyPause,
  unreadCount,
  onOpenNotifications,
  isAppMode,
  onToggleAppMode
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onToggleAppMode(false)}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold tracking-tight text-white text-base">
                <span>SocialPilot</span>
                <span className="text-xs px-1.5 py-0.5 rounded font-mono bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">AI</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Auto Publish SaaS</p>
            </div>
          </button>

          {isAppMode && workspace && (
            <div className="hidden md:flex items-center ml-4 pl-4 border-l border-slate-800">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                <span className="font-semibold text-slate-200">{workspace.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 font-mono uppercase">{workspace.plan}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Emergency Publishing Pause Button */}
          {isAppMode && (
            <button
              onClick={onToggleEmergencyPause}
              title={emergencyPaused ? 'Emergency stop is ACTIVE. Click to resume publishing.' : 'Click to immediately freeze all publishing workers.'}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                emergencyPaused
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-rose-400 hover:border-rose-900/50'
              }`}
            >
              <ShieldAlert className="h-4 w-4 text-rose-500" />
              <span className="hidden sm:inline">
                {emergencyPaused ? 'Publishing Paused' : 'Emergency Stop'}
              </span>
            </button>
          )}

          {/* BYO AI Key Status Pill */}
          {isAppMode && (
            <button
              onClick={() => onNavigate('settings-ai')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:border-slate-700 transition"
              title="Manage your user-owned Gemini API Key"
            >
              <Key className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden md:inline font-mono">
                {aiConfig?.hasKey ? aiConfig.maskedApiKey : 'No API Key'}
              </span>
              {aiConfig?.isValid ? (
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>
          )}

          {/* Switch between Marketing and App */}
          <button
            onClick={() => onToggleAppMode(!isAppMode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
          >
            {isAppMode ? (
              <>
                <Globe className="h-3.5 w-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Marketing Site</span>
              </>
            ) : (
              <>
                <LayoutDashboard className="h-3.5 w-3.5 text-indigo-400" />
                <span>Launch App</span>
              </>
            )}
          </button>

          {/* Notifications Bell */}
          {isAppMode && (
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ring-2 ring-slate-950">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* User Profile Avatar */}
          {isAppMode && user && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={user.name}
                className="h-8 w-8 rounded-full object-cover border border-indigo-500/30"
              />
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-slate-200 leading-none">{user.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{user.role}</p>
              </div>
            </div>
          )}

        </div>

      </div>
    </header>
  );
};
