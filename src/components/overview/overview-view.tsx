'use client';

// ===================================================================
// MOONKY MAIN OVERVIEW DASHBOARD — 100% PORTUGUÊS BRASIL
// Métricas executivas, gráficos de volume por canal, taxas de IA e feed
// ===================================================================

import React from 'react';
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  Bot,
  UserPlus,
  TrendingUp,
  Radio,
  Sparkles
} from 'lucide-react';
import { useMoonky } from '@/context/moonky-store';
import { NavigationTab } from '@/components/layout/sidebar';

interface OverviewViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export function OverviewView({ onNavigate }: OverviewViewProps) {
  const { analytics, conversations, channels } = useMoonky();

  // Escala dinâmica calculada para garantir que os dados fiquem 100% contidos no card
  const maxVolumeVal = Math.max(
    ...analytics.volumeByDay.map((item) => Math.max(item.whatsapp, item.instagram)),
    700
  );
  const weeklyTotalVolume = analytics.volumeByDay.reduce(
    (acc, curr) => acc + curr.whatsapp + curr.instagram,
    0
  );

  const metrics = [
    {
      label: 'Total de Conversas',
      value: analytics.totalConversations.toLocaleString('pt-BR'),
      change: '+12.4% em relação à semana passada',
      isPositive: true,
      icon: MessageSquare
    },
    {
      label: 'Conversas Abertas',
      value: analytics.openConversations,
      change: 'Ativas na fila de espera',
      isPositive: true,
      icon: Clock,
      highlight: true
    },
    {
      label: 'Conversas Resolvidas',
      value: analytics.resolvedConversations.toLocaleString('pt-BR'),
      change: `${analytics.resolutionRatePercentage}% de resolução`,
      isPositive: true,
      icon: CheckCircle2
    },
    {
      label: 'Tempo Médio Resposta',
      value: `${analytics.avgResponseTimeMin}m`,
      change: '-18s mais rápido que o SLA',
      isPositive: true,
      icon: TrendingUp
    },
    {
      label: 'Atendidas por IA',
      value: `${analytics.aiHandledPercentage}%`,
      change: 'Base verificada sem alucinações',
      isPositive: true,
      icon: Bot,
      accent: true
    },
    {
      label: 'Novos Contatos / Leads',
      value: analytics.newLeadsCount,
      change: '+22 novos esta semana',
      isPositive: true,
      icon: UserPlus
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#FAFBFB] p-4 sm:p-6 lg:p-8 select-none">
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        {/* Topo: Boas-vindas & Ações Rápidas */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#45D483] animate-pulse" />
              <h1 className="text-xl sm:text-2xl font-bold text-[#252B28] tracking-tight">Dashboard Executivo</h1>
            </div>
            <p className="text-xs text-[#6C7671] mt-1">
              Métricas consolidadas em tempo real do WhatsApp e Instagram Direct via WAME API.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={() => onNavigate('inbox')}
              className="bg-[#252B28] hover:bg-[#1a1f1d] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#45D483]" />
              <span>Abrir Inbox</span>
            </button>
            <button
              onClick={() => onNavigate('integrations')}
              className="bg-white hover:bg-[#F7F9F8] border border-[#E5E9E7] text-[#252B28] text-xs font-semibold px-3 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Radio className="w-3.5 h-3.5 text-[#AEB7B3]" />
              <span>Canais</span>
            </button>
          </div>
        </div>

        {/* Grid de 6 Métricas Responsivas */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  m.accent
                    ? 'bg-gradient-to-b from-[#FFFFFF] to-[#EAFBF2] border-emerald-200 shadow-xs'
                    : 'bg-white border-[#E5E9E7] shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] sm:text-[11px] font-semibold text-[#AEB7B3] uppercase tracking-wider truncate">
                    {m.label}
                  </span>
                  <div
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg shrink-0 flex items-center justify-center ${
                      m.accent ? 'bg-[#45D483]/20 text-[#1E7E49]' : 'bg-[#F1F3F2] text-[#252B28]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-2.5 sm:mt-3">
                  <p className="text-xl sm:text-2xl font-bold text-[#252B28] tracking-tight">{m.value}</p>
                  <p className="text-[10px] sm:text-[11px] text-[#6C7671] mt-1 flex items-center gap-1 truncate">
                    {m.accent && <Sparkles className="w-3 h-3 text-[#45D483] shrink-0" />}
                    <span className="truncate">{m.change}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      {/* Grid de Volume Visual & Canais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Volume Semanal Responsivo e Contido */}
        <div className="lg:col-span-2 bg-white dark:bg-[#151917] rounded-2xl border border-[#E5E9E7] dark:border-[#262E2A] p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 sm:space-y-6 overflow-hidden">
          {/* Cabeçalho do Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-[#252B28] dark:text-white">Volume de Conversas</h2>
                <span className="bg-[#EAFBF2] dark:bg-[#45D483]/15 text-[#1E7E49] dark:text-[#45D483] text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                  7 Dias
                </span>
              </div>
              <p className="text-xs text-[#AEB7B3] mt-0.5">Tráfego diário consolidado por canal oficial</p>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#45D483]" />
                <span className="text-[#252B28] dark:text-gray-200">WhatsApp</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
                <span className="text-[#252B28] dark:text-gray-200">Instagram</span>
              </div>
            </div>
          </div>

          {/* Gráfico de Barras com Escala Proporcional Contida */}
          <div className="relative pt-6 pb-2">
            {/* Linhas de Grade de Fundo Sutis */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-7 pt-6">
              <div className="w-full border-b border-dashed border-[#F1F3F2] dark:border-[#262E2A] flex justify-end">
                <span className="text-[9px] font-mono text-[#AEB7B3] pr-1 -mt-2.5">600</span>
              </div>
              <div className="w-full border-b border-dashed border-[#F1F3F2] dark:border-[#262E2A] flex justify-end">
                <span className="text-[9px] font-mono text-[#AEB7B3] pr-1 -mt-2.5">400</span>
              </div>
              <div className="w-full border-b border-dashed border-[#F1F3F2] dark:border-[#262E2A] flex justify-end">
                <span className="text-[9px] font-mono text-[#AEB7B3] pr-1 -mt-2.5">200</span>
              </div>
              <div className="w-full border-b border-[#E5E9E7] dark:border-[#262E2A]" />
            </div>

            {/* Colunas do Gráfico */}
            <div className="relative h-44 sm:h-48 flex items-end justify-between gap-1 sm:gap-2 z-0">
              {analytics.volumeByDay.map((item, i) => {
                const total = item.whatsapp + item.instagram;
                const waHeight = Math.min(Math.round((item.whatsapp / maxVolumeVal) * 100), 100);
                const igHeight = Math.min(Math.round((item.instagram / maxVolumeVal) * 100), 100);

                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
                    {/* Dado Numérico Total Diário (Responsivo e Contido) */}
                    <span className="text-[9px] sm:text-[10px] font-bold text-[#6C7671] dark:text-[#AEB7B3] mb-1.5 shrink-0 tabular-nums">
                      {total}
                    </span>

                    {/* Barras Lado a Lado com Limitação de Altura Estrita */}
                    <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-32 sm:h-36">
                      {/* Barra WhatsApp */}
                      <div
                        style={{ height: `${waHeight}%` }}
                        className="w-2.5 sm:w-3.5 md:w-4 max-w-[18px] bg-[#45D483] rounded-t-sm hover:opacity-90 transition-all cursor-pointer relative group shrink-0"
                      >
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#252B28] text-white text-[10px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 shadow-md">
                          {item.whatsapp} WA
                        </span>
                      </div>

                      {/* Barra Instagram */}
                      <div
                        style={{ height: `${igHeight}%` }}
                        className="w-2.5 sm:w-3.5 md:w-4 max-w-[18px] bg-[#3B82F6] rounded-t-sm hover:opacity-90 transition-all cursor-pointer relative group shrink-0"
                      >
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#252B28] text-white text-[10px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 shadow-md">
                          {item.instagram} IG
                        </span>
                      </div>
                    </div>

                    {/* Rótulo do Dia da Semana */}
                    <span className="text-[10px] sm:text-[11px] font-semibold text-[#6C7671] dark:text-[#AEB7B3] mt-2 shrink-0">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rodapé Responsivo */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#6C7671] dark:text-[#AEB7B3] pt-3 border-t border-[#F1F3F2] dark:border-[#262E2A]">
            <span className="flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-[#45D483] shrink-0" />
              <span>Horário de pico: <strong>14:00 - 17:30</strong> (Horário de Brasília)</span>
            </span>
            <span className="text-[#252B28] dark:text-white font-bold shrink-0">
              Total na semana: {weeklyTotalVolume.toLocaleString('pt-BR')} mensagens
            </span>
          </div>
        </div>

        {/* Distribuição por Canal & IA vs Humano */}
        <div className="bg-white rounded-2xl border border-[#E5E9E7] p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-sm font-bold text-[#252B28]">Distribuição por Canal</h2>
            <p className="text-xs text-[#AEB7B3] mt-0.5">Roteamento ativo via WAME API</p>

            <div className="mt-6 space-y-4">
              {analytics.channelDistribution.map((ch, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#252B28]">{ch.channel}</span>
                    <span className="text-[#6C7671]">
                      {ch.count} ({ch.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#F1F3F2] h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${ch.percentage}%` }}
                      className={`h-full rounded-full ${
                        ch.channel === 'WhatsApp' ? 'bg-[#45D483]' : 'bg-[#3B82F6]'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Eficiência da IA */}
          <div className="p-4 bg-[#F7F9F8] rounded-xl border border-[#E5E9E7] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#252B28]">Eficiência da Automação com IA</span>
              <span className="text-[10px] font-bold bg-[#EAFBF2] text-[#1E7E49] px-2 py-0.5 rounded-full">
                68% Automatizado
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#6C7671]">
              <span>Resolvidas pela IA da Moonky:</span>
              <span className="font-bold text-[#252B28]">{analytics.aiVsHuman.ai} conversas</span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#6C7671]">
              <span>Atendidas por Agentes Humanos:</span>
              <span className="font-bold text-[#252B28]">{analytics.aiVsHuman.human} conversas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Inferior: Atividades Recentes & Gateways de Canais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feed de Atividades Recentes */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E9E7] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#252B28]">Fluxo de Atividades Recentes</h2>
              <p className="text-xs text-[#AEB7B3]">Eventos em tempo real recebidos do webhook e agentes</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-[#45D483] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#45D483] animate-pulse" />
              Ao Vivo
            </span>
          </div>

          <div className="divide-y divide-[#F1F3F2] text-xs">
            {conversations.slice(0, 4).map((c, i) => (
              <div
                key={i}
                onClick={() => onNavigate('inbox')}
                className="py-3 flex items-center justify-between hover:bg-[#F7F9F8] px-2 rounded-xl cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.contact.avatarUrl}
                    alt={c.contact.name}
                    className="w-8 h-8 rounded-full object-cover border border-[#E5E9E7]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#252B28]">{c.contact.name}</span>
                      <span className="text-[10px] text-[#AEB7B3]">
                        {c.channelType === 'whatsapp' ? 'via WhatsApp' : 'via Instagram'}
                      </span>
                    </div>
                    <p className="text-[#6C7671] truncate max-w-md">{c.lastMessageSnippet}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      c.aiStatus === 'handed_off'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-[#EAFBF2] text-[#1E7E49]'
                    }`}
                  >
                    {c.aiStatus === 'handed_off' ? 'Transbordo Humano' : 'IA Ativa'}
                  </span>
                  <p className="text-[10px] text-[#AEB7B3] mt-1">{c.lastMessageAt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status dos Gateways */}
        <div className="bg-white rounded-2xl border border-[#E5E9E7] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#252B28]">Gateways de Canais</h2>
            <button
              onClick={() => onNavigate('integrations')}
              className="text-xs font-semibold text-[#45D483] hover:underline"
            >
              Configurar
            </button>
          </div>

          <div className="space-y-3">
            {channels.map((ch) => (
              <div
                key={ch.id}
                className="p-3 bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs ${
                      ch.type === 'whatsapp'
                        ? 'bg-[#25D366]'
                        : 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600'
                    }`}
                  >
                    {ch.type === 'whatsapp' ? 'WA' : 'IG'}
                  </div>
                  <div>
                    <p className="font-bold text-[#252B28]">{ch.name}</p>
                    <p className="text-[10px] text-[#AEB7B3]">
                      {ch.isOfficial ? 'Meta Cloud API' : 'QR Code'} • {ch.lastSyncAt}
                    </p>
                  </div>
                </div>

                <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#1E7E49] bg-[#EAFBF2] px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#45D483]" />
                  Ativo
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#F1F3F2] rounded-xl text-[11px] text-[#6C7671] leading-relaxed">
            Todas as mensagens recebidas são processadas no servidor com proteção de idempotência no padrão oficial Meta da WAME.
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
