'use client';

// ===================================================================
// MOONKY ANÁLISE & INTELIGÊNCIA DE DADOS
// Tendências de volume diário, canais, SLA de IA vs Humano & ranking de equipe
// 100% em Português Brasil
// ===================================================================

import React from 'react';
import {
  TrendingUp,
  BarChart3,
  Bot,
  User,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Award
} from 'lucide-react';
import { useMoonky } from '@/context/moonky-store';

export function AnalyticsView() {
  const { analytics, teamMembers } = useMoonky();

  const dayTranslation: Record<string, string> = {
    Mon: 'Seg',
    Tue: 'Ter',
    Wed: 'Qua',
    Thu: 'Qui',
    Fri: 'Sex',
    Sat: 'Sáb',
    Sun: 'Dom',
    Seg: 'Seg',
    Ter: 'Ter',
    Qua: 'Qua',
    Qui: 'Qui',
    Sex: 'Sex',
    Sáb: 'Sáb',
    Dom: 'Dom'
  };

  const roleTranslation: Record<string, string> = {
    owner: 'Proprietário',
    admin: 'Administrador',
    supervisor: 'Supervisor',
    agent: 'Agente de Suporte'
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F1F3F2] p-8 space-y-6 select-none">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#252B28] tracking-tight">Análise de Desempenho</h1>
          <p className="text-xs text-[#6C7671] mt-1">
            Métricas de atendimento omnichannel, taxa de resolução e eficiência da IA.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-[#E5E9E7] p-1.5 rounded-xl text-xs font-semibold text-[#252B28]">
          <Calendar className="w-3.5 h-3.5 text-[#AEB7B3]" />
          <span>Últimos 7 Dias (Junho 2026)</span>
        </div>
      </div>

      {/* Cartões KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-[#E5E9E7] shadow-xs">
          <span className="text-[10px] font-bold uppercase text-[#AEB7B3] tracking-wider">
            Total de Conversas
          </span>
          <p className="text-2xl font-bold text-[#252B28] mt-2">{analytics.totalConversations}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">+14,2% vs período anterior</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#E5E9E7] shadow-xs">
          <span className="text-[10px] font-bold uppercase text-[#AEB7B3] tracking-wider">
            Taxa de Resolução
          </span>
          <p className="text-2xl font-bold text-[#252B28] mt-2">
            {analytics.resolutionRatePercentage}%
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">SLA padrão de excelência</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#E5E9E7] shadow-xs">
          <span className="text-[10px] font-bold uppercase text-[#AEB7B3] tracking-wider">
            Tempo Médio de 1ª Resposta
          </span>
          <p className="text-2xl font-bold text-[#252B28] mt-2">{analytics.avgResponseTimeMin}m</p>
          <p className="text-[11px] text-[#6C7671] mt-1">Resposta instantânea da IA em &lt; 3s</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-emerald-200 bg-gradient-to-b from-white to-[#EAFBF2] shadow-xs">
          <span className="text-[10px] font-bold uppercase text-[#1E7E49] tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#45D483]" /> Taxa no Piloto Automático
          </span>
          <p className="text-2xl font-bold text-[#252B28] mt-2">{analytics.aiHandledPercentage}%</p>
          <p className="text-[11px] text-[#1E7E49] font-medium mt-1">Resolvidas sem intervenção humana</p>
        </div>
      </div>

      {/* Grid: Volume Diário & Divisão IA vs Humano */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição Diária */}
        <div className="bg-white dark:bg-[#151917] rounded-2xl border border-[#E5E9E7] dark:border-[#262E2A] p-5 sm:p-6 shadow-xs space-y-4 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-[#252B28] dark:text-white">Volume Diário de Mensagens Recebidas</h2>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1 text-[#252B28] dark:text-gray-200">
                <span className="w-2 h-2 rounded-full bg-[#45D483]" /> WhatsApp
              </span>
              <span className="flex items-center gap-1 text-[#252B28] dark:text-gray-200">
                <span className="w-2 h-2 rounded-full bg-[#3B82F6]" /> Instagram
              </span>
            </div>
          </div>

          <div className="h-52 flex items-end justify-between gap-1 sm:gap-2 pt-6 border-b border-[#F1F3F2] dark:border-[#262E2A]">
            {analytics.volumeByDay.map((d, i) => {
              const maxVal = Math.max(...analytics.volumeByDay.map((item) => Math.max(item.whatsapp, item.instagram)), 700);
              const waHeight = Math.min(Math.round((d.whatsapp / maxVal) * 100), 100);
              const igHeight = Math.min(Math.round((d.instagram / maxVal) * 100), 100);
              const dayTotal = d.whatsapp + d.instagram;

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end min-w-0">
                  <span className="text-[9px] sm:text-[10px] font-bold text-[#6C7671] dark:text-[#AEB7B3] mb-1 tabular-nums">
                    {dayTotal}
                  </span>
                  <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-36">
                    <div
                      style={{ height: `${waHeight}%` }}
                      className="w-2.5 sm:w-3.5 md:w-4 max-w-[18px] bg-[#45D483] rounded-t-sm"
                      title={`${d.whatsapp} WhatsApp`}
                    />
                    <div
                      style={{ height: `${igHeight}%` }}
                      className="w-2.5 sm:w-3.5 md:w-4 max-w-[18px] bg-[#3B82F6] rounded-t-sm"
                      title={`${d.instagram} Instagram`}
                    />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-[#6C7671] dark:text-[#AEB7B3] mt-2">
                    {dayTranslation[d.day] || d.day}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-[#AEB7B3] text-center pt-1">
            Total semanal de mensagens processadas: {analytics.volumeByDay.reduce((a, b) => a + b.whatsapp + b.instagram, 0).toLocaleString('pt-BR')}
          </p>
        </div>

        {/* Divisão IA vs Humano */}
        <div className="bg-white rounded-2xl border border-[#E5E9E7] p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#252B28]">Divisão de Atendimentos: IA vs Humano</h2>
          <p className="text-xs text-[#AEB7B3]">
            Proporção de tickets solucionados integralmente pela IA versus escalados para a equipe.
          </p>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-[#252B28] flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-[#45D483]" /> Resolvidos por IA (Piloto Automático)
                </span>
                <span className="text-[#45D483]">{analytics.aiVsHuman.ai} conversas (68,4%)</span>
              </div>
              <div className="w-full bg-[#F1F3F2] h-3 rounded-full overflow-hidden">
                <div style={{ width: '68.4%' }} className="bg-[#45D483] h-full rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-[#252B28] flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#252B28]" /> Escalados para Agente Humano
                </span>
                <span className="text-[#252B28]">{analytics.aiVsHuman.human} conversas (31,6%)</span>
              </div>
              <div className="w-full bg-[#F1F3F2] h-3 rounded-full overflow-hidden">
                <div style={{ width: '31.6%' }} className="bg-[#252B28] h-full rounded-full" />
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#F7F9F8] rounded-xl border border-[#E5E9E7] text-xs text-[#6C7671] space-y-1">
            <span className="font-bold text-[#252B28] block">Impacto de Eficiência</span>
            <p className="text-[11px] leading-relaxed">
              O atendimento automatizado economizou aproximadamente 42,5 horas dos operadores especialistas nesta semana, mantendo nota média de satisfação de 4,9/5.
            </p>
          </div>
        </div>
      </div>

      {/* Classificação de Desempenho dos Atendentes */}
      <div className="bg-white rounded-2xl border border-[#E5E9E7] p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#252B28]">Desempenho da Equipe de Atendimento</h2>

        <div className="divide-y divide-[#F1F3F2]">
          {teamMembers.map((agent, i) => (
            <div key={agent.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="w-5 font-bold text-[#AEB7B3] text-center">{i + 1}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={agent.avatarUrl}
                  alt={agent.fullName}
                  className="w-8 h-8 rounded-full object-cover border border-[#E5E9E7]"
                />
                <div>
                  <p className="font-bold text-[#252B28]">{agent.fullName}</p>
                  <p className="text-[10px] text-[#AEB7B3] capitalize">{roleTranslation[agent.role] || agent.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-right">
                <div>
                  <p className="font-bold text-[#252B28]">{agent.assignedChatsCount * 12}</p>
                  <p className="text-[10px] text-[#AEB7B3]">Tickets Concluídos</p>
                </div>
                <div>
                  <p className="font-bold text-emerald-600">98,2%</p>
                  <p className="text-[10px] text-[#AEB7B3]">Avaliação CSAT</p>
                </div>
                <div>
                  <p className="font-bold text-[#252B28]">1,1 min</p>
                  <p className="text-[10px] text-[#AEB7B3]">Tempo Médio Resposta</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
