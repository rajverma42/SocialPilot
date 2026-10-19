import React, { useState } from 'react';
import { 
  Settings, 
  Globe, 
  ShieldAlert, 
  Download, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Building2,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { Workspace } from '../types';
import { api } from '../services/api';

interface WorkspaceSettingsViewProps {
  workspace: Workspace | null;
  onRefreshWorkspace: () => void;
  emergencyPaused: boolean;
  onToggleEmergencyPause: () => void;
}

export const WorkspaceSettingsView: React.FC<WorkspaceSettingsViewProps> = ({
  workspace,
  onRefreshWorkspace,
  emergencyPaused,
  onToggleEmergencyPause
}) => {
  const [name, setName] = useState(workspace?.name || 'Velocity Tech Media');
  const [timezone, setTimezone] = useState(workspace?.timezone || 'Asia/Kolkata');
  const [defaultLanguage, setDefaultLanguage] = useState(workspace?.defaultLanguage || 'English');
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Berlin',
    'Europe/Paris',
    'Asia/Kolkata',
    'Asia/Dubai',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Australia/Sydney'
  ];

  const languages = ['English', 'Hindi', 'Hinglish', 'Spanish', 'French', 'German', 'Japanese'];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace) return;
    setIsSaving(true);
    try {
      await api.updateWorkspace(workspace.id, {
        name,
        timezone,
        defaultLanguage
      });
      setStatusMessage('Workspace preferences saved successfully.');
      onRefreshWorkspace();
    } catch (err: any) {
      setStatusMessage(`Error updating workspace: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      await api.exportAccountData(workspace?.id);
      setStatusMessage('Workspace records downloaded successfully.');
    } catch (err: any) {
      setStatusMessage(`Export error: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.deleteAccountData(workspace?.id);
      setStatusMessage('Workspace data purged. Reloading...');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      setStatusMessage(`Deletion error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-indigo-400" />
          <span>Workspace & Governance Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure time-zones, publication limits, safety emergency controls, and GDPR data export.
        </p>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 100% Free Subscription Plan Details */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/70 to-indigo-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold uppercase text-[10px] tracking-wider border border-emerald-500/30">
              100% Free Forever Plan
            </span>
            <span className="text-xs text-slate-400">All Devices Supported</span>
          </div>
          <h3 className="text-base font-bold text-white mt-1">
            Enterprise Features Fully Unlocked
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Zero subscription fees. All features (Full Auto, Durable Queue, RSS, AI Studio) are 100% free forever.
          </p>
        </div>

        <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-emerald-400 font-bold font-mono shrink-0">
          $0 / Unlimited Free
        </div>
      </div>

      {/* Main Form */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
        
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Workspace Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Primary Publication Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              >
                {timezones.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Default Content Language
            </label>
            <select
              value={defaultLanguage}
              onChange={(e) => setDefaultLanguage(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition flex items-center gap-2"
          >
            {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            <span>Save Preferences</span>
          </button>
        </form>

        {/* Emergency Stop Switch */}
        <div className="pt-6 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-400" />
                <span>Emergency Publishing Pause</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Instantly freeze all scheduled queues and autonomous background workers across all channels.
              </p>
            </div>

            <button
              onClick={onToggleEmergencyPause}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                emergencyPaused
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {emergencyPaused ? 'RESUME PUBLISHING' : 'TRIGGER EMERGENCY STOP'}
            </button>
          </div>
        </div>

        {/* Data Governance & Account Export */}
        <div className="pt-6 border-t border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Data Portability & GDPR Compliance</h3>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <p className="text-xs font-bold text-slate-200">Export All Workspace Records</p>
              <p className="text-[11px] text-slate-400">Download complete JSON archive of all posts, campaigns, feeds, and analytics.</p>
            </div>
            <button
              disabled={isExporting}
              onClick={handleExportData}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{isExporting ? 'Exporting...' : 'Export JSON'}</span>
            </button>
          </div>

          {/* Danger Zone: Account Deletion */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-rose-950/20 border border-rose-900/40">
            <div>
              <p className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                <span>Danger Zone: Permanent Workspace Deletion</span>
              </p>
              <p className="text-[11px] text-rose-300/80">Irreversibly erase all posts, credentials, and scheduled jobs.</p>
            </div>
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="px-4 py-2 rounded-xl bg-rose-900/60 hover:bg-rose-600 text-rose-200 hover:text-white text-xs font-semibold transition shrink-0 border border-rose-800"
              >
                Purge Workspace
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
