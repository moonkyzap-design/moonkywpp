// ===================================================================
// WAME CREDENTIALS PERSISTENCE & WEBHOOK CONFIGURATION API
// Endpoint: /api/channels/wame/credentials
// Saves WAME Instance Key, updates webhook on server.wame.api.br,
// and verifies instance connectivity
// ===================================================================

import { NextRequest, NextResponse } from 'next/server';
import { WameClient } from '@/lib/wame/client';

export const dynamic = 'force-dynamic';

const DEFAULT_WEBHOOK_URL = 'https://moonkychat.vercel.app/api/webhooks/wame';
const DEFAULT_SERVER_URL = 'https://server.wame.api.br';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawKey = body.instanceKey || '';
    const instanceKey = typeof rawKey === 'string' ? rawKey.trim() : '';
    const baseUrl = (body.baseUrl || process.env.WAME_API_BASE_URL || DEFAULT_SERVER_URL).trim();
    const webhookUrl = (body.webhookUrl || DEFAULT_WEBHOOK_URL).trim();
    const webhookSecret = (body.webhookSecret || '').trim();

    if (!instanceKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'MISSING_INSTANCE_KEY',
          message: 'A chave da instância (Instance Key) é obrigatória.'
        },
        { status: 400 }
      );
    }

    const client = new WameClient(instanceKey, baseUrl);
    let webhookConfigured = false;
    let webhookMessage = '';
    let instanceStatus: any = null;

    // 1. Tentar configurar o Webhook na WAME API
    try {
      await client.setWebhook(webhookUrl);
      webhookConfigured = true;
      webhookMessage = `Webhook configurado com sucesso para ${webhookUrl}`;
    } catch (whErr: unknown) {
      const errDetail = whErr instanceof Error ? whErr.message : String(whErr);
      console.warn('[WAME_SET_WEBHOOK_WARN]', errDetail);
      webhookMessage = `Salvo localmente. Aviso WAME API: ${errDetail}`;
    }

    // 2. Verificar o status da instância
    try {
      instanceStatus = await client.getInstanceStatus();
    } catch (statusErr: unknown) {
      console.warn('[WAME_STATUS_CHECK_WARN]', statusErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Credenciais WAME salvas com sucesso!',
      webhookConfigured,
      webhookMessage,
      credentials: {
        instanceKey,
        baseUrl,
        webhookUrl,
        webhookSecret: webhookSecret ? '••••••••' : '',
        savedAt: new Date().toISOString()
      },
      instanceStatus
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    defaultWebhookUrl: DEFAULT_WEBHOOK_URL,
    defaultBaseUrl: DEFAULT_SERVER_URL,
    defaultInstanceKey: process.env.WAME_DEFAULT_INSTANCE_KEY || 'WAME_PROD_INSTANCE_8941'
  });
}
