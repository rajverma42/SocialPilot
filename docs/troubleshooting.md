# Troubleshooting & Operational Runbook

## 1. Meta Facebook Graph API Errors

### Code 190: `Error validating access token: Session has expired`
- **Cause**: The Page access token has expired or user changed their Facebook account password.
- **Resolution**: Navigate to **Social Accounts -> Facebook Page -> Reconnect**, re-authorizing the Page.

### Code 200: `Permissions error: User does not have sufficient administrative rights`
- **Cause**: User lacks `pages_manage_posts` or `CREATE_CONTENT` tasks on the Facebook Page.
- **Resolution**: Open Meta Business Suite, verify user has Editor/Admin role on the target Page.

### Code 10: `Application does not have permission for this action`
- **Cause**: The Meta App requires App Review for public live posting, or test user needs to be added as an App Tester.
- **Resolution**: Add the user under **Meta Developers Portal -> Roles -> Test Users / Roles**.

---

## 2. Telegram Bot API Errors

### Error 400: `Bad Request: chat not found`
- **Cause**: Channel username is misspelled or Bot has not been added to the channel.
- **Resolution**: Verify that the handle matches `@your_channel` and that the bot is an Administrator.

### Error 403: `Forbidden: bot was kicked from the channel`
- **Cause**: Channel owner removed the bot.
- **Resolution**: Re-add the bot in Telegram Channel Settings with Post Messages permission.

---

## 3. Worker Daemon Crash Recovery & Idempotency

- If a worker node crashes mid-execution, jobs remain in `in_progress` until `leaseExpiresAt` (default: 5 minutes) expires.
- The next scheduler cycle reclaims the abandoned lease and checks `idempotencyKey` against `publishingAttempts` to prevent duplicate publishing.
