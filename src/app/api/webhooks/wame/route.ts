// ===================================================================
// WAME WEBHOOK INGESTION ENDPOINT
// Standard Meta Cloud API envelope parser for WhatsApp & Instagram
// ===================================================================

import { NextRequest, NextResponse } from 'next/server';
import { WameWebhookPayload } from '@/types/wame';

// In-memory idempotency cache for deduplication
const processedEvents = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    if (!rawBody) {
      return NextResponse.json({ status: 400, error: 'EMPTY_BODY' }, { status: 400 });
    }

    const payload: WameWebhookPayload = JSON.parse(rawBody);

    // Validate WAME envelope
    if (payload.object !== 'wame' && !payload.entry) {
      return NextResponse.json({ status: 400, error: 'INVALID_WAME_PAYLOAD' }, { status: 400 });
    }

    const provider = payload.provider || 'whatsapp'; // 'whatsapp' | 'instagram' | 'messenger'
    const isOfficial = payload.official ?? true;
    const instanceId = payload.instance;

    // Process entries and message changes
    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'messages') {
          const value = change.value;

          // Inbound messages
          for (const msg of value.messages || []) {
            const idempotencyKey = msg.id || `${provider}_${msg.from}_${msg.timestamp}`;

            // Deduplication protection
            if (processedEvents.has(idempotencyKey)) {
              console.log(`[WAME Webhook] Duplicate event ignored: ${idempotencyKey}`);
              continue;
            }
            processedEvents.add(idempotencyKey);
            // Limit cache size
            if (processedEvents.size > 5000) {
              const first = processedEvents.values().next().value;
              if (first) processedEvents.delete(first);
            }

            const senderIdentifier = msg.from_user_id || msg.from;
            const textContent = msg.text?.body || (msg.type === 'image' ? '[Photo]' : '[Media]');
            const contactProfile = value.contacts?.find(
              (c) => c.wa_id === msg.from || c.user_id === msg.from_user_id
            );
            const contactName = contactProfile?.profile?.name || senderIdentifier;

            console.log(
              `[WAME Inbound] Provider: ${provider} | Official: ${isOfficial} | From: ${contactName} (${senderIdentifier}): "${textContent}"`
            );
          }

          // Status updates (sent, delivered, read)
          for (const status of value.statuses || []) {
            console.log(`[WAME Status] Message ${status.id} updated to: ${status.status}`);
          }
        }
      }
    }

    // Always respond 200 OK quickly as required by WAME
    return NextResponse.json({
      status: 200,
      received: true,
      provider,
      instance: instanceId
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown parsing error';
    console.error('[WAME Webhook Error]', errorMsg);
    return NextResponse.json({ status: 500, error: errorMsg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Webhook health check or Meta verification token response
  const { searchParams } = new URL(req.url);
  const challenge = searchParams.get('hub.challenge');
  if (challenge) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({
    status: 200,
    service: 'Moonky WAME Omnichannel Webhook Gateway',
    timestamp: new Date().toISOString()
  });
}
