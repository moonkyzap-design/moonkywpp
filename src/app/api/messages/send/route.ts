// ===================================================================
// OUTGOING MESSAGE DISPATCH ENDPOINT
// Server-side WAME dispatcher with error capture & configuration check
// ===================================================================

import { NextRequest, NextResponse } from 'next/server';
import { WameClient } from '@/lib/wame/client';
import { liveStore } from '@/lib/wame/live-store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { conversationId, content, recipient, instanceKey, baseUrl, channelType } = body;

    // Auto-resolve instanceKey from request, liveStore, webhook events, or env
    if (!instanceKey || instanceKey === 'WAME_PROD_INSTANCE_8941') {
      instanceKey =
        liveStore.getLastInstanceKey() ||
        liveStore.getEvents().find((e) => e.instanceKey && e.instanceKey !== 'WAME_PROD_INSTANCE_8941')?.instanceKey ||
        process.env.WAME_DEFAULT_INSTANCE_KEY ||
        '';
    }

    if (!content || !recipient) {
      return NextResponse.json(
        { status: 400, error: 'Destinatário e conteúdo da mensagem são obrigatórios' },
        { status: 400 }
      );
    }

    const isInstagram = channelType === 'instagram';
    const cleanTo = isInstagram ? String(recipient).trim() : String(recipient).replace(/@.*$/, '').replace(/\D/g, '');

    if (!cleanTo) {
      return NextResponse.json(
        { status: 400, error: 'Número de telefone ou destinatário inválido' },
        { status: 400 }
      );
    }

    const client = new WameClient(instanceKey, baseUrl);

    if (!client.isConfigured()) {
      return NextResponse.json(
        {
          status: 400,
          error: 'Instância WAME não configurada ou não detectada. Conecte o WhatsApp escaneando o QR Code na plataforma.',
          simulated: false
        },
        { status: 400 }
      );
    }

    const provider: 'whatsapp' | 'instagram' = isInstagram ? 'instagram' : 'whatsapp';
    const result = await client.sendTextMessage(cleanTo, content, provider);

    // Se o envio foi bem-sucedido, registrar no liveStore para sync imediato na interface
    if (result.status === 200) {
      const convId = conversationId || `conv-${cleanTo.replace(/[^\w]/g, '')}`;
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

    return NextResponse.json(result, { status: result.status || 200 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Send message error';
    return NextResponse.json({ status: 500, error: errorMsg }, { status: 500 });
  }
}
