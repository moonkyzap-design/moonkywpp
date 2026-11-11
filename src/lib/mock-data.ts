// ===================================================================
// MOONKY INITIAL STATE & IDENTIFIED DEMO DATA
// Faithful replication of image.png reference & omnichannel specs
// ===================================================================

import {
  UserProfile,
  Organization,
  Channel,
  Contact,
  Conversation,
  Message,
  InternalNote,
  AIKnowledgeItem,
  AIAgentSettings,
  AutomationRule,
  TeamMember,
  AnalyticsSummary
} from '@/types';

export const initialOrganization: Organization = {
  id: 'org-moonky-global-01',
  name: 'Moonky Technologies',
  slug: 'moonky-tech',
  logoUrl: '',
  plan: 'growth'
};

export const currentUser: UserProfile = {
  id: 'user-hana-01',
  email: 'hana@moonky.io',
  fullName: 'Hana',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'admin',
  organizationId: 'org-moonky-global-01'
};

export const initialChannels: Channel[] = [
  {
    id: 'chan-wame-wa-01',
    organizationId: 'org-moonky-global-01',
    name: 'WhatsApp Official Care',
    type: 'whatsapp',
    provider: 'wame',
    instanceKey: 'WAME_PROD_INSTANCE_8941',
    isOfficial: true,
    phoneNumber: '+55 11 98877-6655',
    status: 'connected',
    webhookUrl: 'https://moonky.app/api/webhooks/wame',
    lastSyncAt: 'Just now'
  },
  {
    id: 'chan-wame-ig-01',
    organizationId: 'org-moonky-global-01',
    name: 'Instagram Direct Support',
    type: 'instagram',
    provider: 'wame',
    instanceKey: 'WAME_IG_INSTANCE_4421',
    isOfficial: true,
    instagramUsername: 'moonky.enterprise',
    status: 'connected',
    webhookUrl: 'https://moonky.app/api/webhooks/wame',
    lastSyncAt: '2 min ago'
  }
];

export const initialTeamMembers: TeamMember[] = [
  {
    id: 'user-hana-01',
    fullName: 'Hana',
    email: 'hana@moonky.io',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    status: 'active',
    assignedChatsCount: 5,
    lastActiveAt: 'Active now'
  },
  {
    id: 'user-mobin-02',
    fullName: 'Mobin',
    email: 'mobin@moonky.io',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'supervisor',
    status: 'active',
    assignedChatsCount: 3,
    lastActiveAt: '5m ago'
  },
  {
    id: 'user-arshia-03',
    fullName: 'Arshia',
    email: 'arshia@moonky.io',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    role: 'agent',
    status: 'active',
    assignedChatsCount: 4,
    lastActiveAt: '12m ago'
  },
  {
    id: 'user-mahdi-04',
    fullName: 'Mahdi',
    email: 'mahdi@moonky.io',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'agent',
    status: 'active',
    assignedChatsCount: 2,
    lastActiveAt: 'Active now'
  }
];

export const initialContacts: Contact[] = [
  {
    id: 'cnt-uiux-01',
    organizationId: 'org-moonky-global-01',
    name: 'Ui/Ux Team',
    phone: '+55 11 98877-1122',
    instagramUsername: 'uiux_designers',
    email: 'team@uiux.design',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    leadStatus: 'customer',
    tags: [
      { id: 'tag-vip', name: 'Product Team', color: '#45D483' },
      { id: 'tag-priority', name: 'Tier 1 Priority', color: '#252B28' }
    ],
    customFields: {
      Members: '37 Members',
      Online: '12 Online',
      Bio: "In this group, we answer each other's questions and help and support each other in the path of growth."
    },
    notes: 'Official UI/UX product design collaboration workspace.',
    createdAt: '2026-06-01T10:00:00Z'
  },
  {
    id: 'cnt-darya-02',
    organizationId: 'org-moonky-global-01',
    name: 'Darya Sohrabi',
    phone: '+55 11 99123-4567',
    instagramUsername: 'darya.sohrabi',
    email: 'darya.sohrabi@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    leadStatus: 'customer',
    tags: [{ id: 'tag-client', name: 'Client Care', color: '#45D483' }],
    customFields: { City: 'São Paulo' },
    notes: 'Please send all the pictures here.',
    createdAt: '2026-06-05T14:30:00Z'
  },
  {
    id: 'cnt-omid-03',
    organizationId: 'org-moonky-global-01',
    name: 'Omid Amiri',
    phone: '+55 21 98888-2233',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    leadStatus: 'qualified',
    tags: [{ id: 'tag-voice', name: 'Voice Memo', color: '#45D483' }],
    customFields: { Status: 'Recording' },
    createdAt: '2026-06-06T09:15:00Z'
  },
  {
    id: 'cnt-emell-04',
    organizationId: 'org-moonky-global-01',
    name: 'Emell Asghari',
    phone: '+1 415 555-0192',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    leadStatus: 'customer',
    tags: [{ id: 'tag-vip', name: 'VIP Customer', color: '#45D483' }],
    customFields: { Region: 'US West' },
    createdAt: '2026-06-07T08:00:00Z'
  },
  {
    id: 'cnt-sanaz-05',
    organizationId: 'org-moonky-global-01',
    name: 'Sanaz vintoni',
    instagramUsername: 'sanaz_vintoni',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    leadStatus: 'lead',
    tags: [{ id: 'tag-issue', name: 'Connectivity Issue', color: '#FF453A' }],
    customFields: {},
    createdAt: '2026-06-07T11:20:00Z'
  }
];

export const initialConversations: Conversation[] = [
  {
    id: 'conv-uiux-01',
    organizationId: 'org-moonky-global-01',
    channelId: 'chan-wame-wa-01',
    channelType: 'whatsapp',
    contact: initialContacts[0],
    assignedAgent: currentUser,
    status: 'open',
    priority: 'high',
    aiEnabled: true,
    aiStatus: 'active',
    unreadCount: 0,
    lastMessageSnippet: '🎙 Voice message',
    lastMessageAt: '12:23',
    isStarred: true
  },
  {
    id: 'conv-darya-02',
    organizationId: 'org-moonky-global-01',
    channelId: 'chan-wame-wa-01',
    channelType: 'whatsapp',
    contact: initialContacts[1],
    assignedAgent: currentUser,
    status: 'open',
    priority: 'medium',
    aiEnabled: true,
    aiStatus: 'active',
    unreadCount: 0,
    lastMessageSnippet: 'Please send all the pictures here.',
    lastMessageAt: '13:42',
    isStarred: false
  },
  {
    id: 'conv-omid-03',
    organizationId: 'org-moonky-global-01',
    channelId: 'chan-wame-wa-01',
    channelType: 'whatsapp',
    contact: initialContacts[2],
    assignedAgent: currentUser,
    status: 'open',
    priority: 'high',
    aiEnabled: true,
    aiStatus: 'active',
    unreadCount: 9,
    lastMessageSnippet: 'Recording a voice message...',
    lastMessageAt: '12:23',
    isStarred: true
  },
  {
    id: 'conv-emell-04',
    organizationId: 'org-moonky-global-01',
    channelId: 'chan-wame-ig-01',
    channelType: 'instagram',
    contact: initialContacts[3],
    assignedAgent: currentUser,
    status: 'open',
    priority: 'medium',
    aiEnabled: true,
    aiStatus: 'active',
    unreadCount: 2,
    lastMessageSnippet: 'Hi Hana, How are you today?',
    lastMessageAt: '12:23',
    isStarred: false
  },
  {
    id: 'conv-sanaz-05',
    organizationId: 'org-moonky-global-01',
    channelId: 'chan-wame-ig-01',
    channelType: 'instagram',
    contact: initialContacts[4],
    assignedAgent: currentUser,
    status: 'pending',
    priority: 'high',
    aiEnabled: false,
    aiStatus: 'paused',
    unreadCount: 1,
    lastMessageSnippet: 'There is an issue with my internet...',
    lastMessageAt: '08:21',
    isStarred: false
  }
];

export const initialMessages: Record<string, Message[]> = {
  'conv-uiux-01': [
    {
      id: 'msg-01',
      conversationId: 'conv-uiux-01',
      senderType: 'contact',
      senderId: 'user-mobin-02',
      senderName: 'Mobin',
      content: "Hi guys, have you completed your Design's?",
      messageType: 'text',
      deliveryStatus: 'delivered',
      timestamp: '14:23'
    },
    {
      id: 'msg-02',
      conversationId: 'conv-uiux-01',
      senderType: 'contact',
      senderId: 'user-arshia-03',
      senderName: 'Arshia',
      content: 'Hey Mahdi, Send your designs.',
      messageType: 'text',
      deliveryStatus: 'delivered',
      timestamp: '14:23'
    },
    {
      id: 'msg-03',
      conversationId: 'conv-uiux-01',
      senderType: 'contact',
      senderId: 'user-mahdi-04',
      senderName: 'Mahdi',
      content: 'Are my new designs attractive? I would love to know your opinion about it 😎✌️',
      messageType: 'image',
      mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
      deliveryStatus: 'delivered',
      timestamp: '22:10'
    },
    {
      id: 'msg-04',
      conversationId: 'conv-uiux-01',
      senderType: 'agent',
      senderId: 'user-hana-01',
      senderName: 'Hana',
      content: 'Hi Mahdi, your work is really amazing 😍',
      messageType: 'text',
      deliveryStatus: 'read',
      timestamp: '22:10'
    },
    {
      id: 'msg-05',
      conversationId: 'conv-uiux-01',
      senderType: 'agent',
      senderId: 'user-hana-01',
      senderName: 'Hana',
      content: 'Voice memo 12"',
      messageType: 'audio',
      deliveryStatus: 'read',
      timestamp: '22:11'
    }
  ],
  'conv-darya-02': [
    {
      id: 'msg-d1',
      conversationId: 'conv-darya-02',
      senderType: 'contact',
      senderId: 'cnt-darya-02',
      senderName: 'Darya',
      content: 'Please send all the pictures here.',
      messageType: 'text',
      deliveryStatus: 'delivered',
      timestamp: '13:42'
    }
  ]
};

export const initialNotes: Record<string, InternalNote[]> = {
  'conv-uiux-01': [
    {
      id: 'note-01',
      conversationId: 'conv-uiux-01',
      author: {
        name: currentUser.fullName,
        avatarUrl: currentUser.avatarUrl
      },
      content: 'Final review round for sprint deliverables. All assets verified.',
      createdAt: 'Today, 14:30'
    }
  ]
};

export const initialAIKnowledge: AIKnowledgeItem[] = [
  {
    id: 'kb-01',
    title: 'Horário de Atendimento',
    content: 'O suporte humano da Moonky opera de segunda a sexta, das 08h00 às 20h00.',
    category: 'Suporte',
    isActive: true,
    updatedAt: '2026-06-01'
  },
  {
    id: 'kb-02',
    title: 'Preços e Planos',
    content: 'Plano Starter por R$ 199/mês (3 agentes), Growth por R$ 499/mês (10 agentes).',
    category: 'Planos',
    isActive: true,
    updatedAt: '2026-06-01'
  }
];

export const initialAIAgentSettings: AIAgentSettings = {
  name: 'Moonky Intelligence',
  personality: 'Você é o assistente virtual da Moonky. Seja empático, minimalista e preciso.',
  instructions: 'Moonky é uma plataforma omnichannel de comunicação unificando WhatsApp e Instagram.',
  whatsappEnabled: true,
  instagramEnabled: true,
  handoffKeywords: ['humano', 'atendente', 'falar com pessoa', 'reclamar', 'urgente'],
  confidenceThreshold: 0.85,
  autoReplyEnabled: true,
  provider: 'gemini',
  model: 'gemini-1.5-flash'
};

export const initialAutomationRules: AutomationRule[] = [
  {
    id: 'auto-01',
    name: 'Auto-resposta de Boas-Vindas',
    description: 'Responde automaticamente aos clientes quando iniciam conversa',
    triggerType: 'new_conversation',
    triggerConfig: { channel: 'whatsapp' },
    actions: [{ type: 'send_message', payload: { text: 'Olá! Bem-vindo à Moonky. Como podemos ajudar você hoje?' } }],
    isActive: true
  }
];

export const initialAnalytics: AnalyticsSummary = {
  totalConversations: 3482,
  openConversations: 18,
  waitingResponse: 7,
  resolvedConversations: 3457,
  avgResponseTimeMin: 1.4,
  aiHandledPercentage: 68.2,
  newLeadsCount: 420,
  resolutionRatePercentage: 99.2,
  volumeByDay: [
    { day: 'Mon', whatsapp: 420, instagram: 180 },
    { day: 'Tue', whatsapp: 510, instagram: 230 },
    { day: 'Wed', whatsapp: 490, instagram: 210 },
    { day: 'Thu', whatsapp: 560, instagram: 290 },
    { day: 'Fri', whatsapp: 620, instagram: 340 },
    { day: 'Sat', whatsapp: 380, instagram: 190 },
    { day: 'Sun', whatsapp: 310, instagram: 150 }
  ],
  channelDistribution: [
    { channel: 'WhatsApp', percentage: 72, count: 2507 },
    { channel: 'Instagram Direct', percentage: 28, count: 975 }
  ],
  aiVsHuman: {
    ai: 2374,
    human: 1108,
    total: 3482
  }
};

export const initialKnowledgeBase = initialAIKnowledge;
export const initialAISettings = initialAIAgentSettings;
export const initialAutomations = initialAutomationRules;
