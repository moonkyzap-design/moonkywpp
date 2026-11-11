import { NextRequest, NextResponse } from 'next/server';
import { WameClient } from '@/lib/wame/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const instanceKey = body.instanceKey || process.env.WAME_DEFAULT_INSTANCE_KEY;
    const channelType = body.channelType || 'whatsapp';

    const client = new WameClient(instanceKey);

    if (client.isConfigured()) {
      await client.logoutInstance();
    }

    return NextResponse.json({
      success: true,
      channelType,
      status: 'disconnected',
      message: `Aparelho ${channelType === 'whatsapp' ? 'WhatsApp' : 'Instagram'} desconectado com sucesso.`
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
