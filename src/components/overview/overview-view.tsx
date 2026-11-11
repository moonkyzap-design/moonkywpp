'use client';

// ===================================================================
// MOONKY MAIN OVERVIEW DASHBOARD
// Executive metrics, channel volume charts, AI resolution rates & feed
// ===================================================================

import React from 'react';
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  Bot,
  UserPlus,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Radio,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useMoonky } from '@/context/moonky-store';
import { NavigationTab } from '@/components/layout/sidebar';

interface OverviewViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export function OverviewView({ onNavigate }: OverviewViewProps) {
  const { analytics, conversations, channels, isLiveSupabase } = useMoonky();

  const metrics = [
    {
      label: 'Total Conversations',
      value: analytics.totalConversations.toLocaleString(),
      change: '+12.4% vs last week',
      isPositive: true,
      icon: MessageSquare
    },
    {
      label: 'Open Conversations',
      value: analytics.openConversations,
      change: 'Active in queue',
      isPositive: true,
      icon: Clock,
      highlight: true
    },
    {
      label: 'Resolved Conversations',
      value: analytics.resolvedConversations.toLocaleString(),
      change: `${analytics.resolutionRatePercentage}% resolution rate`,
      isPositive: true,
      icon: CheckCircle2
    },
    {
      label: 'Avg Response Time',
      value: `${analytics.avgResponseTimeMin}m`,
      change: '-18s faster than SLA',
      isPositive: true,
      icon: TrendingUp
    },
    {
      label: 'AI Handled Rate',
      value: `${analytics.aiHandledPercentage}%`,
      change: 'Zero hallucination guard',
      isPositive: true,
      icon: Bot,
      accent: true
    },
    {
      label: 'New Qualified Leads',
      value: analytics.newLeadsCount,
      change: '+22 new this week',
      isPositive: true,
      icon: UserPlus
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#FAFBFB] p-8 space-y-8 select-none">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#252B28] tracking-tight">Executive Dashboard</h1>
          <p className="text-xs text-[#6C7671] mt-1">
            Omnichannel real-time monitoring across WhatsApp & Instagram Direct.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('inbox')}
            className="bg-[#252B28] hover:bg-[#1a1f1d] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#45D483]" />
            <span>Open Omnichannel Inbox</span>
          </button>
          <button
            onClick={() => onNavigate('integrations')}
            className="bg-white hover:bg-[#F7F9F8] border border-[#E5E9E7] text-[#252B28] text-xs font-semibold px-3 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Radio className="w-3.5 h-3.5 text-[#AEB7B3]" />
            <span>Channels</span>
          </button>
        </div>
      </div>

      {/* Metrics 6-Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition-all ${
                m.accent
                  ? 'bg-gradient-to-b from-[#FFFFFF] to-[#EAFBF2] border-emerald-200 shadow-xs'
                  : 'bg-white border-[#E5E9E7] shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#AEB7B3] uppercase tracking-wider">
                  {m.label}
                </span>
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    m.accent ? 'bg-[#45D483]/20 text-[#1E7E49]' : 'bg-[#F1F3F2] text-[#252B28]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-[#252B28] tracking-tight">{m.value}</p>
                <p className="text-[11px] text-[#6C7671] mt-1 flex items-center gap-1">
                  {m.accent && <Sparkles className="w-3 h-3 text-[#45D483]" />}
                  {m.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Volume & Channel Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Conversation Volume Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E9E7] p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#252B28]">Conversation Volume</h2>
              <p className="text-xs text-[#AEB7B3] mt-0.5">7-day traffic split between channels</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#45D483]" />
                <span className="text-[#252B28]">WhatsApp</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
                <span className="text-[#252B28]">Instagram</span>
              </div>
            </div>
          </div>

          {/* Bar Visualization */}
          <div className="h-48 flex items-end justify-between gap-4 pt-4 border-b border-[#F1F3F2]">
            {analytics.volumeByDay.map((item, i) => {
              const maxVal = 260;
              const waHeight = (item.whatsapp / maxVal) * 100;
              const igHeight = (item.instagram / maxVal) * 100;

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1.5 h-40">
                    {/* WhatsApp Bar */}
                    <div
                      style={{ height: `${waHeight}%` }}
                      className="w-4 bg-[#45D483] rounded-t-md hover:opacity-90 transition-all cursor-pointer relative group"
                    >
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#252B28] text-white text-[10px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {item.whatsapp} WA
                      </span>
                    </div>

                    {/* Instagram Bar */}
                    <div
                      style={{ height: `${igHeight}%` }}
                      className="w-4 bg-[#3B82F6] rounded-t-md hover:opacity-90 transition-all cursor-pointer relative group"
                    >
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#252B28] text-white text-[10px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {item.instagram} IG
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-[#6C7671]">{item.day}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-[#6C7671] pt-2">
            <span>Peak hour: 14:00 - 17:30 UTC-3</span>
            <span className="text-[#252B28] font-bold">Total this week: 1,424 messages</span>
          </div>
        </div>

        {/* Channel Distribution & AI vs Human Breakdown */}
        <div className="bg-white rounded-2xl border border-[#E5E9E7] p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-sm font-bold text-[#252B28]">Channel Distribution</h2>
            <p className="text-xs text-[#AEB7B3] mt-0.5">WAME API active routing</p>

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

          {/* AI vs Human Box */}
          <div className="p-4 bg-[#F7F9F8] rounded-xl border border-[#E5E9E7] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#252B28]">AI Automation Efficiency</span>
              <span className="text-[10px] font-bold bg-[#EAFBF2] text-[#1E7E49] px-2 py-0.5 rounded-full">
                68% Automated
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#6C7671]">
              <span>Handled by Moonky AI:</span>
              <span className="font-bold text-[#252B28]">{analytics.aiVsHuman.ai} chats</span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#6C7671]">
              <span>Handled by Human Agents:</span>
              <span className="font-bold text-[#252B28]">{analytics.aiVsHuman.human} chats</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Live Activity Feed & Active Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E9E7] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#252B28]">Recent Activity Stream</h2>
              <p className="text-xs text-[#AEB7B3]">Real-time events from webhook & agents</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-[#45D483] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#45D483] animate-pulse" />
              Live Feed
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
                    {c.aiStatus === 'handed_off' ? 'Handoff to Human' : 'AI Active'}
                  </span>
                  <p className="text-[10px] text-[#AEB7B3] mt-1">{c.lastMessageAt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Channels Health Box */}
        <div className="bg-white rounded-2xl border border-[#E5E9E7] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#252B28]">Channel Gateways</h2>
            <button
              onClick={() => onNavigate('integrations')}
              className="text-xs font-semibold text-[#45D483] hover:underline"
            >
              Configure
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
                  Active
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#F1F3F2] rounded-xl text-[11px] text-[#6C7671] leading-relaxed">
            All inbound messages are processed server-side with idempotency protection and WAME Meta-standard envelope.
          </div>
        </div>
      </div>
    </div>
  );
}
