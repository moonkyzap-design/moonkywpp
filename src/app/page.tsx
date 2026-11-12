'use client';

// ===================================================================
// MOONKY MAIN APPLICATION SHELL
// Floating rounded container matching image.png reference pixel-for-pixel
// Palette: #FFFFFF, #F1F3F2, #AEB7B3, #252B28, #45D483
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
import { ChannelConnectModal } from '@/components/channels/channel-connect-modal';

function AppShell() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('inbox');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  return (
    <div className="h-screen w-screen bg-[#EAEFEA] dark:bg-[#0D100F] p-0 sm:p-2 md:p-3.5 lg:p-4 flex items-center justify-center overflow-hidden font-sans antialiased selection:bg-[#45D483]/30">
      {/* Floating Enclosed Application Container (from image.png) */}
      <div className="w-full max-w-[1600px] h-full sm:h-[calc(100vh-16px)] md:h-[calc(100vh-28px)] bg-white dark:bg-[#151917] sm:rounded-[28px] md:rounded-[36px] shadow-[0_20px_70px_-10px_rgba(0,0,0,0.07)] border border-[#E2E7E4] dark:border-[#262E2A] flex overflow-hidden">
        {/* Slim Left Navigation Rail — Profile avatar click opens QR Code / WhatsApp Connection */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenConnectModal={() => setIsConnectModalOpen(true)}
        />

        {/* Dynamic Main Workspace Area */}
        <main className="flex-1 flex overflow-hidden min-w-0 bg-white dark:bg-[#151917]">
          {currentTab === 'inbox' && <InboxView onOpenConnectModal={() => setIsConnectModalOpen(true)} />}
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

      {/* WhatsApp QR Code & Instagram Meta Channel Modal */}
      <ChannelConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
      />
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
