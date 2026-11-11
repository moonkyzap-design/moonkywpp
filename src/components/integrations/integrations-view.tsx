'use client';

// ===================================================================
// MOONKY CHANNEL INTEGRATIONS STUDIO (WAME API & META CLOUD)
// Separate official Meta API vs Unofficial QR Code, Webhook verification
// ===================================================================

import React, { useState } from 'react';
import {
  Radio,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Send,
  Zap,
  HelpCircle
} from 'lucide-react';
import { useMoonky } from '@/context/moonky-store';
import { Channel } from '@/types';

export function IntegrationsView() {
  const { channels, updateChannel } = useMoonky();
  const [selectedChannelId, setSelectedChannelId] = useState<string>(channels[0]?.id || '');
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);

  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [activeInstanceKey, setActiveInstanceKey] = useState(channels[0]?.instanceKey || '');
  const [isOfficialMeta, setIsOfficialMeta] = useState(channels[0]?.isOfficial ?? true);

  const selectedChannel = channels.find((c) => c.id === selectedChannelId) || channels[0];

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(selectedChannel.webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/channels/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instanceKey: activeInstanceKey,
          isOfficial: isOfficialMeta
        })
      });

      const data = await res.json();
      setTestResult(data);
    } catch (err: unknown) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Falha na conexão'
      });
    }

    setTestingConnection(false);
  };

  const handleSaveChannel = () => {
    if (!selectedChannel) return;
    updateChannel(selectedChannel.id, {
      instanceKey: activeInstanceKey,
      isOfficial: isOfficialMeta,
      lastSyncAt: 'Just now'
    });
    alert('Channel configuration updated.');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F1F3F2] p-8 space-y-6 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#252B28] tracking-tight">Channel Gateways & WAME API</h1>
          <p className="text-xs text-[#6C7671] mt-1">
            Connect and synchronize WhatsApp Business and Instagram Direct via WAME Server API.
          </p>
        </div>

        <a
          href="https://wame.api.br/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white hover:bg-[#F7F9F8] border border-[#E5E9E7] text-[#252B28] text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 self-start"
        >
          <span>Official WAME Documentation</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#AEB7B3]" />
        </a>
      </div>

      {/* Channel Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {channels.map((ch) => {
          const isSelected = ch.id === selectedChannelId;
          const isWhatsApp = ch.type === 'whatsapp';

          return (
            <div
              key={ch.id}
              onClick={() => {
                setSelectedChannelId(ch.id);
                setActiveInstanceKey(ch.instanceKey);
                setIsOfficialMeta(ch.isOfficial);
                setTestResult(null);
              }}
              className={`p-6 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-white border-[#252B28] shadow-md ring-2 ring-[#45D483]/30'
                  : 'bg-white border-[#E5E9E7] shadow-xs hover:border-[#AEB7B3]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-xs ${
                      isWhatsApp
                        ? 'bg-[#25D366]'
                        : 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600'
                    }`}
                  >
                    {isWhatsApp ? 'WA' : 'IG'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#252B28]">{ch.name}</h3>
                    <p className="text-xs text-[#AEB7B3]">
                      {ch.phoneNumber || `@${ch.instagramUsername}`}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                    ch.status === 'connected'
                      ? 'bg-[#EAFBF2] text-[#1E7E49] border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#45D483]" />
                  {ch.status === 'connected' ? 'Connected' : 'Setup Required'}
                </span>
              </div>

              {/* Mode indicator (Meta Cloud API vs QR Code) */}
              <div className="mt-5 pt-4 border-t border-[#F1F3F2] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[#AEB7B3]">Mode:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      ch.isOfficial
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                    }`}
                  >
                    {ch.isOfficial ? 'Meta Cloud API (Official)' : 'QR Code (Unofficial)'}
                  </span>
                </div>
                <span className="text-[11px] text-[#AEB7B3]">Sync: {ch.lastSyncAt}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Channel Detailed Configuration */}
      {selectedChannel && (
        <div className="bg-white rounded-2xl border border-[#E5E9E7] p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#F1F3F2] pb-4">
            <div>
              <h2 className="text-sm font-bold text-[#252B28]">
                Configure Gateway: {selectedChannel.name}
              </h2>
              <p className="text-xs text-[#AEB7B3] mt-0.5">
                Target endpoint: https://server.wame.api.br/{'{'}KEY{'}'}/...
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleTestConnection}
                disabled={testingConnection}
                className="bg-[#F1F3F2] hover:bg-[#E5E9E7] text-[#252B28] text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition-all disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
                <span>{testingConnection ? 'Testing...' : 'Test Connection'}</span>
              </button>
              <button
                onClick={handleSaveChannel}
                className="bg-[#252B28] text-white hover:bg-[#1a1f1d] text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-xs"
              >
                Save Settings
              </button>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Instance Key */}
            <div className="space-y-2">
              <label className="font-bold text-[#252B28] block">
                WAME Instance Key (Authentication)
              </label>
              <input
                type="text"
                value={activeInstanceKey}
                onChange={(e) => setActiveInstanceKey(e.target.value)}
                placeholder="e.g. WAME_PROD_INSTANCE_8941"
                className="w-full bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl px-3 py-2.5 text-xs text-[#252B28] font-mono focus:outline-none focus:border-[#45D483]"
              />
              <p className="text-[11px] text-[#AEB7B3]">
                Authentication on WAME sits directly in the URL path. No header is required.
              </p>
            </div>

            {/* Connection Type Switcher */}
            <div className="space-y-2">
              <label className="font-bold text-[#252B28] block">Connection Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsOfficialMeta(true)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isOfficialMeta
                      ? 'border-[#45D483] bg-[#EAFBF2] text-[#1E7E49] font-bold'
                      : 'border-[#E5E9E7] bg-[#F7F9F8] text-[#6C7671]'
                  }`}
                >
                  <p className="text-xs font-bold">Meta Cloud API</p>
                  <p className="text-[10px] mt-0.5 opacity-80">Official Meta Enterprise Gateway</p>
                </button>

                <button
                  type="button"
                  onClick={() => setIsOfficialMeta(false)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    !isOfficialMeta
                      ? 'border-[#45D483] bg-[#EAFBF2] text-[#1E7E49] font-bold'
                      : 'border-[#E5E9E7] bg-[#F7F9F8] text-[#6C7671]'
                  }`}
                >
                  <p className="text-xs font-bold">QR Code Pairing</p>
                  <p className="text-[10px] mt-0.5 opacity-80">Unofficial Linked Device</p>
                </button>
              </div>
            </div>

            {/* Webhook URL Endpoint */}
            <div className="md:col-span-2 space-y-2 pt-2 border-t border-[#F1F3F2]">
              <label className="font-bold text-[#252B28] block">
                Webhook Notification URL (Meta standard envelope)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={selectedChannel.webhookUrl}
                  className="flex-1 bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl px-3 py-2.5 text-xs text-[#252B28] font-mono select-all focus:outline-none"
                />
                <button
                  onClick={handleCopyWebhook}
                  className="bg-[#252B28] text-white px-3 py-2.5 rounded-xl font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {copiedWebhook ? <Check className="w-3.5 h-3.5 text-[#45D483]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedWebhook ? 'Copied' : 'Copy URL'}</span>
                </button>
              </div>
              <p className="text-[11px] text-[#AEB7B3]">
                Configure this URL on WAME via PUT /{'{'}KEY{'}'}/instance with webhookFormat: &quot;meta&quot;. Moonky automatically verifies payloads and deduplicates messages.
              </p>
            </div>
          </div>

          {/* Test Connection Results Card */}
          {testResult && (
            <div
              className={`p-4 rounded-xl border text-xs space-y-1 ${
                testResult.success
                  ? 'bg-[#EAFBF2] border-emerald-200 text-[#1E7E49]'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-[#45D483]" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                )}
                <span>{testResult.message}</span>
              </div>
              {testResult.latencyMs && (
                <p className="text-[11px] pl-6 opacity-80">
                  Response latency: {testResult.latencyMs}ms
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
