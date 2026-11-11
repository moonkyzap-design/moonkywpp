// ===================================================================
// MOONKY DOMAIN TYPES & INTERFACES
// ===================================================================

export type UserRole = 'owner' | 'admin' | 'supervisor' | 'agent';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  organizationId: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  plan: 'starter' | 'growth' | 'scale' | 'enterprise';
}

export type ChannelType = 'whatsapp' | 'instagram';
export type ChannelStatus = 'connected' | 'disconnected' | 'pairing' | 'error';

export interface Channel {
  id: string;
  organizationId: string;
  name: string;
  type: ChannelType;
  provider: 'wame';
  instanceKey: string;
  isOfficial: boolean; // true = Meta Cloud API; false = QR Code
  phoneNumber?: string;
  instagramUsername?: string;
  status: ChannelStatus;
  webhookUrl: string;
  lastSyncAt?: string;
  settings?: Record<string, unknown>;
}

export type LeadStatus = 'new' | 'qualified' | 'lead' | 'customer' | 'churned';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Contact {
  id: string;
  organizationId: string;
  name: string;
  phone?: string;
  instagramUsername?: string;
  email?: string;
  avatarUrl?: string;
  leadStatus: LeadStatus;
  tags: Tag[];
  customFields: Record<string, string>;
  notes?: string;
  createdAt: string;
}

export type ConversationStatus = 'open' | 'pending' | 'resolved';
export type ConversationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type AIStatus = 'active' | 'paused' | 'handed_off';

export interface Conversation {
  id: string;
  organizationId: string;
  channelId: string;
  channelType: ChannelType;
  contact: Contact;
  assignedAgent?: UserProfile | null;
  status: ConversationStatus;
  priority: ConversationPriority;
  aiEnabled: boolean;
  aiStatus: AIStatus;
  unreadCount: number;
  lastMessageSnippet: string;
  lastMessageAt: string;
  lastMessageTimestamp?: number;
  isStarred?: boolean;
}

export type SenderType = 'contact' | 'agent' | 'ai' | 'system';
export type MessageDeliveryStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
export type MessageType = 'text' | 'image' | 'audio' | 'video' | 'document' | 'interactive';

export interface Message {
  id: string;
  conversationId: string;
  senderType: SenderType;
  senderId?: string;
  senderName?: string;
  content: string;
  messageType: MessageType;
  mediaUrl?: string;
  deliveryStatus: MessageDeliveryStatus;
  timestamp: string;
  isPinned?: boolean;
  pinnedAt?: string;
  isArchived?: boolean;
  aiMetadata?: {
    confidence?: number;
    tokens?: number;
    model?: string;
  };
}

export interface InternalNote {
  id: string;
  conversationId: string;
  author: {
    name: string;
    avatarUrl?: string;
  };
  content: string;
  createdAt: string;
}

export interface AIKnowledgeItem {
  id: string;
  title: string;
  category: string;
  content: string;
  isActive: boolean;
  updatedAt: string;
}

export interface AIAgentSettings {
  name: string;
  personality: string;
  instructions: string;
  confidenceThreshold: number;
  autoReplyEnabled: boolean;
  whatsappEnabled: boolean;
  instagramEnabled: boolean;
  handoffKeywords: string[];
  provider: 'openai' | 'anthropic' | 'perplexity' | 'gemini' | 'demo';
  model: string;
  apiKey?: string;
  companyMemory?: string;
  temperature?: number;
  maxTokens?: number;
  strictGroundingOnly?: boolean;
}

export interface AILogEntry {
  id: string;
  conversationId: string;
  contactName: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
  handoffTriggered: boolean;
  timestamp: string;
  summary: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  triggerType: 'incoming_message' | 'keyword' | 'status_change' | 'business_hours' | 'new_conversation';
  triggerConfig: {
    keywords?: string[];
    timeWindow?: string;
    channel?: ChannelType;
  };
  actions: {
    type: 'send_message' | 'assign_team' | 'set_tag' | 'toggle_ai' | 'change_status';
    payload: Record<string, unknown>;
  }[];
}

export interface TeamMember {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  status: 'active' | 'invited' | 'offline';
  assignedChatsCount: number;
  lastActiveAt: string;
}

export interface AnalyticsSummary {
  totalConversations: number;
  openConversations: number;
  waitingResponse: number;
  resolvedConversations: number;
  avgResponseTimeMin: number;
  aiHandledPercentage: number;
  newLeadsCount: number;
  resolutionRatePercentage: number;
  volumeByDay: { day: string; whatsapp: number; instagram: number }[];
  channelDistribution: { channel: string; percentage: number; count: number }[];
  aiVsHuman: { ai: number; human: number; total: number };
}
