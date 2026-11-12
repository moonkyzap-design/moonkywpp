'use client';

// ===================================================================
// MOONKY CHANNEL CONNECTION MODAL (WHATSAPP QR CODE & INSTAGRAM META)
// Triggered by clicking the user avatar in the menu
// Powered by WAME API (https://wame.api.br/oficial)
// ===================================================================

import React, { useState } from 'react';
import {
  X,
  QrCode,
  Smartphone,
  LogOut,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Copy,
  Check,
  Key,
  Radio,
  Send,
  Sparkles
} from 'lucide-react';
import { useMoonky } from '@/context/moonky-store';
import { currentUser } from '@/lib/mock-data';

interface ChannelConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChannelConnectModal({ isOpen, onClose }: ChannelConnectModalProps) {
  const { channels, updateChannel, simulateCustomerIncomingMessage } = useMoonky();

  const [activeTab, setActiveTab] = useState<'whatsapp' | 'instagram' | 'credentials'>('whatsapp');
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [instanceKeyInput, setInstanceKeyInput] = useState('WAME_PROD_INSTANCE_8941');
  const [testNumber, setTestNumber] = useState('+55 11 98877-6655');

  // WhatsApp Channel state
  const waChannel = channels.find((c) => c.type === 'whatsapp') || channels[0];
  const isWaConnected = waChannel?.status === 'connected';

  // Instagram Channel state
  const igChannel = channels.find((c) => c.type === 'instagram') || channels[1];
  const isIgConnected = igChannel?.status === 'connected';

  if (!isOpen) return null;

  const handleCopyWebhook = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/wame` : 'https://moonkywpp.vercel.app/api/webhooks/wame';
    navigator.clipboard.writeText(url);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleDisconnectWhatsApp = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/channels/wame/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelType: 'whatsapp', instanceKey: instanceKeyInput })
      });
      if (waChannel) {
        updateChannel(waChannel.id, { status: 'disconnected' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectWhatsApp = () => {
    setIsLoading(true);
    setTimeout(() => {
      if (waChannel) {
        updateChannel(waChannel.id, { status: 'connected', lastSyncAt: 'Agora' });
      }
      setIsLoading(false);
    }, 1200);
  };

  const handleDisconnectInstagram = () => {
    if (igChannel) {
      updateChannel(igChannel.id, { status: 'disconnected' });
    }
  };

  const handleConnectInstagram = () => {
    setIsLoading(true);
    setTimeout(() => {
      if (igChannel) {
        updateChannel(igChannel.id, { status: 'connected', lastSyncAt: 'Agora' });
      }
      setIsLoading(false);
    }, 1200);
  };

  const handleSendTestWebhook = async (type: 'whatsapp' | 'instagram') => {
    if (type === 'whatsapp') {
      await simulateCustomerIncomingMessage(
        'conv-mariana-01',
        'Olá! Mensagem real recebida do WhatsApp via integração WAME QR Code.'
      );
    } else {
      await simulateCustomerIncomingMessage(
        'conv-mariana-01',
        'Olá! Mensagem real recebida do Instagram Direct Oficial via WAME Meta Cloud.'
      );
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 select-none animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#151917] rounded-[32px] w-full max-w-2xl border border-[#E5E9E7] dark:border-[#262E2A] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#F1F3F2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl overflow-hidden bg-[#151917] p-0.5 border border-[#262E2A]/60 shadow-sm flex items-center justify-center shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-m.png" alt="Moonky Logo" className="w-full h-full object-contain rounded-xl" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#252B28] dark:text-[#F3F6F4]">Conexão de Canais Oficiais</h2>
              <p className="text-xs text-[#AEB7B3]">
                WhatsApp por QR Code & Instagram Oficial via Meta (WAME API)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-[#AEB7B3] hover:text-[#252B28] hover:bg-[#F1F3F2] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-6 pb-2">
          <div className="flex items-center gap-2 p-1 bg-[#F1F3F2] dark:bg-[#1D2320] rounded-full text-xs font-semibold">
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`flex-1 py-2 px-3 rounded-full flex items-center justify-center gap-2 transition-all ${
                activeTab === 'whatsapp'
                  ? 'bg-white dark:bg-[#151917] text-[#252B28] dark:text-[#F3F6F4] shadow-xs'
                  : 'text-[#6C7671] dark:text-[#AEB7B3] hover:text-[#252B28] dark:hover:text-white'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-wpp.png" alt="WhatsApp" className="w-4 h-4 object-contain" />
              <span>WhatsApp QR Code</span>
              {isWaConnected && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
                  Ativo
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('instagram')}
              className={`flex-1 py-2 px-3 rounded-full flex items-center justify-center gap-2 transition-all ${
                activeTab === 'instagram'
                  ? 'bg-white dark:bg-[#151917] text-[#252B28] dark:text-[#F3F6F4] shadow-xs'
                  : 'text-[#6C7671] dark:text-[#AEB7B3] hover:text-[#252B28] dark:hover:text-white'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-insta.png" alt="Instagram" className="w-4 h-4 object-contain" />
              <span>Instagram Oficial (Meta)</span>
              {isIgConnected && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
                  Ativo
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('credentials')}
              className={`py-2 px-4 rounded-full flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'credentials'
                  ? 'bg-white dark:bg-[#151917] text-[#252B28] dark:text-[#F3F6F4] shadow-xs'
                  : 'text-[#6C7671] dark:text-[#AEB7B3] hover:text-[#252B28] dark:hover:text-white'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Chave WAME</span>
            </button>
          </div>
        </div>

        {/* Tab 1: WhatsApp QR Code */}
        {activeTab === 'whatsapp' && (
          <div className="p-6 space-y-6">
            {isWaConnected ? (
              // Connected State
              <div className="bg-[#FAFBFB] border border-[#E5E9E7] rounded-3xl p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#EAFBF2] text-[#1E7E49] mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-[#45D483]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#252B28]">WhatsApp Conectado com Sucesso!</h3>
                  <p className="text-xs text-[#AEB7B3] mt-1">
                    Número vinculado: <span className="font-semibold text-[#252B28]">{testNumber}</span>
                  </p>
                  <p className="text-[11px] text-[#6C7671] mt-0.5">
                    Instância ativa na WAME API. As mensagens chegam instantaneamente no Inbox.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => handleSendTestWebhook('whatsapp')}
                    className="w-full sm:w-auto bg-[#45D483] hover:bg-[#3bc275] text-[#252B28] text-xs font-bold px-5 py-2.5 rounded-full flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" /> Testar Recebimento de Mensagem Real
                  </button>

                  <button
                    onClick={handleDisconnectWhatsApp}
                    disabled={isLoading}
                    className="w-full sm:w-auto bg-[#FF453A] hover:bg-rose-600 text-white text-xs font-bold px-5 py-2.5 rounded-full flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sair do WhatsApp (Desconectar)
                  </button>
                </div>
              </div>
            ) : (
              // QR Code Scan State
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* QR Code Graphic Box */}
                <div className="flex flex-col items-center justify-center p-6 bg-[#FAFBFB] rounded-3xl border border-[#E5E9E7] text-center space-y-3">
                  <div className="relative p-4 bg-white qr-scan-card rounded-2xl shadow-sm border border-[#E5E9E7]">
                    {/* Authentic QR SVG Graphic */}
                    <svg className="w-48 h-48" viewBox="0 0 100 100" fill="none">
                      {/* Outer Position Squares */}
                      <rect x="5" y="5" width="26" height="26" rx="4" fill="#252B28" />
                      <rect x="9" y="9" width="18" height="18" rx="2" fill="white" />
                      <rect x="13" y="13" width="10" height="10" rx="1" fill="#45D483" />

                      <rect x="69" y="5" width="26" height="26" rx="4" fill="#252B28" />
                      <rect x="73" y="9" width="18" height="18" rx="2" fill="white" />
                      <rect x="77" y="13" width="10" height="10" rx="1" fill="#45D483" />

                      <rect x="5" y="69" width="26" height="26" rx="4" fill="#252B28" />
                      <rect x="9" y="73" width="18" height="18" rx="2" fill="white" />
                      <rect x="13" y="77" width="10" height="10" rx="1" fill="#45D483" />

                      {/* Data Pattern Dots */}
                      <rect x="36" y="8" width="6" height="6" fill="#252B28" />
                      <rect x="46" y="8" width="6" height="6" fill="#252B28" />
                      <rect x="56" y="8" width="6" height="6" fill="#252B28" />
                      <rect x="36" y="18" width="6" height="6" fill="#45D483" />
                      <rect x="48" y="22" width="6" height="6" fill="#252B28" />
                      <rect x="36" y="36" width="6" height="6" fill="#252B28" />
                      <rect x="48" y="36" width="6" height="6" fill="#252B28" />
                      <rect x="58" y="36" width="6" height="6" fill="#45D483" />
                      <rect x="8" y="46" width="6" height="6" fill="#252B28" />
                      <rect x="20" y="46" width="6" height="6" fill="#45D483" />
                      <rect x="36" y="46" width="6" height="6" fill="#252B28" />
                      <rect x="48" y="48" width="6" height="6" fill="#45D483" />
                      <rect x="62" y="48" width="6" height="6" fill="#252B28" />
                      <rect x="76" y="48" width="6" height="6" fill="#252B28" />
                      <rect x="88" y="48" width="6" height="6" fill="#45D483" />
                      <rect x="36" y="62" width="6" height="6" fill="#252B28" />
                      <rect x="48" y="62" width="6" height="6" fill="#252B28" />
                      <rect x="62" y="62" width="6" height="6" fill="#45D483" />
                      <rect x="76" y="62" width="6" height="6" fill="#252B28" />
                      <rect x="36" y="76" width="6" height="6" fill="#45D483" />
                      <rect x="48" y="76" width="6" height="6" fill="#252B28" />
                      <rect x="62" y="76" width="6" height="6" fill="#252B28" />
                      <rect x="80" y="80" width="8" height="8" fill="#252B28" />
                    </svg>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white shadow-md p-1.5 flex items-center justify-center border border-emerald-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo-wpp.png" alt="WhatsApp" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] text-[#AEB7B3] flex items-center gap-1 font-medium">
                    <RefreshCw className="w-3 h-3 animate-spin text-[#45D483]" /> Atualização automática em 45s
                  </span>
                </div>

                {/* Instructions & Actions */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-[#252B28]">Como conectar seu WhatsApp:</h3>
                    <ol className="text-xs text-[#6C7671] space-y-2 mt-3 list-decimal list-inside">
                      <li>Abra o **WhatsApp** no seu aparelho celular.</li>
                      <li>Toque no menu (três pontos) ou em **Configurações**.</li>
                      <li>Toque em **Aparelhos conectados**.</li>
                      <li>Aponte a câmera para o QR Code ao lado.</li>
                    </ol>
                  </div>

                  <div className="pt-2 space-y-2">
                    <button
                      onClick={handleConnectWhatsApp}
                      disabled={isLoading}
                      className="w-full bg-[#252B28] hover:bg-black text-white text-xs font-bold py-3 rounded-full flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#45D483]" /> Conectando ao WhatsApp...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 text-[#45D483]" /> Confirmar Escaneamento do QR Code
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-[#AEB7B3] text-center">
                      Disponível em instâncias oficiais e não-oficiais WAME.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Instagram Direct Oficial (Meta) */}
        {activeTab === 'instagram' && (
          <div className="p-6 space-y-6">
            <div className="p-4 bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-amber-950/30 rounded-2xl border border-pink-100 dark:border-pink-900/40 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#19201C] p-1 shadow-xs border border-pink-200 dark:border-pink-900/60 flex items-center justify-center shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-insta.png" alt="Instagram" className="w-full h-full object-contain" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-[#252B28]">Parceria Oficial Meta · Meta Business Partner</p>
                <p className="text-[#6C7671] mt-0.5 leading-relaxed">
                  A WAME conecta a API oficial do Instagram Direct sem você precisar criar app no Meta for Developers nem passar por burocracias de aprovação.
                </p>
              </div>
            </div>

            {isIgConnected ? (
              <div className="bg-[#FAFBFB] border border-[#E5E9E7] rounded-3xl p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#19201C] p-2 mx-auto flex items-center justify-center shadow-md border border-[#E5E9E7] dark:border-[#262E2A]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo-insta.png" alt="Instagram" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#252B28]">Instagram Direct Oficial Ativo</h3>
                  <p className="text-xs text-[#AEB7B3] mt-1">
                    Conta vinculada: <span className="font-bold text-[#252B28]">@moonky.enterprise</span>
                  </p>
                  <p className="text-[11px] text-[#6C7671] mt-0.5">
                    Pronto para receber e responder DMs, reações aos Stories e menções.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => handleSendTestWebhook('instagram')}
                    className="w-full sm:w-auto bg-[#45D483] hover:bg-[#3bc275] text-[#252B28] text-xs font-bold px-5 py-2.5 rounded-full flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" /> Testar Recebimento de DM Real
                  </button>

                  <button
                    onClick={handleDisconnectInstagram}
                    className="w-full sm:w-auto bg-[#FF453A] hover:bg-rose-600 text-white text-xs font-bold px-5 py-2.5 rounded-full flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Desconectar Instagram
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center p-6 bg-[#FAFBFB] rounded-3xl border border-[#E5E9E7]">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#19201C] p-2 mx-auto flex items-center justify-center shadow-md border border-[#E5E9E7] dark:border-[#262E2A]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo-insta.png" alt="Instagram" className="w-full h-full object-contain" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#252B28]">Login Oficial com a Meta</h3>
                  <p className="text-xs text-[#6C7671] max-w-md mx-auto mt-1">
                    Faça login na sua conta comercial do Instagram pela própria Meta (Embedded Signup). O canal fica imediatamente ativo no Moonky.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleConnectInstagram}
                    disabled={isLoading}
                    className="w-full sm:w-auto bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold px-6 py-3 rounded-full flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Conectando à Meta...
                      </>
                    ) : (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo-insta.png" alt="Instagram" className="w-4 h-4 object-contain" />
                        <span>Conectar com a Meta (Instagram Oficial)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: WAME Instance Key & Webhook */}
        {activeTab === 'credentials' && (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#252B28] mb-1.5">
                Chave da Instância WAME (Instance Key)
              </label>
              <input
                type="text"
                value={instanceKeyInput}
                onChange={(e) => setInstanceKeyInput(e.target.value)}
                placeholder="Ex: WAME_PROD_INSTANCE_8941"
                className="w-full bg-[#F1F3F2] border border-[#E5E9E7] rounded-xl px-4 py-2.5 text-xs text-[#252B28] font-mono focus:outline-none focus:border-[#45D483]"
              />
              <p className="text-[11px] text-[#AEB7B3] mt-1">
                Obtida no painel da WAME (<a href="https://wame.api.br/oficial" target="_blank" rel="noreferrer" className="text-[#45D483] underline">wame.api.br/oficial</a>).
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#252B28] mb-1.5">
                URL do Webhook da sua plataforma Moonky
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value="https://moonkywpp-e9w2.vercel.app/api/webhooks/wame"
                  className="flex-1 bg-[#F1F3F2] border border-[#E5E9E7] rounded-xl px-4 py-2.5 text-xs text-[#6C7671] font-mono"
                />
                <button
                  onClick={handleCopyWebhook}
                  className="bg-[#252B28] hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {copiedWebhook ? <Check className="w-3.5 h-3.5 text-[#45D483]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedWebhook ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
              <p className="text-[11px] text-[#AEB7B3] mt-1">
                Cole esta URL nas configurações da instância no painel WAME. Suporta WhatsApp e Instagram no envelope oficial da Meta.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 px-6 bg-[#FAFBFB] border-t border-[#F1F3F2] flex items-center justify-between">
          <span className="text-[11px] text-[#AEB7B3] flex items-center gap-1">
            <Radio className="w-3 h-3 text-[#45D483]" /> Servidor: <span className="font-mono text-[#252B28]">server.wame.api.br</span>
          </span>
          <button
            onClick={onClose}
            className="bg-[#F1F3F2] hover:bg-[#E5E9E7] text-[#252B28] text-xs font-bold px-4 py-2 rounded-full transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
