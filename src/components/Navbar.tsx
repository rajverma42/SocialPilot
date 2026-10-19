import React from 'react';
import { 
  Bell, 
  ShieldAlert, 
  Key, 
  ExternalLink, 
  LayoutDashboard, 
  Globe, 
  Sparkles,
  Building2,
  CheckCircle2,
  Menu,
  Download,
  LogIn,
  LogOut,
  User as UserIcon,
  ChevronDown
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
  onOpenMobileDrawer?: () => void;
  onInstallApp?: () => void;
  isInstallable?: boolean;
  isInstalled?: boolean;
  onOpenAuthModal?: (mode?: 'signin' | 'signup') => void;
  onSignOut?: () => void;
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
  onToggleAppMode,
  onOpenMobileDrawer,
  onInstallApp,
  isInstallable,
  isInstalled,
  onOpenAuthModal,
  onSignOut
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        
        {/* Brand / Logo + Mobile Menu Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Hamburger Button */}
          {isAppMode && onOpenMobileDrawer && (
            <button
              onClick={onOpenMobileDrawer}
              className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              title="Open Navigation Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

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
              <p className="text-[10px] text-slate-400 font-medium">Free Auto Publish SaaS</p>
            </div>
          </button>

          {isAppMode && workspace && (
            <div className="hidden md:flex items-center ml-3 pl-3 border-l border-slate-800">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                <span className="font-semibold text-slate-200">{workspace.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider border border-emerald-500/30">
                  100% Free
                </span>
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

          {/* PWA Install Button */}
          {isInstallable && !isInstalled && onInstallApp && (
            <button
              onClick={onInstallApp}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600 hover:text-white text-xs font-semibold transition-all shadow-sm"
              title="Install SocialPilot AI to your device"
            >
              <Download className="h-3.5 w-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Install App</span>
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
                <span className="hidden sm:inline">Website</span>
              </>
            ) : (
              <>
                <LayoutDashboard className="h-3.5 w-3.5 text-indigo-400" />
                <span>Launch WebApp</span>
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

          {/* User Authentication & Profile Menu */}
          {user ? (
            <div className="relative pl-2 border-l border-slate-800">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-900/80 transition"
              >
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover border border-indigo-500/40"
                />
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-slate-200 leading-none">{user.name}</p>
                  <p className="text-[10px] text-emerald-400 mt-0.5 capitalize">{user.role || 'Member'}</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl bg-slate-900 border border-slate-800 p-2 shadow-2xl space-y-1 animate-fadeIn">
                  <div className="p-2 border-b border-slate-800">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-400 truncate font-mono">{user.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      onNavigate('settings-ws');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  >
                    <UserIcon className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Workspace Profile</span>
                  </button>

                  {onSignOut && (
                    <button
                      onClick={() => {
                        onSignOut();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition border-t border-slate-800/80 mt-1"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="pl-2 border-l border-slate-800 flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => onOpenAuthModal && onOpenAuthModal('signin')}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-medium text-xs transition-all"
              >
                <LogIn className="h-3.5 w-3.5 text-indigo-400" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => onOpenAuthModal && onOpenAuthModal('signup')}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md transition-all hover:scale-105"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign Up Free</span>
                <span className="sm:hidden">Sign Up</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
};
