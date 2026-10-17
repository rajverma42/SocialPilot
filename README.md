# SocialPilot AI - Next-Gen Social Media Automation SaaS

> **"One Topic. Every Platform. Automatically."**  
> A production-oriented social media automation platform with user-owned AI API keys, multi-platform native formatting, and a 24/7 durable background scheduler daemon.

---

## 🚀 Key Highlights & Architecture

1. **User-Owned AI API Keys (Bring-Your-Own-Key)**
   - Users provide their own Google Gemini API key.
   - **0% token markup**: Users pay direct provider costs or use Google's free tier.
   - **Security**: Envelope encryption with AES-256-GCM. Plaintext keys are never exposed in browser bundles, local storage, or telemetry.
   - **Supported Models**: `gemini-3.8-flash` (default & recommended), `gemini-3.1-flash-lite`, and `gemini-4-argon`.

2. **Durable 24/7 Background Scheduler**
   - Autonomous Node.js scheduler daemon running continuously inside the server.
   - Evaluates scheduled posts every 20 seconds using idempotency locks to eliminate duplicate publications.
   - **Survives browser closure and sleeping laptops**: Scheduled jobs run strictly server-side.

3. **Official Platform Integrations**
   - **Telegram Channel / Group (Live Official Bot API)**: Direct broadcasting using official Telegram Bot Token and channel username (`@channel_name`). Supports HTML parsing mode and photo uploads.
   - **X (Twitter)**: Strict `<280` character limit validation with real-time countdown.
   - **LinkedIn**: Professional thought-leadership formatting with bullet spacing and clean industry hashtags.
   - **Instagram Pro**: Aesthetic captions, spacing breaks, and hashtag clusters.
   - **Facebook Pages**: Conversational posts with discussion prompts and link previews.
   - **YouTube**: Video title synthesis, high-CTR hooks, timestamps, and search tags.
   - **Pinterest & TikTok**: Aspect ratio guidelines (2:3, 9:16) and short-form scripts.

4. **Meta Facebook Page Official Graph API v22.0 Integration**
   - **Official OAuth Flow**: Popup-based Meta OAuth flow directly opening Meta dialog with CSRF state protection.
   - **Scopes**: Minimally scoped to `pages_show_list`, `pages_read_engagement`, and `pages_manage_posts`.
   - **Page Discovery & Selection**: Lists all managed Pages with Page Name, Page ID, category, tasks, and avatar for selection.
   - **Encryption & Security**: Server-side AES-256-GCM envelope encryption for Page Access Tokens. Access tokens are never returned to client bundles.
   - **Verified Publishing**: Supports direct page feed posts (`POST /{page-id}/feed`) and photo uploads (`POST /{page-id}/photos`) with real remote post IDs.
   - **Direct Page Token Mode**: Alternative direct connection using Page ID and Page Access Token for developers and system users.
   - **Live Health Checks**: Tests token validity, page publication status, and permission sets.

5. **Full Auto Autonomous Mode**
   - **Mode A (Manual)**: Create, refine, and publish manually.
   - **Mode B (Approval Required)**: AI drafts posts autonomously on schedule, holding them in "Awaiting Approval" until you 1-click approve.
   - **Mode C (Full Auto)**: AI generates and schedules direct publication to authorized channels.
   - **Emergency Stop**: Instant kill switch to freeze all automated queues.

6. **Website & RSS Auto Content Ingestion**
   - Connect any RSS/Atom feed or blog source.
   - Ingests articles, extracts title/summary, and 1-click converts to multi-platform posts with source attribution.

7. **Media Studio**
   - Asset library with aspect ratio presets: Square (1:1), Landscape (16:9), Vertical (9:16), Portrait (4:5), Pin (2:3).
   - AI creative prompt synthesizer for social thumbnails.

---

## 📋 Meta Developer App & Facebook Pages Setup Guide

To connect your official Facebook Pages:

1. **Go to Meta Developer Dashboard**:
   - Visit [developers.facebook.com](https://developers.facebook.com/apps/) and create an app with Type: **Business**.

2. **Add Facebook Login for Business**:
   - In your app dashboard, add **Facebook Login for Business**.
   - Navigate to **Facebook Login > Settings > Valid OAuth Redirect URIs**.
   - Add your callback URLs:
     - **Development URL**: `https://ais-dev-inirvehrqervmwccpzi3l3-660322268308.asia-east1.run.app/auth/facebook/callback`
     - **Shared/Deployed URL**: `https://ais-pre-inirvehrqervmwccpzi3l3-660322268308.asia-east1.run.app/auth/facebook/callback`

3. **Configure App Credentials**:
   - Copy your **App ID** and **App Secret** from **App settings > Basic**.
   - In SocialPilot AI, open **Social Accounts > Meta App Setup** and save your credentials (or set `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET` in `.env`).

4. **Permissions & App Review**:
   - **Development Mode**: App Admins, Developers, and Testers can immediately authorize and publish to their Pages without App Review.
   - **Live Production Mode**: Submit `pages_show_list`, `pages_read_engagement`, and `pages_manage_posts` for Meta App Review.

---

## 🛠️ Quick Start

### 1. Installation & Local Development
```bash
# Clone the repository
git clone <repo-url>
cd socialpilot-ai

# Install dependencies
npm install

# Start development full-stack server (runs Express + Vite on port 3000)
npm run dev
```

### 2. Environment Variables (.env)
```env
# Optional fallback if user hasn't added their own key in Settings
GEMINI_API_KEY=""

# Host URL
APP_URL="http://localhost:3000"

# Port (defaults to 3000)
PORT=3000

# Optional default Telegram Bot credentials
TELEGRAM_BOT_TOKEN=""
TELEGRAM_CHAT_ID=""
```

---

## 🛡️ Security, Privacy & Compliance

- **No Secret Telemetry**: We never log raw API keys, tokens, or private drafts.
- **Data Portability**: Full JSON export of all posts, accounts, and analytics via **Workspace Settings > Export JSON**.
- **Right to Erasure**: Immediate cascade purge of all workspace data and scheduled jobs via **Workspace Settings > Purge Workspace**.
