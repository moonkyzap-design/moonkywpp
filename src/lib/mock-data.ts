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
    name: 'WhatsApp Oficial',
    type: 'whatsapp',
    provider: 'wame',
    instanceKey: 'WAME_PROD_INSTANCE_8941',
    isOfficial: true,
    phoneNumber: '+55 11 98877-6655',
    status: 'connected',
    webhookUrl: 'https://moonkywpp-e9w2.vercel.app/api/webhooks/wame',
    lastSyncAt: 'Agora'
  },
  {
    id: 'chan-wame-ig-01',
    organizationId: 'org-moonky-global-01',
    name: 'Instagram Direct Oficial',
    type: 'instagram',
    provider: 'wame',
    instanceKey: 'WAME_IG_INSTANCE_4421',
    isOfficial: true,
    instagramUsername: 'moonky.enterprise',
    status: 'connected',
    webhookUrl: 'https://moonkywpp-e9w2.vercel.app/api/webhooks/wame',
    lastSyncAt: 'há 2 min'
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

export const initialContacts: Contact[] = [
  {
    id: 'cnt-mariana-01',
    organizationId: 'org-moonky-global-01',
    name: 'Mariana Silva',
    phone: '+55 11 98877-1122',
    instagramUsername: 'mariana.silva',
    email: 'mariana.silva@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    leadStatus: 'customer',
    tags: [
      { id: 'tag-vip', name: 'Cliente VIP', color: '#45D483' },
      { id: 'tag-priority', name: 'Atendimento Prioritário', color: '#252B28' }
    ],
    customFields: {
      Cidade: 'São Paulo - SP',
      Empresa: 'Silva & Associados'
    },
    notes: 'Cliente interessada na automação com IA para WhatsApp e Instagram.',
    createdAt: '2026-06-01T10:00:00Z'
  },
  {
    id: 'cnt-darya-02',
    organizationId: 'org-moonky-global-01',
    name: 'Darya Santos',
    phone: '+55 11 99123-4567',
    instagramUsername: 'darya.santos',
    email: 'darya.santos@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    leadStatus: 'customer',
    tags: [{ id: 'tag-client', name: 'Suporte Ativo', color: '#45D483' }],
    customFields: { Cidade: 'Campinas - SP' },
    notes: 'Solicitou tabela de preços e propostas dos planos.',
    createdAt: '2026-06-05T14:30:00Z'
  },
  {
    id: 'cnt-omid-03',
    organizationId: 'org-moonky-global-01',
    name: 'Omid Ferreira',
    phone: '+55 21 98888-2233',
    instagramUsername: 'omid.ferreira',
    email: 'omid.ferreira@empresa.com.br',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    leadStatus: 'qualified',
    tags: [{ id: 'tag-voice', name: 'Mensagem de Voz', color: '#45D483' }],
    customFields: { Cidade: 'Rio de Janeiro - RJ' },
    notes: 'Enviou áudio com dúvidas sobre a API da WAME.',
    createdAt: '2026-06-06T09:15:00Z'
  },
  {
    id: 'cnt-carlos-04',
    organizationId: 'org-moonky-global-01',
    name: 'Carlos Eduardo',
    phone: '+55 11 97766-5544',
    instagramUsername: 'carlos.edu',
    email: 'carlos.eduardo@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    leadStatus: 'customer',
    tags: [{ id: 'tag-vip', name: 'Plano Growth', color: '#45D483' }],
    customFields: { Cidade: 'Belo Horizonte - MG' },
    notes: 'Pagamento confirmado via PIX.',
    createdAt: '2026-06-07T08:00:00Z'
  },
  {
    id: 'cnt-sanaz-05',
    organizationId: 'org-moonky-global-01',
    name: 'Sanaz Souza',
    instagramUsername: 'sanaz_souza',
    phone: '+55 31 99876-5432',
    email: 'sanaz.souza@yahoo.com',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    leadStatus: 'lead',
    tags: [{ id: 'tag-ig', name: 'Lead Instagram', color: '#3B82F6' }],
    customFields: { Origem: 'Instagram Direct' },
    notes: 'Dúvidas sobre o teste gratuito de 7 dias.',
    createdAt: '2026-06-07T11:20:00Z'
  }
];

export const initialConversations: Conversation[] = [
  {
    id: 'conv-mariana-01',
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
    lastMessageSnippet: '🎙 Mensagem de voz 14"',
    lastMessageAt: '14:25',
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
    lastMessageSnippet: '📄 Tabela_Precos_Moonky_2026.pdf (1.2 MB)',
    lastMessageAt: '13:43',
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
    unreadCount: 1,
    lastMessageSnippet: '🎙 Mensagem de voz 24"',
    lastMessageAt: '12:20',
    isStarred: true
  },
  {
    id: 'conv-carlos-04',
    organizationId: 'org-moonky-global-01',
    channelId: 'chan-wame-wa-01',
    channelType: 'whatsapp',
    contact: initialContacts[3],
    assignedAgent: currentUser,
    status: 'open',
    priority: 'medium',
    aiEnabled: true,
    aiStatus: 'active',
    unreadCount: 0,
    lastMessageSnippet: 'Perfeito Carlos! Pagamento confirmado.',
    lastMessageAt: '11:12',
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
    lastMessageSnippet: 'Oi! Queria saber se o teste grátis ainda está ativo.',
    lastMessageAt: '08:20',
    isStarred: false
  }
];

export const initialMessages: Record<string, Message[]> = {
  'conv-mariana-01': [
    {
      id: 'msg-m1',
      conversationId: 'conv-mariana-01',
      senderType: 'contact',
      senderId: 'cnt-mariana-01',
      senderName: 'Mariana Silva',
      content: 'Olá! Gostaria de entender como funciona a integração da Moonky com a API oficial do WhatsApp e Instagram.',
      messageType: 'text',
      deliveryStatus: 'delivered',
      timestamp: '14:20'
    },
    {
      id: 'msg-m2',
      conversationId: 'conv-mariana-01',
      senderType: 'agent',
      senderId: 'user-hana-01',
      senderName: 'Hana',
      content: 'Olá Mariana, tudo bem? A integração é 100% oficial via Meta Cloud API através da WAME, conectando por QR Code no WhatsApp e login seguro no Instagram Direct.',
      messageType: 'text',
      deliveryStatus: 'read',
      timestamp: '14:22'
    },
    {
      id: 'msg-m3',
      conversationId: 'conv-mariana-01',
      senderType: 'contact',
      senderId: 'cnt-mariana-01',
      senderName: 'Mariana Silva',
      content: 'Excelente! Vocês conseguem conectar a IA para responder automaticamente com base no catálogo da minha empresa?',
      messageType: 'text',
      deliveryStatus: 'delivered',
      timestamp: '14:23'
    },
    {
      id: 'msg-m4',
      conversationId: 'conv-mariana-01',
      senderType: 'agent',
      senderId: 'user-hana-01',
      senderName: 'Hana',
      content: 'Com certeza! Você pode utilizar ChatGPT (GPT-4o), Claude ou Perplexity AI e cadastrar toda a memória da sua empresa com trava anti-alucinação.',
      messageType: 'text',
      deliveryStatus: 'read',
      timestamp: '14:24'
    },
    {
      id: 'msg-m5',
      conversationId: 'conv-mariana-01',
      senderType: 'agent',
      senderId: 'user-hana-01',
      senderName: 'Hana',
      content: 'Mensagem de voz 14"',
      messageType: 'audio',
      deliveryStatus: 'read',
      timestamp: '14:25'
    }
  ],
  'conv-darya-02': [
    {
      id: 'msg-d1',
      conversationId: 'conv-darya-02',
      senderType: 'contact',
      senderId: 'cnt-darya-02',
      senderName: 'Darya Santos',
      content: 'Por favor, vocês poderiam me enviar a tabela de preços atualizada dos planos?',
      messageType: 'text',
      deliveryStatus: 'delivered',
      timestamp: '13:40'
    },
    {
      id: 'msg-d2',
      conversationId: 'conv-darya-02',
      senderType: 'agent',
      senderId: 'user-hana-01',
      senderName: 'Hana',
      content: 'Olá Darya! Segue em anexo a nossa tabela completa de planos com suporte a múltiplos atendentes e canais integrados:',
      messageType: 'text',
      deliveryStatus: 'read',
      timestamp: '13:42'
    },
    {
      id: 'msg-d3',
      conversationId: 'conv-darya-02',
      senderType: 'agent',
      senderId: 'user-hana-01',
      senderName: 'Hana',
      content: 'Tabela_Precos_Moonky_2026.pdf (1.2 MB)',
      messageType: 'document',
      deliveryStatus: 'read',
      timestamp: '13:43'
    }
  ],
  'conv-omid-03': [
    {
      id: 'msg-o1',
      conversationId: 'conv-omid-03',
      senderType: 'contact',
      senderId: 'cnt-omid-03',
      senderName: 'Omid Ferreira',
      content: 'Mensagem de voz 24"',
      messageType: 'audio',
      deliveryStatus: 'delivered',
      timestamp: '12:20'
    },
    {
      id: 'msg-o2',
      conversationId: 'conv-omid-03',
      senderType: 'agent',
      senderId: 'user-hana-01',
      senderName: 'Hana',
      content: 'Áudio recebido Omid, já estou ouvindo para te ajudar com a configuração da sua instância.',
      messageType: 'text',
      deliveryStatus: 'read',
      timestamp: '12:22'
    }
  ],
  'conv-carlos-04': [
    {
      id: 'msg-c1',
      conversationId: 'conv-carlos-04',
      senderType: 'contact',
      senderId: 'cnt-carlos-04',
      senderName: 'Carlos Eduardo',
      content: 'Olá! Acabei de realizar o pagamento do plano Growth via PIX. Vocês já conseguem liberar o acesso?',
      messageType: 'text',
      deliveryStatus: 'delivered',
      timestamp: '11:10'
    },
    {
      id: 'msg-c2',
      conversationId: 'conv-carlos-04',
      senderType: 'agent',
      senderId: 'user-hana-01',
      senderName: 'Hana',
      content: 'Perfeito Carlos! Pagamento confirmado e sua conta já foi liberada com acesso total às automações e canais.',
      messageType: 'text',
      deliveryStatus: 'read',
      timestamp: '11:12'
    }
  ],
  'conv-sanaz-05': [
    {
      id: 'msg-s1',
      conversationId: 'conv-sanaz-05',
      senderType: 'contact',
      senderId: 'cnt-sanaz-05',
      senderName: 'Sanaz Souza',
      content: 'Oi! Vi o post de vocês no Instagram e queria saber se o teste grátis ainda está ativo.',
      messageType: 'text',
      deliveryStatus: 'delivered',
      timestamp: '08:20'
    },
    {
      id: 'msg-s2',
      conversationId: 'conv-sanaz-05',
      senderType: 'agent',
      senderId: 'user-hana-01',
      senderName: 'Hana',
      content: 'Oi Sanaz! Sim, você tem 7 dias grátis para testar todos os recursos da plataforma sem compromisso.',
      messageType: 'text',
      deliveryStatus: 'read',
      timestamp: '08:22'
    }
  ]
};

export const initialNotes: Record<string, InternalNote[]> = {
  'conv-mariana-01': [
    {
      id: 'note-01',
      conversationId: 'conv-mariana-01',
      author: {
        name: currentUser.fullName,
        avatarUrl: currentUser.avatarUrl
      },
      content: 'Cliente corporativa de alto potencial. Agendar demonstração da IA com GPT-4o.',
      createdAt: 'Hoje, 14:30'
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
  personality: 'Você é o assistente virtual da Moonky. Seja empático, minimalista, educado e extremamente preciso.',
  instructions: 'Atenda clientes no WhatsApp e Instagram. Use apenas as informações da memória da empresa.',
  companyMemory: `A Moonky é uma plataforma SaaS omnichannel de ponta que unifica o atendimento de WhatsApp e Instagram Direct em uma única caixa de entrada inteligente.

Planos disponíveis:
- Plano Starter: R$ 97/mês (2 atendentes, 1 canal WhatsApp).
- Plano Growth: R$ 297/mês (5 atendentes, 3 canais WhatsApp e Instagram, automações e CRM).
- Plano Scale: R$ 697/mês (atendentes e canais ilimitados, treinamento dedicado).

Horário de Atendimento Humano:
- Segunda a sexta das 08h00 às 20h00, sábados das 09h00 às 14h00.
- Fora desse horário, o assistente de IA responde dúvidas frequentes 24 horas por dia.

Políticas e Segurança:
- Conexão oficial via Meta Cloud API e pareamento por QR Code.
- Dados isolados por empresa com segurança de nível bancário e criptografia ponta a ponta.
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
    { day: 'Seg', whatsapp: 420, instagram: 180 },
    { day: 'Ter', whatsapp: 510, instagram: 230 },
    { day: 'Qua', whatsapp: 490, instagram: 210 },
    { day: 'Qui', whatsapp: 560, instagram: 290 },
    { day: 'Sex', whatsapp: 620, instagram: 340 },
    { day: 'Sáb', whatsapp: 380, instagram: 190 },
    { day: 'Dom', whatsapp: 310, instagram: 150 }
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
