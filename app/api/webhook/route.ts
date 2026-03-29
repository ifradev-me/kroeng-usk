import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('Webhook received:', body);

    return NextResponse.json({ success: true, message: 'Webhook received' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'KROENG API is running'
  });
}
