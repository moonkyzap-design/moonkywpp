// ===================================================================
// WAME CHANNEL CONNECTION TEST ENDPOINT
// Tests real-time connectivity to WAME API and reports status
// ===================================================================

import { NextRequest, NextResponse } from 'next/server';
import { WameClient } from '@/lib/wame/client';

export async function POST(req: NextRequest) {
  try {
    const { instanceKey, isOfficial } = await req.json();

    if (!instanceKey || typeof instanceKey !== 'string' || instanceKey.trim().length === 0) {
      return NextResponse.json({
        success: false,
        status: 'unconfigured',
        message: 'Por favor, insira a chave da instância WAME (Instance Key) para testar a conexão.'
      });
    }

    const client = new WameClient(instanceKey.trim());
    const startTime = Date.now();

    try {
      const statusData = await client.getInstanceStatus();
      const latencyMs = Date.now() - startTime;

      return NextResponse.json({
        success: true,
        latencyMs,
        isOfficial: isOfficial ?? true,
        data: statusData,
        message: 'Conexão com WAME estabelecida com sucesso!'
      });
    } catch (apiErr: unknown) {
      return NextResponse.json({
        success: false,
        status: 'error',
        latencyMs: Date.now() - startTime,
        message:
          apiErr instanceof Error
            ? apiErr.message
            : 'Falha ao conectar com o servidor WAME. Verifique a chave da instância.'
      });
    }
  } catch (err: unknown) {
    return NextResponse.json({
      success: false,
      message: err instanceof Error ? err.message : 'Invalid request payload'
    });
  }
}
