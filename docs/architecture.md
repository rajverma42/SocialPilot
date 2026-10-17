# Production Architecture: SocialPilot AI

## 1. High-Level Architecture Overview

SocialPilot AI is a scalable, enterprise-ready multi-platform social media automation SaaS built on Google Cloud Platform and Firebase.

```
                      +---------------------------------------+
                      |           React SPA Client            |
                      |  (Vite + TailwindCSS + Firebase SDK)  |
                      +-------------------+-------------------+
                                          |
                        HTTPS (REST + Bearer / Firebase Auth)
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                           Cloud Run (Node.js + Express)                           |
|                                                                                   |
|  +-----------------------+   +-----------------------+   +---------------------+  |
|  | Correlation & Trace   |   | Zod Validation Engine |   | RBAC & Auth Guard   |  |
|  | (/api/v1 middleware)  |   | (Runtime Schemas)     |   | (Owner/Admin/Editor)|  |
|  +-----------------------+   +-----------------------+   +---------------------+  |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                           Application Controllers                           |  |
|  |  * Users & Workspaces     * AI Provider (BYO-Key)   * Multi-Platform Post   |  |
|  |  * Meta Graph API v22.0   * Telegram Bot API        * RSS & Feed Ingestion  |  |
|  |  * Media Storage Vault    * Analytics & Auditing    * System Emergency Stop |  |
|  +-----------------------------------------------------------------------------+  |
|                                         |                                         |
|  +-----------------------------------+  |  +-----------------------------------+  |
|  |   Durable Scheduler Daemon        |  |  |   KMS Envelope Cryptography       |  |
|  |   * Idempotent Leases             |  |  |   * AES-256-GCM Vault             |  |
|  |   * Exponential Backoff & Jitter  |  |  |   * Server-Side Key Derivation    |  |
|  +-----------------------------------+  |  +-----------------------------------+  |
+-----------------------------------------+-----------------------------------------+
                    |                                         |
                    v                                         v
+---------------------------------------+   +---------------------------------------+
|            Cloud Firestore            |   |             Cloud Storage             |
|   * Standard & Enterprise Editions    |   |   * Signed Upload URLs                |
|   * Zero-Trust Security Rules         |   |   * Media Validation & Checksums      |
|   * Master Gate RBAC Inheritance      |   |   * Asset Expiration & Cleanup        |
+---------------------------------------+   +---------------------------------------+
                    ^
                    | (Durable Dispatch)
+-----------------------------------------------------------------------------------+
|                         Cloud Scheduler & Cloud Tasks                             |
|   * Periodic publishing triggers         * Dead-letter queues & crash recovery    |
+-----------------------------------------------------------------------------------+
```

---

## 2. Core Subsystems

### A. Authentication & Workspace Isolation
- **Identity Provider**: Firebase Authentication (Email/Password, Google OAuth).
- **Session Verification**: Verified via Firebase Admin SDK / Bearer ID token validation.
- **Tenant Isolation**: Every resource belongs strictly to a `workspaceId`. Subcollection permissions are evaluated against the parent workspace document using the Master Gate pattern.

### B. User-Owned Gemini AI Key Integration
- **Zero-Markup Billing**: Users connect their personal Google AI Studio / Gemini API keys (`gemini-2.5-flash`, `gemini-1.5-pro`).
- **Storage Security**: Keys are encrypted immediately upon receipt using AES-256-GCM envelope encryption. Plaintext keys are never stored in client Firestore or logged in plaintext.

### C. Official Social Provider Adapters
- **Meta Facebook Pages**: Meta Graph API v22.0 (`/{page-id}/feed`, `/{page-id}/photos`).
- **Telegram Channels**: Official Telegram Bot API (`sendMessage`, `sendPhoto`).
- **Instagram, LinkedIn, X, YouTube, TikTok, Threads, Reddit, Mastodon, Pinterest**: Modular adapters with per-destination state machines.

### D. Durable Publishing Engine
- Independent background daemon with idempotent leases (`leaseExpiresAt`).
- Pre-flight checks verifying destination authorization and token validity.
- Automatic exponential backoff with random jitter for transient errors (rate limits, 5xx outages).
- Immediate terminal transition for permanent errors (revoked permissions, expired token 190).
