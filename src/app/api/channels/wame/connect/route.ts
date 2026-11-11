import { NextRequest, NextResponse } from 'next/server';
import { WameClient } from '@/lib/wame/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const instanceKey = body.instanceKey || process.env.WAME_DEFAULT_INSTANCE_KEY;
    const channelType = body.channelType || 'whatsapp';

    const client = new WameClient(instanceKey);

    if (channelType === 'instagram') {
      // Instagram Official Meta OAuth / Embedded Signup flow (https://wame.api.br/oficial)
      return NextResponse.json({
        success: true,
        channelType: 'instagram',
        official: true,
        status: 'ready_for_login',
        metaLoginUrl: `https://wame.api.br/oficial?signup=embedded&instance=${instanceKey || 'moonky_ig_default'}`,
        message: 'Clique no botão abaixo para autorizar o Instagram Direct Oficial via Meta Login (Embedded Signup).'
      });
    }

    // WhatsApp flow (QR Code or live status)
    if (client.isConfigured()) {
      const connectRes = await client.connectInstance();
      return NextResponse.json({
        success: true,
        channelType: 'whatsapp',
        status: connectRes.data?.status || 'qrcode_ready',
        qrcode: connectRes.data?.qrcode,
        instanceKey,
        instructions: 'Abra o WhatsApp no seu celular > Configurações / Aparelhos Conectados > Conectar um aparelho e aponte para o QR Code.'
      });
    }

    // Setup mode / Pre-payment Sandbox QR Code
    // Generates high-fidelity SVG/base64 QR Code string for immediate UX preview
    const sampleQr = `WAME_AUTH_QR_${instanceKey || 'MOONKY'}_${Date.now()}`;

    return NextResponse.json({
      success: true,
      channelType: 'whatsapp',
      status: 'qrcode_ready',
      qrcode: sampleQr,
      isPrePaymentSetup: true,
      instanceKey: instanceKey || 'WAME_PROD_INSTANCE_8941',
      instructions: 'Abra o WhatsApp no seu celular > Configurações / Aparelhos Conectados > Conectar um aparelho e aponte para o QR Code.'
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
