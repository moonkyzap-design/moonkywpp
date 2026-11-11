// ===================================================================
// MOONKY INITIAL STATE & IDENTIFIED DEMO DATA
// Realistic customer support data strictly mirroring image.png & image_2.png
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
  id: 'user-christian-01',
  email: 'christian@moonky.io',
  fullName: 'Christian',
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
    id: 'user-christian-01',
    fullName: 'Christian',
    email: 'christian@moonky.io',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    status: 'active',
    assignedChatsCount: 5,
    lastActiveAt: 'Active now'
  },
  {
    id: 'user-aulya-02',
    fullName: 'Aulya Riski',
    email: 'aulya@moonky.io',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    role: 'supervisor',
    status: 'active',
    assignedChatsCount: 3,
    lastActiveAt: '5m ago'
  },
  {
    id: 'user-alexander-03',
    fullName: 'Alexander',
    email: 'alexander@moonky.io',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'agent',
    status: 'active',
    assignedChatsCount: 4,
    lastActiveAt: '12m ago'
  },
  {
    id: 'user-rudi-04',
    fullName: 'Rudi Sudirman',
    email: 'rudi@moonky.io',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'agent',
    status: 'active',
    assignedChatsCount: 2,
    lastActiveAt: 'Active now'
  }
];

export const initialContacts: Contact[] = [
  {
    id: 'cnt-hanaya-01',
    organizationId: 'org-moonky-global-01',
    name: 'Hanaya Christin',
    phone: '+62 8523 0110 289',
    instagramUsername: 'hanayachristin',
    email: 'hanaya.christin@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    leadStatus: 'customer',
    tags: [
      { id: 'tag-vip', name: 'VIP Customer', color: '#45D483' },
      { id: 'tag-escalated', name: 'Escalated', color: '#EF4444' }
    ],
    customFields: {
      Company: 'PT Indo Retail Global',
      Tier: 'Tier 1 Priority',
      City: 'Jakarta'
    },
    notes: 'High-value corporate buyer. Requires expedited courier investigation.',
    createdAt: '2026-06-01T10:00:00Z'
  },
  {
    id: 'cnt-muhammad-02',
    organizationId: 'org-moonky-global-01',
    name: 'Muhammad Ali',
    phone: '+55 11 99123-4567',
    instagramUsername: 'ali.muhammad99',
    email: 'm.ali@outlook.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    leadStatus: 'lead',
    tags: [{ id: 'tag-event', name: 'New Years Event', color: '#3B82F6' }],
    customFields: { City: 'São Paulo', Channel: 'Instagram DM' },
    notes: 'Interested in corporate bulk discount.',
    createdAt: '2026-06-05T14:30:00Z'
  },
  {
    id: 'cnt-mharcel-03',
    organizationId: 'org-moonky-global-01',
    name: 'Mharcel',
    phone: '+55 21 98888-2233',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    leadStatus: 'qualified',
    tags: [{ id: 'tag-billing', name: 'Billing', color: '#F59E0B' }],
    customFields: { Plan: 'Growth SaaS' },
    createdAt: '2026-06-06T09:15:00Z'
  },
  {
    id: 'cnt-david-04',
    organizationId: 'org-moonky-global-01',
    name: 'David Park',
    phone: '+1 415 555-0192',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    leadStatus: 'customer',
    tags: [{ id: 'tag-vip', name: 'VIP Customer', color: '#45D483' }],
    customFields: { Region: 'US West' },
    createdAt: '2026-06-07T08:00:00Z'
  },
  {
    id: 'cnt-jammes-05',
    organizationId: 'org-moonky-global-01',
    name: 'Jammes Jhon',
    instagramUsername: 'jammes_jhon',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    leadStatus: 'lead',
    tags: [{ id: 'tag-assigned', name: 'Assigned', color: '#8B5CF6' }],
    customFields: {},
    createdAt: '2026-06-07T11:20:00Z'
  }
];

export const initialConversations: Conversation[] = [
  {
    id: 'conv-hanaya-01',
    organizationId: 'org-moonky-global-01',
    channelId: 'chan-wame-wa-01',
    channelType: 'whatsapp',
    contact: initialContacts[0],
    assignedAgent: currentUser,
    status: 'open',
    priority: 'high',
    aiEnabled: true,
    aiStatus: 'handed_off',
    unreadCount: 1,
    lastMessageSnippet: 'Yes, I already did! The security guard said no package came for me yesterday...',
    lastMessageAt: '14:05',
    isStarred: true
  },
  {
    id: 'conv-muhammad-02',
    organizationId: 'org-moonky-global-01',
    channelId: 'chan-wame-ig-01',
    channelType: 'instagram',
    contact: initialContacts[1],
    assignedAgent: {
      id: 'user-rudi-04',
      fullName: 'Rudi Sudirman',
      email: 'rudi@moonky.io',
      role: 'agent',
      organizationId: 'org-moonky-global-01'
    },
    status: 'open',
    priority: 'medium',
    aiEnabled: true,
    aiStatus: 'active',
    unreadCount: 2,
    lastMessageSnippet: 'Can we apply the New Years promotion code to our 50-seats team plan?',
    lastMessageAt: '14:01',
    isStarred: true
  },
  {
    id: 'conv-mharcel-03',
    organizationId: 'org-moonky-global-01',
    channelId: 'chan-wame-wa-01',
    channelType: 'whatsapp',
    contact: initialContacts[2],
    assignedAgent: currentUser,
    status: 'pending',
    priority: 'medium',
    aiEnabled: true,
    aiStatus: 'paused',
    unreadCount: 0,
    lastMessageSnippet: 'Invoice updated. Waiting for the bank receipt.',
    lastMessageAt: '13:51'
  },
  {
    id: 'conv-david-04',
    organizationId: 'org-moonky-global-01',
    channelId: 'chan-wame-wa-01',
    channelType: 'whatsapp',
    contact: initialContacts[3],
    assignedAgent: {
      id: 'user-aulya-02',
      fullName: 'Aulya Riski',
      email: 'aulya@moonky.io',
      role: 'supervisor',
      organizationId: 'org-moonky-global-01'
    },
    status: 'open',
    priority: 'urgent',
    aiEnabled: true,
    aiStatus: 'active',
    unreadCount: 1,
    lastMessageSnippet: 'My package was supposed to arrive 2 days ago',
    lastMessageAt: '13:51'
  },
  {
    id: 'conv-jammes-05',
    organizationId: 'org-moonky-global-01',
    channelId: 'chan-wame-ig-01',
    channelType: 'instagram',
    contact: initialContacts[4],
    assignedAgent: {
      id: 'user-alexander-03',
      fullName: 'Alexander',
      email: 'alexander@moonky.io',
      role: 'agent',
      organizationId: 'org-moonky-global-01'
    },
    status: 'resolved',
    priority: 'low',
    aiEnabled: true,
    aiStatus: 'active',
    unreadCount: 0,
    lastMessageSnippet: 'Perfect, thank you so much for the swift setup guide!',
    lastMessageAt: '13:42'
  }
];

export const initialMessages: Record<string, Message[]> = {
  'conv-hanaya-01': [
    {
      id: 'msg-01',
      conversationId: 'conv-hanaya-01',
      senderType: 'contact',
      content:
        'Hi! My package was marked as "Delivered" yesterday evening, but I never received anything. This is a very expensive electronic item. I need help right now!',
      messageType: 'text',
      deliveryStatus: 'read',
      timestamp: '13:50'
    },
    {
      id: 'msg-02',
      conversationId: 'conv-hanaya-01',
      senderType: 'ai',
      senderName: 'Moonky AI Assistant',
      content:
        "Hello Hanaya. I'm the automated assistant. I sincerely apologize for the inconvenience. To help me investigate this immediately, could you please provide your tracking number/AWB?",
      messageType: 'text',
      deliveryStatus: 'read',
      timestamp: '13:50',
      aiMetadata: {
        confidence: 0.96,
        tokens: 142,
        model: 'gemini-1.5-pro'
      }
    },
    {
      id: 'msg-03',
      conversationId: 'conv-hanaya-01',
      senderType: 'contact',
      content: "It's LNC-9988776655. Please find out where it is ASAP.",
      messageType: 'text',
      deliveryStatus: 'read',
      timestamp: '13:52'
    },
    {
      id: 'msg-04',
      conversationId: 'conv-hanaya-01',
      senderType: 'ai',
      senderName: 'Moonky AI Assistant',
      content:
        'Thank you. Let me check our system for tracking number LNC-9988776655... Our records show it was received by "Front Desk / Security" at 17:30 yesterday. Have you checked with the personnel on duty at that time?',
      messageType: 'text',
      deliveryStatus: 'read',
      timestamp: '13:53',
      aiMetadata: {
        confidence: 0.94,
        tokens: 188,
        model: 'gemini-1.5-pro'
      }
    },
    {
      id: 'msg-05',
      conversationId: 'conv-hanaya-01',
      senderType: 'contact',
      content:
        'Yes, I already did! The security guard said no package came for me yesterday. The proof of delivery photo in the app is also completely blurry. This is unacceptable.',
      messageType: 'text',
      deliveryStatus: 'read',
      timestamp: '13:55'
    },
    {
      id: 'msg-06',
      conversationId: 'conv-hanaya-01',
      senderType: 'ai',
      senderName: 'Moonky AI Assistant',
      content:
        'I completely understand your frustration, Hanaya. Since the package is missing and the POD photo is unclear, I am escalating this ticket to a human agent right now for an immediate courier investigation. Please hold on a moment while I connect you.',
      messageType: 'text',
      deliveryStatus: 'read',
      timestamp: '13:55',
      aiMetadata: {
        confidence: 0.98,
        tokens: 210,
        model: 'gemini-1.5-pro'
      }
    }
  ],
  'conv-muhammad-02': [
    {
      id: 'msg-m-01',
      conversationId: 'conv-muhammad-02',
      senderType: 'contact',
      content: 'Hello! Does Moonky support multi-agent assignment on Instagram DMs?',
      messageType: 'text',
      deliveryStatus: 'read',
      timestamp: '13:58'
    },
    {
      id: 'msg-m-02',
      conversationId: 'conv-muhammad-02',
      senderType: 'ai',
      senderName: 'Moonky AI',
      content:
        'Hi Muhammad! Yes, Moonky natively supports multi-agent assignment, team round-robin routing, and supervisor oversight across both WhatsApp and Instagram Direct.',
      messageType: 'text',
      deliveryStatus: 'read',
      timestamp: '13:59'
    },
    {
      id: 'msg-m-03',
      conversationId: 'conv-muhammad-02',
      senderType: 'contact',
      content: 'Can we apply the New Years promotion code to our 50-seats team plan?',
      messageType: 'text',
      deliveryStatus: 'delivered',
      timestamp: '14:01'
    }
  ]
};

export const initialNotes: Record<string, InternalNote[]> = {
  'conv-hanaya-01': [
    {
      id: 'note-01',
      conversationId: 'conv-hanaya-01',
      author: { name: 'AI Agent' },
      content:
        'The AI just escalated this ticket. The POD photo is completely blurry and the customer claims the front desk security didn’t receive it. Can you contact the driver for route LNC-9988776655 to verify the exact drop-off point ASAP?',
      createdAt: '13:56'
    },
    {
      id: 'note-02',
      conversationId: 'conv-hanaya-01',
      author: { name: 'Aulya Riski' },
      content:
        'Please review this case. This is a high-value electronic item. Before I reply to her, can you check if her shipping insurance covers a full replacement if the courier actually misdelivered it?',
      createdAt: '14:00'
    },
    {
      id: 'note-03',
      conversationId: 'conv-hanaya-01',
      author: { name: 'Christian' },
      content:
        'Got it. I’m checking the GPS logs right now. It looks like there’s a discrepancy with the drop-off location. I’ll take over the chat to keep Hanaya updated while I escalate this to the dispatch team.',
      createdAt: '14:02'
    }
  ]
};

export const initialKnowledgeBase: AIKnowledgeItem[] = [
  {
    id: 'kb-01',
    title: 'Courier Shipping & Tracking Policy',
    category: 'Logistics',
    content:
      'All shipments are tracked via 12-digit AWB codes starting with LNC or MK. If a parcel is marked delivered but not received, customer must report within 48 hours for immediate dispatch review. POD photos must clearly depict the address number.',
    isActive: true,
    updatedAt: '2026-06-05'
  },
  {
    id: 'kb-02',
    title: 'Replacement & Insurance Coverage',
    category: 'Billing',
    content:
      'High-value electronic items above $500 are automatically insured for 100% replacement value. Claims require courier dispatch verification within 24 business hours.',
    isActive: true,
    updatedAt: '2026-06-04'
  },
  {
    id: 'kb-03',
    title: 'Business Hours & SLA Commitments',
    category: 'General',
    content:
      'Moonky live support operates 24/7. First response time SLA for VIP tier customers is guaranteed under 2 minutes; general inquiries within 10 minutes.',
    isActive: true,
    updatedAt: '2026-06-02'
  },
  {
    id: 'kb-04',
    title: 'Pricing & Team Seat Plans',
    category: 'Pricing',
    content:
      'Starter is $19/mo (2 agents, 1 channel). Growth is $79/mo (5 agents, 3 channels, 500k AI tokens). Scale is $199/mo (unlimited agents, all channels, enterprise SLA).',
    isActive: true,
    updatedAt: '2026-06-01'
  }
];

export const initialAISettings: AIAgentSettings = {
  name: 'Moonky AI Assistant',
  personality: 'Empathetic, clear, enterprise-grade, concise, and strictly truthful.',
  instructions:
    'Always verify information against the company knowledge base. Never invent refund amounts, delivery guarantees, or discounts not explicitly documented. When customer frustration or unresolvable delivery discrepancy occurs, politely hand off to an agent.',
  confidenceThreshold: 0.85,
  autoReplyEnabled: true,
  whatsappEnabled: true,
  instagramEnabled: true,
  handoffKeywords: ['atendente', 'humano', 'falar com humano', 'supervisor', 'cancelar', 'advogado', 'procon'],
  provider: 'gemini',
  model: 'gemini-1.5-pro'
};

export const initialAutomations: AutomationRule[] = [
  {
    id: 'auto-01',
    name: 'VIP Customer Auto-Escalation',
    description: 'Immediately assign VIP conversations to Senior Support Christian.',
    isActive: true,
    triggerType: 'incoming_message',
    triggerConfig: { keywords: ['urgent', 'missing', 'delivery', 'damaged'] },
    actions: [
      { type: 'assign_team', payload: { agentId: 'user-christian-01' } },
      { type: 'set_tag', payload: { tagName: 'VIP Customer' } }
    ]
  },
  {
    id: 'auto-02',
    name: 'Instagram Inbound Lead Greeting',
    description: 'Greet new Instagram DM inquiries and collect email/company info.',
    isActive: true,
    triggerType: 'new_conversation',
    triggerConfig: { channel: 'instagram' },
    actions: [
      {
        type: 'send_message',
        payload: {
          text: 'Olá! Bem-vindo à Moonky. Como nosso time pode impulsionar o atendimento da sua empresa hoje?'
        }
      },
      { type: 'toggle_ai', payload: { enabled: true } }
    ]
  },
  {
    id: 'auto-03',
    name: 'Out of Hours Intelligent Notice',
    description: 'Triggered when messages arrive outside 08:00 - 20:00.',
    isActive: false,
    triggerType: 'business_hours',
    triggerConfig: { timeWindow: 'outside_business_hours' },
    actions: [
      {
        type: 'send_message',
        payload: {
          text: 'Nosso time humano está em horário de descanso, mas nossa IA está de prontidão para tirar dúvidas!'
        }
      }
    ]
  }
];

export const initialAnalytics: AnalyticsSummary = {
  totalConversations: 1248,
  openConversations: 42,
  waitingResponse: 9,
  resolvedConversations: 1197,
  avgResponseTimeMin: 1.2,
  aiHandledPercentage: 68.4,
  newLeadsCount: 184,
  resolutionRatePercentage: 95.8,
  volumeByDay: [
    { day: 'Mon', whatsapp: 145, instagram: 65 },
    { day: 'Tue', whatsapp: 180, instagram: 82 },
    { day: 'Wed', whatsapp: 195, instagram: 94 },
    { day: 'Thu', whatsapp: 210, instagram: 88 },
    { day: 'Fri', whatsapp: 230, instagram: 110 },
    { day: 'Sat', whatsapp: 120, instagram: 75 },
    { day: 'Sun', whatsapp: 95, instagram: 60 }
  ],
  channelDistribution: [
    { channel: 'WhatsApp', percentage: 68, count: 848 },
    { channel: 'Instagram Direct', percentage: 32, count: 400 }
  ],
  aiVsHuman: {
    ai: 853,
    human: 395,
    total: 1248
  }
};
