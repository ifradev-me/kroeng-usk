# Cloudflare Analytics Setup Guide

## Overview

Cloudflare Web Analytics provides privacy-focused website analytics without cookies or tracking scripts that slow down your site.

## Setup Steps

### 1. Enable Cloudflare Web Analytics

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your domain (or add your site if not using Cloudflare DNS)
3. Navigate to **Analytics & Logs** → **Web Analytics**
4. Click **Enable Web Analytics** (or **Manage beacon** if already enabled)

### 2. Get Your Analytics Token

1. In the Web Analytics page, click **Manage beacon**
2. Copy the token from the script snippet:
   ```html
   <script defer src='https://static.cloudflareinsights.com/beacon.min.js' 
           data-cf-beacon='{"token": "YOUR_TOKEN_HERE"}'></script>
   ```
3. The token is the value inside `"token": "..."`

### 3. Add Token to Environment Variables

Add this to your `.env.local`:

```env
NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN=your-token-here
```

### 4. Deploy

The analytics script is already integrated in the layout. Just deploy your app and analytics will start working.

## What's Tracked

Cloudflare Web Analytics tracks:

- **Page Views** - Total and unique page views
- **Visitors** - Unique visitors by country
- **Top Pages** - Most visited pages
- **Referrers** - Where traffic comes from
- **Devices** - Browser and device breakdown
- **Core Web Vitals** - LCP, FID, CLS performance metrics

## Privacy Benefits

- **No cookies** - Doesn't use cookies
- **No personal data** - Doesn't collect PII
- **GDPR compliant** - Privacy-first by design
- **No performance impact** - Lightweight script

## Viewing Analytics

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your domain
3. Click **Analytics & Logs** → **Web Analytics**

Or access directly at:
`https://dash.cloudflare.com/<account-id>/<domain>/analytics/web-analytics`

## Alternative: Without Cloudflare DNS

If you're not using Cloudflare for DNS, you can still use Web Analytics:

1. Go to [Cloudflare Web Analytics](https://dash.cloudflare.com/?to=/:account/web-analytics)
2. Click **Add a site**
3. Enter your domain
4. Get the JavaScript snippet
5. Add the token to your environment variables

## Troubleshooting

### Analytics not showing data?

1. Check if the token is correctly set in `.env.local`
2. Verify the script is loading (check Network tab in DevTools)
3. Wait 24-48 hours for data to appear
4. Ensure you're not blocking the script with an ad blocker

### Script not loading?

Make sure the environment variable is prefixed with `NEXT_PUBLIC_`:
```env
# ✅ Correct
NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN=abc123

# ❌ Wrong - won't be exposed to browser
CLOUDFLARE_ANALYTICS_TOKEN=abc123
```

## Integration Code

The analytics script is integrated in `/app/layout.tsx`:

```tsx
{process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN && (
  <Script
    defer
    src="https://static.cloudflareinsights.com/beacon.min.js"
    data-cf-beacon={`{"token": "${process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN}"}`}
    strategy="afterInteractive"
  />
)}
```

This ensures:
- Script only loads if token is set
- Uses Next.js Script component for optimal loading
- Loads after page is interactive (doesn't block rendering)