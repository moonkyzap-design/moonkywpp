// ===================================================================
// AI CHAT COMPLETION ENDPOINT
// Server-side AI assistant completion with knowledge grounding & handoff logic
// ===================================================================

import { NextRequest, NextResponse } from 'next/server';
import { moonkyAI } from '@/lib/ai/service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      conversationId,
      contactName,
      lastCustomerMessage,
      conversationHistory,
      knowledgeBase,
      customInstructions,
      personality
    } = body;

    if (!lastCustomerMessage) {
      return NextResponse.json({ error: 'lastCustomerMessage is required' }, { status: 400 });
    }

    const result = await moonkyAI.generateResponse({
      conversationId: conversationId || 'conv-temp',
      contactName: contactName || 'Cliente',
      lastCustomerMessage,
      conversationHistory: conversationHistory || [],
      knowledgeBase: knowledgeBase || [],
      customInstructions,
      personality
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'AI Processing error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
