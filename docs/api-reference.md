# REST API Reference: v1

Base URL: `/api/v1`

## Security & Common Headers

| Header | Description | Required |
|---|---|---|
| `Authorization` | `Bearer <Firebase ID Token>` | Yes (for protected routes) |
| `x-workspace-id` | Active Workspace ID (e.g., `ws-default-01`) | Optional (defaults to primary) |
| `x-correlation-id` | Client request trace ID | Optional (generated automatically) |
| `Content-Type` | `application/json` | Yes (for POST/PATCH requests) |

---

## 1. Authentication & Users

### `GET /api/v1/me`
Returns the verified authenticated user profile and membership context.
- **Response `200 OK`**:
```json
{
  "data": {
    "uid": "usr-admin-01",
    "email": "riteshkumarverma486@gmail.com",
    "displayName": "Ritesh Kumar",
    "role": "owner",
    "currentWorkspaceId": "ws-default-01"
  }
}
```

### `PATCH /api/v1/me`
Updates user profile settings (name, photo, language, timezone).

---

## 2. Workspaces

### `GET /api/v1/workspaces`
Lists workspaces accessible to the authenticated user.

### `POST /api/v1/workspaces`
Creates a new workspace.
- **Request Body**:
```json
{
  "name": "Global Media Brand",
  "timezone": "America/New_York",
  "defaultLanguage": "en"
}
```

---

## 3. AI Providers (BYO-Key Vault)

### `GET /api/v1/ai-providers`
Returns configured AI provider metadata with masked key. Plaintext key is NEVER returned.

### `POST /api/v1/ai-providers`
Validates and securely envelopes user's Gemini / OpenAI API key.
- **Request Body**:
```json
{
  "provider": "gemini",
  "apiKey": "AIzaSyD-...",
  "selectedModel": "gemini-2.5-flash"
}
```
- **Response `200 OK`**:
```json
{
  "data": {
    "success": true,
    "maskedApiKey": "AIzaSy...4x9B",
    "selectedModel": "gemini-2.5-flash",
    "latencyMs": 142
  }
}
```

---

## 4. AI Post Generation

### `POST /api/v1/ai/generate`
Generates tailored post variations across multiple social platforms.
- **Request Body**:
```json
{
  "topic": "Why autonomous AI agents will redefine SaaS in 2026",
  "niche": "Artificial Intelligence",
  "language": "English",
  "tone": "Engaging & Professional",
  "targetPlatforms": ["x", "linkedin", "facebook", "telegram"]
}
```

---

## 5. Social Accounts & Health Verification

### `GET /api/v1/social-accounts`
Returns connected broadcasting destinations with real health check status.

### `POST /api/v1/social-accounts/:socialAccountId/verify`
Performs a live probe check against the provider's official API.

---

## 6. Posts & Publishing

### `GET /api/v1/posts`
Query posts filtered by `status` (`draft`, `scheduled`, `published`, `failed`).

### `POST /api/v1/posts/:postId/publish`
Immediate trigger to publish a post across authorized channels.

---

## Standard Error Response Format

```json
{
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "Insufficient permissions for this operation.",
    "correlationId": "req-98f24bc109"
  }
}
```
