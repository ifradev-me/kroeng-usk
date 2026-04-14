import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

function verifySignature(payload: string, signature: string | null): boolean {
  if (!WEBHOOK_SECRET || !signature) return false;

  const expected = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(`sha256=${expected}`),
    Buffer.from(signature)
  );
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-webhook-signature');

    // If WEBHOOK_SECRET is configured, enforce signature verification
    if (WEBHOOK_SECRET) {
      if (!verifySignature(rawBody, signature)) {
        return NextResponse.json(
          { success: false, error: 'Invalid signature' },
          { status: 401 }
        );
      }
    } else {
      // No secret configured — reject all webhook calls in production
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { success: false, error: 'Webhook not configured' },
          { status: 403 }
        );
      }
    }

    const body = JSON.parse(rawBody);

    // Only log in development, never log full body in production
    if (process.env.NODE_ENV !== 'production') {
      console.log('Webhook received:', body);
    }

    return NextResponse.json({ success: true, message: 'Webhook received' });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'KROENG API is running',
  });
}
