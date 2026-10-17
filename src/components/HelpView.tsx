import React from 'react';
import { HelpCircle, BookOpen, Key, Bot, Shield, ExternalLink, Code } from 'lucide-react';

export const HelpView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <HelpCircle className="h-6 w-6 text-indigo-400" />
          <span>Documentation & Architecture Guide</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Technical specifications, BYO Gemini key setup, official social API integrations, and durable worker lifecycle.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Card 1: Gemini Keys */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Key className="h-4 w-4" />
            <span>Setting Up Your Gemini Key</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            1. Visit Google AI Studio (<a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-indigo-400 underline">aistudio.google.com</a>).<br />
            2. Click "Create API Key" and select your Google Cloud project.<br />
            3. Paste it in <b>AI API Keys (BYO)</b> in the sidebar.<br />
            4. Click "Test" to verify connectivity and quota latency.
          </p>
        </div>

        {/* Card 2: Telegram Bot Integration */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <Bot className="h-4 w-4" />
            <span>Real Telegram Bot Publishing</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            1. Message <b>@BotFather</b> on Telegram and send <code>/newbot</code>.<br />
            2. Give your bot a name and username, then copy the HTTP Token.<br />
            3. Add the bot as an Administrator to your Telegram Channel.<br />
            4. Enter the token and channel handle in <b>Social Accounts</b>.
          </p>
        </div>

        {/* Card 3: Durable Background Daemon */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Shield className="h-4 w-4" />
            <span>24/7 Publishing Daemon</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The publishing engine runs as an authoritative background loop inside the Express server. It polls pending jobs every 20 seconds, respects idempotency locks, and broadcasts on time even when your browser tab or laptop is closed.
          </p>
        </div>

        {/* Card 4: Full Auto Mode */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <BookOpen className="h-4 w-4" />
            <span>Autonomous Mode vs Approval Mode</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            <b>Mode B (Approval Required):</b> AI drafts posts automatically on schedule, holding them until you click "Approve".<br />
            <b>Mode C (Full Auto):</b> AI generates and immediately schedules direct publication to authorized channels.
          </p>
        </div>

      </div>

      {/* REST API Endpoints Table */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Code className="h-4 w-4 text-indigo-400" />
          <span>Core REST API Endpoints</span>
        </h3>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500">
                <th className="py-2 pr-4">Method</th>
                <th className="py-2 pr-4">Endpoint</th>
                <th className="py-2">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-slate-300">
              <tr>
                <td className="py-2 pr-4 text-emerald-400 font-bold">POST</td>
                <td className="py-2 pr-4">/api/ai/generate-post</td>
                <td className="py-2 font-sans text-slate-400">Synthesizes multi-platform native content using Gemini</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-indigo-400 font-bold">GET</td>
                <td className="py-2 pr-4">/api/posts</td>
                <td className="py-2 font-sans text-slate-400">Retrieves scheduled, queued, or published posts</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-emerald-400 font-bold">POST</td>
                <td className="py-2 pr-4">/api/posts/:id/publish-now</td>
                <td className="py-2 font-sans text-slate-400">Dispatches immediate broadcast through official adapters</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-emerald-400 font-bold">POST</td>
                <td className="py-2 pr-4">/api/auto-mode/run-now</td>
                <td className="py-2 font-sans text-slate-400">Triggers an autonomous generation and scheduling cycle</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-rose-400 font-bold">POST</td>
                <td className="py-2 pr-4">/api/system/toggle-emergency-pause</td>
                <td className="py-2 font-sans text-slate-400">Emergency pause switch to halt all scheduled publishing</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
