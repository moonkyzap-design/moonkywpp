// ===================================================================
// WAME LIVE SYNC ENDPOINT (/api/channels/wame/sync)
// Directly synchronizes WhatsApp profile picture, chats, and messages
// from server.wame.api.br and merges live webhook events
// ===================================================================

import { NextRequest, NextResponse } from 'next/server';
import { WameClient } from '@/lib/wame/client';
import { liveStore } from '@/lib/wame/live-store';
import { Conversation, Message, Contact } from '@/types';
import { initialConversations, initialMessages } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handleSync(req);
}

export async function POST(req: NextRequest) {
  return handleSync(req);
}

async function handleSync(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let instanceKey = searchParams.get('instanceKey') || '';
    let baseUrl = searchParams.get('baseUrl') || '';

    if (!instanceKey && req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      instanceKey = body.instanceKey || '';
      baseUrl = body.baseUrl || '';
    }

    if (!instanceKey || instanceKey === 'WAME_PROD_INSTANCE_8941') {
      instanceKey =
        liveStore.getLastInstanceKey() ||
        liveStore.getEvents().find((e) => e.instanceKey && e.instanceKey !== 'WAME_PROD_INSTANCE_8941')?.instanceKey ||
        process.env.WAME_DEFAULT_INSTANCE_KEY ||
        '5575xf6381291bf';
    }

    instanceKey = instanceKey.trim();
    if (instanceKey && instanceKey !== 'WAME_PROD_INSTANCE_8941') {
      liveStore.setLastInstanceKey(instanceKey);
    }

    // In-memory profile & live events
    const cachedProfile = liveStore.getProfile();
    const liveEvents = liveStore.getEvents();

    let connected = false;
    let userProfile = {
      name: cachedProfile?.name || '',
      phone: cachedProfile?.phone || '',
      imageProfile: cachedProfile?.imageProfile || ''
    };

    let conversations: Conversation[] = [];
    const messagesRecord: Record<string, Message[]> = {};
    const contactMap: Record<string, { name?: string; imgUrl?: string; phone?: string; lid?: string }> = {};

    let client: WameClient | null = null;

    // 1. Tentar consultar a API WAME se houver instanceKey
    if (instanceKey) {
      client = new WameClient(instanceKey, baseUrl || undefined);

      try {
        // 1.1 Consultar status e perfil do usuário WhatsApp conectado
        const statusData: any = await client.getInstanceStatus().catch(() => null);

        if (statusData) {
          const inst = statusData.instance || statusData.data || statusData;
          connected = Boolean(inst.phoneConnected || inst.connected || inst.status === 'connected');

          const user =
            inst.user ||
            inst.data?.user ||
            statusData.user ||
            statusData.data?.user ||
            statusData.data ||
            null;

          if (user) {
            const rawPhone = user.id ? user.id.replace(/@.*$/, '') : (user.phone || '');
            const photoUrl =
              user.imageProfile ||
              user.profilePictureUrl ||
              user.picture ||
              user.imgUrl ||
              user.avatar ||
              inst.imageProfile ||
              inst.profilePictureUrl ||
              '';

            userProfile = {
              name: user.name || user.notify || userProfile.name || 'MGI & FORBIN',
              phone: rawPhone ? `+${rawPhone.replace(/\D/g, '')}` : userProfile.phone,
              imageProfile: photoUrl || userProfile.imageProfile || ''
            };

            liveStore.setProfile({
              id: user.id || rawPhone,
              name: userProfile.name,
              phone: userProfile.phone,
              imageProfile: userProfile.imageProfile
            });
          }

          if (!userProfile.imageProfile) {
            const directPic = await client.getProfilePicture().catch(() => null);
            if (directPic) {
              userProfile.imageProfile = directPic;
              liveStore.setProfile({ imageProfile: directPic });
            }
          }
        }

        // 1.2 Obter contatos para associar fotos de perfil aos chats
        const rawContacts = await client.getContacts().catch(() => []);

        const lidToPhone: Record<string, string> = {};
        const lidToAvatar: Record<string, string> = {};
        const phoneToAvatar: Record<string, string> = {};
        const nameToAvatar: Record<string, string> = {};
        const nameToPhone: Record<string, string> = {};

        for (const c of rawContacts) {
          if (c.id || c.number) {
            const fullId = c.id || c.number;
            const cleanDigits = fullId.replace(/@.*$/, '').replace(/\D/g, '');
            const photo = c.imgUrl || (c as any).pictureUrl;
            contactMap[fullId] = { name: c.name, imgUrl: photo, phone: cleanDigits };
            if (cleanDigits) {
              contactMap[cleanDigits] = { name: c.name, imgUrl: photo, phone: cleanDigits };
            }
            if (photo) {
              liveStore.setContactPicture(cleanDigits, photo);
              liveStore.setContactPicture(fullId, photo);
              if (c.name) nameToAvatar[c.name.trim().toLowerCase()] = photo;
            }
            if (c.name && cleanDigits && cleanDigits.length >= 10 && !fullId.includes('@lid')) {
              nameToPhone[c.name.trim().toLowerCase()] = cleanDigits;
            }
          }
        }

        // 1.3 Obter conversas ativas do WhatsApp
        const rawChats = await client.getChats().catch(() => []);

        if (Array.isArray(rawChats) && rawChats.length > 0) {
          // Filtrar status de broadcast ou chats vazios
          const validChats = rawChats.filter(
            (c) => c.chatId && !c.chatId.includes('broadcast') && c.chatId !== 'status@broadcast'
          );

          // PASSO A: Resolver perfil e fotos dos contatos com telefone direto
          for (const c of validChats.slice(0, 40)) {
            const rawId = c.chatId || '';
            const phone = c.phone || rawId.replace(/@.*$/, '').replace(/\D/g, '');
            if (phone && phone.length >= 10 && !rawId.includes('@lid')) {
              if (c.name) {
                nameToPhone[c.name.trim().toLowerCase()] = phone;
              }
              // Buscar foto real via /contacts/{phone}
              try {
                const directContact = await client.getContact(phone).catch(() => null);
                if (directContact) {
                  if (directContact.lid) {
                    const cleanLid = directContact.lid.replace(/@.*$/, '').replace(/\D/g, '');
                    lidToPhone[directContact.lid] = phone;
                    lidToPhone[cleanLid] = phone;
                    if (directContact.imgUrl) {
                      lidToAvatar[directContact.lid] = directContact.imgUrl;
                      lidToAvatar[cleanLid] = directContact.imgUrl;
                    }
                  }
                  if (directContact.imgUrl) {
                    phoneToAvatar[phone] = directContact.imgUrl;
                    liveStore.setContactPicture(phone, directContact.imgUrl);
                    liveStore.setContactPicture(rawId, directContact.imgUrl);
                    if (c.name) nameToAvatar[c.name.trim().toLowerCase()] = directContact.imgUrl;
                  }
                }
              } catch {}
            }
          }

          // PASSO B: Processar os chats do WhatsApp unificando LIDs com telefones reais
          for (let i = 0; i < Math.min(validChats.length, 35); i++) {
            const chat = validChats[i];
            const chatId = chat.chatId || chat.id || '';
            const rawPhone = chat.phone || chatId.replace(/@.*$/, '').replace(/\D/g, '');

            // Se o chat for um LID, tentar resolver o telefone real do contato
            let resolvedPhone = rawPhone;
            if (chatId.includes('@lid') || (rawPhone.length > 13 && !rawPhone.startsWith('55'))) {
              resolvedPhone =
                lidToPhone[chatId] ||
                lidToPhone[rawPhone] ||
                (chat.name ? nameToPhone[chat.name.trim().toLowerCase()] : null) ||
                '';
            }

            const phoneForConv = resolvedPhone || (chatId.includes('@lid') ? '' : rawPhone);
            const convId = phoneForConv ? `conv-${phoneForConv}` : `conv-${chatId.replace(/[^\w]/g, '')}`;

            const contactInfo = contactMap[chatId] || contactMap[rawPhone] || (phoneForConv ? contactMap[phoneForConv] : {}) || {};
            const contactName =
              chat.name ||
              contactInfo.name ||
              (phoneForConv ? `+${phoneForConv}` : 'Contato WhatsApp');

            let avatarUrl =
              phoneToAvatar[phoneForConv] ||
              lidToAvatar[chatId] ||
              lidToAvatar[rawPhone] ||
              (chat.name ? nameToAvatar[chat.name.trim().toLowerCase()] : null) ||
              contactInfo.imgUrl ||
              (phoneForConv ? liveStore.getContactPicture(phoneForConv) : null) ||
              liveStore.getContactPicture(chatId) ||
              null;

            if (!avatarUrl && client && phoneForConv) {
              const directContact = await client.getContact(phoneForConv).catch(() => null);
              if (directContact?.imgUrl) {
                avatarUrl = directContact.imgUrl;
                phoneToAvatar[phoneForConv] = directContact.imgUrl;
                liveStore.setContactPicture(phoneForConv, directContact.imgUrl);
                liveStore.setContactPicture(chatId, directContact.imgUrl);
              }
            }

            if (!avatarUrl) {
              avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(contactName)}&background=252B28&color=45D483`;
            }

            const ts = chat.timestamp ? Number(chat.timestamp) * 1000 : Date.now();
            const dateObj = new Date(ts);
            const timeStr = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            // Verificar se esta conversa já existe (evita duplicação de LID e número real)
            let existingConv = conversations.find(
              (c) =>
                c.id === convId ||
                (phoneForConv && c.contact.phone && c.contact.phone.replace(/\D/g, '') === phoneForConv)
            );

            if (!existingConv) {
              existingConv = {
                id: convId,
                organizationId: '11111111-1111-4111-8111-111111111111',
                channelId: '22222222-2222-4222-8222-222222222222',
                channelType: 'whatsapp',
                contact: {
                  id: `cnt-${phoneForConv || chatId.replace(/[^\w]/g, '')}`,
                  organizationId: '11111111-1111-4111-8111-111111111111',
                  name: contactName,
                  phone: phoneForConv ? `+${phoneForConv}` : undefined,
                  avatarUrl,
                  leadStatus: 'lead',
                  tags: [{ id: 'tag-wa', name: 'WhatsApp', color: '#45D483' }],
                  customFields: {},
                  createdAt: dateObj.toISOString()
                },
                status: 'open',
                priority: 'medium',
                aiEnabled: true,
                aiStatus: 'active',
                unreadCount: chat.unreadCount || 0,
                lastMessageSnippet: 'Conversa WhatsApp',
                lastMessageAt: timeStr,
                lastMessageTimestamp: dateObj.getTime(),
                isStarred: false,
                isPinned: false,
                isArchived: false
              };
              conversations.push(existingConv);
            } else {
              // Se já existia, atualizar avatar se tivermos uma foto real
              if (avatarUrl && !avatarUrl.includes('ui-avatars.com')) {
                existingConv.contact.avatarUrl = avatarUrl;
              }
              if (phoneForConv && !existingConv.contact.phone) {
                existingConv.contact.phone = `+${phoneForConv}`;
              }
              if (contactName && existingConv.contact.name === 'Contato WhatsApp') {
                existingConv.contact.name = contactName;
              }
            }

            // 1.4 Obter mensagens recentes deste chat
            try {
              const rawMsgs = await client.getChatMessages(chatId, 50);
              if (Array.isArray(rawMsgs) && rawMsgs.length > 0) {
                const convMsgs: Message[] = messagesRecord[existingConv.id] ? [...messagesRecord[existingConv.id]] : [];

                for (const m of rawMsgs) {
                  const msgId = m.id || m.key?.id || `msg-${Date.now()}-${Math.random()}`;
                  // Evitar mensagens duplicadas
                  if (convMsgs.some((existing) => existing.id === msgId)) continue;

                  const isFromMe = Boolean(m.from_me ?? m.fromMe ?? m.key?.fromMe);
                  const msgContent =
                    m.text?.body ||
                    m.message?.conversation ||
                    m.message?.extendedTextMessage?.text ||
                    (m.document ? `📄 ${m.document.filename || 'Documento'}` : null) ||
                    (m.image ? (m.image.caption || '📷 Foto') : null) ||
                    (m.video ? (m.video.caption || '🎥 Vídeo') : null) ||
                    (m.audio ? '🎙 Mensagem de voz' : null) ||
                    m.body ||
                    m.content ||
                    m.caption ||
                    'Mensagem';

                  const mediaUrl =
                    m.document?.url ||
                    m.image?.url ||
                    m.video?.url ||
                    m.audio?.url ||
                    m.mediaUrl ||
                    undefined;

                  const rawTs = m.timestamp || m.messageTimestamp || m.date;
                  const tsNum = rawTs
                    ? (Number(rawTs) > 10000000000 ? Number(rawTs) : Number(rawTs) * 1000)
                    : Date.now();
                  const msgTime = new Date(tsNum).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                  convMsgs.push({
                    id: msgId,
                    conversationId: existingConv.id,
                    senderType: isFromMe ? 'agent' : 'contact',
                    senderName: isFromMe ? (userProfile.name || 'Você') : contactName,
                    content: msgContent,
                    messageType: m.document ? 'document' : m.image ? 'image' : m.video ? 'video' : m.audio ? 'audio' : 'text',
                    mediaUrl,
                    deliveryStatus: 'delivered',
                    timestamp: msgTime
                  });
                }

                // Ordenar cronologicamente
                if (convMsgs.length > 0) {
                  const lastMsg = convMsgs[convMsgs.length - 1];
                  existingConv.lastMessageSnippet = lastMsg.content;
                }

                messagesRecord[existingConv.id] = convMsgs;
              }
            } catch (msgErr) {
              console.warn('[WAME_CHAT_MESSAGES_FETCH_WARN]', msgErr);
            }
          }
        }
      } catch (clientErr) {
        console.warn('[WAME_CLIENT_SYNC_WARN]', clientErr);
      }
    }

    // 2. Mesclar mensagens e eventos recebidos pelo Webhook em tempo real
    if (liveEvents.length > 0) {
      for (const event of liveEvents) {
        const convId = event.conversationId;
        const msgTime = event.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const mappedMsg: Message = {
          id: event.id,
          conversationId: convId,
          senderType: event.senderType,
          senderName: event.senderName,
          content: event.content,
          messageType: event.messageType,
          mediaUrl: event.mediaUrl,
          deliveryStatus: 'delivered',
          timestamp: msgTime
        };

        if (!messagesRecord[convId]) {
          messagesRecord[convId] = [];
        }

        // Evitar duplicidade de id
        if (!messagesRecord[convId].some((m) => m.id === mappedMsg.id)) {
          messagesRecord[convId].push(mappedMsg);
        }

        const cleanFrom = event.from.replace(/@.*$/, '').replace(/\D/g, '');
        let eventAvatar =
          contactMap[event.from]?.imgUrl ||
          contactMap[cleanFrom]?.imgUrl ||
          liveStore.getContactPicture(cleanFrom) ||
          liveStore.getContactPicture(event.from) ||
          null;

        if (!eventAvatar && client) {
          const direct = await client.getContact(cleanFrom || event.from).catch(() => null);
          if (direct?.imgUrl) {
            eventAvatar = direct.imgUrl;
            liveStore.setContactPicture(cleanFrom, direct.imgUrl);
            liveStore.setContactPicture(event.from, direct.imgUrl);
          }
        }

        if (!eventAvatar) {
          eventAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(event.senderName || cleanFrom || 'Contato')}&background=252B28&color=45D483`;
        }

        // Encontrar conversa existente (por ID ou por telefone do contato)
        const existingConv = conversations.find(
          (c) =>
            c.id === convId ||
            (cleanFrom && c.contact.phone && c.contact.phone.replace(/\D/g, '') === cleanFrom) ||
            (c.contact.id && c.contact.id.includes(cleanFrom))
        );

        if (existingConv) {
          existingConv.lastMessageSnippet = event.content;
          existingConv.lastMessageAt = msgTime;
          existingConv.lastMessageTimestamp = event.timestampMs;
          existingConv.unreadCount = (existingConv.unreadCount || 0) + 1;
          if (eventAvatar && (eventAvatar.includes('whatsapp.net') || !existingConv.contact.avatarUrl || existingConv.contact.avatarUrl.includes('unsplash') || existingConv.contact.avatarUrl.includes('ui-avatars.com'))) {
            existingConv.contact.avatarUrl = eventAvatar;
          }
        } else {
          conversations.unshift({
            id: convId,
            organizationId: '11111111-1111-4111-8111-111111111111',
            channelId: event.channelType === 'instagram' ? '33333333-3333-4333-8333-333333333333' : '22222222-2222-4222-8222-222222222222',
            channelType: event.channelType,
            contact: {
              id: `cnt-${cleanFrom || event.from.replace(/[^\w]/g, '')}`,
              organizationId: '11111111-1111-4111-8111-111111111111',
              name: event.senderName || (cleanFrom ? `+${cleanFrom}` : event.from),
              phone: event.channelType === 'whatsapp' ? (cleanFrom ? `+${cleanFrom}` : event.from) : undefined,
              instagramUsername: event.channelType === 'instagram' ? event.from : undefined,
              avatarUrl: eventAvatar,
              leadStatus: 'lead',
              tags: [{ id: 'tag-live', name: 'WhatsApp', color: '#45D483' }],
              customFields: {},
              createdAt: new Date().toISOString()
            },
            status: 'open',
            priority: 'high',
            aiEnabled: true,
            aiStatus: 'active',
            unreadCount: 1,
            lastMessageSnippet: event.content,
            lastMessageAt: msgTime,
            lastMessageTimestamp: event.timestampMs,
            isStarred: false,
            isPinned: false,
            isArchived: false
          });
        }
      }
    }

    // 3. Se nenhuma conversa foi retornada (ex: WhatsApp sem conversas recentes),
    // manter os dados iniciais estruturados para o usuário poder testar e interagir
    if (conversations.length === 0) {
      conversations = initialConversations;
      Object.assign(messagesRecord, initialMessages);
    }

    return NextResponse.json({
      success: true,
      connected,
      instanceKey: instanceKey || liveStore.getLastInstanceKey() || '',
      user: userProfile,
      conversations,
      messages: messagesRecord,
      timestamp: new Date().toISOString()
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[WAME_LIVE_SYNC_ERROR]', errorMsg);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
