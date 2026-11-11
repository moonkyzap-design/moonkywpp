'use client';

// ===================================================================
// MOONKY ESTÚDIO DO ASSISTENTE IA & BASE DE CONHECIMENTO
// Grounding de conhecimento estrito, regras de transbordo humano e telemetria
// 100% em Português Brasil
// ===================================================================

import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  BookOpen,
  HelpCircle,
  ShieldAlert,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Play,
  RotateCcw,
  Zap
} from 'lucide-react';
import { useMoonky } from '@/context/moonky-store';
import { moonkyAI } from '@/lib/ai/service';

export function AIAssistantView() {
  const {
    aiSettings,
    updateAISettings,
    knowledgeBase,
    addKnowledgeItem,
    updateKnowledgeItem
  } = useMoonky();

  const [activeTab, setActiveTab] = useState<'settings' | 'knowledge' | 'handoff' | 'playground'>('settings');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Logística');
  const [newContent, setNewContent] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Estado do simulador / playground
  const [playgroundInput, setPlaygroundInput] = useState('');
  const [playgroundLoading, setPlaygroundLoading] = useState(false);
  const [playgroundResult, setPlaygroundResult] = useState<{
    reply: string;
    isHandoff: boolean;
    confidence: number;
    tokens: number;
    latency: number;
    reasoning?: string;
  } | null>(null);

  const handleAddArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    addKnowledgeItem({
      title: newTitle.trim(),
      category: newCategory,
      content: newContent.trim(),
      isActive: true
    });

    setNewTitle('');
    setNewContent('');
    setShowAddModal(false);
  };

  const handleTestPlayground = async () => {
    if (!playgroundInput.trim() || playgroundLoading) return;
    setPlaygroundLoading(true);

    const result = await moonkyAI.generateResponse({
      conversationId: 'playground-test',
      contactName: 'Usuário do Teste',
      lastCustomerMessage: playgroundInput,
      conversationHistory: [],
      knowledgeBase,
      customInstructions: aiSettings.instructions,
      personality: aiSettings.personality
    });

    setPlaygroundResult({
      reply: result.replyText,
      isHandoff: result.isHandoffRequired,
      confidence: result.confidenceScore,
      tokens: result.tokensUsed.total,
      latency: result.latencyMs,
      reasoning: result.reasoningNote
    });

    setPlaygroundLoading(false);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F1F3F2] p-8 space-y-6 select-none">
      {/* Cabeçalho Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#252B28] tracking-tight">Estúdio do Assistente IA</h1>
            <span className="bg-[#EAFBF2] text-[#1E7E49] text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
              <Sparkles className="w-3 h-3 text-[#45D483]" /> Zero Alucinação Ativo
            </span>
          </div>
          <p className="text-xs text-[#6C7671] mt-1">
            Configure a personalidade corporativa, base de conhecimento verificada e regras automáticas de transbordo humano.
          </p>
        </div>

        {/* Alternador de Abas */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E5E9E7] shadow-xs text-xs font-semibold">
          {[
            { id: 'settings', label: 'Personalidade & Regras' },
            { id: 'knowledge', label: `Base de Conhecimento (${knowledgeBase.length})` },
            { id: 'handoff', label: 'Transbordo Humano' },
            { id: 'playground', label: 'Simulador ao Vivo' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as typeof activeTab)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === t.id
                  ? 'bg-[#252B28] text-white shadow-xs'
                  : 'text-[#6C7671] hover:text-[#252B28]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ABA 1: CONFIGURAÇÕES & PERSONALIDADE */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E9E7] p-6 shadow-xs space-y-5">
            <h2 className="text-sm font-bold text-[#252B28]">Identidade & Escopo do Assistente</h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#252B28] block mb-1">Nome de Exibição do Assistente</label>
                <input
                  type="text"
                  value={aiSettings.name}
                  onChange={(e) => updateAISettings({ name: e.target.value })}
                  className="w-full bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl px-3 py-2 text-xs text-[#252B28] focus:outline-none focus:border-[#45D483]"
                />
              </div>

              <div>
                <label className="font-bold text-[#252B28] block mb-1">Personalidade & Tom de Voz</label>
                <textarea
                  rows={2}
                  value={aiSettings.personality}
                  onChange={(e) => updateAISettings({ personality: e.target.value })}
                  className="w-full bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl p-3 text-xs text-[#252B28] focus:outline-none focus:border-[#45D483]"
                />
              </div>

              <div>
                <label className="font-bold text-[#252B28] block mb-1">
                  Instruções Customizadas do Sistema (Diretrizes Estritas de Prompt)
                </label>
                <textarea
                  rows={4}
                  value={aiSettings.instructions}
                  onChange={(e) => updateAISettings({ instructions: e.target.value })}
                  className="w-full bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl p-3 text-xs text-[#252B28] focus:outline-none focus:border-[#45D483]"
                />
              </div>

              {/* Ativação por Canal */}
              <div className="pt-3 border-t border-[#F1F3F2] space-y-3">
                <p className="font-bold text-[#252B28]">Ativação por Canal de Atendimento</p>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={aiSettings.whatsappEnabled}
                      onChange={(e) => updateAISettings({ whatsappEnabled: e.target.checked })}
                      className="w-4 h-4 accent-[#45D483] rounded"
                    />
                    <span className="font-medium text-[#252B28]">Ativar no WhatsApp</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={aiSettings.instagramEnabled}
                      onChange={(e) => updateAISettings({ instagramEnabled: e.target.checked })}
                      className="w-4 h-4 accent-[#45D483] rounded"
                    />
                    <span className="font-medium text-[#252B28]">Ativar no Instagram Direct</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Motor & Limites Operacionais */}
          <div className="bg-white rounded-2xl border border-[#E5E9E7] p-6 shadow-xs space-y-5">
            <h2 className="text-sm font-bold text-[#252B28]">Motor de Inteligência</h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-[#AEB7B3] block mb-1">
                  Provedor no Servidor
                </label>
                <div className="p-3 bg-[#F7F9F8] rounded-xl border border-[#E5E9E7] font-semibold text-[#252B28]">
                  {aiSettings.provider.toUpperCase()} (Configurável via .env)
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-[#AEB7B3] block mb-1">
                  Modelo Ativo
                </label>
                <div className="p-3 bg-[#F7F9F8] rounded-xl border border-[#E5E9E7] font-semibold text-[#252B28]">
                  {aiSettings.model}
                </div>
              </div>

              <div className="p-4 bg-[#EAFBF2] border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-[#1E7E49]">
                  <CheckCircle2 className="w-4 h-4 text-[#45D483]" />
                  <span>Regras Estritas Moonky AI Ativas</span>
                </div>
                <p className="text-[11px] text-[#1E7E49]/80 leading-relaxed">
                  O modelo nunca inventa preços, prazos ou regras da empresa. Se a pergunta não estiver presente na base verificada, aciona imediatamente o transbordo para um atendente humano.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: BASE DE CONHECIMENTO */}
      {activeTab === 'knowledge' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#252B28]">Base de Conhecimento Verificada da Empresa</h2>
              <p className="text-xs text-[#AEB7B3]">
                A IA responde exclusivamente com base nas informações contidas nestes artigos verificados.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#252B28] hover:bg-[#1a1f1d] text-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-[#45D483]" />
              <span>Adicionar Artigo de Conhecimento</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {knowledgeBase.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#E5E9E7] p-5 shadow-xs space-y-3 relative group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F1F3F2] text-[#252B28] px-2 py-0.5 rounded-full">
                      {item.category}
                    </span>
                    <h3 className="text-sm font-bold text-[#252B28] mt-2">{item.title}</h3>
                  </div>

                  <label className="flex items-center gap-1.5 text-xs text-[#6C7671] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.isActive}
                      onChange={(e) => updateKnowledgeItem(item.id, { isActive: e.target.checked })}
                      className="w-3.5 h-3.5 accent-[#45D483]"
                    />
                    <span className="text-[11px] font-semibold">Ativo</span>
                  </label>
                </div>

                <p className="text-xs text-[#6C7671] leading-relaxed bg-[#F7F9F8] p-3 rounded-xl border border-[#E5E9E7]">
                  {item.content}
                </p>

                <div className="flex items-center justify-between text-[11px] text-[#AEB7B3] pt-1">
                  <span>Atualizado: {item.updatedAt}</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#45D483]" /> Grounding Verificado
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 3: PROTOCOLO DE TRANSBORDO HUMANO */}
      {activeTab === 'handoff' && (
        <div className="bg-white rounded-2xl border border-[#E5E9E7] p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-sm font-bold text-[#252B28]">Regras de Transbordo & Assunção por Agentes Humanos</h2>
            <p className="text-xs text-[#AEB7B3] mt-0.5">
              Define os critérios nos quais a IA pausa as respostas automáticas e transfere o atendimento aos operadores humanos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-4 bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl space-y-3">
              <h3 className="font-bold text-[#252B28] flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <span>Palavras-Chave de Escalação Automática</span>
              </h3>
              <p className="text-[#6C7671] text-[11px]">
                Quando qualquer um destes termos for enviado pelo cliente, a IA é pausada instantaneamente e a conversa vai para a fila humana:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {aiSettings.handoffKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="bg-white border border-[#E5E9E7] text-[#252B28] px-2.5 py-1 rounded-lg font-semibold text-[11px]"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl space-y-3">
              <h3 className="font-bold text-[#252B28] flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-[#45D483]" />
                <span>Regra de Incerteza e Fallback</span>
              </h3>
              <p className="text-[#6C7671] text-[11px] leading-relaxed">
                Se a dúvida não puder ser respondida com 100% de precisão baseada na base de conhecimento corporativa, a IA é terminantemente proibida de inventar ou supor, acionando o transbordo na mesma hora.
              </p>
              <div className="p-2.5 bg-white border border-[#E5E9E7] rounded-lg text-[11px] text-[#252B28] font-mono">
                [TRANSBORDO_SOLICITADO] → Pausar IA → Notificar operador responsável
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: SIMULADOR AO VIVO */}
      {activeTab === 'playground' && (
        <div className="bg-white rounded-2xl border border-[#E5E9E7] p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-sm font-bold text-[#252B28]">Simulador Interativo de Grounding da IA</h2>
            <p className="text-xs text-[#AEB7B3] mt-0.5">
              Envie perguntas de teste contra a base de conhecimento da sua empresa e observe o comportamento em tempo real.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Pergunte algo (ex: 'Qual o horário de suporte?' ou 'Quero falar com um humano')"
                value={playgroundInput}
                onChange={(e) => setPlaygroundInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTestPlayground()}
                className="flex-1 bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl px-4 py-2.5 text-xs text-[#252B28] focus:outline-none focus:border-[#45D483]"
              />
              <button
                onClick={handleTestPlayground}
                disabled={playgroundLoading || !playgroundInput.trim()}
                className="bg-[#252B28] hover:bg-[#1a1f1d] text-white text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-40"
              >
                <Play className="w-3.5 h-3.5 text-[#45D483]" />
                <span>{playgroundLoading ? 'Avaliando...' : 'Simular Resposta'}</span>
              </button>
            </div>

            {/* Prompts Rápidos */}
            <div className="flex items-center gap-2 text-xs text-[#6C7671]">
              <span className="text-[11px] font-bold">Prompts de teste rápido:</span>
              <button
                onClick={() => {
                  setPlaygroundInput('Qual o horário de funcionamento do atendimento?');
                }}
                className="text-[11px] bg-[#F1F3F2] px-2 py-0.5 rounded hover:bg-[#E5E9E7]"
              >
                Horário de Atendimento
              </button>
              <button
                onClick={() => {
                  setPlaygroundInput('Quero falar com um atendente agora!');
                }}
                className="text-[11px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded hover:bg-amber-100"
              >
                Disparo de Transbordo
              </button>
              <button
                onClick={() => {
                  setPlaygroundInput('Vocês lançam foguetes espaciais para Marte amanhã?');
                }}
                className="text-[11px] bg-[#F1F3F2] px-2 py-0.5 rounded hover:bg-[#E5E9E7]"
              >
                Pergunta Fora do Escopo (Escalação)
              </button>
            </div>
          </div>

          {playgroundResult && (
            <div className="p-5 bg-[#F7F9F8] border border-[#E5E9E7] rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E9E7] pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-[#252B28]">Resposta Simulada da IA</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      playgroundResult.isHandoff
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-[#EAFBF2] text-[#1E7E49]'
                    }`}
                  >
                    {playgroundResult.isHandoff ? 'Transbordo Humano Acionado' : 'Resposta Apoiada na Base'}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-[#AEB7B3]">
                  <span>Latência: {playgroundResult.latency}ms</span>
                  <span>Tokens: {playgroundResult.tokens}</span>
                  <span>Confiança: {(playgroundResult.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#E5E9E7] text-xs text-[#252B28] leading-relaxed whitespace-pre-line font-sans">
                {playgroundResult.reply}
              </div>

              {playgroundResult.reasoning && (
                <div className="text-[11px] text-[#6C7671] bg-white/70 p-2.5 rounded-lg border border-[#E5E9E7] italic">
                  Rastreamento de Grounding: {playgroundResult.reasoning}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal: Adicionar Artigo de Conhecimento */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#E5E9E7]">
            <h3 className="text-base font-bold text-[#252B28]">Adicionar Artigo de Conhecimento Verificado</h3>
            <form onSubmit={handleAddArticle} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#252B28] block mb-1">Título do Artigo</label>
                <input
                  type="text"
                  placeholder="Ex: Política de Trocas e Devoluções"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl px-3 py-2 text-xs text-[#252B28] focus:outline-none focus:border-[#45D483]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-[#252B28] block mb-1">Categoria</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl px-3 py-2 text-xs text-[#252B28] focus:outline-none"
                >
                  <option value="Logística">Logística & Envios</option>
                  <option value="Financeiro">Faturamento & Pagamentos</option>
                  <option value="Planos">Planos & Preços</option>
                  <option value="Suporte">Dúvidas Frequentes (FAQ)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#252B28] block mb-1">
                  Conteúdo do Artigo (Fatos oficiais da empresa)
                </label>
                <textarea
                  rows={4}
                  placeholder="Descreva a política exata, instruções ou regras oficiais para a IA seguir à risca..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl p-3 text-xs text-[#252B28] focus:outline-none focus:border-[#45D483]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F1F3F2]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6C7671] hover:bg-[#F1F3F2]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#252B28] text-white hover:bg-[#1a1f1d] px-4 py-2 rounded-xl text-xs font-semibold shadow-xs"
                >
                  Salvar Artigo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
