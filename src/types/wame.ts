// ===================================================================
// WAME API INTEGRATION TYPES (https://wame.api.br/docs)
// ===================================================================

export interface WameInstanceStatus {
  status: number;
  data: {
    instanceKey: string;
    phone?: string;
    name?: string;
    status: 'connected' | 'disconnected' | 'connecting';
    official: boolean; // true = Meta Cloud API; false = Unofficial QR
    provider: 'whatsapp' | 'instagram' | 'messenger';
    qrcode?: string;
    battery?: number;
    platform?: string;
  };
}

export interface WameSendTextRequest {
  to: string; // international digits only for WhatsApp (e.g. 5511999999999) or IG user ID
  text: string;
}

export interface WameSendMediaRequest {
  to: string;
  url: string;
  caption?: string;
  fileName?: string;
}

export interface WameApiResponse<T = unknown> {
  status: number;
  message?: string;
  data?: T;
  id?: string;
  error?: string;
}

/**
 * WAME Webhook Envelope (Meta Standard Format)
 * As documented at https://wame.api.br/docs/webhooks
 */
export interface WameWebhookPayload {
  object: 'wame';
  provider: 'whatsapp' | 'instagram' | 'messenger' | 'telegram';
  instance: string;
  official: boolean;
  entry: Array<{
    id: string;
    changes: Array<{
      field: 'messages' | 'presence' | 'connection' | 'qrcode' | 'call' | 'health';
      value: {
        messaging_product?: string;
        metadata?: {
          display_phone_number?: string;
          phone_number_id?: string;
        };
        contacts?: Array<{
          profile?: {
            name?: string;
          };
          wa_id?: string;
          user_id?: string;
        }>;
        messages?: Array<{
          from: string;
          from_user_id?: string;
          id: string;
          timestamp: string;
          type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'interactive' | 'unsupported';
          text?: {
            body: string;
          };
          image?: {
            id?: string;
            mime_type?: string;
            sha256?: string;
            caption?: string;
          };
          audio?: {
            id?: string;
            mime_type?: string;
          };
        }>;
        statuses?: Array<{
          id: string;
          status: 'sent' | 'delivered' | 'read' | 'failed';
          timestamp: string;
          recipient_id: string;
        }>;
      };
    }>;
  }>;
}
