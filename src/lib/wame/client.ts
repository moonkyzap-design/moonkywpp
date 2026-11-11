// ===================================================================
// WAME SERVER-SIDE CLIENT (https://wame.api.br)
// Implements secure API interaction, channel mapping, error handling
// ===================================================================

import { WameApiResponse, WameInstanceStatus, WameSendTextRequest, WameSendMediaRequest } from '@/types/wame';

export class WameClient {
  private baseUrl: string;
  private instanceKey: string;

  constructor(instanceKey?: string, baseUrl?: string) {
    this.baseUrl = (baseUrl || process.env.WAME_API_BASE_URL || 'https://server.wame.api.br').replace(/\/+$/, '');
    this.instanceKey = instanceKey || process.env.WAME_DEFAULT_INSTANCE_KEY || '';
  }

  public isConfigured(): boolean {
    return Boolean(this.instanceKey && this.instanceKey.trim().length > 0 && !this.instanceKey.includes('INSTANCE_8941'));
  }

  public getKey(): string {
    return this.instanceKey;
  }

  /**
   * Check connection status of this instance
   * Endpoint: GET https://server.wame.api.br/{KEY}/instance
   */
  async getInstanceStatus(): Promise<WameInstanceStatus | { configured: false; message: string }> {
    if (!this.instanceKey) {
      return {
        configured: false,
        message: 'WAME Instance Key not configured in environment or channel settings.'
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/${this.instanceKey}/instance`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`WAME API responded with HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as WameInstanceStatus;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown WAME API error';
      throw new Error(`Failed to fetch WAME instance status: ${errorMessage}`);
    }
  }

  /**
   * Connect instance / retrieve QR Code
   * Endpoint: POST https://server.wame.api.br/{KEY}/instance
   */
  async connectInstance(): Promise<WameApiResponse<{ qrcode?: string; status: string }>> {
    if (!this.instanceKey) {
      throw new Error('Instance Key is required to connect.');
    }

    try {
      const response = await fetch(`${this.baseUrl}/${this.instanceKey}/instance`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });

      const data = await response.json();
      return {
        status: response.status,
        data: {
          qrcode: data.data?.qrcode || data.qrcode,
          status: data.data?.status || data.status || 'connecting'
        }
      };
    } catch (err: unknown) {
      return {
        status: 500,
        error: 'CONNECT_ERROR',
        message: err instanceof Error ? err.message : 'Connection failed'
      };
    }
  }

  /**
   * Disconnect / Logout from WhatsApp session
   * Endpoint: POST https://server.wame.api.br/{KEY}/instance/logout
   */
  async logoutInstance(): Promise<WameApiResponse> {
    if (!this.instanceKey) {
      throw new Error('Instance Key is required to logout.');
    }

    try {
      const response = await fetch(`${this.baseUrl}/${this.instanceKey}/instance/logout`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      return {
        status: response.status,
        message: data.message || 'Desconectado com sucesso da sessão WhatsApp.'
      };
    } catch (err: unknown) {
      return {
        status: 500,
        error: 'LOGOUT_ERROR',
        message: err instanceof Error ? err.message : 'Logout failed'
      };
    }
  }

  /**
   * Configure Webhook URL on the WAME instance
   * Endpoint: PUT https://server.wame.api.br/{KEY}/instance
   */
  async setWebhook(webhookUrl: string): Promise<WameApiResponse> {
    if (!this.instanceKey) {
      throw new Error('WAME Instance Key is required to configure webhook.');
    }

    const response = await fetch(`${this.baseUrl}/${this.instanceKey}/instance`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        webhookMessage: webhookUrl,
        webhookFormat: 'meta' // Use unified Meta standard envelope for WhatsApp & Instagram
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to configure WAME webhook: HTTP ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Send a text message to WhatsApp or Instagram
   * Endpoint: POST https://server.wame.api.br/{KEY}/message/text
   */
  async sendTextMessage(to: string, text: string): Promise<WameApiResponse<{ messageId: string }>> {
    if (!this.instanceKey) {
      return {
        status: 400,
        error: 'WAME_UNCONFIGURED',
        message: 'Cannot send live message: WAME Instance Key is missing. Channel is currently in setup mode.'
      };
    }

    const sanitizedTo = to.replace(/[^\d+]/g, '');

    const payload: WameSendTextRequest = {
      to: sanitizedTo || to,
      text
    };

    try {
      const response = await fetch(`${this.baseUrl}/${this.instanceKey}/message/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          status: response.status,
          error: result.error || 'WAME_SEND_FAILED',
          message: result.message || 'Failed to dispatch message through WAME.'
        };
      }

      return {
        status: 200,
        data: {
          messageId: result.data?.id || result.id || `wame_${Date.now()}`
        }
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Network error';
      return {
        status: 500,
        error: 'NETWORK_ERROR',
        message: errorMessage
      };
    }
  }

  /**
   * Send an image or media message
   * Endpoint: POST https://server.wame.api.br/{KEY}/message/media
   */
  async sendMediaMessage(req: WameSendMediaRequest): Promise<WameApiResponse> {
    if (!this.instanceKey) {
      return {
        status: 400,
        error: 'WAME_UNCONFIGURED',
        message: 'WAME instance not configured.'
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/${this.instanceKey}/message/media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(req)
      });

      return await response.json();
    } catch (err: unknown) {
      return {
        status: 500,
        error: 'MEDIA_SEND_ERROR',
        message: err instanceof Error ? err.message : 'Media dispatch failed'
      };
    }
  }
}
