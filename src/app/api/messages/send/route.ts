// ===================================================================
// OUTGOING MESSAGE DISPATCH ENDPOINT
// Server-side WAME dispatcher with error capture & configuration check
// ===================================================================

import { NextRequest, NextResponse } from 'next/server';
import { WameClient } from '@/lib/wame/client';
import { liveStore } from '@/lib/wame/live-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { conversationId, content, recipient, instanceKey, baseUrl, channelType } = body;

    if (!instanceKey) {
      instanceKey = process.env.WAME_DEFAULT_INSTANCE_KEY || '';
    }

    if (!content || !recipient) {
      return NextResponse.json(
        { status: 400, error: 'Recipient and content are required' },
        { status: 400 }
      );
    }

    const client = new WameClient(instanceKey, baseUrl);

    if (!client.isConfigured()) {
      return NextResponse.json({
        status: 200,
        simulated: true,
        message:
          'Message handled in local state. Configure seu Instance Key da WAME para despachar ao WhatsApp real.',
        conversationId,
        recipient,
        sentAt: new Date().toISOString()
      });
    }

    const provider: 'whatsapp' | 'instagram' = channelType === 'instagram' ? 'instagram' : 'whatsapp';
    const result = await client.sendTextMessage(recipient, content, provider);

    // Se o envio foi bem-sucedido, registrar no liveStore para sync imediato
    if (result.status === 200) {
      const cleanTo = recipient.replace(/@.*$/, '').replace(/\D/g, '');
      const convId = conversationId || `conv-${cleanTo}`;
      liveStore.addEvent({
        id: result.data?.messageId || `msg-agent-${Date.now()}`,
        conversationId: convId,
        senderType: 'agent',
        senderName: 'Você',
        content: content.trim(),
        messageType: 'text',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestampMs: Date.now(),
        from: cleanTo,
        channelType: provider,
        instanceKey
      });
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Send message error';
    return NextResponse.json({ status: 500, error: errorMsg }, { status: 500 });
  }
}
