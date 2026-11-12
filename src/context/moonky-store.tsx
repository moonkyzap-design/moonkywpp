'use client';

// ===================================================================
// MOONKY GLOBAL INTERACTIVE STORE
// Handles real-time conversation state, AI handoff, CRM, and integrations
// ===================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Conversation,
  Message,
  Channel,
  Contact,
  InternalNote,
  AIKnowledgeItem,
  AIAgentSettings,
  AutomationRule,
  TeamMember,
  AnalyticsSummary,
  ChannelType,
  ConversationStatus,
  AIStatus,
  MessageType
} from '@/types';
import {
  initialOrganization,
  currentUser,
  initialChannels,
  initialTeamMembers,
  initialContacts,
  initialConversations,
  initialMessages,
  initialNotes,
  initialKnowledgeBase,
  initialAISettings,
  initialAutomations,
  initialAnalytics
} from '@/lib/mock-data';
import { moonkyAI } from '@/lib/ai/service';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

interface MoonkyStoreContextType {
  // State
  conversations: Conversation[];
  activeConversationId: string | null;
  activeConversation: Conversation | null;
  messages: Record<string, Message[]>;
  activeMessages: Message[];
  channels: Channel[];
  contacts: Contact[];
  teamMembers: TeamMember[];
  notes: Record<string, InternalNote[]>;
  knowledgeBase: AIKnowledgeItem[];
  aiSettings: AIAgentSettings;
  automations: AutomationRule[];
  analytics: AnalyticsSummary;
  isLiveSupabase: boolean;
  isSyncingStats: boolean;
  lastStatsSync: string;
  syncDashboardStatsFromSupabase: () => Promise<void>;
  isTyping: boolean;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  toggleDarkMode: () => void;

  // Filters
  filterChannel: 'all' | ChannelType;
  setFilterChannel: (c: 'all' | ChannelType) => void;
  filterStatus: 'all' | ConversationStatus;
  setFilterStatus: (s: 'all' | ConversationStatus) => void;
  filterAgent: 'all' | 'mine' | 'unassigned';
  setFilterAgent: (a: 'all' | 'mine' | 'unassigned') => void;
  filterTag: string | null;
  setFilterTag: (t: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredConversations: Conversation[];

  // Actions
  setActiveConversationId: (id: string) => void;
  sendMessage: (
    content: string,
    type?: MessageType,
    mediaUrl?: string,
    metadata?: Record<string, unknown>
  ) => Promise<void>;
  simulateCustomerIncomingMessage: (convId: string, text: string) => Promise<void>;
  updateConversationStatus: (convId: string, status: ConversationStatus) => void;
  updateConversationAIStatus: (convId: string, aiStatus: AIStatus) => void;
  assignConversationAgent: (convId: string, agentId: string | null) => void;
  addInternalNote: (convId: string, content: string) => void;
  addContact: (contact: Partial<Contact>) => void;
  updateContact: (id: string, contact: Partial<Contact>) => void;
  toggleAutomation: (id: string) => void;
  addAutomation: (automation: AutomationRule) => void;
  updateKnowledgeItem: (id: string, item: Partial<AIKnowledgeItem>) => void;
  addKnowledgeItem: (item: Omit<AIKnowledgeItem, 'id' | 'updatedAt'>) => void;
  updateAISettings: (settings: Partial<AIAgentSettings>) => void;
  updateChannel: (channelId: string, channel: Partial<Channel>) => void;
  pinMessage: (convId: string, messageId: string) => boolean;
  unpinMessage: (convId: string, messageId: string) => void;
  archiveMessage: (convId: string, messageId: string) => void;
  deleteMessage: (convId: string, messageId: string) => void;
  pinConversation: (convId: string) => boolean;
  unpinConversation: (convId: string) => void;
  archiveConversation: (convId: string) => void;
  deleteConversation: (convId: string) => void;
}

const MoonkyStoreContext = createContext<MoonkyStoreContextType | null>(null);

export function MoonkyStoreProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>(initialMessages);
  const [channels, setChannels] = useState<Channel[]>(initialChannels);
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [teamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [notes, setNotes] = useState<Record<string, InternalNote[]>>(initialNotes);
  const [knowledgeBase, setKnowledgeBase] = useState<AIKnowledgeItem[]>(initialKnowledgeBase);
  const [aiSettings, setAISettings] = useState<AIAgentSettings>(initialAISettings);
  const [automations, setAutomations] = useState<AutomationRule[]>(initialAutomations);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>(initialAnalytics);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isLiveSupabase, setIsLiveSupabase] = useState<boolean>(false);
  const [isSyncingStats, setIsSyncingStats] = useState<boolean>(false);
  const [lastStatsSync, setLastStatsSync] = useState<string>('');
  const [isDarkMode, setIsDarkModeState] = useState<boolean>(false);

  // Filters
  const [filterChannel, setFilterChannel] = useState<'all' | ChannelType>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | ConversationStatus>('all');
  const [filterAgent, setFilterAgent] = useState<'all' | 'mine' | 'unassigned'>('all');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const syncDashboardStatsFromSupabase = async () => {
    try {
      setIsSyncingStats(true);
      const res = await fetch('/api/dashboard/stats', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.analytics) {
          setAnalytics(data.analytics);
          setIsLiveSupabase(true);
          const now = new Date();
          setLastStatsSync(
            now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          );
        }
      }
    } catch (err) {
      console.warn('[SUPABASE_SYNC_STATS_WARN]', err);
    } finally {
      setIsSyncingStats(false);
    }
  };

  const syncConversationsFromSupabase = async () => {
    try {
      const res = await fetch('/api/conversations/list', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (Array.isArray(data.conversations) && data.conversations.length > 0) {
            setConversations(data.conversations);
            setActiveConversationId(data.conversations[0].id);
          } else {
            setConversations([]);
            setActiveConversationId(null);
          }
          if (Array.isArray(data.channels) && data.channels.length > 0) {
            setChannels((prev) =>
              prev.map((ch) => {
                const dbMatch = data.channels.find(
                  (c: any) =>
                    (ch.type === 'whatsapp' && c.type === 'whatsapp') ||
                    (ch.type === 'instagram' && c.type === 'instagram')
                );
                if (dbMatch) {
                  return {
                    ...ch,
                    status: dbMatch.status || ch.status,
                    instanceKey: dbMatch.instance_key || ch.instanceKey,
                    phoneNumber: dbMatch.phone_number || ch.phoneNumber,
                    instagramUsername: dbMatch.instagram_username || ch.instagramUsername,
                    lastSyncAt: dbMatch.last_sync_at || ch.lastSyncAt
                  };
                }
                return ch;
              })
            );
          }
        }
      }
    } catch (err) {
      console.warn('[CONVERSATIONS_SYNC_WARN]', err);
    }
  };

  useEffect(() => {
    setIsLiveSupabase(isSupabaseConfigured());
    // Sincroniza estatísticas e conversas reais do Supabase
    syncDashboardStatsFromSupabase();
    syncConversationsFromSupabase();

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('moonky_theme');
      if (saved === 'dark') {
        setIsDarkModeState(true);
        document.documentElement.classList.add('dark');
      } else if (saved === 'light') {
        setIsDarkModeState(false);
        document.documentElement.classList.remove('dark');
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setIsDarkModeState(true);
        document.documentElement.classList.add('dark');
      }

      // Limpar caches legados de demonstração para garantir dados 100% reais e limpos
      try {
        localStorage.removeItem('moonky_messages_v4');
        localStorage.removeItem('moonky_conversations_v4');
        localStorage.removeItem('moonky_messages_v3');
        localStorage.removeItem('moonky_conversations_v3');
        localStorage.removeItem('moonky_contacts_v4');
      } catch (err) {
        console.error('Failed to clear legacy local storage cache', err);
      }
    }
  }, []);

  const setIsDarkMode = (val: boolean) => {
    setIsDarkModeState(val);
    if (typeof document !== 'undefined') {
      if (val) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('moonky_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('moonky_theme', 'light');
      }
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const activeConversation = activeConversationId
    ? conversations.find((c) => c.id === activeConversationId) || null
    : null;

  const activeMessages = activeConversationId ? messages[activeConversationId] || [] : [];

  // Helper to extract timestamp for ordering conversations by latest activity
  const getConversationTimeValue = (conv: Conversation): number => {
    if (conv.lastMessageTimestamp) return conv.lastMessageTimestamp;
    if (conv.lastMessageAt) {
      const parts = conv.lastMessageAt.split(':');
      if (parts.length === 2) {
        const d = new Date();
        d.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
        return d.getTime();
      }
    }
    return 0;
  };

  // Filter and strictly sort conversations by latest message sent or received (most recent at top)
  const filteredConversations = conversations
    .filter((conv) => {
      if (filterChannel !== 'all' && conv.channelType !== filterChannel) return false;
      if (filterStatus !== 'all' && conv.status !== filterStatus) return false;
      if (filterAgent === 'mine' && conv.assignedAgent?.id !== currentUser.id) return false;
      if (filterAgent === 'unassigned' && conv.assignedAgent !== null) return false;
      if (filterTag && !conv.contact.tags.some((t) => t.name.toLowerCase() === filterTag.toLowerCase())) {
        return false;
      }
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchName = conv.contact.name.toLowerCase().includes(q);
        const matchPhone = conv.contact.phone?.toLowerCase().includes(q);
        const matchSnippet = conv.lastMessageSnippet.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchSnippet) return false;
      }
      return true;
    })
    .sort((a, b) => getConversationTimeValue(b) - getConversationTimeValue(a));

  /**
   * Send agent message and optionally trigger server-side WAME dispatch
   */
  const sendMessage = async (
    content: string,
    type: MessageType = 'text',
    mediaUrl?: string,
    metadata?: Record<string, unknown>
  ) => {
    if (!activeConversationId) return;
    if (type === 'text' && !content.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const now = Date.now();
    const newMsg: Message = {
      id: `msg-agent-${now}`,
      conversationId: activeConversationId,
      senderType: 'agent',
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      content: content.trim(),
      messageType: type,
      mediaUrl,
      metadata: metadata || {},
      deliveryStatus: 'delivered',
      timestamp: timeStr
    };

    setMessages((prev) => {
      const currentList = prev[activeConversationId] || [];
      const updated = {
        ...prev,
        [activeConversationId]: [...currentList, newMsg]
      };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('moonky_messages_v4', JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });

    const snippet =
      type === 'image'
        ? '📷 Foto'
        : type === 'video'
        ? '🎥 Vídeo'
        : type === 'audio'
        ? '🎙 Mensagem de voz'
        : type === 'document'
        ? `📄 ${content}`
        : content.trim();

    // Reorder conversation to the top with updated snippet and timestamp
    setConversations((prev) => {
      const target = prev.find((c) => c.id === activeConversationId);
      if (!target) return prev;
      const updatedTarget: Conversation = {
        ...target,
        lastMessageSnippet: snippet,
        lastMessageAt: timeStr,
        lastMessageTimestamp: now,
        unreadCount: 0
      };
      const rest = prev.filter((c) => c.id !== activeConversationId);
      const reordered = [updatedTarget, ...rest];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('moonky_conversations_v4', JSON.stringify(reordered));
        } catch {}
      }
      return reordered;
    });

    // 1. Salvar no Banco de Dados Real (Supabase)
    try {
      fetch('/api/messages/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConversationId,
          content: content.trim(),
          messageType: type,
          mediaUrl,
          metadata: metadata || {},
          senderType: 'agent',
          channelType: activeConversation?.channelType || 'whatsapp'
        })
      })
        .then((r) => r.json())
        .then((res) => {
          console.log('[BANCO_REAL_SUPABASE_SALVO]', res);
          syncDashboardStatsFromSupabase();
        })
        .catch((e) => console.warn('[BANCO_REAL_AVISO]', e));
    } catch (e) {
      // non-blocking
    }

    // 2. Despachar via API Oficial WAME (WhatsApp / Instagram Direct)
    try {
      fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConversationId,
          content: content.trim(),
          recipient: activeConversation?.contact.phone || activeConversation?.contact.instagramUsername
        })
      }).catch((e) => console.log('Outgoing dispatch recorded', e));
    } catch (e) {
      // non-blocking
    }
  };

  /**
   * Simulate or process incoming customer message
   * Triggers Moonky AI evaluation and strict human handoff if needed
   */
  const simulateCustomerIncomingMessage = async (convId: string, text: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const customerMsg: Message = {
      id: `msg-cust-${Date.now()}`,
      conversationId: convId,
      senderType: 'contact',
      content: text,
      messageType: 'text',
      deliveryStatus: 'read',
      timestamp: timeStr
    };

    setMessages((prev) => {
      const updated = {
        ...prev,
        [convId]: [...(prev[convId] || []), customerMsg]
      };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('moonky_messages_v4', JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });

    const now = Date.now();
    const targetConv = conversations.find((c) => c.id === convId);
    setConversations((prev) => {
      const target = prev.find((c) => c.id === convId);
      if (!target) return prev;
      const updatedTarget: Conversation = {
        ...target,
        lastMessageSnippet: text,
        lastMessageAt: timeStr,
        lastMessageTimestamp: now,
        unreadCount: convId === activeConversationId ? 0 : target.unreadCount + 1
      };
      const rest = prev.filter((c) => c.id !== convId);
      const reordered = [updatedTarget, ...rest];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('moonky_conversations_v4', JSON.stringify(reordered));
        } catch {}
      }
      return reordered;
    });

    // Evaluate AI rules:
    // AI responds only if conversation has AI enabled AND aiStatus is 'active' (NOT paused, NOT handed_off)
    if (targetConv && targetConv.aiEnabled && targetConv.aiStatus === 'active') {
      setIsTyping(true);

      // Generate strictly grounded response
      const existingHistory = (messages[convId] || []).map((m) => ({
        role: m.senderType === 'contact' ? ('customer' as const) : ('assistant' as const),
        text: m.content
      }));

      const aiResponse = await moonkyAI.generateResponse({
        conversationId: convId,
        contactName: targetConv.contact.name,
        lastCustomerMessage: text,
        conversationHistory: existingHistory,
        knowledgeBase,
        customInstructions: aiSettings.instructions,
        personality: aiSettings.personality
      });

      setIsTyping(false);

      const aiTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const aiNow = Date.now();
      const aiMsg: Message = {
        id: `msg-ai-${aiNow}`,
        conversationId: convId,
        senderType: 'ai',
        senderName: aiSettings.name,
        content: aiResponse.replyText,
        messageType: 'text',
        deliveryStatus: 'delivered',
        timestamp: aiTime,
        aiMetadata: {
          confidence: aiResponse.confidenceScore,
          tokens: aiResponse.tokensUsed.total,
          model: aiResponse.model
        }
      };

      setMessages((prev) => {
        const updated = {
          ...prev,
          [convId]: [...(prev[convId] || []), aiMsg]
        };
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('moonky_messages_v4', JSON.stringify(updated));
          } catch {}
        }
        return updated;
      });

      setConversations((prev) => {
        const target = prev.find((c) => c.id === convId);
        if (!target) return prev;
        const updatedTarget: Conversation = {
          ...target,
          lastMessageSnippet: aiResponse.replyText,
          lastMessageAt: aiTime,
          lastMessageTimestamp: aiNow,
          // If handoff was triggered, automatically transition AI status to handed_off and assign agent!
          aiStatus: aiResponse.isHandoffRequired ? 'handed_off' : target.aiStatus,
          assignedAgent: aiResponse.isHandoffRequired ? currentUser : target.assignedAgent
        };
        const rest = prev.filter((c) => c.id !== convId);
        const reordered = [updatedTarget, ...rest];
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('moonky_conversations_v4', JSON.stringify(reordered));
          } catch {}
        }
        return reordered;
      });

      // If handoff required, append automated system note
      if (aiResponse.isHandoffRequired) {
        addInternalNote(
          convId,
          `[AUTOMATED HANDOFF] Customer inquiry triggered human escalation. Reason: ${aiResponse.reasoningNote || 'Uncertainty / Human agent requested'}`
        );
      }
    }
  };

  const updateConversationStatus = (convId: string, status: ConversationStatus) => {
    setConversations((prev) => prev.map((c) => (c.id === convId ? { ...c, status } : c)));
    setTimeout(syncDashboardStatsFromSupabase, 100);
  };

  const updateConversationAIStatus = (convId: string, aiStatus: AIStatus) => {
    setConversations((prev) => prev.map((c) => (c.id === convId ? { ...c, aiStatus } : c)));
    setTimeout(syncDashboardStatsFromSupabase, 100);
  };

  const assignConversationAgent = (convId: string, agentId: string | null) => {
    const selectedAgent = teamMembers.find((m) => m.id === agentId) || null;
    const agentProfile = selectedAgent
      ? {
          id: selectedAgent.id,
          email: selectedAgent.email,
          fullName: selectedAgent.fullName,
          avatarUrl: selectedAgent.avatarUrl,
          role: selectedAgent.role,
          organizationId: initialOrganization.id
        }
      : null;

    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, assignedAgent: agentProfile } : c))
    );
  };

  const addInternalNote = (convId: string, content: string) => {
    const newNote: InternalNote = {
      id: `note-${Date.now()}`,
      conversationId: convId,
      author: {
        name: currentUser.fullName,
        avatarUrl: currentUser.avatarUrl
      },
      content: content.trim(),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setNotes((prev) => ({
      ...prev,
      [convId]: [newNote, ...(prev[convId] || [])]
    }));
  };

  const addContact = (newContact: Partial<Contact>) => {
    const created: Contact = {
      id: `cnt-${Date.now()}`,
      organizationId: initialOrganization.id,
      name: newContact.name || 'New Customer',
      phone: newContact.phone,
      instagramUsername: newContact.instagramUsername,
      email: newContact.email,
      avatarUrl:
        newContact.avatarUrl ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      leadStatus: newContact.leadStatus || 'lead',
      tags: newContact.tags || [{ id: 'tag-new', name: 'New Lead', color: '#45D483' }],
      customFields: newContact.customFields || {},
      notes: newContact.notes || '',
      createdAt: new Date().toISOString()
    };
    setContacts((prev) => [created, ...prev]);
  };

  const updateContact = (id: string, updatedFields: Partial<Contact>) => {
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c)));
    setConversations((prev) =>
      prev.map((conv) =>
        conv.contact.id === id
          ? { ...conv, contact: { ...conv.contact, ...updatedFields } }
          : conv
      )
    );
  };

  const toggleAutomation = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );
  };

  const addAutomation = (automation: AutomationRule) => {
    setAutomations((prev) => [automation, ...prev]);
  };

  const updateKnowledgeItem = (id: string, item: Partial<AIKnowledgeItem>) => {
    setKnowledgeBase((prev) =>
      prev.map((k) =>
        k.id === id
          ? { ...k, ...item, updatedAt: new Date().toISOString().split('T')[0] }
          : k
      )
    );
  };

  const addKnowledgeItem = (item: Omit<AIKnowledgeItem, 'id' | 'updatedAt'>) => {
    const newItem: AIKnowledgeItem = {
      ...item,
      id: `kb-${Date.now()}`,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setKnowledgeBase((prev) => [newItem, ...prev]);
  };

  const updateAISettings = (newSettings: Partial<AIAgentSettings>) => {
    setAISettings((prev) => ({ ...prev, ...newSettings }));
  };

  const updateChannel = (channelId: string, updated: Partial<Channel>) => {
    setChannels((prev) => prev.map((ch) => (ch.id === channelId ? { ...ch, ...updated } : ch)));
    if (supabase && isSupabaseConfigured()) {
      const dbChannelId = channelId.includes('wa')
        ? '22222222-2222-4222-8222-222222222222'
        : channelId.includes('ig')
        ? '33333333-3333-4333-8333-333333333333'
        : channelId;
      const dbPayload: Record<string, unknown> = {};
      if (updated.status) dbPayload.status = updated.status;
      if (updated.instanceKey !== undefined) dbPayload.instance_key = updated.instanceKey;
      if (updated.phoneNumber !== undefined) dbPayload.phone_number = updated.phoneNumber;
      if (updated.instagramUsername !== undefined) dbPayload.instagram_username = updated.instagramUsername;
      if (updated.lastSyncAt !== undefined) dbPayload.last_sync_at = new Date().toISOString();
      if (Object.keys(dbPayload).length > 0) {
        supabase.from('channels').update(dbPayload).eq('id', dbChannelId).then();
      }
    }
  };

  /**
   * Fixar mensagem no topo da conversa (limite máximo de 5 mensagens)
   */
  const pinMessage = (convId: string, messageId: string): boolean => {
    const list = messages[convId] || [];
    const currentlyPinned = list.filter((m) => m.isPinned && !m.isArchived);
    if (currentlyPinned.length >= 5) {
      return false; // Limite de 5 atingido
    }
    const updatedList = list.map((m) =>
      m.id === messageId
        ? {
            ...m,
            isPinned: true,
            pinnedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        : m
    );
    const updated = { ...messages, [convId]: updatedList };
    setMessages(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('moonky_messages_v4', JSON.stringify(updated));
      } catch {}
    }
    return true;
  };

  /**
   * Desafixar mensagem do topo
   */
  const unpinMessage = (convId: string, messageId: string) => {
    const list = messages[convId] || [];
    const updatedList = list.map((m) =>
      m.id === messageId ? { ...m, isPinned: false, pinnedAt: undefined } : m
    );
    const updated = { ...messages, [convId]: updatedList };
    setMessages(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('moonky_messages_v4', JSON.stringify(updated));
      } catch {}
    }
  };

  /**
   * Arquivar / Desarquivar mensagem
   */
  const archiveMessage = (convId: string, messageId: string) => {
    const list = messages[convId] || [];
    const updatedList = list.map((m) =>
      m.id === messageId ? { ...m, isArchived: !m.isArchived, isPinned: false } : m
    );
    const updated = { ...messages, [convId]: updatedList };
    setMessages(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('moonky_messages_v4', JSON.stringify(updated));
      } catch {}
    }
  };

  /**
   * Excluir mensagem do histórico e atualizar prévia se necessário
   */
  const deleteMessage = (convId: string, messageId: string) => {
    const list = messages[convId] || [];
    const updatedList = list.filter((m) => m.id !== messageId);
    const updated = { ...messages, [convId]: updatedList };
    setMessages(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('moonky_messages_v4', JSON.stringify(updated));
      } catch {}
    }
    if (updatedList.length > 0) {
      const lastMsg = updatedList[updatedList.length - 1];
      const snippet =
        lastMsg.messageType === 'image'
          ? '📷 Foto'
          : lastMsg.messageType === 'audio'
          ? '🎙 Mensagem de voz'
          : lastMsg.messageType === 'document'
          ? `📄 ${lastMsg.content}`
          : lastMsg.content;
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId ? { ...c, lastMessageSnippet: snippet, lastMessageAt: lastMsg.timestamp } : c
        )
      );
    }
  };

  /**
   * Fixar conversa no topo da lista (limite de até 5 conversas fixadas)
   */
  const pinConversation = (convId: string): boolean => {
    const pinnedCount = conversations.filter((c) => c.isPinned && !c.isArchived).length;
    const target = conversations.find((c) => c.id === convId);
    if (!target) return false;
    if (!target.isPinned && pinnedCount >= 5) {
      return false;
    }
    const updated = conversations.map((c) =>
      c.id === convId
        ? { ...c, isPinned: true, pinnedAt: new Date().toISOString() }
        : c
    );
    setConversations(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('moonky_conversations_v4', JSON.stringify(updated));
      } catch {}
    }
    return true;
  };

  /**
   * Desafixar conversa do topo
   */
  const unpinConversation = (convId: string) => {
    const updated = conversations.map((c) =>
      c.id === convId
        ? { ...c, isPinned: false, pinnedAt: undefined }
        : c
    );
    setConversations(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('moonky_conversations_v4', JSON.stringify(updated));
      } catch {}
    }
  };

  /**
   * Arquivar / Desarquivar conversa inteira
   */
  const archiveConversation = (convId: string) => {
    const updated = conversations.map((c) =>
      c.id === convId
        ? { ...c, isArchived: !c.isArchived, isPinned: false }
        : c
    );
    setConversations(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('moonky_conversations_v4', JSON.stringify(updated));
      } catch {}
    }
  };

  /**
   * Excluir conversa
   */
  const deleteConversation = (convId: string) => {
    const updated = conversations.filter((c) => c.id !== convId);
    setConversations(updated);
    if (activeConversationId === convId) {
      setActiveConversationId(updated.length > 0 ? updated[0].id : null);
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('moonky_conversations_v4', JSON.stringify(updated));
      } catch {}
    }
    // Remove mensagens da conversa
    setMessages((prev) => {
      const copy = { ...prev };
      delete copy[convId];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('moonky_messages_v4', JSON.stringify(copy));
        } catch {}
      }
      return copy;
    });
    // Se Supabase estiver conectado, remove de forma assíncrona
    if (supabase && isSupabaseConfigured()) {
      try {
        supabase.from('conversations').delete().eq('id', convId).then(() => {
          syncDashboardStatsFromSupabase();
        });
      } catch (err) {
        console.warn('Erro ao deletar conversa no Supabase:', err);
      }
    }
  };

  return (
    <MoonkyStoreContext.Provider
      value={{
        conversations,
        activeConversationId,
        activeConversation,
        messages,
        activeMessages,
        channels,
        contacts,
        teamMembers,
        notes,
        knowledgeBase,
        aiSettings,
        automations,
        analytics,
        isLiveSupabase,
        isSyncingStats,
        lastStatsSync,
        syncDashboardStatsFromSupabase,
        isTyping,
        isDarkMode,
        setIsDarkMode,
        toggleDarkMode,
        filterChannel,
        setFilterChannel,
        filterStatus,
        setFilterStatus,
        filterAgent,
        setFilterAgent,
        filterTag,
        setFilterTag,
        searchQuery,
        setSearchQuery,
        filteredConversations,
        setActiveConversationId,
        sendMessage,
        simulateCustomerIncomingMessage,
        updateConversationStatus,
        updateConversationAIStatus,
        assignConversationAgent,
        addInternalNote,
        addContact,
        updateContact,
        toggleAutomation,
        addAutomation,
        updateKnowledgeItem,
        addKnowledgeItem,
        updateAISettings,
        updateChannel,
        pinMessage,
        unpinMessage,
        archiveMessage,
        deleteMessage,
        pinConversation,
        unpinConversation,
        archiveConversation,
        deleteConversation
      }}
    >
      {children}
    </MoonkyStoreContext.Provider>
  );
}

export function useMoonky() {
  const ctx = useContext(MoonkyStoreContext);
  if (!ctx) {
    throw new Error('useMoonky must be used within MoonkyStoreProvider');
  }
  return ctx;
}
