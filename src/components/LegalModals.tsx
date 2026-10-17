import React from 'react';
import { X, ShieldCheck, FileText, Trash2 } from 'lucide-react';

interface LegalModalsProps {
  activeModal: 'privacy' | 'terms' | 'deletion' | null;
  onClose: () => void;
}

export const LegalModals: React.FC<LegalModalsProps> = ({ activeModal, onClose }) => {
  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {activeModal === 'privacy' && <ShieldCheck className="h-5 w-5 text-indigo-400" />}
            {activeModal === 'terms' && <FileText className="h-5 w-5 text-indigo-400" />}
            {activeModal === 'deletion' && <Trash2 className="h-5 w-5 text-rose-400" />}
            <h3 className="font-bold text-white text-base">
              {activeModal === 'privacy' && 'Privacy Policy & Data Processing'}
              {activeModal === 'terms' && 'Terms of Service & Acceptable Use'}
              {activeModal === 'deletion' && 'Account & Data Deletion Procedure'}
            </h3>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
          
          {activeModal === 'privacy' && (
            <>
              <p className="font-semibold text-slate-200">Last updated: October 2026</p>
              <h4 className="font-bold text-white text-sm">1. User-Owned AI Keys and Data Ownership</h4>
              <p>
                SocialPilot AI operates on a Bring-Your-Own-Key (BYOK) paradigm. When you configure your Google Gemini API key, your prompts and content are transmitted directly between our secure application backend and Google's official API servers. We never sell, train upon, or lease your intellectual property or social media post drafts.
              </p>
              <h4 className="font-bold text-white text-sm">2. Envelope Encryption</h4>
              <p>
                API keys and OAuth tokens are protected via server-side envelope encryption utilizing AES-256-GCM. Plaintext secrets are never stored in browser cookies, session storage, or client JavaScript bundles.
              </p>
              <h4 className="font-bold text-white text-sm">3. Platform Compliance</h4>
              <p>
                We access social media accounts strictly via authorized official APIs (including Telegram Bot API, Meta Graph API, and Twitter API v2). We do not collect account passwords or employ unauthorized scraping mechanisms.
              </p>
            </>
          )}

          {activeModal === 'terms' && (
            <>
              <p className="font-semibold text-slate-200">Last updated: October 2026</p>
              <h4 className="font-bold text-white text-sm">1. Authorized Social Media Automation</h4>
              <p>
                Users agree to utilize SocialPilot AI in compliance with all relevant social media platform terms of service and community guidelines. Spamming, impersonation, hate speech, and deceptive mass generation are strictly prohibited.
              </p>
              <h4 className="font-bold text-white text-sm">2. AI Provider Billing & Quotas</h4>
              <p>
                Users acknowledge that they are directly responsible for any billing, quotas, or service limitations incurred under their personal AI provider accounts (e.g. Google Gemini API). SocialPilot AI charges only for platform automation, durable workers, and queue orchestration.
              </p>
              <h4 className="font-bold text-white text-sm">3. Limitation of Liability</h4>
              <p>
                SocialPilot AI makes best-effort attempts to publish scheduled content according to configured timezones. In the event of third-party platform API outages, network partitions, or revoked token credentials, retry policies are executed without guarantee of third-party acceptance.
              </p>
            </>
          )}

          {activeModal === 'deletion' && (
            <>
              <h4 className="font-bold text-white text-sm">Right to Erasure (GDPR / CCPA)</h4>
              <p>
                You retain full sovereign control over your data. You may request immediate deletion of all workspace records, posts, media assets, credentials, and scheduled jobs at any time directly through the Workspace Settings tab.
              </p>
              <h4 className="font-bold text-white text-sm">Revoking AI and Platform Keys</h4>
              <p>
                Removing an API key or social channel from SocialPilot AI deletes the encrypted token from our database immediately. To invalidate the credentials at the source:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>For Gemini: Revoke or rotate the key in Google AI Studio or Google Cloud Console.</li>
                <li>For Telegram: Message @BotFather on Telegram and use /revoke on your bot.</li>
                <li>For OAuth channels: Remove application permissions in your connected account security settings.</li>
              </ul>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
