// ===================================================================
// WAME IN-MEMORY LIVE STORE & EVENT CACHE
// Ensures incoming webhook messages and synced chats are instantly
// accessible to the frontend even if external databases are offline
// ===================================================================

import { Conversation, Message } from '@/types';

export interface LiveMessageEvent {
  id: string;
  conversationId: string;
  senderType: 'contact' | 'agent' | 'ai';
  senderName: string;
  content: string;
  messageType: 'text' | 'image' | 'audio' | 'video' | 'document';
  mediaUrl?: string;
  timestamp: string;
  timestampMs: number;
  from: string;
  channelType: 'whatsapp' | 'instagram';
  instanceKey?: string;
}

export interface LiveProfile {
  id?: string;
  name?: string;
  phone?: string;
  imageProfile?: string;
  updatedAt?: string;
}

// Global cache (persists across Next.js API requests within the same server process)
declare global {
  // eslint-disable-next-line no-var
  var __moonkyLiveEvents: LiveMessageEvent[] | undefined;
  // eslint-disable-next-line no-var
  var __moonkyLiveProfile: LiveProfile | undefined;
  // eslint-disable-next-line no-var
  var __moonkySyncedConversations: Conversation[] | undefined;
}

if (!globalThis.__moonkyLiveEvents) {
  globalThis.__moonkyLiveEvents = [];
}

export const liveStore = {
  addEvent(event: LiveMessageEvent) {
    if (!globalThis.__moonkyLiveEvents) {
      globalThis.__moonkyLiveEvents = [];
    }
    // Prevent duplicates
    if (!globalThis.__moonkyLiveEvents.some((e) => e.id === event.id)) {
      globalThis.__moonkyLiveEvents.unshift(event);
      if (globalThis.__moonkyLiveEvents.length > 500) {
        globalThis.__moonkyLiveEvents.pop();
      }
    }
  },

  getEvents(): LiveMessageEvent[] {
    return globalThis.__moonkyLiveEvents || [];
  },

  setProfile(profile: LiveProfile) {
    globalThis.__moonkyLiveProfile = {
      ...(globalThis.__moonkyLiveProfile || {}),
      ...profile,
      updatedAt: new Date().toISOString()
    };
  },

  getProfile(): LiveProfile | undefined {
    return globalThis.__moonkyLiveProfile;
  },

  setConversations(convs: Conversation[]) {
    globalThis.__moonkySyncedConversations = convs;
  },

  getConversations(): Conversation[] | undefined {
    return globalThis.__moonkySyncedConversations;
  }
};
