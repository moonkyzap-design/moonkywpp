// ===================================================================
// WAME WEBHOOK INGESTION ENDPOINT
// Standard Meta Cloud API envelope parser for WhatsApp & Instagram
// Persists real inbound messages, creates contacts & conversations in Supabase
// ===================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase/client';
import { WameWebhookPayload } from '@/types/wame';
import { randomUUID } from 'crypto';

const ORG_UUID = '11111111-1111-4111-8111-111111111111';
const WA_CHANNEL_UUID = '22222222-2222-4222-8222-222222222222';
const IG_CHANNEL_UUID = '33333333-3333-4333-8333-333333333333';

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
    const channelId = provider === 'instagram' ? IG_CHANNEL_UUID : WA_CHANNEL_UUID;

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // 1. Atualizar canal para conectado e registrar última sincronização
    try {
      await supabase
        .from('channels')
        .update({
          status: 'connected',
          instance_key: instanceId || 'WAME_PROD_INSTANCE_8941',
          last_sync_at: new Date().toISOString()
        })
        .eq('id', channelId);
    } catch (e) {
      console.warn('[WAME_CHANNEL_UPDATE_WARN]', e);
    }

    // 2. Processar entradas e mensagens
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
            if (processedEvents.size > 5000) {
              const first = processedEvents.values().next().value;
              if (first) processedEvents.delete(first);
            }

            const senderIdentifier = msg.from_user_id || msg.from;
            const textContent =
              msg.text?.body ||
              (msg.type === 'image'
                ? '📷 Foto'
                : msg.type === 'audio'
                ? '🎙 Mensagem de voz'
                : msg.type === 'video'
                ? '🎥 Vídeo'
                : msg.type === 'document'
                ? '📄 Documento'
                : '[Mensagem]');

            const contactProfile = value.contacts?.find(
              (c) => c.wa_id === msg.from || c.user_id === msg.from_user_id
            );
            const contactName = contactProfile?.profile?.name || senderIdentifier;

            console.log(
              `[WAME Inbound] Provider: ${provider} | Official: ${isOfficial} | From: ${contactName} (${senderIdentifier}): "${textContent}"`
            );

            // Persistir no Supabase:
            try {
              // 2.1 Encontrar ou criar Contato
              let contactId: string | null = null;
              if (provider === 'instagram') {
                const { data: existingContact } = await supabase
                  .from('contacts')
                  .select('id')
                  .eq('organization_id', ORG_UUID)
                  .eq('instagram_username', senderIdentifier)
                  .maybeSingle();

                if (existingContact?.id) {
                  contactId = existingContact.id;
                } else {
                  const newContactId = randomUUID();
                  const { data: createdContact } = await supabase
                    .from('contacts')
                    .insert({
                      id: newContactId,
                      organization_id: ORG_UUID,
                      name: contactName,
                      instagram_username: senderIdentifier,
                      lead_status: 'lead',
                      avatar_url:
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                    })
                    .select('id')
                    .single();
                  contactId = createdContact?.id || newContactId;
                }
              } else {
                const { data: existingContact } = await supabase
                  .from('contacts')
                  .select('id')
                  .eq('organization_id', ORG_UUID)
                  .eq('phone', senderIdentifier)
                  .maybeSingle();

                if (existingContact?.id) {
                  contactId = existingContact.id;
                } else {
                  const newContactId = randomUUID();
                  const { data: createdContact } = await supabase
                    .from('contacts')
                    .insert({
                      id: newContactId,
                      organization_id: ORG_UUID,
                      name: contactName,
                      phone: senderIdentifier,
                      lead_status: 'lead',
                      avatar_url:
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                    })
                    .select('id')
                    .single();
                  contactId = createdContact?.id || newContactId;
                }
              }

              // 2.2 Encontrar ou criar Conversa
              let conversationId: string | null = null;
              if (contactId) {
                const { data: existingConv } = await supabase
                  .from('conversations')
                  .select('id, unread_count')
                  .eq('organization_id', ORG_UUID)
                  .eq('channel_id', channelId)
                  .eq('contact_id', contactId)
                  .maybeSingle();

                if (existingConv?.id) {
                  conversationId = existingConv.id;
                  await supabase
                    .from('conversations')
                    .update({
                      last_message_preview: textContent,
                      last_message_at: new Date().toISOString(),
                      unread_count: (existingConv.unread_count || 0) + 1
                    })
                    .eq('id', existingConv.id);
                } else {
                  const newConvId = randomUUID();
                  const { data: createdConv } = await supabase
                    .from('conversations')
                    .insert({
                      id: newConvId,
                      organization_id: ORG_UUID,
                      channel_id: channelId,
                      contact_id: contactId,
                      status: 'open',
                      priority: 'medium',
                      ai_enabled: true,
                      ai_status: 'active',
                      unread_count: 1,
                      last_message_preview: textContent,
                      last_message_at: new Date().toISOString()
                    })
                    .select('id')
                    .single();
                  conversationId = createdConv?.id || newConvId;
                }
              }

              // 2.3 Inserir Mensagem
              if (conversationId) {
                await supabase.from('messages').insert({
                  id: randomUUID(),
                  organization_id: ORG_UUID,
                  conversation_id: conversationId,
                  channel_id: channelId,
                  sender_type: 'contact',
                  external_id: msg.id || null,
                  content: textContent,
                  message_type: msg.type || 'text',
                  media_url:
                    (msg as any).image?.link ||
                    (msg as any).audio?.link ||
                    (msg as any).video?.link ||
                    (msg as any).document?.link ||
                    null,
                  delivery_status: 'delivered',
                  metadata: {
                    rawTimestamp: msg.timestamp,
                    wameInstance: instanceId,
                    from: senderIdentifier
                  }
                });
              }
            } catch (dbErr) {
              console.error('[WAME_SUPABASE_PERSIST_ERROR]', dbErr);
            }
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
