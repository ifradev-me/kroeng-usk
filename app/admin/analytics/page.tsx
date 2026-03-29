'use client';

import { ChartBar as BarChart3, ExternalLink, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AdminAnalyticsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-navy-900">Analytics</h1>
        <p className="text-gray-600 mt-2">
          Website traffic and performance analytics powered by Cloudflare
        </p>
      </div>

      <Alert className="mb-8">
        <Info className="h-4 w-4" />
        <AlertTitle>Cloudflare Analytics Integration</AlertTitle>
        <AlertDescription>
          To view analytics, you need to set up Cloudflare Analytics for your domain. Follow the
          steps below to get started.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-electric-600" />
              Setup Cloudflare Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-3 text-gray-600">
              <li>
                Go to your{' '}
                <a
                  href="https://dash.cloudflare.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-electric-600 hover:underline"
                >
                  Cloudflare Dashboard
                </a>
              </li>
              <li>Navigate to your website domain</li>
              <li>Click on &quot;Analytics & Logs&quot; in the sidebar</li>
              <li>Enable Web Analytics if not already enabled</li>
              <li>Copy the JavaScript snippet provided</li>
              <li>Add the snippet to your website&apos;s layout</li>
            </ol>

            <a
              href="https://dash.cloudflare.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="w-full bg-electric-500 hover:bg-electric-600 gap-2 mt-4">
                Open Cloudflare Dashboard
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Once Cloudflare Analytics is set up, you&apos;ll be able to track:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-electric-500" />
                Page views and unique visitors
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-electric-500" />
                Traffic sources and referrers
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-electric-500" />
                Geographic distribution
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-electric-500" />
                Device and browser statistics
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-electric-500" />
                Performance metrics (Core Web Vitals)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-electric-500" />
                Top pages and content performance
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Analytics Script</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            After getting your Cloudflare Analytics token, add this script to your layout.tsx:
          </p>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
            {`<!-- Cloudflare Web Analytics -->
<script
  defer
  src='https://static.cloudflareinsights.com/beacon.min.js'
  data-cf-beacon='{"token": "YOUR_TOKEN_HERE"}'
></script>
<!-- End Cloudflare Web Analytics -->`}
          </pre>
          <p className="text-gray-500 text-sm mt-4">
            Replace YOUR_TOKEN_HERE with your actual Cloudflare Analytics token.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
