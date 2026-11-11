'use client';

// ===================================================================
// MOONKY MAIN APPLICATION SHELL
// Unifying Omnichannel Inbox, Dashboard, CRM, AI Studio & Settings
// ===================================================================

import React, { useState } from 'react';
import { MoonkyStoreProvider } from '@/context/moonky-store';
import { Sidebar, NavigationTab } from '@/components/layout/sidebar';
import { InboxView } from '@/components/inbox/inbox-view';
import { OverviewView } from '@/components/overview/overview-view';
import { ContactsView } from '@/components/contacts/contacts-view';
import { AIAssistantView } from '@/components/ai/ai-view';
import { AutomationsView } from '@/components/automations/automations-view';
import { AnalyticsView } from '@/components/analytics/analytics-view';
import { TeamView } from '@/components/team/team-view';
import { IntegrationsView } from '@/components/integrations/integrations-view';
import { SettingsView } from '@/components/settings/settings-view';

function AppShell() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('inbox');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F1F3F2]">
      {/* Primary Sidebar */}
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {currentTab === 'inbox' && <InboxView />}
        {currentTab === 'overview' && <OverviewView onNavigate={setCurrentTab} />}
        {currentTab === 'contacts' && <ContactsView onNavigate={setCurrentTab} />}
        {currentTab === 'ai-assistant' && <AIAssistantView />}
        {currentTab === 'automations' && <AutomationsView />}
        {currentTab === 'analytics' && <AnalyticsView />}
        {currentTab === 'team' && <TeamView />}
        {currentTab === 'integrations' && <IntegrationsView />}
        {currentTab === 'settings' && <SettingsView />}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <MoonkyStoreProvider>
      <AppShell />
    </MoonkyStoreProvider>
  );
}
