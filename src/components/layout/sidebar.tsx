'use client';

// ===================================================================
// MOONKY SLIM ICON RAIL NAVIGATION
// Matching image.png design reference pixel-for-pixel
// Palette: #FFFFFF, #F1F3F2, #AEB7B3, #252B28, #45D483
// ===================================================================

import React, { useState } from 'react';
import {
  Home,
  Search,
  Bookmark,
  Trash2,
  Share2,
  Settings,
  Sun,
  Moon
} from 'lucide-react';
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
  const { conversations } = useMoonky();
  const unreadTotal = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Exact 6 items from image.png: Home, Search, Saves, Trash, Share, Settings
  const navItems: {
    id: NavigationTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }[] = [
    { id: 'inbox', label: 'Home', icon: Home, badge: unreadTotal > 0 ? unreadTotal : undefined },
    { id: 'overview', label: 'Search', icon: Search },
    { id: 'contacts', label: 'Saves', icon: Bookmark },
    { id: 'automations', label: 'Trash', icon: Trash2 },
    { id: 'integrations', label: 'Share', icon: Share2 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="w-[74px] md:w-[78px] bg-white border-r border-[#E5E9E7]/80 flex flex-col justify-between items-center py-6 shrink-0 select-none z-20">
      {/* Top: Stylized Moonky Monogram Glyph (matching image.png) */}
      <div className="flex flex-col items-center gap-7">
        <button
          onClick={() => onSelectTab('inbox')}
          title="Moonky Intelligent Omnichannel"
          className="relative w-11 h-11 rounded-2xl bg-[#252B28] flex items-center justify-center text-white shadow-sm hover:scale-105 transition-transform"
        >
          <span className="font-extrabold text-xl tracking-tighter text-white">M</span>
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#45D483] ring-2 ring-[#252B28]" />
        </button>

        {/* Navigation Icon List with small labels underneath (matching image.png) */}
        <nav className="flex flex-col items-center gap-5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                title={item.label}
                className={`group relative flex flex-col items-center justify-center gap-1 w-13 py-1 transition-all ${
                  isActive
                    ? 'text-[#252B28]'
                    : 'text-[#AEB7B3] hover:text-[#252B28]'
                }`}
              >
                {/* Active Indicator Pill */}
                {isActive && (
                  <span className="absolute -left-[14px] top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#45D483] rounded-r-full" />
                )}

                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-[#252B28] text-white shadow-xs'
                      : 'text-[#AEB7B3] group-hover:text-[#252B28] group-hover:bg-[#F1F3F2]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <span
                  className={`text-[9.5px] font-medium leading-none transition-colors ${
                    isActive ? 'font-bold text-[#252B28]' : 'text-[#AEB7B3] group-hover:text-[#252B28]'
                  }`}
                >
                  {item.label}
                </span>

                {/* Badge if unread */}
                {item.badge !== undefined && (
                  <span className="absolute top-0 right-1 w-4 h-4 bg-[#45D483] text-[#252B28] text-[9px] font-extrabold rounded-full flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Day/Night Capsule Toggle & User Avatar (matching image.png) */}
      <div className="flex flex-col items-center gap-5">
        {/* Day / Night Vertical Capsule Switch */}
        <div className="bg-[#F1F3F2] p-1 rounded-full flex flex-col items-center gap-1 shadow-inner">
          <button
            onClick={() => setIsDarkMode(false)}
            title="Light mode"
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              !isDarkMode
                ? 'bg-white text-[#252B28] shadow-xs'
                : 'text-[#AEB7B3] hover:text-[#252B28]'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-[#45D483]" />
          </button>
          <button
            onClick={() => setIsDarkMode(true)}
            title="Dark mode"
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              isDarkMode
                ? 'bg-[#252B28] text-white shadow-xs'
                : 'text-[#AEB7B3] hover:text-[#252B28]'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* User Profile Avatar with Online Ring */}
        <button
          onClick={() => onSelectTab('settings')}
          title={`${currentUser.fullName} (${currentUser.role})`}
          className="relative group focus:outline-none"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.fullName}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-offset-2 ring-[#45D483] group-hover:scale-105 transition-transform"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#45D483] ring-2 ring-white" />
        </button>
      </div>
    </aside>
  );
}
