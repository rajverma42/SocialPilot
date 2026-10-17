# Security & Threat Model: Zero-Trust Architecture

## 1. Zero-Trust Access Control (ABAC & RBAC)

1. **Default-Deny Catch-All**:
   Any read or write targeting an undefined collection path is blocked at the gateway:
   ```javascript
   match /{document=**} { allow read, write: if false; }
   ```

2. **Master Gate Relational Inheritance**:
   No subcollection document can be accessed without verifying that the caller has active membership in the root `/workspaces/{workspaceId}` document.

3. **No Client Privilege Escalation**:
   Role modification (`owner`, `admin`, `editor`, `viewer`) is strictly restricted to workspace owners.

---

## 2. Envelope Encryption & Key Vault (BYO-Key Security)

1. **In-Flight Protection**: All API keys and OAuth tokens are transmitted strictly over HTTPS (TLS 1.3).
2. **At-Rest Protection**: Keys are encrypted with AES-256-GCM authenticated cipher using a 256-bit key derivation function before writing to disk or database.
3. **Decryption Guard**: Decryption occurs exclusively in transient memory during active API calls and is never persisted in plaintext.
4. **Log Sanitization**: All logging pipelines automatically mask secret values (`AIzaSy...4x9B`).
