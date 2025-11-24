# Demo Mode Configuration

This document explains how the demo mode works and how to enable it.

## Overview

Demo mode provides session-based data isolation for public demo sites. Each user gets their own isolated data stored in Cloudflare KV with automatic cleanup of old sessions.

## Architecture

### Session Management

**Cookie-Based Sessions:**

- Session ID stored in `mmmf_demo_session` HttpOnly cookie
- 5-day expiration
- SameSite=Strict for security
- Auto-generated on first visit

**Session ID Format:**

```
demo_{nanoid(16)}_{timestamp}
```

Example: `demo_V1StGXR8_Z5jdHi_1700000000000`

### Data Storage

**KV Key Prefixing:**

```
Normal mode:  transactions
Demo mode:    demo_V1StGXR8_Z5jdHi_1700000000000:transactions
```

All session data uses the same `MMMF_KV` namespace with prefixed keys:

- `{sessionId}:transactions`
- `{sessionId}:recurring`
- `{sessionId}:settings`
- `{sessionId}:credit-cards`

### Automatic Cleanup

**Cleanup Trigger:**

- Runs every 24 hours (on first API call after interval)
- Checks all keys with `demo_` prefix
- Deletes sessions older than 5 days

**Cleanup Logic:**

```javascript
// Session age calculation
const sessionTimestamp = extractTimestampFromSessionId(sessionId);
const sessionAge = Date.now() - sessionTimestamp;
const isExpired = sessionAge > 5 * 24 * 60 * 60 * 1000; // 5 days
```

## Configuration

### Cloudflare Workers

**wrangler.jsonc:**

```jsonc
{
  "vars": {
    "DEMO": "false" // Set to "true" to enable demo mode
  }
}
```

**Via Cloudflare Dashboard:**

1. Go to Workers & Pages → Your Worker → Settings → Variables
2. Add environment variable: `DEMO` = `true`
3. Deploy changes

### Local Development (Node.js)

Set environment variable before starting:

**Linux/Mac:**

```bash
export DEMO=true
npm run dev
```

**Windows:**

```cmd
set DEMO=true
npm run dev
```

## Implementation Details

### Session Flow

1. **First Visit:**

   - No cookie exists
   - Generate new session ID
   - Set cookie with 5-day expiration
   - Initialize default data for session

2. **Subsequent Visits:**

   - Read session ID from cookie
   - Use prefixed keys for all data operations
   - Extend cookie expiration

3. **Session Expiry:**
   - After 5 days of inactivity
   - Cookie expires in browser
   - KV data cleaned up by background job

### Middleware

**Hono (Cloudflare):**

```javascript
import { demoSessionMiddlewareHono } from "./demo-session.js";

app.use("*", async (c, next) => {
  await demoSessionMiddlewareHono(c, next);
});

// In route handlers:
const sessionId = c.get("sessionId");
const getKVKey = c.get("getKVKey");
const key = getKVKey("transactions"); // Auto-prefixed if demo mode
```

**Express (Node.js):**

```javascript
import { demoSessionMiddleware } from "./demo-session.js";

app.use(demoSessionMiddleware);

// In route handlers:
const sessionId = req.sessionId;
const key = req.getKVKey("transactions");
```

## Security Considerations

### Cookie Security

- **HttpOnly**: Prevents JavaScript access
- **SameSite=Strict**: CSRF protection
- **5-day expiration**: Limits session lifetime
- **No sensitive data**: Only session ID stored

### Data Isolation

- Sessions cannot access each other's data
- KV keys are cryptographically random (nanoid)
- Timestamp in session ID prevents prediction

### Resource Management

- Automatic cleanup prevents KV bloat
- 5-day retention balances demo usage and storage
- Background cleanup doesn't block requests

## Monitoring

### Cleanup Logs

Check Cloudflare Workers logs for cleanup events:

```
Starting cleanup of expired demo sessions...
Cleaned up 42 expired session keys
```

### Session Statistics

To monitor active sessions, query KV with prefix:

```javascript
const { keys } = await KV.list({ prefix: "demo_" });
const activeSessions = new Set(keys.map((k) => k.name.split(":")[0]));
console.log(`Active demo sessions: ${activeSessions.size}`);
```

## Best Practices

### For Demo Sites

1. Enable `DEMO=true` in production environment
2. Monitor KV storage usage in Cloudflare dashboard
3. Set up alerts for high KV usage
4. Consider shorter retention if storage is limited

### For Development

1. Keep `DEMO=false` for local development
2. Use separate KV namespace for testing demo mode
3. Test cleanup logic with mock timestamps

## Troubleshooting

### Sessions Not Isolated

- Check `DEMO` environment variable is set to `true`
- Verify middleware is applied before API routes
- Check cookie is being set (browser DevTools → Application → Cookies)

### Data Not Persisting

- Verify cookie expiration is set correctly
- Check session ID format is valid
- Ensure KV namespace binding is correct

### Cleanup Not Running

- Check Workers logs for errors
- Verify last cleanup timestamp is updating
- Ensure KV list operation has permissions

## Future Enhancements

Possible improvements:

- Configurable session duration via environment variable
- Admin dashboard to view/manage active sessions
- Rate limiting per session
- Session migration/export functionality
- Analytics on session usage patterns
