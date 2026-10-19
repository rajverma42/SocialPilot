import React, { useState } from 'react';
import { 
  Key, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Cpu, 
  DollarSign, 
  Trash2,
  Lock
} from 'lucide-react';
import { AiProviderConfig } from '../types';
import { api } from '../services/api';

interface AiSettingsViewProps {
  aiConfig: AiProviderConfig | null;
  onRefreshConfig: () => void;
  workspaceId: string;
}

export const AiSettingsView: React.FC<AiSettingsViewProps> = ({
  aiConfig,
  onRefreshConfig,
  workspaceId
}) => {
  const [rawKeyInput, setRawKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState(aiConfig?.selectedModel || 'gemini-3.8-flash');
  
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    models: string[];
    latencyMs: number;
    error?: string;
  } | null>(null);

  const supportedModels = [
    { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash (Recommended)', desc: 'Fastest generation, ultra-low latency, optimal for high-volume social copywriting.' },
    { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', desc: 'Lightweight, ultra-cost efficient for simple summary hooks.' },
    { id: 'gemini-4-argon', name: 'Gemini 4 Argon', desc: 'Deep reasoning, advanced multi-modal analysis, and complex thought leadership.' }
  ];

  const handleTestKey = async () => {
    setIsValidating(true);
    setValidationResult(null);
    setStatusMessage(null);
    try {
      const res = await api.validateAiKey(rawKeyInput || undefined, workspaceId);
      setValidationResult(res);
      if (res.isValid) {
        setStatusMessage({ text: 'API Key verified successfully! Gemini endpoint responded.' });
      } else {
        setStatusMessage({ text: `Key validation issue: ${res.error || 'Check key quota and permissions'}`, isError: true });
      }
    } catch (err: any) {
      setValidationResult({
        isValid: false,
        models: [],
        latencyMs: 0,
        error: err.message || 'Key validation request failed'
      });
      setStatusMessage({ text: `Validation failed: ${err.message}`, isError: true });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);
    try {
      await api.saveAiConfig({
        workspaceId,
        provider: 'gemini',
        rawApiKey: rawKeyInput || undefined,
        selectedModel
      });
      setRawKeyInput('');
      setValidationResult(null);
      setStatusMessage({ text: 'AI Configuration updated successfully! Your key is securely encrypted on the backend with AES-256-GCM.' });
      onRefreshConfig();
    } catch (err: any) {
      setStatusMessage({ text: `Error saving AI config: ${err.message}`, isError: true });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveKey = async () => {
    setStatusMessage(null);
    try {
      await api.removeAiConfig(workspaceId);
      setStatusMessage({ text: 'Saved AI key removed from this workspace.' });
      onRefreshConfig();
    } catch (err: any) {
      setStatusMessage({ text: `Error removing key: ${err.message}`, isError: true });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Status Banner */}
      {statusMessage && (
        <div className={`p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between gap-2 animate-fadeIn ${
          statusMessage.isError
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
        }`}>
          <div className="flex items-center gap-2">
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Key className="h-6 w-6 text-amber-400" />
          <span>User-Owned AI API Key Management</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Bring your own Google Gemini API key. Zero middleman markup, 100% token quota transparency, and private generation.
        </p>
      </div>

      {/* Security Architecture Notice */}
      <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-900/50 flex items-start gap-3 text-xs text-indigo-300">
        <Lock className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-slate-200">Envelope Encryption & Secret Redaction</h4>
          <p className="leading-relaxed">
            Your key is never stored in browser localStorage or exposed in client bundles. We use server-side envelope encryption with AES-256-GCM. All calls to Gemini are dispatched server-to-server.
          </p>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
        
        {/* Status Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${
              aiConfig?.isValid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              {aiConfig?.isValid ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                {aiConfig?.hasKey ? `Active Key: ${aiConfig.maskedApiKey}` : 'No User Key Configured (Fallback Active)'}
              </p>
              <p className="text-xs text-slate-400">
                Provider: <span className="text-slate-200 font-semibold uppercase">{aiConfig?.provider || 'Gemini'}</span> &bull; 
                Total Generations: <span className="font-mono text-indigo-400 font-bold">{aiConfig?.totalGenerations || 0}</span>
              </p>
            </div>
          </div>

          {aiConfig?.hasKey && (
            <button
              onClick={handleRemoveKey}
              className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Remove Key</span>
            </button>
          )}
        </div>

        <form onSubmit={handleSaveConfig} className="space-y-5">
          
          {/* Key Input Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Gemini API Key
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span>Get a free Gemini Key</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={rawKeyInput}
                onChange={(e) => setRawKeyInput(e.target.value)}
                placeholder={aiConfig?.hasKey ? '•••••••••••••••••••••••• (Leave blank to keep current key)' : 'Paste your AIzaSy... key here'}
                className="w-full pl-3.5 pr-24 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1.5 text-slate-500 hover:text-slate-300 transition"
                  title={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  disabled={isValidating}
                  onClick={handleTestKey}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
                >
                  {isValidating ? <RefreshCw className="h-3 w-3 animate-spin" /> : 'Test'}
                </button>
              </div>
            </div>
          </div>

          {/* Validation Feedback */}
          {validationResult && (
            <div className={`p-4 rounded-xl text-xs space-y-1 ${
              validationResult.isValid
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}>
              <div className="flex items-center gap-2 font-bold">
                {validationResult.isValid ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertTriangle className="h-4 w-4 text-rose-400" />}
                <span>{validationResult.isValid ? 'Key Validated Successfully' : 'Key Validation Failed'}</span>
                {validationResult.isValid && <span className="font-mono text-[10px]">({validationResult.latencyMs}ms)</span>}
              </div>
              {validationResult.error && <p>{validationResult.error}</p>}
            </div>
          )}

          {/* Model Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Default Copywriting Model
            </label>
            <div className="space-y-2">
              {supportedModels.map((m) => (
                <label
                  key={m.id}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                    selectedModel === m.id
                      ? 'bg-indigo-600/15 border-indigo-500 text-slate-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="modelSelection"
                    checked={selectedModel === m.id}
                    onChange={() => setSelectedModel(m.id)}
                    className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-white">{m.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition flex items-center gap-2"
            >
              {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              <span>Save AI Provider Settings</span>
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};
