'use client';

// ===================================================================
// MOONKY ESTÚDIO DE AUTOMAÇÕES
// Gatilhos de eventos, regras de condições, distribuição de equipe e roteamento IA
// 100% em Português Brasil
// ===================================================================

import React, { useState } from 'react';
import {
  Zap,
  Plus,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageSquare,
  Users,
  Bot,
  Tag,
  ArrowRight
} from 'lucide-react';
import { useMoonky } from '@/context/moonky-store';
import { AutomationRule } from '@/types';

export function AutomationsView() {
  const { automations, toggleAutomation, addAutomation, teamMembers } = useMoonky();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Novo estado de automação
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState<AutomationRule['triggerType']>('keyword');
  const [keywords, setKeywords] = useState('');
  const [actionType, setActionType] = useState<'send_message' | 'assign_team' | 'toggle_ai'>('send_message');
  const [actionPayload, setActionPayload] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newAuto: AutomationRule = {
      id: `auto-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'Regra de fluxo automatizado',
      isActive: true,
      triggerType,
      triggerConfig: {
        keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean)
      },
      actions: [
        {
          type: actionType,
          payload:
            actionType === 'send_message'
              ? { text: actionPayload }
              : actionType === 'assign_team'
              ? { agentId: actionPayload }
              : { enabled: true }
        }
      ]
    };

    addAutomation(newAuto);
    setName('');
    setDescription('');
    setKeywords('');
    setActionPayload('');
    setShowCreateModal(false);
  };

  const getTriggerLabel = (type: string) => {
    switch (type) {
      case 'keyword':
        return 'Palavra-chave na mensagem';
      case 'incoming_message':
        return 'Qualquer mensagem recebida';
      case 'new_conversation':
        return 'Nova conversa iniciada';
      case 'business_hours':
        return 'Fora do horário comercial';
      default:
        return type;
    }
  };

  const getActionLabel = (type: string) => {
    switch (type) {
      case 'send_message':
        return 'Enviar resposta automática';
      case 'assign_team':
        return 'Distribuir para atendente';
      case 'toggle_ai':
        return 'Ativar assistente IA';
      default:
        return type;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F1F3F2] p-8 space-y-6 select-none">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#252B28] tracking-tight">Automações de Fluxo</h1>
          <p className="text-xs text-[#6C7671] mt-1">
            Crie regras baseadas em eventos para mensagens recebidas, distribuição em fila de atendentes e respostas IA.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#252B28] hover:bg-[#1a1f1d] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start"
        >
          <Plus className="w-3.5 h-3.5 text-[#45D483]" />
          <span>Criar Automação</span>
        </button>
      </div>

      {/* Lista de Automações */}
      <div className="space-y-4">
        {automations.map((auto) => (
          <div
            key={auto.id}
            className={`bg-white rounded-2xl border p-6 shadow-xs transition-all ${
              auto.isActive ? 'border-[#E5E9E7]' : 'border-[#E5E9E7] opacity-60'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    auto.isActive ? 'bg-[#EAFBF2] text-[#1E7E49]' : 'bg-[#F1F3F2] text-[#AEB7B3]'
                  }`}
                >
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#252B28]">{auto.name}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        auto.isActive
                          ? 'bg-[#EAFBF2] text-[#1E7E49]'
                          : 'bg-[#F1F3F2] text-[#AEB7B3]'
                      }`}
                    >
                      {auto.isActive ? 'Ativa' : 'Desativada'}
                    </span>
                  </div>
                  <p className="text-xs text-[#6C7671] mt-1">{auto.description}</p>
                </div>
              </div>

              {/* Botão de Ativação */}
              <button
                onClick={() => toggleAutomation(auto.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  auto.isActive
                    ? 'bg-[#F1F3F2] text-[#252B28] hover:bg-rose-50 hover:text-rose-700'
                    : 'bg-[#252B28] text-white'
                }`}
              >
                {auto.isActive ? 'Desativar Regra' : 'Ativar Regra'}
              </button>
            </div>

            {/* Passos Visuais do Fluxo (Gatilho -> Ação) */}
            <div className="mt-5 pt-4 border-t border-[#F1F3F2] flex flex-wrap items-center gap-3 text-xs">
              {/* Gatilho */}
              <div className="bg-[#F7F9F8] border border-[#E5E9E7] px-3 py-1.5 rounded-xl flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#AEB7B3]" />
                <span className="font-semibold text-[#252B28]">
                  Quando: {getTriggerLabel(auto.triggerType)}
                </span>
                {auto.triggerConfig.keywords && auto.triggerConfig.keywords.length > 0 && (
                  <span className="text-[10px] bg-white border border-[#E5E9E7] px-1.5 py-0.5 rounded text-[#6C7671]">
                    [{auto.triggerConfig.keywords.join(', ')}]
                  </span>
                )}
              </div>

              <ArrowRight className="w-3.5 h-3.5 text-[#AEB7B3]" />

              {/* Ação */}
              {auto.actions.map((act, i) => (
                <div
                  key={i}
                  className="bg-[#EAFBF2] border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-2 text-[#1E7E49]"
                >
                  {act.type === 'assign_team' ? (
                    <Users className="w-3.5 h-3.5" />
                  ) : act.type === 'toggle_ai' ? (
                    <Bot className="w-3.5 h-3.5" />
                  ) : (
                    <MessageSquare className="w-3.5 h-3.5" />
                  )}
                  <span className="font-semibold text-xs">
                    Fazer: {getActionLabel(act.type)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Criar Automação */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#E5E9E7]">
            <h3 className="text-base font-bold text-[#252B28]">Construir Regra de Automação de Entrada</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#252B28] block mb-1">Nome do Fluxo</label>
                <input
                  type="text"
                  placeholder="Ex: Roteamento de Financeiro por Palavra-Chave"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl px-3 py-2 text-xs text-[#252B28] focus:outline-none focus:border-[#45D483]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-[#252B28] block mb-1">Descrição</label>
                <input
                  type="text"
                  placeholder="Qual o objetivo desta automação?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl px-3 py-2 text-xs text-[#252B28] focus:outline-none focus:border-[#45D483]"
                />
              </div>

              <div>
                <label className="font-bold text-[#252B28] block mb-1">Evento de Disparo (Gatilho)</label>
                <select
                  value={triggerType}
                  onChange={(e) => setTriggerType(e.target.value as AutomationRule['triggerType'])}
                  className="w-full bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl px-3 py-2 text-xs text-[#252B28] focus:outline-none"
                >
                  <option value="keyword">Palavras-chave específicas na mensagem</option>
                  <option value="incoming_message">Qualquer mensagem recebida</option>
                  <option value="new_conversation">Novo cliente iniciou conversa</option>
                  <option value="business_hours">Fora do horário comercial</option>
                </select>
              </div>

              {triggerType === 'keyword' && (
                <div>
                  <label className="font-bold text-[#252B28] block mb-1">Palavras-Chave (Separadas por vírgula)</label>
                  <input
                    type="text"
                    placeholder="boleto, nota fiscal, pagamento, segunda via"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="w-full bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl px-3 py-2 text-xs text-[#252B28] focus:outline-none focus:border-[#45D483]"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-[#252B28] block mb-1">Ação Automatizada</label>
                <select
                  value={actionType}
                  onChange={(e) =>
                    setActionType(e.target.value as 'send_message' | 'assign_team' | 'toggle_ai')
                  }
                  className="w-full bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl px-3 py-2 text-xs text-[#252B28] focus:outline-none"
                >
                  <option value="send_message">Enviar resposta de texto automática</option>
                  <option value="assign_team">Distribuir para membro da equipe</option>
                  <option value="toggle_ai">Ativar assistente IA</option>
                </select>
              </div>

              {actionType === 'send_message' && (
                <div>
                  <label className="font-bold text-[#252B28] block mb-1">Texto da Resposta</label>
                  <textarea
                    rows={3}
                    placeholder="Digite a mensagem a ser enviada automaticamente ao cliente..."
                    value={actionPayload}
                    onChange={(e) => setActionPayload(e.target.value)}
                    className="w-full bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl p-3 text-xs text-[#252B28] focus:outline-none focus:border-[#45D483]"
                  />
                </div>
              )}

              {actionType === 'assign_team' && (
                <div>
                  <label className="font-bold text-[#252B28] block mb-1">Atribuir ao Atendente</label>
                  <select
                    value={actionPayload}
                    onChange={(e) => setActionPayload(e.target.value)}
                    className="w-full bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl px-3 py-2 text-xs text-[#252B28] focus:outline-none"
                  >
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.fullName} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F1F3F2]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6C7671] hover:bg-[#F1F3F2]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#252B28] text-white hover:bg-[#1a1f1d] px-4 py-2 rounded-xl text-xs font-semibold shadow-xs"
                >
                  Salvar Automação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
