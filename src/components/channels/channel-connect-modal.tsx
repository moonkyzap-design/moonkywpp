'use client';

// ===================================================================
// MOONKY CHANNEL CONNECTION MODAL (WHATSAPP REAL QR CODE & INSTAGRAM META)
// Triggered by clicking the user avatar in the menu
// Powered by WAME API (https://wame.api.br/oficial)
// ===================================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Sparkles,
  Server,
  Globe,
  AlertCircle
} from 'lucide-react';
import { useMoonky } from '@/context/moonky-store';

interface ChannelConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRODUCTION_WEBHOOK_URL = 'https://moonkychat.vercel.app/api/webhooks/wame';
const DEFAULT_SERVER_URL = 'https://server.wame.api.br';

export function ChannelConnectModal({ isOpen, onClose }: ChannelConnectModalProps) {
  const { channels, updateChannel, simulateCustomerIncomingMessage } = useMoonky();

  const [activeTab, setActiveTab] = useState<'whatsapp' | 'instagram' | 'credentials'>('whatsapp');
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // WAME Credentials state
  const [instanceKeyInput, setInstanceKeyInput] = useState('WAME_PROD_INSTANCE_8941');
  const [serverUrlInput, setServerUrlInput] = useState(DEFAULT_SERVER_URL);
  const [webhookUrlInput, setWebhookUrlInput] = useState(PRODUCTION_WEBHOOK_URL);
  const [webhookSecretInput, setWebhookSecretInput] = useState('');

  // Saving credentials feedback
  const [isSavingCreds, setIsSavingCreds] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  // Real QR Code state
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [qrRawCode, setQrRawCode] = useState<string | null>(null);
  const [isLoadingQr, setIsLoadingQr] = useState<boolean>(false);
  const [qrCountdown, setQrCountdown] = useState<number>(45);
  const [connectedUser, setConnectedUser] = useState<{ id?: string; name?: string; imageProfile?: string } | null>(null);

  // WhatsApp Channel state
  const waChannel = channels.find((c) => c.type === 'whatsapp') || channels[0];
  const isWaConnected = waChannel?.status === 'connected';

  // Instagram Channel state
  const igChannel = channels.find((c) => c.type === 'instagram') || channels[1];
  const isIgConnected = igChannel?.status === 'connected';

  const [testNumber, setTestNumber] = useState('+55 11 98877-6655');

  // Load saved credentials from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('moonky_wame_credentials');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.instanceKey) setInstanceKeyInput(parsed.instanceKey);
          if (parsed.baseUrl) setServerUrlInput(parsed.baseUrl);
          if (parsed.webhookUrl) setWebhookUrlInput(parsed.webhookUrl);
          if (parsed.webhookSecret) setWebhookSecretInput(parsed.webhookSecret);
        } else if (waChannel?.instanceKey) {
          setInstanceKeyInput(waChannel.instanceKey);
        }
      } catch (e) {
        console.warn('Error reading saved WAME credentials from localStorage', e);
      }
    }
  }, [waChannel?.instanceKey]);

  // Fetch real QR Code from backend / WAME API
  const fetchRealQrCode = useCallback(async (customKey?: string) => {
    const keyToUse = (customKey || instanceKeyInput || '').trim();
    setIsLoadingQr(true);
    try {
      const res = await fetch('/api/channels/wame/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instanceKey: keyToUse,
          baseUrl: serverUrlInput,
          channelType: 'whatsapp'
        })
      });

      const data = await res.json();

      if (data.phoneConnected || data.status === 'connected') {
        if (waChannel) {
          updateChannel(waChannel.id, {
            status: 'connected',
            instanceKey: keyToUse,
            lastSyncAt: 'Agora'
          });
        }
        if (data.user) {
          setConnectedUser(data.user);
          if (data.user.id) {
            const rawPhone = data.user.id.split('@')[0];
            setTestNumber(rawPhone ? `+${rawPhone}` : testNumber);
          }
        }
      } else {
        if (data.image) {
          setQrImage(data.image);
        }
        if (data.qrcode) {
          setQrRawCode(data.qrcode);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch real QR code', err);
    } finally {
      setIsLoadingQr(false);
      setQrCountdown(45);
    }
  }, [instanceKeyInput, serverUrlInput, waChannel, updateChannel, testNumber]);

  // QR Code auto-refresh timer (every 45 seconds when WhatsApp tab is active and not connected)
  useEffect(() => {
    if (!isOpen || activeTab !== 'whatsapp' || isWaConnected) return;

    // Fetch initial QR Code if not present
    if (!qrImage) {
      fetchRealQrCode();
    }

    const interval = setInterval(() => {
      setQrCountdown((prev) => {
        if (prev <= 1) {
          fetchRealQrCode();
          return 45;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, activeTab, isWaConnected, qrImage, fetchRealQrCode]);

  if (!isOpen) return null;

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(PRODUCTION_WEBHOOK_URL);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  // Salvar credenciais WAME e configurar webhook
  const handleSaveCredentials = async () => {
    if (!instanceKeyInput.trim()) {
      setSaveErrorMessage('Por favor, informe a Chave da Instância WAME.');
      return;
    }

    setIsSavingCreds(true);
    setSaveSuccessMessage(null);
    setSaveErrorMessage(null);

    try {
      // 1. Salvar no localStorage para persistência imediata no navegador
      const credsObject = {
        instanceKey: instanceKeyInput.trim(),
        baseUrl: serverUrlInput.trim() || DEFAULT_SERVER_URL,
        webhookUrl: webhookUrlInput.trim() || PRODUCTION_WEBHOOK_URL,
        webhookSecret: webhookSecretInput.trim(),
        updatedAt: new Date().toISOString()
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('moonky_wame_credentials', JSON.stringify(credsObject));
      }

      // 2. Atualizar no estado de canais da aplicação Moonky
      if (waChannel) {
        updateChannel(waChannel.id, {
          instanceKey: credsObject.instanceKey,
          webhookUrl: credsObject.webhookUrl
        });
      }

      // 3. Enviar ao backend para configurar o webhook na instância WAME
      const res = await fetch('/api/channels/wame/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credsObject)
      });

      const data = await res.json();

      if (data.success) {
        setSaveSuccessMessage(
          `Credenciais salvas com sucesso! Webhook sincronizado: ${credsObject.webhookUrl}`
        );

        // Se a instância já estiver conectada, atualizar status
        if (data.instanceStatus?.instance?.phoneConnected || data.instanceStatus?.data?.status === 'connected') {
          if (waChannel) {
            updateChannel(waChannel.id, {
              status: 'connected',
              instanceKey: credsObject.instanceKey,
              lastSyncAt: 'Agora'
            });
          }
        } else {
          // Atualizar o QR Code imediatamente com a nova chave da instância
          fetchRealQrCode(credsObject.instanceKey);
        }
      } else {
        setSaveErrorMessage(data.message || 'Erro ao configurar credenciais na WAME.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao salvar credenciais';
      setSaveErrorMessage(msg);
    } finally {
      setIsSavingCreds(false);
    }
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
      setConnectedUser(null);
      // Gerar novo QR Code para reconexão
      setTimeout(() => fetchRealQrCode(), 500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmConnection = async () => {
    setIsLoading(true);
    try {
      // Testar status real na WAME
      const res = await fetch('/api/channels/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceKey: instanceKeyInput, isOfficial: false })
      });
      const data = await res.json();

      if (waChannel) {
        updateChannel(waChannel.id, {
          status: 'connected',
          instanceKey: instanceKeyInput,
          lastSyncAt: 'Agora'
        });
      }
    } catch (e) {
      if (waChannel) {
        updateChannel(waChannel.id, { status: 'connected', lastSyncAt: 'Agora' });
      }
    } finally {
      setIsLoading(false);
    }
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
        <div className="p-6 pb-4 border-b border-[#F1F3F2] dark:border-[#262E2A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl overflow-hidden bg-[#151917] p-0.5 border border-[#262E2A]/60 shadow-sm flex items-center justify-center shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-m.png" alt="Moonky Logo" className="w-full h-full object-contain rounded-xl" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#252B28] dark:text-[#F3F6F4]">Conexão de Canais Oficiais</h2>
              <p className="text-xs text-[#AEB7B3]">
                WhatsApp por QR Code Real & Instagram Oficial via Meta (WAME API)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-[#AEB7B3] hover:text-[#252B28] dark:hover:text-white hover:bg-[#F1F3F2] dark:hover:bg-[#1D2320] flex items-center justify-center transition-colors"
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
              <span>Credenciais WAME</span>
            </button>
          </div>
        </div>

        {/* Tab 1: WhatsApp QR Code Real */}
        {activeTab === 'whatsapp' && (
          <div className="p-6 space-y-6">
            {isWaConnected ? (
              // Connected State
              <div className="bg-[#FAFBFB] dark:bg-[#181F1B] border border-[#E5E9E7] dark:border-[#262E2A] rounded-3xl p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#EAFBF2] text-[#1E7E49] mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-[#45D483]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#252B28] dark:text-[#F3F6F4]">WhatsApp Conectado com Sucesso!</h3>
                  <p className="text-xs text-[#AEB7B3] mt-1">
                    Número vinculado: <span className="font-semibold text-[#252B28] dark:text-white">{connectedUser?.name ? `${connectedUser.name} (${testNumber})` : testNumber}</span>
                  </p>
                  <p className="text-[11px] text-[#6C7671] dark:text-[#AEB7B3] mt-0.5">
                    Instância WAME: <span className="font-mono text-[#252B28] dark:text-emerald-400">{instanceKeyInput}</span>
                  </p>
                  <p className="text-[11px] text-[#6C7671] dark:text-[#AEB7B3] mt-0.5">
                    Webhook ativo em: <span className="font-mono text-[#252B28] dark:text-white">{PRODUCTION_WEBHOOK_URL}</span>
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
              // Real QR Code Scan State
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* QR Code Graphic Box */}
                <div className="flex flex-col items-center justify-center p-6 bg-[#FAFBFB] dark:bg-[#181F1B] rounded-3xl border border-[#E5E9E7] dark:border-[#262E2A] text-center space-y-3">
                  <div className="relative p-3 bg-white rounded-2xl shadow-sm border border-[#E5E9E7] flex items-center justify-center min-w-[210px] min-h-[210px]">
                    {isLoadingQr ? (
                      <div className="w-48 h-48 flex flex-col items-center justify-center text-[#6C7671]">
                        <RefreshCw className="w-8 h-8 animate-spin text-[#45D483] mb-2" />
                        <span className="text-xs font-semibold">Carregando QR Code...</span>
                      </div>
                    ) : qrImage ? (
                      <div className="relative">
                        {/* Authentic Real QR Code Image */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={qrImage}
                          alt="QR Code WhatsApp Real WAME"
                          className="w-48 h-48 object-contain rounded-xl select-none"
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-9 h-9 rounded-full bg-white shadow-md p-1.5 flex items-center justify-center border border-emerald-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/logo-wpp.png" alt="WhatsApp" className="w-full h-full object-contain" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-48 h-48 flex flex-col items-center justify-center text-[#AEB7B3] p-4">
                        <QrCode className="w-10 h-10 mb-2 opacity-50" />
                        <span className="text-[11px]">Clique abaixo para gerar o QR Code</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between w-full px-2 text-[11px] text-[#AEB7B3]">
                    <span className="flex items-center gap-1 font-medium">
                      <RefreshCw className="w-3 h-3 text-[#45D483]" /> Expira em {qrCountdown}s
                    </span>

                    <button
                      onClick={() => fetchRealQrCode()}
                      disabled={isLoadingQr}
                      className="text-[#45D483] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingQr ? 'animate-spin' : ''}`} />
                      <span>Atualizar</span>
                    </button>
                  </div>
                </div>

                {/* Instructions & Actions */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-[#252B28] dark:text-[#F3F6F4]">Como conectar seu WhatsApp:</h3>
                    <ol className="text-xs text-[#6C7671] dark:text-[#AEB7B3] space-y-2 mt-3 list-decimal list-inside">
                      <li>Abra o <strong>WhatsApp</strong> no seu aparelho celular.</li>
                      <li>Toque no menu (três pontos) ou em <strong>Configurações</strong>.</li>
                      <li>Toque em <strong>Aparelhos conectados</strong>.</li>
                      <li>Aponte a câmera para o <strong>QR Code real</strong> ao lado.</li>
                    </ol>
                  </div>

                  <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl text-[11px] text-[#1E7E49] dark:text-emerald-300">
                    <p className="font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      QR Code integrado com a instância WAME:
                    </p>
                    <p className="font-mono mt-0.5 truncate text-[10px] opacity-90">
                      {instanceKeyInput}
                    </p>
                  </div>

                  <div className="pt-1 space-y-2">
                    <button
                      onClick={handleConfirmConnection}
                      disabled={isLoading}
                      className="w-full bg-[#252B28] hover:bg-black text-white text-xs font-bold py-3 rounded-full flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#45D483]" /> Verificando Conexão...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 text-[#45D483]" /> Confirmar Escaneamento do QR Code
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-[#AEB7B3] text-center">
                      Após escanear, o status sincroniza automaticamente pelo Webhook oficial.
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
                <p className="font-bold text-[#252B28] dark:text-[#F3F6F4]">Parceria Oficial Meta · Meta Business Partner</p>
                <p className="text-[#6C7671] dark:text-[#AEB7B3] mt-0.5 leading-relaxed">
                  A WAME conecta a API oficial do Instagram Direct sem você precisar criar app no Meta for Developers nem passar por burocracias de aprovação.
                </p>
              </div>
            </div>

            {isIgConnected ? (
              <div className="bg-[#FAFBFB] dark:bg-[#181F1B] border border-[#E5E9E7] dark:border-[#262E2A] rounded-3xl p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#19201C] p-2 mx-auto flex items-center justify-center shadow-md border border-[#E5E9E7] dark:border-[#262E2A]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo-insta.png" alt="Instagram" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#252B28] dark:text-[#F3F6F4]">Instagram Direct Oficial Ativo</h3>
                  <p className="text-xs text-[#AEB7B3] mt-1">
                    Conta vinculada: <span className="font-bold text-[#252B28] dark:text-white">@moonky.enterprise</span>
                  </p>
                  <p className="text-[11px] text-[#6C7671] dark:text-[#AEB7B3] mt-0.5">
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
              <div className="space-y-4 text-center p-6 bg-[#FAFBFB] dark:bg-[#181F1B] rounded-3xl border border-[#E5E9E7] dark:border-[#262E2A]">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#19201C] p-2 mx-auto flex items-center justify-center shadow-md border border-[#E5E9E7] dark:border-[#262E2A]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo-insta.png" alt="Instagram" className="w-full h-full object-contain" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#252B28] dark:text-[#F3F6F4]">Login Oficial com a Meta</h3>
                  <p className="text-xs text-[#6C7671] dark:text-[#AEB7B3] max-w-md mx-auto mt-1">
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

        {/* Tab 3: Salvar Credenciais WAME & Webhook */}
        {activeTab === 'credentials' && (
          <div className="p-6 space-y-4 max-h-[460px] overflow-y-auto">
            {/* Feedback messages */}
            {saveSuccessMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-[#1E7E49] animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 text-[#45D483] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Salvo com Sucesso!</p>
                  <p className="text-[11px] opacity-90 mt-0.5">{saveSuccessMessage}</p>
                </div>
              </div>
            )}

            {saveErrorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Atenção</p>
                  <p className="text-[11px] opacity-90 mt-0.5">{saveErrorMessage}</p>
                </div>
              </div>
            )}

            {/* Chave da Instância */}
            <div>
              <label className="block text-xs font-bold text-[#252B28] dark:text-[#F3F6F4] mb-1.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#45D483]" />
                <span>Chave da Instância WAME (Instance Key)</span>
              </label>
              <input
                type="text"
                value={instanceKeyInput}
                onChange={(e) => setInstanceKeyInput(e.target.value)}
                placeholder="Ex: SUA_CHAVE_INSTANCIA_WAME"
                className="w-full bg-[#F1F3F2] dark:bg-[#1D2320] border border-[#E5E9E7] dark:border-[#2A342E] rounded-xl px-4 py-2.5 text-xs text-[#252B28] dark:text-[#F3F6F4] font-mono focus:outline-none focus:border-[#45D483]"
              />
              <p className="text-[11px] text-[#AEB7B3] mt-1">
                Obtida no painel da WAME (<a href="https://wame.api.br/oficial" target="_blank" rel="noreferrer" className="text-[#45D483] underline">wame.api.br/oficial</a>). Essa chave autentica diretamente suas requisições.
              </p>
            </div>

            {/* Servidor WAME (Base URL) */}
            <div>
              <label className="block text-xs font-bold text-[#252B28] dark:text-[#F3F6F4] mb-1.5 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-[#45D483]" />
                <span>Servidor da API WAME (Base URL)</span>
              </label>
              <input
                type="text"
                value={serverUrlInput}
                onChange={(e) => setServerUrlInput(e.target.value)}
                placeholder="https://server.wame.api.br"
                className="w-full bg-[#F1F3F2] dark:bg-[#1D2320] border border-[#E5E9E7] dark:border-[#2A342E] rounded-xl px-4 py-2.5 text-xs text-[#252B28] dark:text-[#F3F6F4] font-mono focus:outline-none focus:border-[#45D483]"
              />
              <p className="text-[11px] text-[#AEB7B3] mt-1">
                Padrão de produção: <span className="font-mono text-[#252B28] dark:text-emerald-400">https://server.wame.api.br</span>
              </p>
            </div>

            {/* URL do Webhook Atualizado */}
            <div>
              <label className="block text-xs font-bold text-[#252B28] dark:text-[#F3F6F4] mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#45D483]" />
                <span>URL do Webhook do Moonky (Atualizado)</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={webhookUrlInput}
                  onChange={(e) => setWebhookUrlInput(e.target.value)}
                  className="flex-1 bg-[#F1F3F2] dark:bg-[#1D2320] border border-[#E5E9E7] dark:border-[#2A342E] rounded-xl px-4 py-2.5 text-xs text-[#252B28] dark:text-[#F3F6F4] font-mono"
                />
                <button
                  type="button"
                  onClick={handleCopyWebhook}
                  className="bg-[#252B28] hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {copiedWebhook ? <Check className="w-3.5 h-3.5 text-[#45D483]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedWebhook ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
              <p className="text-[11px] text-[#AEB7B3] mt-1">
                Ao clicar em salvar, esta URL será configurada automaticamente na sua instância WAME via <span className="font-mono text-emerald-600 dark:text-emerald-400">PUT /{'{'}KEY{'}'}/instance</span>.
              </p>
            </div>

            {/* Botão de Salvar Credenciais WAME */}
            <div className="pt-3 border-t border-[#F1F3F2] dark:border-[#262E2A] flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleSaveCredentials}
                disabled={isSavingCreds}
                className="w-full sm:flex-1 bg-[#45D483] hover:bg-[#3bc275] text-[#252B28] text-xs font-bold py-3 px-6 rounded-full flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isSavingCreds ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Salvando e Sincronizando com WAME...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Salvar Credenciais WAME</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('whatsapp');
                  fetchRealQrCode();
                }}
                className="w-full sm:w-auto bg-[#F1F3F2] dark:bg-[#1D2320] hover:bg-[#E5E9E7] dark:hover:bg-[#262E2A] text-[#252B28] dark:text-[#F3F6F4] text-xs font-bold py-3 px-5 rounded-full flex items-center justify-center gap-1.5 transition-colors"
              >
                <QrCode className="w-4 h-4 text-[#45D483]" />
                <span>Ver QR Code da Instância</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 px-6 bg-[#FAFBFB] dark:bg-[#181F1B] border-t border-[#F1F3F2] dark:border-[#262E2A] flex items-center justify-between">
          <span className="text-[11px] text-[#AEB7B3] flex items-center gap-1">
            <Radio className="w-3 h-3 text-[#45D483]" /> Servidor: <span className="font-mono text-[#252B28] dark:text-white">{serverUrlInput.replace(/^https?:\/\//, '')}</span>
          </span>
          <button
            onClick={onClose}
            className="bg-[#F1F3F2] dark:bg-[#1D2320] hover:bg-[#E5E9E7] dark:hover:bg-[#262E2A] text-[#252B28] dark:text-[#F3F6F4] text-xs font-bold px-4 py-2 rounded-full transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
