// ===================================================================
// PERSIST MESSAGE TO REAL DATABASE (SUPABASE)
// Saves text, audio recordings, images, and documents
// ===================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase/client';
import { randomUUID } from 'crypto';

const ORG_UUID = '11111111-1111-4111-8111-111111111111';
const WA_CHANNEL_UUID = '22222222-2222-4222-8222-222222222222';
const IG_CHANNEL_UUID = '33333333-3333-4333-8333-333333333333';

// Mapeamento de conversas para UUIDs válidos no banco
const CONVERSATION_UUID_MAP: Record<string, string> = {
  'conv-mariana-01': '55555555-5555-4555-8555-555555555551',
  'conv-darya-02': '55555555-5555-4555-8555-555555555552',
  'conv-omid-03': '55555555-5555-4555-8555-555555555553',
  'conv-carlos-04': '55555555-5555-4555-8555-555555555554',
  'conv-sanaz-05': '55555555-5555-4555-8555-555555555555'
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      conversationId,
      content,
      messageType = 'text',
      mediaUrl,
      senderType = 'agent',
      channelType = 'whatsapp',
      metadata = {}
    } = body;

    const convUUID = CONVERSATION_UUID_MAP[conversationId] || conversationId;
    const channelUUID = channelType === 'instagram' ? IG_CHANNEL_UUID : WA_CHANNEL_UUID;
    const msgUUID = randomUUID();

    // Iniciar cliente Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Tentar gravar no Supabase
    const { data, error } = await supabase.from('messages').insert({
      id: msgUUID,
      organization_id: ORG_UUID,
      conversation_id: convUUID,
      channel_id: channelUUID,
      sender_type: senderType,
      content: content || (messageType === 'audio' ? 'Mensagem de voz' : messageType === 'video' ? 'Vídeo' : 'Arquivo anexado'),
      message_type: messageType,
      media_url: mediaUrl || null,
      metadata: metadata || {},
      delivery_status: 'delivered'
    }).select();

    if (error) {
      console.warn('[SUPABASE_SAVE_WARNING]', error.message, error.code);
      return NextResponse.json({
        success: true,
        savedIn: 'local_storage',
        warning: error.message,
        needsSeed: error.code === '42501' || error.code === '23503',
        message: {
          id: msgUUID,
          conversationId,
          content,
          messageType,
          mediaUrl
        }
      });
    }

    return NextResponse.json({
      success: true,
      savedIn: 'supabase',
      database: 'real',
      data
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Save message error:', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
