import { NextRequest, NextResponse } from 'next/server';
import { WameClient } from '@/lib/wame/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const instanceKey = (body.instanceKey || process.env.WAME_DEFAULT_INSTANCE_KEY || '').trim();
    const baseUrl = body.baseUrl || process.env.WAME_API_BASE_URL;
    const channelType = body.channelType || 'whatsapp';

    const client = new WameClient(instanceKey, baseUrl);

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

    // WhatsApp flow (Real QR Code or live status)
    const connectRes = await client.connectInstance();
    const connectData = connectRes.data;

    return NextResponse.json({
      success: true,
      channelType: 'whatsapp',
      status: connectData?.status || 'qrcode_ready',
      phoneConnected: connectData?.phoneConnected || false,
      qrcode: connectData?.qrcode,
      image: connectData?.image,
      user: connectData?.user,
      instanceKey: instanceKey || 'WAME_PROD_INSTANCE_8941',
      instructions: 'Abra o WhatsApp no seu celular > Configurações / Aparelhos Conectados > Conectar um aparelho e aponte para o QR Code.'
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
