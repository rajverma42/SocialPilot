import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Key, 
  Share2, 
  Clock, 
  Zap, 
  ShieldCheck, 
  Check, 
  Layers, 
  Rss, 
  ChevronRight, 
  HelpCircle,
  Play,
  Send,
  RefreshCw,
  ExternalLink,
  Lock,
  Globe,
  DollarSign,
  Gift,
  Download,
  Smartphone
} from 'lucide-react';
import { SocialPlatform } from '../types';

interface MarketingSiteProps {
  onLaunchApp: () => void;
  onOpenLegal: (modal: 'privacy' | 'terms' | 'deletion') => void;
  onInstallApp?: () => void;
  isInstallable?: boolean;
  onOpenAuthModal?: (mode?: 'signin' | 'signup') => void;
}

export const MarketingSite: React.FC<MarketingSiteProps> = ({ 
  onLaunchApp, 
  onOpenLegal,
  onInstallApp,
  isInstallable,
  onOpenAuthModal
}) => {
  // Interactive demo playground state
  const [demoTopic, setDemoTopic] = useState('Why Autonomous AI Agents Are Outpacing Traditional Automation');
  const [demoPlatform, setDemoPlatform] = useState<SocialPlatform>('x');
  const [isGeneratingDemo, setIsGeneratingDemo] = useState(false);
  const [demoOutput, setDemoOutput] = useState({
    x: 'AI agents in 2026 do not just answer questions—they execute multi-step microservices, recover from errors, and deploy code autonomously.\n\nThe real leverage is in autonomous workflows. What routine tasks did your team automate this month?\n\n#AIAgents #Automation #SaaS',
    linkedin: 'For 3 years, enterprise AI was primarily "chat with your docs".\n\nIn 2026, the paradigm has inverted:\n• Agents orchestrate distributed tools with durable locks.\n• Autonomous retry budgets prevent drift.\n• Human approval acts as an escalation gate, not a bottleneck.\n\nThe competitive gap will be defined by workflow autonomy.\n\n#EnterpriseAI #FutureOfWork #Productivity #Technology',
    telegram: '🚀 <b>Autonomous AI Agents: The Next Paradigm</b>\n\nChatbots are out. Self-healing agents with multi-tool execution are in:\n• Direct API calls\n• Automated status retries\n• Zero-human routine pipelines\n\nRead our breakdown in the channel!',
    instagram: 'The shift from conversational AI to autonomous execution is the biggest unlock of 2026. 🔥\n\nSwipe to see how modern engineering teams are deploying autonomous agents to handle repetitive workflows while founders focus on strategy.\n\nDrop your thoughts below! 👇\n\n#TechTrends #AIAutomation #FutureOfWork #Developers #SaaS'
  });

  const handleRunDemo = () => {
    setIsGeneratingDemo(true);
    setTimeout(() => {
      setIsGeneratingDemo(false);
    }, 600);
  };

  const platforms = [
    { id: 'telegram', name: 'Telegram', status: 'Live Official API', tag: 'Real Bot Publishing', desc: 'Direct channel & group broadcasting via Telegram Bot API' },
    { id: 'x', name: 'X (Twitter)', status: 'Live API Supported', tag: '<280 Chars Native', desc: 'Punchy text hooks with character countdown enforcement' },
    { id: 'linkedin', name: 'LinkedIn', status: 'Official API Ready', tag: 'B2B Thought Leadership', desc: 'Formatted articles, spacing, bullet lists, and company updates' },
    { id: 'instagram', name: 'Instagram', status: 'Professional Graph API', tag: 'Reels & Carousels', desc: 'Aesthetic captions, curated hashtag blocks, and media specs' },
    { id: 'facebook', name: 'Facebook Pages', status: 'Graph API V20', tag: 'Page Posts', desc: 'Conversational posts with link previews and community prompts' },
    { id: 'youtube', name: 'YouTube', status: 'Data API v3 Ready', tag: 'Titles & SEO Tags', desc: 'High-CTR titles, timestamps, and search-optimized descriptions' },
    { id: 'pinterest', name: 'Pinterest', status: 'Pins API Ready', tag: '2:3 Aspect Ratio', desc: 'Rich pin descriptions, destination links, and board tags' },
    { id: 'tiktok', name: 'TikTok', status: 'Creator API Ready', tag: 'Video Hooks', desc: 'Short-form scripts, hook lines, sound vibe tags' }
  ];

  const pricingTiers = [
    {
      name: 'Free Creator',
      price: '$0',
      period: 'forever',
      description: 'Zero cost forever. Ideal for creators, solo makers, and social media influencers.',
      features: [
        'Bring your own Gemini API key (0% markup)',
        'Unlimited Connected Social Accounts',
        'Unlimited Scheduled Posts & Queue slots',
        'Topic-to-Multi-Platform AI Studio',
        'Real-time Telegram Bot & Graph API publishing',
        'Durable 24/7 background scheduler daemon'
      ],
      cta: 'Start Free Forever',
      popular: false
    },
    {
      name: 'Free Pro & Automation',
      price: '$0',
      period: 'forever',
      description: 'All advanced features unlocked for growing brands and high-volume publishers.',
      features: [
        '100% Free with zero subscription fees',
        'Full Auto Mode with autonomous publishing',
        'RSS & Website Feed Auto-Summarization',
        'Media Studio with aspect ratio presets',
        'Campaign Manager & CSV import/export',
        'Emergency Kill Switch & Safety Governance'
      ],
      cta: 'Launch Free Pro Features',
      popular: true
    },
    {
      name: 'Teams & Agencies',
      price: '$0',
      period: 'forever',
      description: 'Multi-workspace client management with collaborative approvals.',
      features: [
        'Unlimited Workspaces & Team Members',
        'Multi-channel synchronized queues',
        'High-throughput background daemon workers',
        'Multi-device responsive layouts (PWA & Desktop)',
        'Real-time delivery & audience reach analytics',
        'Zero credit card or billing ever required'
      ],
      cta: 'Access Teams Free',
      popular: false
    }
  ];

  const faqs = [
    {
      q: 'Why does SocialPilot AI use "User-Owned AI API Keys"?',
      a: 'Traditional social SaaS platforms markup AI generation tokens by 400% to 1000% or impose tight monthly word limits. By bringing your own free or paid Google Gemini API key, you pay exactly provider direct pricing (or use Google\'s generous free tier) with zero markup, maximum rate limits, and full data privacy.'
    },
    {
      q: 'Will posts publish if my computer is turned off or browser is closed?',
      a: 'Yes, absolutely. Publishing is handled by a persistent, durable Node.js background scheduler daemon running on the server. Your scheduled jobs are saved in a durable database with lease locks and idempotency keys, guaranteeing publication at the exact scheduled UTC timestamp.'
    },
    {
      q: 'How does real Telegram channel publishing work?',
      a: 'Telegram provides a robust, official Bot API. You create a bot in seconds with @BotFather, invite it as an admin to your Telegram channel or group, and add the bot token and channel handle. SocialPilot AI directly communicates with api.telegram.org to broadcast your posts and photos with HTML formatting.'
    },
    {
      q: 'Can I review posts before they are published in Full Auto Mode?',
      a: 'Yes! Full Auto provides two modes: Mode B (Approval Required), where posts are generated autonomously according to your niche and schedule but hold in an "Awaiting Approval" state until you one-click approve them; and Mode C (Full Auto), which publishes directly to your channels. You can toggle between them or trigger an Emergency Pause anytime.'
    },
    {
      q: 'Is my Gemini API Key safe?',
      a: 'Your API key is never exposed in client-side JavaScript bundles, never sent to third parties, and masked immediately upon input. Server-side envelope encryption protects stored credentials and all Gemini requests are made server-to-server with official headers.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/20 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[300px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-8 animate-fade-in flex-wrap justify-center">
            <Sparkles className="h-3.5 w-3.5" />
            <span>100% Free Forever</span>
            <span className="h-1 w-1 rounded-full bg-emerald-400" />
            <span>All Devices Supported (PWA)</span>
            <span className="h-1 w-1 rounded-full bg-emerald-400" />
            <span className="font-mono text-indigo-300">Open Creator Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            One Topic. Every Platform. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              100% Free Forever.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Eliminate hours of manual rewriting. Turn a single topic or RSS feed into tailored, native posts for X, LinkedIn, Telegram, Instagram, and YouTube. All features unlocked completely free.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 flex-wrap">
            {onOpenAuthModal && (
              <button
                onClick={() => onOpenAuthModal('signup')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-bold text-base shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                <span>Create 100% Free Account</span>
              </button>
            )}

            <button
              onClick={onLaunchApp}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white hover:border-slate-500 font-semibold text-base transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Launch Studio & WebApp</span>
              <ArrowRight className="h-4 w-4 text-indigo-400" />
            </button>

            {onOpenAuthModal && (
              <button
                onClick={() => onOpenAuthModal('signin')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/80 border border-indigo-500/30 text-indigo-300 hover:text-white hover:border-indigo-500 font-semibold text-base transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <span>User Login / Sign In</span>
              </button>
            )}

            {isInstallable && onInstallApp && (
              <button
                onClick={onInstallApp}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600 hover:text-white font-semibold text-base transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Download className="h-4 w-4 text-emerald-400" />
                <span>Install App (PWA)</span>
              </button>
            )}

            <a
              href="#interactive-demo"
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 font-medium text-sm transition-all flex items-center justify-center gap-2"
            >
              <Play className="h-3.5 w-3.5 text-indigo-400 fill-indigo-400" />
              <span>Try Live Demo</span>
            </a>
          </div>

          {/* Value Props Bar */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <Key className="h-5 w-5 text-amber-400 mb-2" />
              <h4 className="text-sm font-semibold text-slate-200">User-Owned Keys</h4>
              <p className="text-xs text-slate-400 mt-1">Zero token markup. Use your own Gemini key.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <Clock className="h-5 w-5 text-indigo-400 mb-2" />
              <h4 className="text-sm font-semibold text-slate-200">Durable Daemon</h4>
              <p className="text-xs text-slate-400 mt-1">Publishes on schedule even if browser is shut.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <Zap className="h-5 w-5 text-emerald-400 mb-2" />
              <h4 className="text-sm font-semibold text-slate-200">Full Auto Mode</h4>
              <p className="text-xs text-slate-400 mt-1">Set topic niche, frequency, and let AI post.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <ShieldCheck className="h-5 w-5 text-purple-400 mb-2" />
              <h4 className="text-sm font-semibold text-slate-200">Official APIs</h4>
              <p className="text-xs text-slate-400 mt-1">Authorized Telegram Bot & official OAuth adapters.</p>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Demonstration Section */}
      <section id="interactive-demo" className="py-16 bg-slate-900/40 border-y border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Experience the Topic Engine in Action
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-400">
              See how a single idea is dynamically synthesized into platform-native formats respecting each destination's constraints.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl">
            
            {/* Input Column */}
            <div className="lg:col-span-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Input Topic or Headline
                </label>
                <textarea
                  rows={4}
                  value={demoTopic}
                  onChange={(e) => setDemoTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                  placeholder="E.g., Launching our autonomous AI workflow automation platform..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Language</label>
                  <div className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                    English (or Hindi/Hinglish)
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Tone</label>
                  <div className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                    Authoritative & Tactical
                  </div>
                </div>
              </div>

              <button
                onClick={handleRunDemo}
                disabled={isGeneratingDemo}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30"
              >
                {isGeneratingDemo ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Synthesizing Native Variations...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Synthesize Multi-Platform Post</span>
                  </>
                )}
              </button>

              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-900/40 text-xs text-indigo-300 flex items-start gap-2">
                <Key className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <p>
                  In the full app, generations use your own Gemini API key for complete transparency and infinite scale.
                </p>
              </div>
            </div>

            {/* Output Preview Column */}
            <div className="lg:col-span-7 flex flex-col border border-slate-800 rounded-xl bg-slate-900/60 p-4">
              
              {/* Platform Selector Tabs */}
              <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3 overflow-x-auto">
                {(['x', 'linkedin', 'telegram', 'instagram'] as SocialPlatform[]).map((plat) => (
                  <button
                    key={plat}
                    onClick={() => setDemoPlatform(plat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                      demoPlatform === plat
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {plat === 'x' ? 'X (Twitter)' : plat}
                  </button>
                ))}
              </div>

              {/* Native Post Display */}
              <div className="mt-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">
                      {demoPlatform === 'x' && 'Twitter Native Card (<280 Chars)'}
                      {demoPlatform === 'linkedin' && 'LinkedIn Professional Post'}
                      {demoPlatform === 'telegram' && 'Telegram HTML Channel Broadcast'}
                      {demoPlatform === 'instagram' && 'Instagram Caption & Hashtags'}
                    </span>
                    <span className="font-mono text-emerald-400 text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Format Validated
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                    {(demoOutput as any)[demoPlatform] || demoOutput.x}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Character Count: <span className="text-slate-200 font-mono font-bold">{((demoOutput as any)[demoPlatform] || '').length}</span>
                  </span>
                  <button
                    onClick={onLaunchApp}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <span>Open in AI Studio</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Supported Platforms Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Built for Official Social APIs
          </h2>
          <p className="mt-3 text-slate-400">
            Never risk account bans with unofficial browser scrapers. We integrate through legitimate authorized endpoints with real status validation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {platforms.map((p) => (
            <div key={p.id} className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-white text-base">{p.name}</h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    {p.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {p.desc}
                </p>
              </div>
              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-indigo-400 font-medium">
                <span>{p.tag}</span>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 100% Free Access Model Section */}
      <section className="py-20 bg-slate-900/30 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider mb-4">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>100% Free Forever · No Hidden Fees</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Enterprise Social Automation. $0 for Everyone.
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed">
              No credit cards. No monthly subscriptions. No paywalled features. SocialPilot AI is completely free across all devices, empowering creators and agencies worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier) => (
              <div 
                key={tier.name}
                className={`rounded-2xl p-7 flex flex-col justify-between transition-all ${
                  tier.popular
                    ? 'bg-slate-900 border-2 border-emerald-500 shadow-xl shadow-emerald-500/10 relative scale-105'
                    : 'bg-slate-900/40 border border-slate-800'
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-bold uppercase tracking-wider shadow">
                    All Pro Features Free
                  </span>
                )}

                <div>
                  <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 mb-4">{tier.description}</p>
                  
                  <div className="flex items-baseline gap-1 my-4">
                    <span className="text-4xl font-extrabold text-white font-mono">{tier.price}</span>
                    <span className="text-xs text-emerald-400 font-semibold font-mono">/{tier.period}</span>
                  </div>

                  <div className="border-t border-slate-800 pt-4 space-y-2.5">
                    {tier.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onOpenAuthModal ? onOpenAuthModal('signup') : onLaunchApp()}
                  className={`mt-8 w-full py-3 rounded-xl font-semibold text-sm transition ${
                    tier.popular
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  {tier.cta}
                </button>

              </div>
            ))}
          </div>

          {/* Open Creator Architecture Explainer */}
          <div className="mt-14 max-w-3xl mx-auto p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900/70 to-purple-950/40 border border-indigo-500/20 text-center space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span>How is SocialPilot AI 100% Free Forever?</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-2xl mx-auto">
              We believe creator tools should not be trapped behind high monthly subscriptions. By bringing your own direct Google Gemini API key (which has a generous free tier and zero token markup), you pay direct provider cost or nothing at all. You get full access to scheduling, AI studios, and autonomous publishing without credit card requirements.
            </p>
          </div>

        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-slate-400">Everything you need to know about keys, scheduling, and official APIs.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
              <h4 className="text-base font-semibold text-white flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>{faq.q}</span>
              </h4>
              <p className="mt-2.5 text-xs sm:text-sm text-slate-400 leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 bg-gradient-to-b from-indigo-950/40 to-slate-950 border-t border-slate-800 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to Automate Your Multi-Platform Growth?
          </h2>
          <p className="mt-3 text-slate-400 text-base max-w-xl mx-auto">
            Connect your channels, input your Gemini key, and let SocialPilot AI transform single ideas into automated omni-channel momentum.
          </p>
          <div className="mt-8">
            <button
              onClick={onLaunchApp}
              className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base shadow-xl shadow-indigo-600/30 hover:scale-105 transition-all"
            >
              Launch SocialPilot AI Studio
            </button>
          </div>
        </div>
      </section>

      {/* Footer & Compliance */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              S
            </div>
            <span className="font-bold text-slate-300">SocialPilot AI</span>
            <span>&copy; {new Date().getFullYear()} SocialPilot SaaS Inc. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <button onClick={() => onOpenLegal('privacy')} className="hover:text-slate-300 transition">
              Privacy Policy
            </button>
            <button onClick={() => onOpenLegal('terms')} className="hover:text-slate-300 transition">
              Terms of Service
            </button>
            <button onClick={() => onOpenLegal('deletion')} className="hover:text-slate-300 transition">
              Account & Data Deletion
            </button>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400">BYO Key Architecture</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
