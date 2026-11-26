// ===================================================================
// WAME IN-MEMORY LIVE STORE & EVENT CACHE
// Ensures incoming webhook messages and synced chats are instantly
// accessible to the frontend even if external databases are offline
// ===================================================================

import { Conversation, Message } from '@/types';
import fs from 'fs';

const DISK_CONFIG_PATH = '/tmp/moonky_wame_config.json';

function readDiskConfig(): { instanceKey?: string; baseUrl?: string } {
  try {
    if (fs.existsSync(DISK_CONFIG_PATH)) {
      const content = fs.readFileSync(DISK_CONFIG_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch {}
  return {};
}

function writeDiskConfig(data: { instanceKey?: string; baseUrl?: string }) {
  try {
    const existing = readDiskConfig();
    fs.writeFileSync(DISK_CONFIG_PATH, JSON.stringify({ ...existing, ...data }), 'utf-8');
  } catch {}
}

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
  // eslint-disable-next-line no-var
  var __moonkyContactPictures: Record<string, string> | undefined;
  // eslint-disable-next-line no-var
  var __moonkyLastInstanceKey: string | undefined;
}

if (!globalThis.__moonkyLiveEvents) {
  globalThis.__moonkyLiveEvents = [];
}
if (!globalThis.__moonkyContactPictures) {
  globalThis.__moonkyContactPictures = {};
}

export const liveStore = {
  setLastInstanceKey(key: string) {
    const clean = (key || '').trim();
    if (clean && clean !== 'WAME_PROD_INSTANCE_8941') {
      globalThis.__moonkyLastInstanceKey = clean;
      writeDiskConfig({ instanceKey: clean });
    }
  },

  getLastInstanceKey(): string | undefined {
    if (globalThis.__moonkyLastInstanceKey && globalThis.__moonkyLastInstanceKey !== 'WAME_PROD_INSTANCE_8941') {
      return globalThis.__moonkyLastInstanceKey;
    }
    const disk = readDiskConfig();
    if (disk.instanceKey && disk.instanceKey !== 'WAME_PROD_INSTANCE_8941') {
      globalThis.__moonkyLastInstanceKey = disk.instanceKey;
      return disk.instanceKey;
    }
    return undefined;
  },

  addEvent(event: LiveMessageEvent) {
    if (event.instanceKey && event.instanceKey !== 'WAME_PROD_INSTANCE_8941') {
      this.setLastInstanceKey(event.instanceKey);
    }
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

  setContactPicture(phoneOrJid: string, url: string) {
    if (!globalThis.__moonkyContactPictures) {
      globalThis.__moonkyContactPictures = {};
    }
    const clean = phoneOrJid.replace(/@.*$/, '').replace(/\D/g, '');
    if (clean && url) {
      globalThis.__moonkyContactPictures[clean] = url;
    }
  },

  getContactPicture(phoneOrJid: string): string | undefined {
    if (!globalThis.__moonkyContactPictures) return undefined;
    const clean = phoneOrJid.replace(/@.*$/, '').replace(/\D/g, '');
    return globalThis.__moonkyContactPictures[clean];
  },

  setConversations(convs: Conversation[]) {
    globalThis.__moonkySyncedConversations = convs;
  },

  getConversations(): Conversation[] | undefined {
    return globalThis.__moonkySyncedConversations;
  }
};
