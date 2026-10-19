import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MarketingSite } from './components/MarketingSite';
import { DashboardView } from './components/DashboardView';
import { GeneratorView } from './components/GeneratorView';
import { CalendarQueueView } from './components/CalendarQueueView';
import { SocialAccountsView } from './components/SocialAccountsView';
import { AutoModeView } from './components/AutoModeView';
import { RssView } from './components/RssView';
import { MediaStudioView } from './components/MediaStudioView';
import { CampaignsView } from './components/CampaignsView';
import { AnalyticsView } from './components/AnalyticsView';
import { AiSettingsView } from './components/AiSettingsView';
import { WorkspaceSettingsView } from './components/WorkspaceSettingsView';
import { HelpView } from './components/HelpView';
import { NotificationModal } from './components/NotificationModal';
import { LegalModals } from './components/LegalModals';
import { AuthModal } from './components/AuthModal';
import { MobileNavigation } from './components/MobileNavigation';
import { usePwaInstall } from './hooks/usePwaInstall';
import { 
  User, 
  Workspace, 
  AiProviderConfig, 
  Post, 
  SocialAccount, 
  FullAutoConfig, 
  AnalyticsSummary, 
  InAppNotification 
} from './types';
import { api } from './services/api';

export default function App() {
  const [isAppMode, setIsAppMode] = useState(true);
  const [currentView, setCurrentView] = useState('overview');

  // Application State with localStorage session persistence
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('socialpilot_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [aiConfig, setAiConfig] = useState<AiProviderConfig | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [autoConfig, setAutoConfig] = useState<FullAutoConfig | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [emergencyPaused, setEmergencyPaused] = useState(false);

  // Modals & Navigation
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | 'deletion' | null>(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  const openAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Cross-device PWA Installation
  const { isInstallable, isInstalled, isIOS, installApp } = usePwaInstall();

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    try {
      localStorage.setItem('socialpilot_user', JSON.stringify(loggedInUser));
      localStorage.removeItem('socialpilot_logged_out');
    } catch {}
    triggerToast(`Welcome, ${loggedInUser.name}! Signed in successfully.`, 'success');
  };

  const handleSignOut = () => {
    try {
      localStorage.removeItem('socialpilot_user');
      localStorage.setItem('socialpilot_logged_out', 'true');
      api.logoutUser().catch(() => {});
    } catch {}
    setUser(null);
    triggerToast('Signed out successfully.', 'info');
  };

  // Fetch initial state
  const refreshAll = async () => {
    try {
      let savedEmail: string | undefined;
      const isLoggedOut = typeof window !== 'undefined' && localStorage.getItem('socialpilot_logged_out') === 'true';
      if (!isLoggedOut) {
        try {
          const stored = localStorage.getItem('socialpilot_user');
          if (stored) {
            const parsed = JSON.parse(stored);
            savedEmail = parsed?.email;
          }
        } catch {}
      }

      const [u, wsList, sys] = await Promise.all([
        savedEmail ? api.getUser(savedEmail) : Promise.resolve(null),
        api.getWorkspaces(),
        api.getSystemSettings()
      ]);

      if (u) {
        setUser(u);
      } else if (isLoggedOut) {
        setUser(null);
      }
      setEmergencyPaused(sys.emergencyPublishingPaused);

      const activeWs = wsList[0] || null;
      setWorkspace(activeWs);

      if (activeWs) {
        const [ai, pList, accList, auto, anal, notifs] = await Promise.all([
          api.getAiConfig(activeWs.id),
          api.getPosts(activeWs.id),
          api.getSocialAccounts(activeWs.id),
          api.getAutoConfig(activeWs.id),
          api.getAnalytics(activeWs.id),
          api.getNotifications(activeWs.id)
        ]);

        setAiConfig(ai);
        setPosts(pList);
        setAccounts(accList);
        setAutoConfig(auto);
        setAnalytics(anal);
        setNotifications(notifs);
      }
    } catch (err) {
      console.error('Error fetching application state:', err);
    }
  };

  useEffect(() => {
    refreshAll();
    // Poll every 25 seconds for background publishing daemon updates
    const timer = setInterval(() => {
      refreshAll();
    }, 25000);
    return () => clearInterval(timer);
  }, []);

  const [appToast, setAppToast] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null);

  const triggerToast = (message: string, type: 'error' | 'success' | 'info' = 'info') => {
    setAppToast({ message, type });
    setTimeout(() => {
      setAppToast(curr => (curr?.message === message ? null : curr));
    }, 6000);
  };

  const handleToggleEmergencyPause = async () => {
    try {
      const res = await api.toggleEmergencyPause();
      setEmergencyPaused(res.emergencyPublishingPaused);
      triggerToast(
        res.emergencyPublishingPaused ? 'All publishing paused globally (Safety lock active).' : 'Publishing safety pause lifted. Scheduled queue resumed.',
        res.emergencyPublishingPaused ? 'info' : 'success'
      );
      refreshAll();
    } catch (err: any) {
      triggerToast(`Failed to toggle emergency pause: ${err.message}`, 'error');
    }
  };

  const handlePublishNow = async (postId: string) => {
    try {
      await api.publishPostNow(postId);
      triggerToast('Post published live successfully!', 'success');
      refreshAll();
    } catch (err: any) {
      triggerToast(`Publishing failed: ${err.message}`, 'error');
    }
  };

  const handleMarkNotificationsRead = async () => {
    if (!workspace) return;
    try {
      await api.markNotificationsRead(workspace.id);
      refreshAll();
    } catch (err) {
      console.error('Error marking notifications read:', err);
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;
  const queueCount = posts.filter(p => p.status === 'scheduled' || p.status === 'queued').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative">
      
      {/* Toast Notification Banner */}
      {appToast && (
        <div className="fixed top-16 right-4 z-50 max-w-md transition-all">
          <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md ${
            appToast.type === 'error'
              ? 'bg-rose-950/90 border-rose-700/50 text-rose-200'
              : appToast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-700/50 text-emerald-200'
              : 'bg-indigo-950/90 border-indigo-700/50 text-indigo-200'
          }`}>
            <span className="text-sm font-medium flex-1 leading-snug">{appToast.message}</span>
            <button
              type="button"
              onClick={() => setAppToast(null)}
              className="text-xs px-2 py-0.5 rounded hover:bg-white/10 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        workspace={workspace}
        user={user}
        aiConfig={aiConfig}
        emergencyPaused={emergencyPaused}
        onToggleEmergencyPause={handleToggleEmergencyPause}
        unreadCount={unreadNotifications}
        onOpenNotifications={() => setIsNotifModalOpen(true)}
        isAppMode={isAppMode}
        onToggleAppMode={setIsAppMode}
        onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
        onInstallApp={installApp}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        onOpenAuthModal={(mode) => openAuthModal(mode || 'signin')}
        onSignOut={handleSignOut}
      />

      {/* Main Container */}
      {!isAppMode ? (
        <MarketingSite
          onLaunchApp={() => {
            setIsAppMode(true);
            setCurrentView('overview');
          }}
          onOpenLegal={setLegalModal}
          onOpenAuthModal={(mode) => openAuthModal(mode || 'signup')}
          onInstallApp={installApp}
          isInstallable={isInstallable}
        />
      ) : (
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Sidebar */}
          <Sidebar
            currentView={currentView}
            onNavigate={setCurrentView}
            queueCount={queueCount}
            autoModeActive={autoConfig?.enabled ?? false}
            unreadNotifications={unreadNotifications}
            aiKeyConfigured={Boolean(aiConfig?.hasKey && aiConfig.isValid)}
          />

          {/* Center Main View Area with Mobile Safe Padding */}
          <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 pb-32 sm:pb-28 md:pb-8">
            <div className="max-w-7xl mx-auto">
              
              {currentView === 'overview' && (
                <DashboardView
                  onNavigate={setCurrentView}
                  analytics={analytics}
                  posts={posts}
                  accounts={accounts}
                  aiConfig={aiConfig}
                  onPublishNow={handlePublishNow}
                  emergencyPaused={emergencyPaused}
                />
              )}

              {currentView === 'generator' && (
                <GeneratorView
                  onPostCreated={() => {
                    refreshAll();
                    setCurrentView('calendar');
                  }}
                  workspaceId={workspace?.id || 'ws-default-01'}
                  hasAiKey={Boolean(aiConfig?.hasKey)}
                  onNavigateToSettings={() => setCurrentView('settings-ai')}
                />
              )}

              {currentView === 'auto-mode' && (
                <AutoModeView
                  autoConfig={autoConfig}
                  onRefreshConfig={refreshAll}
                  workspaceId={workspace?.id || 'ws-default-01'}
                  hasAiKey={Boolean(aiConfig?.hasKey)}
                  onNavigateToSettings={() => setCurrentView('settings-ai')}
                />
              )}

              {currentView === 'calendar' && (
                <CalendarQueueView
                  posts={posts}
                  onRefreshPosts={refreshAll}
                  timezone={workspace?.timezone || 'Asia/Kolkata'}
                />
              )}

              {currentView === 'accounts' && (
                <SocialAccountsView
                  accounts={accounts}
                  onRefresh={refreshAll}
                  workspaceId={workspace?.id || 'ws-default-01'}
                />
              )}

              {currentView === 'rss' && (
                <RssView
                  workspaceId={workspace?.id || 'ws-default-01'}
                  onPostCreated={() => {
                    refreshAll();
                    setCurrentView('calendar');
                  }}
                  onNavigateToQueue={() => setCurrentView('calendar')}
                />
              )}

              {currentView === 'media' && (
                <MediaStudioView
                  workspaceId={workspace?.id || 'ws-default-01'}
                />
              )}

              {currentView === 'campaigns' && (
                <CampaignsView
                  workspaceId={workspace?.id || 'ws-default-01'}
                  posts={posts}
                  onRefreshPosts={refreshAll}
                />
              )}

              {currentView === 'analytics' && (
                <AnalyticsView
                  analytics={analytics}
                />
              )}

              {currentView === 'notifications' && (
                <div className="space-y-4 max-w-3xl">
                  <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-white">Notifications</h1>
                    <button
                      onClick={handleMarkNotificationsRead}
                      className="text-xs text-indigo-400 font-semibold"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="space-y-2">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200">{n.title}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(n.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-400">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentView === 'settings-ai' && (
                <AiSettingsView
                  aiConfig={aiConfig}
                  onRefreshConfig={refreshAll}
                  workspaceId={workspace?.id || 'ws-default-01'}
                />
              )}

              {currentView === 'settings-ws' && (
                <WorkspaceSettingsView
                  workspace={workspace}
                  onRefreshWorkspace={refreshAll}
                  emergencyPaused={emergencyPaused}
                  onToggleEmergencyPause={handleToggleEmergencyPause}
                />
              )}

              {currentView === 'help' && (
                <HelpView />
              )}

            </div>
          </main>

        </div>
      )}

      {/* Mobile Bottom Navigation & Drawer */}
      {isAppMode && (
        <MobileNavigation
          currentView={currentView}
          onNavigate={setCurrentView}
          isDrawerOpen={isMobileDrawerOpen}
          onToggleDrawer={setIsMobileDrawerOpen}
          queueCount={queueCount}
          autoModeActive={autoConfig?.enabled ?? false}
          unreadNotifications={unreadNotifications}
          workspace={workspace}
          onInstallApp={installApp}
          isInstallable={isInstallable}
          isInstalled={isInstalled}
          isIOS={isIOS}
        />
      )}

      {/* In-App Notifications Modal */}
      <NotificationModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkNotificationsRead}
        onNavigate={setCurrentView}
      />

      {/* Legal & Compliance Modals */}
      <LegalModals
        activeModal={legalModal}
        onClose={() => setLegalModal(null)}
      />

      {/* Full Professional User Authentication & Login Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );
}
