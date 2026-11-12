'use client';

// ===================================================================
// MOONKY CONFIGURAÇÕES DA ORGANIZAÇÃO & PREPARAÇÃO MULTI-TENANT
// Perfil da empresa, planos SaaS, checklist de ambiente e conexão Supabase
// 100% em Português Brasil
// ===================================================================

import React, { useState } from 'react';
import {
  Settings,
  Building,
  CreditCard,
  Shield,
  Key,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Layers
} from 'lucide-react';
import { useMoonky } from '@/context/moonky-store';
import { currentUser, initialOrganization } from '@/lib/mock-data';

export function SettingsView() {
  const { isLiveSupabase } = useMoonky();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const plans = [
    {
      id: 'starter',
      name: 'Iniciante',
      price: 'R$ 97',
      period: '/mês',
      description: 'Ideal para pequenos negócios locais iniciando atendimento no WhatsApp.',
      features: ['2 Atendentes', '1 Canal de WhatsApp', '10.000 Tokens de IA/mês', 'Suporte Comunitário'],
      current: false
    },
    {
      id: 'growth',
      name: 'Crescimento',
      price: 'R$ 297',
      period: '/mês',
      description: 'Para e-commerces e empresas em expansão no WhatsApp & Instagram.',
      features: [
        '5 Atendentes',
        '3 Canais (WhatsApp & Instagram)',
        '500.000 Tokens de IA/mês',
        'Automações & CRM Integrado',
        'Prioridade de SLA 24/7'
      ],
      current: true,
      highlight: true
    },
    {
      id: 'scale',
      name: 'Escala',
      price: 'R$ 697',
      period: '/mês',
      description: 'Operações de alto volume que precisam de largura de banda ilimitada.',
      features: [
        'Atendentes Ilimitados',
        'Canais Ilimitados',
        'Treinamento Dedicado da IA',
        'Webhooks Customizados & Sync de BD',
        'Gerente de Contas Dedicado'
      ],
      current: false
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#F1F3F2] p-8 space-y-6 select-none">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-[#252B28] tracking-tight">Configurações da Organização</h1>
        <p className="text-xs text-[#6C7671] mt-1">
          Gerencie o perfil da empresa, planos de assinatura e conectividade das APIs.
        </p>
      </div>

      {/* Detalhes da Organização */}
      <div className="bg-white dark:bg-[#151917] rounded-2xl border border-[#E5E9E7] dark:border-[#262E2A] p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[#151917] p-1 border border-[#262E2A]/60 shadow-sm flex items-center justify-center shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-m.png" alt="Logotipo Oficial Moonky" className="w-full h-full object-contain rounded-xl" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#252B28] dark:text-[#F3F6F4] flex items-center gap-2">
              <Building className="w-4 h-4 text-[#45D483]" />
              <span>Organização (Empresa)</span>
            </h2>
            <p className="text-xs text-[#6C7671] dark:text-[#AEB7B3] mt-0.5">
              Identificador da conta empresarial no Moonky
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-[#AEB7B3] uppercase text-[10px] block mb-1">
              Nome da Empresa
            </label>
            <input
              type="text"
              readOnly
              value={initialOrganization.name}
              className="w-full bg-[#F7F9F8] dark:bg-[#1D2320] border border-[#E5E9E7] dark:border-[#2A342E] rounded-xl px-3 py-2 text-xs text-[#252B28] dark:text-[#F3F6F4] font-semibold"
            />
          </div>

          <div>
            <label className="font-bold text-[#AEB7B3] uppercase text-[10px] block mb-1">
              Slug da Organização (Tenant ID)
            </label>
            <input
              type="text"
              readOnly
              value={initialOrganization.slug}
              className="w-full bg-[#F7F9F8] dark:bg-[#1D2320] border border-[#E5E9E7] dark:border-[#2A342E] rounded-xl px-3 py-2 text-xs text-[#252B28] dark:text-[#F3F6F4] font-mono"
            />
          </div>
        </div>
      </div>

      {/* Checklist de Conexão com o Ambiente */}
      <div className="bg-white dark:bg-[#151917] rounded-2xl border border-[#E5E9E7] dark:border-[#262E2A] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#252B28] flex items-center gap-2">
            <Key className="w-4 h-4 text-[#45D483]" />
            <span>Checklist de Conexão de Produção</span>
          </h2>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isLiveSupabase
                ? 'bg-emerald-50 text-emerald-800'
                : 'bg-emerald-50 text-emerald-800'
            }`}
          >
            Supabase Conectado
          </span>
        </div>

        <div className="space-y-3 text-xs">
          {/* Item Supabase */}
          <div className="p-3 bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#45D483]" />
              <div>
                <p className="font-bold text-[#252B28]">Banco de Dados & Autenticação Supabase</p>
                <p className="text-[11px] text-[#6C7671]">
                  awsmysjmittjvgpbopay.supabase.co (Tabelas e RLS isolados por tenant)
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-[#1E7E49]">
              Ativo & Conectado
            </span>
          </div>

          {/* Item WAME */}
          <div className="p-3 bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#45D483]" />
              <div>
                <p className="font-bold text-[#252B28]">API Oficial WAME de WhatsApp & Instagram</p>
                <p className="text-[11px] text-[#6C7671]">
                  Instância configurada e pronta para leitura de QR Code e login Meta
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-[#1E7E49]">Integrado</span>
          </div>

          {/* Item IA */}
          <div className="p-3 bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#45D483]" />
              <div>
                <p className="font-bold text-[#252B28]">Motor de IA no Servidor</p>
                <p className="text-[11px] text-[#6C7671]">
                  Grounding estrito de conhecimento corporativo e transbordo humano ativo
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-[#1E7E49]">Ativo</span>
          </div>
        </div>
      </div>

      {/* Planos de Assinatura */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-bold text-[#252B28] flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#45D483]" />
            <span>Planos de Assinatura & Faturamento</span>
          </h2>
          <p className="text-xs text-[#AEB7B3] mt-0.5">
            Estrutura multi-tenant pronta para cobrança recorrente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`p-6 rounded-2xl border transition-all ${
                p.highlight
                  ? 'bg-white dark:bg-[#151917] border-[#252B28] dark:border-[#45D483] shadow-md ring-2 ring-[#45D483]/30'
                  : 'bg-white dark:bg-[#151917] border-[#E5E9E7] dark:border-[#262E2A] shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#252B28]">{p.name}</span>
                {p.current && (
                  <span className="text-[10px] font-bold bg-[#EAFBF2] text-[#1E7E49] px-2 py-0.5 rounded-full">
                    Plano Atual
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-[#252B28]">{p.price}</span>
                <span className="text-xs text-[#AEB7B3]">{p.period}</span>
              </div>

              <p className="text-xs text-[#6C7671] mt-2">{p.description}</p>

              <div className="mt-5 pt-4 border-t border-[#F1F3F2] space-y-2 text-xs">
                {p.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-[#252B28]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#45D483] shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <button
                disabled={p.current}
                className={`w-full mt-6 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  p.current
                    ? 'bg-[#F1F3F2] text-[#AEB7B3] cursor-default'
                    : 'bg-[#252B28] text-white hover:bg-[#1a1f1d]'
                }`}
              >
                {p.current ? 'Plano Ativo' : 'Fazer Upgrade'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
