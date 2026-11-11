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
  AIStatus
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
import { isSupabaseConfigured } from '@/lib/supabase/client';

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
  sendMessage: (content: string, type?: 'text' | 'image' | 'document') => Promise<void>;
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
}

const MoonkyStoreContext = createContext<MoonkyStoreContextType | null>(null);

export function MoonkyStoreProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>('conv-uiux-01');
  const [messages, setMessages] = useState<Record<string, Message[]>>(initialMessages);
  const [channels, setChannels] = useState<Channel[]>(initialChannels);
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [teamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [notes, setNotes] = useState<Record<string, InternalNote[]>>(initialNotes);
  const [knowledgeBase, setKnowledgeBase] = useState<AIKnowledgeItem[]>(initialKnowledgeBase);
  const [aiSettings, setAISettings] = useState<AIAgentSettings>(initialAISettings);
  const [automations, setAutomations] = useState<AutomationRule[]>(initialAutomations);
  const [analytics] = useState<AnalyticsSummary>(initialAnalytics);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isLiveSupabase, setIsLiveSupabase] = useState<boolean>(false);
  const [isDarkMode, setIsDarkModeState] = useState<boolean>(false);

  // Filters
  const [filterChannel, setFilterChannel] = useState<'all' | ChannelType>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | ConversationStatus>('all');
  const [filterAgent, setFilterAgent] = useState<'all' | 'mine' | 'unassigned'>('all');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    setIsLiveSupabase(isSupabaseConfigured());
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

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || conversations[0] || null;

  const activeMessages = activeConversationId ? messages[activeConversationId] || [] : [];

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
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
  });

  /**
   * Send agent message and optionally trigger server-side WAME dispatch
   */
  const sendMessage = async (content: string, type: 'text' | 'image' | 'document' = 'text') => {
    if (!activeConversationId || !content.trim()) return;

    const newMsg: Message = {
      id: `msg-agent-${Date.now()}`,
      conversationId: activeConversationId,
      senderType: 'agent',
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      content: content.trim(),
      messageType: type,
      deliveryStatus: 'delivered',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] || []), newMsg]
    }));

    // Update conversation snippet and time
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? {
              ...c,
              lastMessageSnippet: content.trim(),
              lastMessageAt: newMsg.timestamp,
              unreadCount: 0
            }
          : c
      )
    );

    // Call server-side API endpoint asynchronously
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

    setMessages((prev) => ({
      ...prev,
      [convId]: [...(prev[convId] || []), customerMsg]
    }));

    const targetConv = conversations.find((c) => c.id === convId);

    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              lastMessageSnippet: text,
              lastMessageAt: timeStr,
              unreadCount: c.id === activeConversationId ? 0 : c.unreadCount + 1
            }
          : c
      )
    );

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

      const aiMsg: Message = {
        id: `msg-ai-${Date.now()}`,
        conversationId: convId,
        senderType: 'ai',
        senderName: aiSettings.name,
        content: aiResponse.replyText,
        messageType: 'text',
        deliveryStatus: 'delivered',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        aiMetadata: {
          confidence: aiResponse.confidenceScore,
          tokens: aiResponse.tokensUsed.total,
          model: aiResponse.model
        }
      };

      setMessages((prev) => ({
        ...prev,
        [convId]: [...(prev[convId] || []), aiMsg]
      }));

      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                lastMessageSnippet: aiResponse.replyText,
                lastMessageAt: aiMsg.timestamp,
                // If handoff was triggered, automatically transition AI status to handed_off and assign agent!
                aiStatus: aiResponse.isHandoffRequired ? 'handed_off' : c.aiStatus,
                assignedAgent: aiResponse.isHandoffRequired ? currentUser : c.assignedAgent
              }
            : c
        )
      );

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
  };

  const updateConversationAIStatus = (convId: string, aiStatus: AIStatus) => {
    setConversations((prev) => prev.map((c) => (c.id === convId ? { ...c, aiStatus } : c)));
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
        updateChannel
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
