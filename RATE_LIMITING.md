# Rate Limiting Implementation

## Overview
The name-checker app implements a dual-layer rate limiting system to protect the AI name generation feature from abuse.

## Rate Limits

### Per-IP Daily Limit
- **50 requests per IP address per day**
- Resets at midnight UTC
- Tracked using file-based storage for persistence across container restarts

### Global Daily Limit
- **1,000 total AI generations per day** (configurable)
- Prevents overall API cost overruns
- Shared across all users

## How It Works

### Backend Implementation
- `lib/rateLimit.ts`: Core rate limiting logic
- Persistent storage in `data/ai-rate-limits.json`
- IP address extraction from headers (supports reverse proxy setups)
- Automatic cleanup of expired records

### API Integration
- `/api/generate-names`: Protected endpoint with rate limit checks
- `/api/rate-limit-status`: Get current rate limit status for an IP
- Returns rate limit headers: `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### Frontend Integration
- Displays remaining AI generations to users
- Shows clear error messages when limits are reached
- Real-time updates after each request

## Configuration

Edit `lib/rateLimit.ts` to adjust limits:

```typescript
const MAX_REQUESTS_PER_IP_PER_DAY = 50;  // Per-IP limit
const MAX_GLOBAL_REQUESTS_PER_DAY = 1000; // Global limit
```

## Data Storage

Rate limit data is stored in `data/ai-rate-limits.json`:
```json
{
  "perIP": {
    "1.2.3.4": { "count": 5, "resetTime": 1706659200000 }
  },
  "global": { "count": 42, "resetDate": "2026-01-30" }
}
```

**Note**: This file is excluded from git via `.gitignore`

## Testing Rate Limits

```bash
# Check current status
curl https://kabirstudios.com/apps/name-checker/api/rate-limit-status

# Test generation (will increment counter)
curl -X POST https://kabirstudios.com/apps/name-checker/api/generate-names \
  -H "Content-Type: application/json" \
  -d '{"name":"test","count":10}'
```

## Docker Volume (Optional)

To persist rate limit data across container recreations, add a volume to `docker-compose.yml`:

```yaml
name-checker:
  volumes:
    - ./name-checker/data:/app/data
```

This is already handled by the current setup as the data directory is in the app folder.

## Security Considerations

- IP addresses are hashed/normalized for privacy
- Works behind reverse proxies (nginx)
- Respects `X-Forwarded-For` and `X-Real-IP` headers
- Automatic cleanup prevents memory leaks
- File-based storage survives container restarts
