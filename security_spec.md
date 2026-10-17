# Security Specification: Attribute-Based Access Control (ABAC) & Zero-Trust Firestore Security

## 1. Data Invariants

1. **Global Default-Deny**: Every path not explicitly allowed is denied by default via `match /{document=**} { allow read, write: if false; }`.
2. **User Isolation**: A user can only access their own user profile `/users/{uid}` (`request.auth.uid == uid`).
3. **Workspace Isolation**: A user can only access a workspace if they are the `ownerUid` or an active member in `/workspaces/{workspaceId}/members/{uid}`.
4. **Sub-collection Inheritance (Master Gate)**: Access to subcollections (`posts`, `socialAccounts`, `aiProviders`, `notifications`, `mediaAssets`, `automationRules`, `contentSources`) strictly requires verified membership in the parent `/workspaces/{workspaceId}`.
5. **No Client Privilege Escalation**: Member role changes and system status fields (e.g. `role: 'owner'`, `status: 'published'`) can only be modified by owners/admins or through server-trusted workers.
6. **No Client Access to Secrets**: Plaintext API keys and raw social access/refresh tokens are never stored in client-accessible Firestore documents. Server credentials live in backend encrypted stores.
7. **Client Cannot Fake Published State**: Clients cannot set `status: 'published'` or invent `remotePostId` directly on `/destinations/{destinationId}`. Only the backend publishing engine performs status transition to `published`.
8. **Immutability of IDs & Timestamps**: Document IDs and `createdAt` cannot be altered on update.

---

## 2. The Dirty Dozen Payloads

1. **Payload 1 (User ID Spoofing)**:
   Attempt to create or update `/users/victim-user-123` with `request.auth.uid = 'attacker-user-456'`.
   *Expected Result*: PERMISSION_DENIED.

2. **Payload 2 (Ghost Field Injection)**:
   Send an update to `/users/{uid}` with `{ isSuperAdmin: true, role: 'root' }`.
   *Expected Result*: PERMISSION_DENIED (enforces strict keys).

3. **Payload 3 (Cross-Workspace Post Injection)**:
   Authenticated user creates a post inside `/workspaces/ws-victim/posts/post-1` where user is not a member of `ws-victim`.
   *Expected Result*: PERMISSION_DENIED (Master Gate failure).

4. **Payload 4 (Fake Published State)**:
   Client tries to update `/workspaces/{wsId}/posts/{pId}/destinations/{dId}` with `{ status: 'published', remotePostId: 'fb_123456' }`.
   *Expected Result*: PERMISSION_DENIED.

5. **Payload 5 (ID Poisoning / Denial of Wallet)**:
   Attempt to write with document ID containing 2048 junk characters or illegal regex characters.
   *Expected Result*: PERMISSION_DENIED (`isValidId` check).

6. **Payload 6 (Oversized Payload / Buffer Exhaustion)**:
   Send a post content with string size > 15,000 characters.
   *Expected Result*: PERMISSION_DENIED (string `.size()` check).

7. **Payload 7 (Social Credential Client Exfiltration)**:
   Client attempts to `get` or `list` `/socialCredentials/{credentialId}`.
   *Expected Result*: PERMISSION_DENIED (Collection completely restricted from client SDK).

8. **Payload 8 (Owner Immutability Violation)**:
   User tries to update a post changing `ownerUid` to another user.
   *Expected Result*: PERMISSION_DENIED (`incoming().ownerUid == existing().ownerUid`).

9. **Payload 9 (Blanket Query Scraping)**:
   Attempt to run query `collection('users')` without filtering to own document.
   *Expected Result*: PERMISSION_DENIED.

10. **Payload 10 (Unauthorized Workspace Role Promotion)**:
    Editor attempts to promote themselves or another member to `role: 'owner'`.
    *Expected Result*: PERMISSION_DENIED (only existing `owner` can change roles).

11. **Payload 11 (Audit Log Tampering)**:
    Any client attempts `update` or `delete` on `/auditLogs/{auditLogId}`.
    *Expected Result*: PERMISSION_DENIED (audit logs are append-only/system-managed).

12. **Payload 12 (Scheduled Job Direct Client Hijack)**:
    Client tries to mark a `scheduledJob` as `completed` directly.
    *Expected Result*: PERMISSION_DENIED.
