'use client';

// ===================================================================
// MOONKY MAIN SIDEBAR NAVIGATION
// Clean, minimalist, premium sidebar strictly adhering to brand guidelines
// ===================================================================

import React from 'react';
import {
  LayoutDashboard,
  Inbox,
  Users,
  Bot,
  Zap,
  BarChart3,
  ShieldCheck,
  Radio,
  Settings,
  HelpCircle,
  Bell
} from 'lucide-react';
import { MoonkyWordmark } from '@/components/ui/wordmark';
import { useMoonky } from '@/context/moonky-store';
import { currentUser } from '@/lib/mock-data';

export type NavigationTab =
  | 'overview'
  | 'inbox'
  | 'contacts'
  | 'ai-assistant'
  | 'automations'
  | 'analytics'
  | 'team'
  | 'integrations'
  | 'settings';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
}

export function Sidebar({ currentTab, onSelectTab }: SidebarProps) {
  const { conversations, isLiveSupabase } = useMoonky();
  const unreadTotal = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  const navItems: { id: NavigationTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'inbox', label: 'Inbox', icon: Inbox, badge: unreadTotal > 0 ? unreadTotal : undefined },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot },
    { id: 'automations', label: 'Automations', icon: Zap },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'team', label: 'Team', icon: ShieldCheck },
    { id: 'integrations', label: 'Integrations', icon: Radio },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#E5E9E7] flex flex-col justify-between h-screen shrink-0 select-none">
      {/* Top Header & Brand */}
      <div>
        <div className="h-16 px-6 flex items-center justify-between border-b border-[#F1F3F2]">
          <div className="cursor-pointer" onClick={() => onSelectTab('overview')}>
            <MoonkyWordmark size="md" />
          </div>
          <div className="flex items-center gap-2">
            <button
              title="Notifications"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#AEB7B3] hover:text-[#252B28] hover:bg-[#F1F3F2] transition-colors"
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Environment Status Badge */}
        <div className="px-5 py-3 border-b border-[#F1F3F2]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#AEB7B3] font-medium">Environment</span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                isLiveSupabase
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${isLiveSupabase ? 'bg-[#45D483]' : 'bg-amber-500'}`}
              />
              {isLiveSupabase ? 'Supabase Live' : 'Demo Mode'}
            </span>
          </div>
          <p className="text-[11px] text-[#AEB7B3] mt-1 truncate">Org: Moonky Technologies</p>
        </div>

        {/* Main Navigation Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#F1F3F2] text-[#252B28] font-semibold'
                    : 'text-[#AEB7B3] hover:text-[#252B28] hover:bg-[#F7F9F8]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-[#252B28]' : 'text-[#AEB7B3]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="bg-[#45D483] text-[#252B28] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Help */}
      <div className="p-4 border-t border-[#F1F3F2] space-y-3">
        <button
          onClick={() => onSelectTab('settings')}
          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[#F1F3F2] transition-colors text-left"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.fullName}
            className="w-9 h-9 rounded-full object-cover border border-[#E5E9E7]"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#252B28] truncate">{currentUser.fullName}</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#45D483]" />
              <p className="text-xs text-[#AEB7B3] truncate capitalize">{currentUser.role}</p>
            </div>
          </div>
        </button>

        <div className="flex items-center justify-between text-xs text-[#AEB7B3] px-2 pt-1 border-t border-[#F1F3F2]">
          <span className="flex items-center gap-1 cursor-pointer hover:text-[#252B28]">
            <HelpCircle className="w-3.5 h-3.5" /> Support
          </span>
          <span className="text-[10px]">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
