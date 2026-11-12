// ===================================================================
// LIST REAL CONVERSATIONS FROM SUPABASE
// Returns active conversations, associated contacts, and channels
// ===================================================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

const ORG_UUID = '11111111-1111-4111-8111-111111111111';

export async function GET() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // 1. Obter canais atualizados
    const { data: channelsData } = await supabase
      .from('channels')
      .select('*')
      .eq('organization_id', ORG_UUID);

    // 2. Obter conversas com contatos
    const { data: convsData, error: convsErr } = await supabase
      .from('conversations')
      .select(`
        id,
        organization_id,
        channel_id,
        contact_id,
        status,
        priority,
        ai_enabled,
        ai_status,
        unread_count,
        last_message_preview,
        last_message_at,
        created_at,
        contacts (
          id,
          name,
          phone,
          instagram_username,
          avatar_url,
          lead_status,
          notes
        ),
        channels (
          id,
          name,
          type,
          status,
          phone_number,
          instagram_username
        )
      `)
      .eq('organization_id', ORG_UUID)
      .order('last_message_at', { ascending: false });

    if (convsErr) {
      console.warn('[CONVERSATIONS_LIST_ERR]', convsErr.message);
      return NextResponse.json({
        success: true,
        conversations: [],
        channels: channelsData || [],
        warning: convsErr.message
      });
    }

    const formattedConversations = (convsData || []).map((row: any) => {
      const contactObj = row.contacts || {};
      const channelObj = row.channels || {};
      const dateObj = row.last_message_at ? new Date(row.last_message_at) : new Date();
      const timeStr = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      return {
        id: row.id,
        organizationId: row.organization_id,
        channelId: row.channel_id,
        channelType: channelObj.type || (row.channel_id === '33333333-3333-4333-8333-333333333333' ? 'instagram' : 'whatsapp'),
        contact: {
          id: contactObj.id || row.contact_id,
          organizationId: row.organization_id,
          name: contactObj.name || 'Contato WAME',
          phone: contactObj.phone || '',
          instagramUsername: contactObj.instagram_username || '',
          avatarUrl: contactObj.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          leadStatus: contactObj.lead_status || 'lead',
          tags: [{ id: 'tag-1', name: 'WAME Live', color: '#45D483' }],
          notes: contactObj.notes || '',
          createdAt: row.created_at
        },
        status: row.status || 'open',
        priority: row.priority || 'medium',
        aiEnabled: row.ai_enabled ?? true,
        aiStatus: row.ai_status || 'active',
        unreadCount: row.unread_count || 0,
        lastMessageSnippet: row.last_message_preview || '',
        lastMessageAt: timeStr,
        lastMessageTimestamp: dateObj.getTime(),
        isStarred: false,
        isPinned: false,
        isArchived: false
      };
    });

    return NextResponse.json({
      success: true,
      conversations: formattedConversations,
      channels: channelsData || []
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[API_CONVERSATIONS_LIST_ERROR]', errorMsg);
    return NextResponse.json({ success: false, error: errorMsg, conversations: [] }, { status: 500 });
  }
}
