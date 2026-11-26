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
import { liveStore } from '@/lib/wame/live-store';

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

    const payload: any = JSON.parse(rawBody);

    const provider = payload.provider || (payload.object === 'instagram' ? 'instagram' : 'whatsapp');
    const isOfficial = payload.official ?? true;
    const instanceId =
      payload.instance ||
      payload.instanceKey ||
      payload.data?.instanceKey ||
      payload.data?.instance ||
      payload.entry?.[0]?.id ||
      payload.phone_number_id;

    if (instanceId && typeof instanceId === 'string' && instanceId !== 'WAME_PROD_INSTANCE_8941') {
      liveStore.setLastInstanceKey(instanceId);
    }
    const channelId = provider === 'instagram' ? IG_CHANNEL_UUID : WA_CHANNEL_UUID;

    // 0. Processar eventos nativos de conexão WAME (ex: connection.update, status.instance)
    if (
      payload.event === 'connection.update' ||
      payload.event === 'status.instance' ||
      payload.event === 'qrcode.updated' ||
      payload.state === 'open'
    ) {
      const user = payload.data?.user || payload.user || payload.instance?.user;
      if (user) {
        liveStore.setProfile({
          id: user.id,
          name: user.name || user.notify,
          phone: user.id ? user.id.replace(/@.*$/, '') : undefined,
          imageProfile: user.imageProfile || user.profilePictureUrl || user.picture || user.imgUrl
        });
      }
      return NextResponse.json({
        status: 200,
        received: true,
        event: payload.event || 'connection.update',
        instance: instanceId
      });
    }

    // 0.1 Processar eventos nativos de mensagens WAME / Baileys (messages.upsert / message)
    if (
      payload.event === 'messages.upsert' ||
      payload.event === 'message' ||
      payload.event === 'messages' ||
      payload.data?.messages ||
      payload.message
    ) {
      const rawMsgs =
        payload.data?.messages ||
        (Array.isArray(payload.data) ? payload.data : null) ||
        (Array.isArray(payload.messages) ? payload.messages : null) ||
        [payload.data || payload.message || payload];

      for (const m of rawMsgs) {
        if (!m) continue;
        const fromMe = Boolean(m.key?.fromMe || m.fromMe);
        const remoteJid = m.key?.remoteJid || m.from || m.remoteJid || '';
        const cleanFrom = remoteJid.replace(/@.*$/, '');
        if (!cleanFrom) continue;

        const textContent =
          m.message?.conversation ||
          m.message?.extendedTextMessage?.text ||
          m.body ||
          m.text ||
          m.content ||
          (m.message?.imageMessage ? '📷 Foto' : m.message?.audioMessage ? '🎙 Áudio' : 'Mensagem');

        const senderName = m.pushName || (fromMe ? 'Você' : cleanFrom);
        const idempotencyKey = m.key?.id || m.id || `wame_${cleanFrom}_${Date.now()}`;

        if (processedEvents.has(idempotencyKey)) continue;
        processedEvents.add(idempotencyKey);

        liveStore.addEvent({
          id: idempotencyKey,
          conversationId: `conv-${cleanFrom.replace(/[^\w]/g, '')}`,
          senderType: fromMe ? 'agent' : 'contact',
          senderName,
          content: textContent,
          messageType: m.message?.imageMessage ? 'image' : m.message?.audioMessage ? 'audio' : 'text',
          mediaUrl: m.mediaUrl || m.message?.imageMessage?.url,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestampMs: Date.now(),
          from: cleanFrom,
          channelType: 'whatsapp',
          instanceKey: instanceId
        });
      }

      return NextResponse.json({
        status: 200,
        received: true,
        event: payload.event || 'messages.upsert',
        instance: instanceId
      });
    }

    // Validate WAME Meta format envelope fallback
    if (payload.object !== 'wame' && !payload.entry) {
      return NextResponse.json({ status: 200, received: true, note: 'Generic event logged' });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // 1. Atualizar canal para conectado e registrar última sincronização
    try {
      await supabase
        .from('channels')
        .update({
          status: 'connected',
          instance_key: instanceId || '5575xf6381291bf',
          last_sync_at: new Date().toISOString()
        })
        .eq('id', channelId);
    } catch (e) {
      console.warn('[WAME_CHANNEL_UPDATE_WARN]', e);
    }

    // 2. Processar entradas e mensagens (Meta envelope format)
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
              (c: any) => c.wa_id === msg.from || c.user_id === msg.from_user_id
            );
            const contactName = contactProfile?.profile?.name || senderIdentifier;

            console.log(
              `[WAME Inbound] Provider: ${provider} | Official: ${isOfficial} | From: ${contactName} (${senderIdentifier}): "${textContent}"`
            );

            const mediaUrl =
              (msg as any).image?.link ||
              (msg as any).audio?.link ||
              (msg as any).video?.link ||
              (msg as any).document?.link ||
              undefined;

            // In-memory instant delivery for UI (guarantees messages appear even if DB is offline)
            liveStore.addEvent({
              id: msg.id || idempotencyKey,
              conversationId: `conv-${senderIdentifier.replace(/[^\w]/g, '')}`,
              senderType: 'contact',
              senderName: contactName,
              content: textContent,
              messageType: (msg.type as any) || 'text',
              mediaUrl,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              timestampMs: Date.now(),
              from: senderIdentifier,
              channelType: provider === 'instagram' ? 'instagram' : 'whatsapp',
              instanceKey: instanceId
            });

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
                  const realIgAvatar =
                    (msg as any).profilePictureUrl ||
                    liveStore.getContactPicture(senderIdentifier) ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(contactName)}&background=252B28&color=45D483`;
                  const { data: createdContact } = await supabase
                    .from('contacts')
                    .insert({
                      id: newContactId,
                      organization_id: ORG_UUID,
                      name: contactName,
                      instagram_username: senderIdentifier,
                      lead_status: 'lead',
                      avatar_url: realIgAvatar
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
                  const cleanPhone = senderIdentifier.replace(/\D/g, '');
                  const realWaAvatar =
                    contactProfile?.profile?.picture ||
                    contactProfile?.picture ||
                    liveStore.getContactPicture(cleanPhone) ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(contactName || cleanPhone || 'Contato')}&background=252B28&color=45D483`;
                  const { data: createdContact } = await supabase
                    .from('contacts')
                    .insert({
                      id: newContactId,
                      organization_id: ORG_UUID,
                      name: contactName,
                      phone: senderIdentifier,
                      lead_status: 'lead',
                      avatar_url: realWaAvatar
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
