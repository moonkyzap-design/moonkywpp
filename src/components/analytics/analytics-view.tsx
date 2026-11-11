'use client';

// ===================================================================
// MOONKY ANALYTICS & INTELLIGENCE SUITE
// Daily volume trends, channel breakdown, AI vs human SLA & agent ranking
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

  return (
    <div className="flex-1 overflow-y-auto bg-[#F1F3F2] p-8 space-y-6 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#252B28] tracking-tight">Performance Analytics</h1>
          <p className="text-xs text-[#6C7671] mt-1">
            Omnichannel service metrics, customer resolution rates, and AI efficiency KPIs.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-[#E5E9E7] p-1.5 rounded-xl text-xs font-semibold text-[#252B28]">
          <Calendar className="w-3.5 h-3.5 text-[#AEB7B3]" />
          <span>Last 7 Days (June 2026)</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-[#E5E9E7] shadow-xs">
          <span className="text-[10px] font-bold uppercase text-[#AEB7B3] tracking-wider">
            Total Conversations
          </span>
          <p className="text-2xl font-bold text-[#252B28] mt-2">{analytics.totalConversations}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">+14.2% vs previous period</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#E5E9E7] shadow-xs">
          <span className="text-[10px] font-bold uppercase text-[#AEB7B3] tracking-wider">
            Resolution Rate
          </span>
          <p className="text-2xl font-bold text-[#252B28] mt-2">
            {analytics.resolutionRatePercentage}%
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Top tier industry SLA</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#E5E9E7] shadow-xs">
          <span className="text-[10px] font-bold uppercase text-[#AEB7B3] tracking-wider">
            Average First Response
          </span>
          <p className="text-2xl font-bold text-[#252B28] mt-2">{analytics.avgResponseTimeMin}m</p>
          <p className="text-[11px] text-[#6C7671] mt-1">AI instant reply under 3s</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-emerald-200 bg-gradient-to-b from-white to-[#EAFBF2] shadow-xs">
          <span className="text-[10px] font-bold uppercase text-[#1E7E49] tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#45D483]" /> AI Autopilot Rate
          </span>
          <p className="text-2xl font-bold text-[#252B28] mt-2">{analytics.aiHandledPercentage}%</p>
          <p className="text-[11px] text-[#1E7E49] font-medium mt-1">Resolved without agent intervention</p>
        </div>
      </div>

      {/* Grid: Volume & AI vs Human Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Volume Bar Distribution */}
        <div className="bg-white rounded-2xl border border-[#E5E9E7] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#252B28]">Daily Inbound Volume</h2>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1 text-[#252B28]">
                <span className="w-2 h-2 rounded-full bg-[#45D483]" /> WhatsApp
              </span>
              <span className="flex items-center gap-1 text-[#252B28]">
                <span className="w-2 h-2 rounded-full bg-[#3B82F6]" /> Instagram
              </span>
            </div>
          </div>

          <div className="h-52 flex items-end justify-between gap-3 pt-6 border-b border-[#F1F3F2]">
            {analytics.volumeByDay.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1 h-44">
                  <div
                    style={{ height: `${(d.whatsapp / 240) * 100}%` }}
                    className="w-5 bg-[#45D483] rounded-t-sm"
                  />
                  <div
                    style={{ height: `${(d.instagram / 240) * 100}%` }}
                    className="w-5 bg-[#3B82F6] rounded-t-sm"
                  />
                </div>
                <span className="text-[11px] font-bold text-[#6C7671]">{d.day}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-[#AEB7B3] text-center">
            Total weekly messages processed: 1,424
          </p>
        </div>

        {/* AI vs Human Split Details */}
        <div className="bg-white rounded-2xl border border-[#E5E9E7] p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#252B28]">AI vs Human Agent Split</h2>
          <p className="text-xs text-[#AEB7B3]">
            Proportion of tickets resolved entirely by AI vs escalated to team members.
          </p>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-[#252B28] flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-[#45D483]" /> AI Resolved (Autopilot)
                </span>
                <span className="text-[#45D483]">{analytics.aiVsHuman.ai} chats (68.4%)</span>
              </div>
              <div className="w-full bg-[#F1F3F2] h-3 rounded-full overflow-hidden">
                <div style={{ width: '68.4%' }} className="bg-[#45D483] h-full rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-[#252B28] flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#252B28]" /> Human Agent Escalated
                </span>
                <span className="text-[#252B28]">{analytics.aiVsHuman.human} chats (31.6%)</span>
              </div>
              <div className="w-full bg-[#F1F3F2] h-3 rounded-full overflow-hidden">
                <div style={{ width: '31.6%' }} className="bg-[#252B28] h-full rounded-full" />
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#F7F9F8] rounded-xl border border-[#E5E9E7] text-xs text-[#6C7671] space-y-1">
            <span className="font-bold text-[#252B28] block">Efficiency Impact</span>
            <p className="text-[11px] leading-relaxed">
              Automated support has saved approximately 42.5 hours of human specialist time this week, maintaining a 4.9/5 satisfaction score.
            </p>
          </div>
        </div>
      </div>

      {/* Agent Performance Leaderboard */}
      <div className="bg-white rounded-2xl border border-[#E5E9E7] p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#252B28]">Agent Performance Leaderboard</h2>

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
                  <p className="text-[10px] text-[#AEB7B3] capitalize">{agent.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-right">
                <div>
                  <p className="font-bold text-[#252B28]">{agent.assignedChatsCount * 12}</p>
                  <p className="text-[10px] text-[#AEB7B3]">Tickets Closed</p>
                </div>
                <div>
                  <p className="font-bold text-emerald-600">98.2%</p>
                  <p className="text-[10px] text-[#AEB7B3]">CSAT Score</p>
                </div>
                <div>
                  <p className="font-bold text-[#252B28]">1.1 min</p>
                  <p className="text-[10px] text-[#AEB7B3]">Avg First Response</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
