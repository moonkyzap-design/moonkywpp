// ===================================================================
// OUTGOING MESSAGE DISPATCH ENDPOINT
// Server-side WAME dispatcher with error capture & configuration check
// ===================================================================

import { NextRequest, NextResponse } from 'next/server';
import { WameClient } from '@/lib/wame/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, content, recipient, instanceKey } = body;

    if (!content || !recipient) {
      return NextResponse.json(
        { status: 400, error: 'Recipient and content are required' },
        { status: 400 }
      );
    }

    const client = new WameClient(instanceKey);

    if (!client.isConfigured()) {
      return NextResponse.json({
        status: 200,
        simulated: true,
        message:
          'Message handled in local state. To send real outbound WhatsApp/Instagram messages, configure your WAME Instance Key in Channel Settings or .env file.',
        conversationId,
        recipient,
        sentAt: new Date().toISOString()
      });
    }

    const result = await client.sendTextMessage(recipient, content);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Send message error';
    return NextResponse.json({ status: 500, error: errorMsg }, { status: 500 });
  }
}
