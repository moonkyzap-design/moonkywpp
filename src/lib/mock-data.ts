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
  logoUrl: '/logo-m.png',
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
    name: 'WhatsApp Oficial',
    type: 'whatsapp',
    provider: 'wame',
    instanceKey: '',
    isOfficial: true,
    phoneNumber: '',
    status: 'disconnected',
    webhookUrl: 'https://moonkywpp-e9w2.vercel.app/api/webhooks/wame',
    lastSyncAt: undefined
  },
  {
    id: 'chan-wame-ig-01',
    organizationId: 'org-moonky-global-01',
    name: 'Instagram Direct Oficial',
    type: 'instagram',
    provider: 'wame',
    instanceKey: '',
    isOfficial: true,
    instagramUsername: '',
    status: 'disconnected',
    webhookUrl: 'https://moonkywpp-e9w2.vercel.app/api/webhooks/wame',
    lastSyncAt: undefined
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
    lastActiveAt: 'Ativo agora'
  },
  {
    id: 'user-mobin-02',
    fullName: 'Mobin',
    email: 'mobin@moonky.io',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'supervisor',
    status: 'active',
    assignedChatsCount: 3,
    lastActiveAt: 'há 5m'
  },
  {
    id: 'user-arshia-03',
    fullName: 'Arshia',
    email: 'arshia@moonky.io',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    role: 'agent',
    status: 'active',
    assignedChatsCount: 4,
    lastActiveAt: 'há 12m'
  },
  {
    id: 'user-mahdi-04',
    fullName: 'Mahdi',
    email: 'mahdi@moonky.io',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'agent',
    status: 'active',
    assignedChatsCount: 2,
    lastActiveAt: 'Ativo agora'
  }
];

export const initialContacts: Contact[] = [];

export const initialConversations: Conversation[] = [];

export const initialMessages: Record<string, Message[]> = {};

export const initialNotes: Record<string, InternalNote[]> = {};

export const initialAIKnowledge: AIKnowledgeItem[] = [
  {
    id: 'kb-01',
    title: 'Horário de Atendimento',
    content: 'O suporte humano opera de segunda a sexta, das 08h00 às 20h00.',
    category: 'Suporte',
    isActive: true,
    updatedAt: '2026-06-01'
  }
];

export const initialAIAgentSettings: AIAgentSettings = {
  name: 'Moonky Intelligence',
  personality: 'Você é o assistente virtual da Moonky. Seja empático, minimalista, educado e extremamente preciso.',
  instructions: 'Atenda clientes no WhatsApp e Instagram. Use apenas as informações da memória da empresa.',
  companyMemory: `A Moonky é uma plataforma SaaS omnichannel de ponta que unifica o atendimento de WhatsApp e Instagram Direct em uma única caixa de entrada inteligente.

Horário de Atendimento Humano:
- Segunda a sexta das 08h00 às 20h00, sábados das 09h00 às 14h00.
- Fora desse horário, o assistente de IA responde dúvidas frequentes 24 horas por dia.

Políticas e Segurança:
- Conexão oficial via Meta Cloud API / WAME.
- Se o cliente solicitar falar com atendente humano ou você não tiver certeza sobre alguma informação específica, avise educadamente que irá transferir para um especialista da equipe imediatamente.`,
  whatsappEnabled: true,
  instagramEnabled: true,
  handoffKeywords: ['humano', 'atendente', 'falar com pessoa', 'reclamar', 'urgente'],
  confidenceThreshold: 0.85,
  autoReplyEnabled: true,
  provider: 'openai',
  model: 'gpt-4o',
  apiKey: '',
  temperature: 0.2,
  maxTokens: 500,
  strictGroundingOnly: true
};

export const initialAutomationRules: AutomationRule[] = [
  {
    id: 'auto-01',
    name: 'Auto-resposta de Boas-Vindas',
    description: 'Responde automaticamente aos clientes quando iniciam conversa',
    triggerType: 'new_conversation',
    triggerConfig: { channel: 'whatsapp' },
    actions: [{ type: 'send_message', payload: { text: 'Olá! Bem-vindo. Como podemos ajudar você hoje?' } }],
    isActive: true
  }
];

export const initialAnalytics: AnalyticsSummary = {
  totalConversations: 0,
  openConversations: 0,
  waitingResponse: 0,
  resolvedConversations: 0,
  avgResponseTimeMin: 0,
  aiHandledPercentage: 0,
  newLeadsCount: 0,
  resolutionRatePercentage: 0,
  volumeByDay: [
    { day: 'Seg', whatsapp: 0, instagram: 0 },
    { day: 'Ter', whatsapp: 0, instagram: 0 },
    { day: 'Qua', whatsapp: 0, instagram: 0 },
    { day: 'Qui', whatsapp: 0, instagram: 0 },
    { day: 'Sex', whatsapp: 0, instagram: 0 },
    { day: 'Sáb', whatsapp: 0, instagram: 0 },
    { day: 'Dom', whatsapp: 0, instagram: 0 }
  ],
  channelDistribution: [],
  aiVsHuman: {
    ai: 0,
    human: 0,
    total: 0
  }
};

export const initialKnowledgeBase = initialAIKnowledge;
export const initialAISettings = initialAIAgentSettings;
export const initialAutomations = initialAutomationRules;
