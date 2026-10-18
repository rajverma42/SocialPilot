import React from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  Zap, 
  Calendar, 
  Megaphone, 
  Menu, 
  X, 
  Share2, 
  Rss, 
  Image as ImageIcon, 
  Layers, 
  BarChart3, 
  Bell, 
  Key, 
  Settings, 
  HelpCircle,
  Download,
  ShieldCheck,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { Workspace } from '../types';

interface MobileNavigationProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isDrawerOpen: boolean;
  onToggleDrawer: (open: boolean) => void;
  queueCount: number;
  autoModeActive: boolean;
  unreadNotifications: number;
  workspace: Workspace | null;
  onInstallApp: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  currentView,
  onNavigate,
  isDrawerOpen,
  onToggleDrawer,
  queueCount,
  autoModeActive,
  unreadNotifications,
  workspace,
  onInstallApp,
  isInstallable,
  isInstalled,
  isIOS
}) => {
  const bottomItems = [
    { id: 'overview', label: 'Home', icon: LayoutDashboard },
    { id: 'generator', label: 'AI Studio', icon: Sparkles },
    { id: 'auto-mode', label: 'Auto', icon: Zap, active: autoModeActive },
    { id: 'calendar', label: 'Queue', icon: Calendar, count: queueCount },
    { id: 'ads', label: 'Ads', icon: Megaphone },
  ];

  const allDrawerItems = [
    {
      group: 'Core Engine',
      items: [
        { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
        { id: 'generator', label: 'AI Content Studio', icon: Sparkles, badge: 'Smart' },
        { id: 'auto-mode', label: 'Full Auto Mode', icon: Zap, active: autoModeActive },
        { id: 'calendar', label: 'Calendar & Queue', icon: Calendar, count: queueCount },
      ]
    },
    {
      group: 'Website & Webapp Ads',
      items: [
        { id: 'ads', label: 'Ads & Sponsor Spaces', icon: Megaphone, badge: 'AdSense' }
      ]
    },
    {
      group: 'Distribution & Media',
      items: [
        { id: 'accounts', label: 'Social Accounts', icon: Share2 },
        { id: 'rss', label: 'Website & RSS Feeds', icon: Rss },
        { id: 'media', label: 'Media Studio', icon: ImageIcon },
        { id: 'campaigns', label: 'Campaigns & Recycling', icon: Layers },
      ]
    },
    {
      group: 'Analytics & Account',
      items: [
        { id: 'analytics', label: 'Analytics & Reach', icon: BarChart3 },
        { id: 'notifications', label: 'Notifications', icon: Bell, count: unreadNotifications },
        { id: 'settings-ai', label: 'AI API Keys (BYO)', icon: Key },
        { id: 'settings-ws', label: 'Workspace Settings', icon: Settings },
        { id: 'help', label: 'Help & Docs', icon: HelpCircle },
      ]
    }
  ];

  return (
    <>
      {/* Fixed Mobile Bottom Bar (hidden on md and larger) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-xl px-2 py-1.5 flex items-center justify-around safe-area-bottom">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                isActive 
                  ? 'text-indigo-400 font-bold scale-105' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                {item.count !== undefined && item.count > 0 && (
                  <span className="absolute -top-1.5 -right-2 h-4 min-w-4 px-1 rounded-full bg-indigo-600 text-white text-[9px] font-mono font-bold flex items-center justify-center">
                    {item.count}
                  </span>
                )}
                {item.active && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}

        {/* More Drawer Button */}
        <button
          onClick={() => onToggleDrawer(true)}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-400 hover:text-slate-200 transition-all"
        >
          <Menu className="h-5 w-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">More</span>
        </button>
      </nav>

      {/* Slide-out Mobile Drawer */}
      {isDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            onClick={() => onToggleDrawer(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Panel */}
          <div className="relative w-4/5 max-w-xs bg-slate-950 border-r border-slate-800 h-full flex flex-col justify-between p-4 z-10 overflow-y-auto animate-slideRight">
            
            <div className="space-y-5">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">SocialPilot AI</h3>
                    <p className="text-[10px] text-emerald-400 font-semibold">100% Free Forever</p>
                  </div>
                </div>

                <button
                  onClick={() => onToggleDrawer(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Install PWA Prompt Button */}
              {!isInstalled && (
                <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border border-indigo-500/30 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold">
                    <Download className="h-4 w-4 text-indigo-400" />
                    <span>Install App on Phone</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {isIOS 
                      ? 'Tap Safari Share icon -> "Add to Home Screen" to install native web app.' 
                      : 'Install SocialPilot AI to your home screen for instant 1-tap access.'
                    }
                  </p>
                  {!isIOS && isInstallable && (
                    <button
                      onClick={onInstallApp}
                      className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs text-center shadow-md transition-all"
                    >
                      Install Web App Now
                    </button>
                  )}
                </div>
              )}

              {/* Workspace Badge */}
              {workspace && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <Building2 className="h-4 w-4 text-indigo-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-200 truncate">{workspace.name}</p>
                    <p className="text-[10px] text-emerald-400 font-mono">Plan: Free (Ad-Supported)</p>
                  </div>
                </div>
              )}

              {/* Nav Sections */}
              <div className="space-y-4">
                {allDrawerItems.map((section, idx) => (
                  <div key={idx} className="space-y-1">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                      {section.group}
                    </h4>
                    <div className="space-y-0.5">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentView === item.id;

                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              onNavigate(item.id);
                              onToggleDrawer(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                              isActive
                                ? 'bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/30'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                              <span>{item.label}</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {item.badge && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                                  {item.badge}
                                </span>
                              )}
                              {item.count !== undefined && item.count > 0 && (
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                                  {item.count}
                                </span>
                              )}
                              {item.active && (
                                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Bottom Footer note */}
            <div className="pt-4 border-t border-slate-900 text-center text-[10px] text-slate-400 space-y-1">
              <div className="flex items-center justify-center gap-1 text-emerald-400 font-semibold">
                <ShieldCheck className="h-3 w-3" />
                <span>100% Free Forever</span>
              </div>
              <p>Supported by Sponsor Ads</p>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
