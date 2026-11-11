'use client';

// ===================================================================
// MOONKY SETTINGS & MULTI-TENANCY BILLING PREPARATION
// Tenant profile, SaaS plans, environment checklist & Supabase guide
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
      name: 'Starter',
      price: '$19',
      period: '/month',
      description: 'Ideal for small local businesses starting on WhatsApp.',
      features: ['2 Team Agents', '1 WhatsApp Channel', '10,000 AI Tokens/mo', 'Community Support'],
      current: false
    },
    {
      id: 'growth',
      name: 'Growth',
      price: '$79',
      period: '/month',
      description: 'For growing e-commerce and SaaS brands on WA & Instagram.',
      features: [
        '5 Team Agents',
        '3 Channels (WhatsApp & Instagram)',
        '500,000 AI Tokens/mo',
        'Automations & CRM',
        '24/7 SLA Priority'
      ],
      current: true,
      highlight: true
    },
    {
      id: 'scale',
      name: 'Scale',
      price: '$199',
      period: '/month',
      description: 'High-volume enterprises needing unlimited bandwidth.',
      features: [
        'Unlimited Agents',
        'Unlimited Channels',
        'Dedicated AI Fine-tuning',
        'Custom Webhooks & DB Sync',
        'Dedicated Account Manager'
      ],
      current: false
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#F1F3F2] p-8 space-y-6 select-none">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#252B28] tracking-tight">Organization Settings</h1>
        <p className="text-xs text-[#6C7671] mt-1">
          Manage multi-tenant organization profile, subscription tiers, and API connectivity.
        </p>
      </div>

      {/* Organization Details */}
      <div className="bg-white rounded-2xl border border-[#E5E9E7] p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#252B28] flex items-center gap-2">
          <Building className="w-4 h-4 text-[#45D483]" />
          <span>Tenant Organization</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-[#AEB7B3] uppercase text-[10px] block mb-1">
              Organization Name
            </label>
            <input
              type="text"
              readOnly
              value={initialOrganization.name}
              className="w-full bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl px-3 py-2 text-xs text-[#252B28] font-semibold"
            />
          </div>

          <div>
            <label className="font-bold text-[#AEB7B3] uppercase text-[10px] block mb-1">
              Organization Slug (Tenant ID)
            </label>
            <input
              type="text"
              readOnly
              value={initialOrganization.slug}
              className="w-full bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl px-3 py-2 text-xs text-[#252B28] font-mono"
            />
          </div>
        </div>
      </div>

      {/* Environment & Integration Checklist (Rule #8 & #9 compliance) */}
      <div className="bg-white rounded-2xl border border-[#E5E9E7] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#252B28] flex items-center gap-2">
            <Key className="w-4 h-4 text-[#45D483]" />
            <span>Production Credentials Checklist</span>
          </h2>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isLiveSupabase
                ? 'bg-emerald-50 text-emerald-800'
                : 'bg-amber-50 text-amber-800'
            }`}
          >
            {isLiveSupabase ? 'Supabase Connected' : 'Demo State (Ready to Connect)'}
          </span>
        </div>

        <div className="space-y-3 text-xs">
          {/* Supabase Item */}
          <div className="p-3 bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isLiveSupabase ? (
                <CheckCircle2 className="w-4 h-4 text-[#45D483]" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500" />
              )}
              <div>
                <p className="font-bold text-[#252B28]">Supabase Database & Auth</p>
                <p className="text-[11px] text-[#6C7671]">
                  NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-[#6C7671]">
              {isLiveSupabase ? 'Active' : 'Awaiting .env'}
            </span>
          </div>

          {/* WAME Item */}
          <div className="p-3 bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#45D483]" />
              <div>
                <p className="font-bold text-[#252B28]">WAME WhatsApp & Instagram API</p>
                <p className="text-[11px] text-[#6C7671]">
                  Instance Key configured in Channel Gateways
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-[#1E7E49]">Integrated</span>
          </div>

          {/* AI Engine Item */}
          <div className="p-3 bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#45D483]" />
              <div>
                <p className="font-bold text-[#252B28]">Server-Side AI Engine</p>
                <p className="text-[11px] text-[#6C7671]">
                  Zero-hallucination knowledge grounding & handoff active
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-[#1E7E49]">Active</span>
          </div>
        </div>
      </div>

      {/* SaaS Subscription Plans */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-bold text-[#252B28] flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#45D483]" />
            <span>SaaS Subscription & Billing Tiers</span>
          </h2>
          <p className="text-xs text-[#AEB7B3] mt-0.5">
            Prepared multi-tenant tier infrastructure (payments disabled until Stripe key configured).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`p-6 rounded-2xl border transition-all ${
                p.highlight
                  ? 'bg-white border-[#252B28] shadow-md ring-2 ring-[#45D483]/30'
                  : 'bg-white border-[#E5E9E7] shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#252B28]">{p.name}</span>
                {p.current && (
                  <span className="text-[10px] font-bold bg-[#EAFBF2] text-[#1E7E49] px-2 py-0.5 rounded-full">
                    Current Plan
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
                {p.current ? 'Active Plan' : 'Upgrade Plan'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
