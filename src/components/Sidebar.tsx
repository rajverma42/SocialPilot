import React from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  Zap, 
  Calendar, 
  Share2, 
  Rss, 
  Image as ImageIcon, 
  Layers, 
  BarChart3, 
  Bell, 
  Key, 
  Settings, 
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Megaphone
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  activePill?: boolean;
  count?: number;
  statusIcon?: React.ComponentType<{ className?: string }>;
  statusColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  queueCount: number;
  autoModeActive: boolean;
  unreadNotifications: number;
  aiKeyConfigured: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  queueCount,
  autoModeActive,
  unreadNotifications,
  aiKeyConfigured
}) => {
  const navSections: NavSection[] = [
    {
      title: 'Core Engine',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'generator', label: 'AI Content Studio', icon: Sparkles, badge: 'Smart' },
        { id: 'auto-mode', label: 'Full Auto Mode', icon: Zap, activePill: autoModeActive },
        { id: 'calendar', label: 'Calendar & Queue', icon: Calendar, count: queueCount },
      ]
    },
    {
      title: 'Distribution & Assets',
      items: [
        { id: 'accounts', label: 'Social Accounts', icon: Share2 },
        { id: 'rss', label: 'Website & RSS Feeds', icon: Rss },
        { id: 'media', label: 'Media Studio', icon: ImageIcon },
        { id: 'campaigns', label: 'Campaigns & Recycling', icon: Layers },
      ]
    },
    {
      title: 'Intelligence & Growth',
      items: [
        { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
        { id: 'ads', label: 'Ads & Sponsor Spaces', icon: Megaphone, badge: 'AdSense' },
        { id: 'notifications', label: 'Notifications', icon: Bell, count: unreadNotifications },
      ]
    },
    {
      title: 'Configuration',
      items: [
        { 
          id: 'settings-ai', 
          label: 'AI API Keys (BYO)', 
          icon: Key, 
          statusIcon: aiKeyConfigured ? CheckCircle2 : AlertTriangle,
          statusColor: aiKeyConfigured ? 'text-emerald-400' : 'text-amber-400'
        },
        { id: 'settings-ws', label: 'Workspace Settings', icon: Settings },
        { id: 'help', label: 'Help & API Docs', icon: HelpCircle },
      ]
    }
  ];

  return (
    <aside className="hidden md:flex w-64 shrink-0 border-r border-slate-800 bg-slate-950/90 flex-col justify-between h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="p-4 space-y-6">
        
        {/* Navigation Sections */}
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              {section.title}
            </h3>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                const StatusIcon = (item as any).statusIcon;

                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600/15 text-indigo-400 font-semibold border border-indigo-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {item.badge}
                        </span>
                      )}

                      {item.activePill !== undefined && (
                        <span className={`h-2 w-2 rounded-full ${item.activePill ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                      )}

                      {item.count !== undefined && item.count > 0 && (
                        <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {item.count}
                        </span>
                      )}

                      {StatusIcon && (
                        <StatusIcon className={`h-3.5 w-3.5 ${(item as any).statusColor}`} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

      </div>

      {/* Scheduler Engine Worker Status Card */}
      <div className="p-4 border-t border-slate-900">
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-3 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-indigo-400" />
              Scheduler Daemon
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              ACTIVE
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Durable backend worker is running. Jobs publish even when this window is closed.
          </p>
        </div>
      </div>
    </aside>
  );
};
