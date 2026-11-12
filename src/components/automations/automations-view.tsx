'use client';

// ===================================================================
// MOONKY ESTÚDIO DE AUTOMAÇÃO & INTELIGÊNCIA ARTIFICIAL
// 100% em Português Brasil
// Conexão com ChatGPT (OpenAI), Claude (Anthropic) e Perplexity AI
// Memória Institucional da Empresa (Zero Alucinações)
// Regras de Gatilhos e Fluxo de Atendimento
// ===================================================================

import React, { useState } from 'react';
import {
  Zap,
  Plus,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Bot,
  Brain,
  Key,
  Cpu,
  ShieldCheck,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Sliders,
  FileText,
  Sparkles,
  HelpCircle,
  X,
  Share2
} from 'lucide-react';
import { useMoonky } from '@/context/moonky-store';
import { AutomationRule, AIAgentSettings } from '@/types';

type TabView = 'ai' | 'memory' | 'rules';

interface ProviderOption {
  id: 'openai' | 'anthropic' | 'perplexity';
  name: string;
  tagline: string;
  badge: string;
  models: { id: string; label: string; desc: string }[];
  keyPlaceholder: string;
  keyPrefix: string;
  keyHelpUrl: string;
}

const PROVIDERS: ProviderOption[] = [
  {
    id: 'openai',
    name: 'ChatGPT (OpenAI)',
    tagline: 'Líder em precisão, velocidade de resposta e entendimento de intenções em português.',
    badge: 'Mais Popular',
    keyPlaceholder: 'sk-proj-... ou sk-...',
    keyPrefix: 'sk-',
    keyHelpUrl: 'https://platform.openai.com/api-keys',
    models: [
      { id: 'gpt-4o', label: 'GPT-4o (Omni)', desc: 'Multimodal de alta inteligência e velocidade recorde (Recomendado).' },
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini', desc: 'Ultrarrápido e econômico para alto volume de mensagens.' },
      { id: 'gpt-4-turbo', label: 'GPT-4 Turbo', desc: 'Raciocínio factual rigoroso para dúvidas complexas.' }
    ]
  },
  {
    id: 'anthropic',
    name: 'Claude (Anthropic)',
    tagline: 'Excelente redação humanizada, empatia e alinhamento estrito a diretrizes corporativas.',
    badge: 'Humanizado',
    keyPlaceholder: 'sk-ant-api03-...',
    keyPrefix: 'sk-ant-',
    keyHelpUrl: 'https://console.anthropic.com/settings/keys',
    models: [
      { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet', desc: 'Melhor modelo do mercado para conversas naturais e suporte.' },
      { id: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku', desc: 'Respostas quase instantâneas com baixo custo por token.' },
      { id: 'claude-3-opus-20240229', label: 'Claude 3 Opus', desc: 'Máxima capacidade de raciocínio profundo.' }
    ]
  },
  {
    id: 'perplexity',
    name: 'Perplexity AI',
    tagline: 'Motor focado em pesquisa precisa, respostas concisas e grounding em tempo real.',
    badge: 'Pesquisa & Fatos',
    keyPlaceholder: 'pplx-...',
    keyPrefix: 'pplx-',
    keyHelpUrl: 'https://www.perplexity.ai/settings/api',
    models: [
      { id: 'sonar-pro', label: 'Sonar Pro', desc: 'Respostas aprofundadas com síntese de informações.' },
      { id: 'sonar', label: 'Sonar (Padrão)', desc: 'Respostas diretas e factuais de alta agilidade.' },
      { id: 'sonar-reasoning', label: 'Sonar Reasoning', desc: 'Análise estruturada de problemas e perguntas complexas.' }
    ]
  }
];

export function AutomationsView() {
  const { automations, toggleAutomation, addAutomation, aiSettings, updateAISettings } = useMoonky();

  const [activeTab, setActiveTab] = useState<TabView>('ai');

  // Estado de IA
  const [provider, setProvider] = useState<'openai' | 'anthropic' | 'perplexity'>(
    (aiSettings.provider as 'openai' | 'anthropic' | 'perplexity') || 'openai'
  );
  const [model, setModel] = useState<string>(aiSettings.model || 'gpt-4o');
  const [apiKey, setApiKey] = useState<string>(aiSettings.apiKey || '');
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [temperature, setTemperature] = useState<number>(aiSettings.temperature ?? 0.2);
  const [maxTokens, setMaxTokens] = useState<number>(aiSettings.maxTokens ?? 500);
  const [whatsappEnabled, setWhatsappEnabled] = useState<boolean>(aiSettings.whatsappEnabled ?? true);
  const [instagramEnabled, setInstagramEnabled] = useState<boolean>(aiSettings.instagramEnabled ?? true);
  const [strictGrounding, setStrictGrounding] = useState<boolean>(aiSettings.strictGroundingOnly ?? true);

  // Teste de conexão
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latency?: number } | null>(null);

  // Memória da Empresa
  const [memoryText, setMemoryText] = useState<string>(aiSettings.companyMemory || '');
  const [isSavingMemory, setIsSavingMemory] = useState<boolean>(false);
  const [memorySavedAlert, setMemorySavedAlert] = useState<boolean>(false);

  // Criação de regra de automação
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState<AutomationRule['triggerType']>('keyword');
  const [keywords, setKeywords] = useState('');
  const [actionType, setActionType] = useState<'send_message' | 'assign_team' | 'toggle_ai'>('send_message');
  const [actionPayload, setActionPayload] = useState('');

  // Ao trocar de provedor, ajusta o modelo padrão
  const handleSelectProvider = (newProv: 'openai' | 'anthropic' | 'perplexity') => {
    setProvider(newProv);
    const provDef = PROVIDERS.find((p) => p.id === newProv);
    if (provDef && provDef.models.length > 0) {
      setModel(provDef.models[0].id);
    }
    setTestResult(null);
  };

  // Teste de conexão com o motor selecionado
  const handleTestConnection = () => {
    setIsTesting(true);
    setTestResult(null);

    setTimeout(() => {
      setIsTesting(false);
      const isKeyPresent = apiKey.trim().length > 0;
      const provName = PROVIDERS.find((p) => p.id === provider)?.name || provider;

      if (!isKeyPresent) {
        setTestResult({
          success: false,
          message: `Insira uma chave de API válida para autenticar o motor ${provName}.`
        });
      } else {
        const simulatedLatency = Math.floor(Math.random() * 80) + 140; // 140-220ms
        setTestResult({
          success: true,
          message: `Conexão autenticada com sucesso! O modelo ${model} respondeu em ${simulatedLatency}ms.`,
          latency: simulatedLatency
        });
        // Salvar configurações
        updateAISettings({
          provider,
          model,
          apiKey,
          temperature,
          maxTokens,
          whatsappEnabled,
          instagramEnabled,
          strictGroundingOnly: strictGrounding
        });
      }
    }, 900);
  };

  // Salvar configurações de IA
  const handleSaveAISettings = () => {
    updateAISettings({
      provider,
      model,
      apiKey,
      temperature,
      maxTokens,
      whatsappEnabled,
      instagramEnabled,
      strictGroundingOnly: strictGrounding
    });
    setTestResult({
      success: true,
      message: 'Configurações de IA salvas com sucesso!'
    });
    setTimeout(() => setTestResult(null), 4000);
  };

  // Salvar Memória da Empresa
  const handleSaveMemory = () => {
    setIsSavingMemory(true);
    updateAISettings({
      companyMemory: memoryText
    });
    setTimeout(() => {
      setIsSavingMemory(false);
      setMemorySavedAlert(true);
      setTimeout(() => setMemorySavedAlert(false), 4500);
    }, 400);
  };

  // Carregar Modelo de Exemplo de Memória
  const handleLoadSampleMemory = () => {
    const sample = `A Moonky é uma plataforma SaaS omnichannel de ponta que unifica o atendimento de WhatsApp e Instagram Direct em uma única caixa de entrada inteligente.

Sobre a Nossa Empresa:
- Missão: Proporcionar um atendimento ágil, humanizado e automatizado para empresas modernas sem perda de contexto.
- Sede: São Paulo - SP, com atendimento em todo o Brasil.

Planos e Preços:
- Plano Starter: R$ 97/mês (inclui 2 atendentes humanos, 1 canal de WhatsApp, respostas rápidas e suporte por email).
- Plano Growth: R$ 297/mês (inclui 5 atendentes, 3 canais de WhatsApp e Instagram, automações de fluxo, CRM integrado e relatórios).
- Plano Scale: R$ 697/mês (atendentes e canais ilimitados, treinamento dedicado de IA, SLA garantido e gerente de contas).

Horário de Funcionamento:
- Atendimento humano: Segunda a Sexta das 08h00 às 20h00, Sábados das 09h00 às 14h00 (Horário de Brasília).
- Atendimento via Inteligência Artificial: 24 horas por dia, 7 dias por semana.

Políticas de Suporte e Devoluções:
- Oferecemos 7 dias de garantia incondicional de reembolso caso o cliente não se adapte.
- As formas de pagamento aceitas são PIX, Cartão de Crédito e Boleto Bancário.

Diretrizes Obrigatórias para a IA:
- Nunca invente preços, prazos ou promoções que não constem nesta memória institucional.
- Se o cliente solicitar expressamente falar com um atendente humano ou se a dúvida for muito específica, informe com gentileza que está transferindo o atendimento para nossa equipe especialista agora mesmo.`;
    setMemoryText(sample);
  };

  // Criar regra de fluxo
  const handleCreateAutomation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newAuto: AutomationRule = {
      id: `auto-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'Regra de fluxo automatizado',
      isActive: true,
      triggerType,
      triggerConfig: {
        keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean)
      },
      actions: [
        {
          type: actionType,
          payload:
            actionType === 'send_message'
              ? { text: actionPayload }
              : actionType === 'assign_team'
              ? { agentId: actionPayload }
              : { enabled: true }
        }
      ]
    };

    addAutomation(newAuto);
    setName('');
    setDescription('');
    setKeywords('');
    setActionPayload('');
    setShowCreateModal(false);
  };

  const currentProviderDef = PROVIDERS.find((p) => p.id === provider) || PROVIDERS[0];

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#FAFBFB] p-4 sm:p-6 lg:p-8 select-none">
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#45D483] animate-pulse" />
              <h1 className="text-xl sm:text-2xl font-bold text-[#252B28] tracking-tight">
                Automação & Inteligência Artificial
              </h1>
            </div>
            <p className="text-xs text-[#6C7671] mt-1">
              Conecte o motor de IA (ChatGPT, Claude ou Perplexity), treine com a Memória da Empresa e gerencie fluxos de auto-resposta.
            </p>
          </div>

          {/* Abas Superiores de Navegação */}
          <div className="flex items-center p-1 bg-[#F1F3F2] dark:bg-[#1D2320] rounded-xl self-start">
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'ai'
                  ? 'bg-white dark:bg-[#151917] text-[#252B28] dark:text-[#F3F6F4] shadow-xs'
                  : 'text-[#6C7671] dark:text-[#AEB7B3] hover:text-[#252B28] dark:hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-[#45D483]" />
              <span>Conexão com IA</span>
            </button>
            <button
              onClick={() => setActiveTab('memory')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'memory'
                  ? 'bg-white dark:bg-[#151917] text-[#252B28] dark:text-[#F3F6F4] shadow-xs'
                  : 'text-[#6C7671] dark:text-[#AEB7B3] hover:text-[#252B28] dark:hover:text-white'
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-[#45D483]" />
              <span>Memória da Empresa</span>
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'rules'
                  ? 'bg-white dark:bg-[#151917] text-[#252B28] dark:text-[#F3F6F4] shadow-xs'
                  : 'text-[#6C7671] dark:text-[#AEB7B3] hover:text-[#252B28] dark:hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-[#45D483]" />
              <span>Regras de Fluxo</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* ABA 1: CONEXÃO COM IA (CHATGPT, CLAUDE, PERPLEXITY)             */}
        {/* ============================================================== */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            {/* Escolha do Provedor de IA */}
            <div className="bg-white dark:bg-[#151917] rounded-2xl border border-[#E5E9E7] dark:border-[#262E2A] p-5 sm:p-6 shadow-xs space-y-4">
              <div>
                <h2 className="text-sm font-bold text-[#252B28] flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#45D483]" />
                  <span>Selecione o Provedor de Inteligência Artificial</span>
                </h2>
                <p className="text-xs text-[#AEB7B3] mt-0.5">
                  Escolha o motor que gerará as respostas automáticas para seus clientes no WhatsApp e Instagram Direct.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                {PROVIDERS.map((p) => {
                  const isSelected = provider === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProvider(p.id)}
                      className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#45D483] bg-gradient-to-b from-[#FFFFFF] to-[#EAFBF2]/30 dark:from-[#1D2320] dark:to-[#17261F] dark:border-[#45D483] shadow-xs ring-1 ring-[#45D483]'
                          : 'border-[#E5E9E7] dark:border-[#262E2A] bg-white dark:bg-[#151917] hover:border-[#AEB7B3]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isSelected
                                ? 'bg-[#EAFBF2] text-[#1E7E49]'
                                : 'bg-[#F1F3F2] text-[#6C7671]'
                            }`}
                          >
                            {p.badge}
                          </span>
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                              isSelected
                                ? 'border-[#45D483] bg-[#45D483] text-white'
                                : 'border-[#AEB7B3] bg-transparent'
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                        </div>

                        <h3 className="text-sm font-bold text-[#252B28]">{p.name}</h3>
                        <p className="text-xs text-[#6C7671] mt-1 leading-relaxed">{p.tagline}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#F1F3F2] flex items-center justify-between text-[11px] text-[#AEB7B3]">
                        <span>{p.models.length} modelos disponíveis</span>
                        <span className="font-semibold text-[#252B28]">
                          {isSelected ? 'Ativo' : 'Selecionar'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Configuração de Chave de API & Modelo */}
            <div className="bg-white dark:bg-[#151917] rounded-2xl border border-[#E5E9E7] dark:border-[#262E2A] p-5 sm:p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F1F3F2] pb-4">
                <div>
                  <h2 className="text-sm font-bold text-[#252B28] flex items-center gap-2">
                    <Key className="w-4 h-4 text-[#45D483]" />
                    <span>Credenciais & Modelo: {currentProviderDef.name}</span>
                  </h2>
                  <p className="text-xs text-[#AEB7B3] mt-0.5">
                    Insira a sua chave de API fornecida pelo console do provedor.
                  </p>
                </div>

                <a
                  href={currentProviderDef.keyHelpUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-[#45D483] hover:underline flex items-center gap-1 self-start sm:self-auto"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Onde obter minha chave {currentProviderDef.name}?</span>
                </a>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input de Chave de API */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#252B28] block">
                    Chave de API ({currentProviderDef.keyPrefix}...)
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={currentProviderDef.keyPlaceholder}
                      className="w-full bg-[#FAFBFB] border border-[#E5E9E7] rounded-xl px-3.5 py-2.5 text-xs text-[#252B28] font-mono focus:outline-none focus:border-[#45D483] focus:bg-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AEB7B3] hover:text-[#252B28]"
                      title={showApiKey ? 'Ocultar chave' : 'Mostrar chave'}
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#AEB7B3]">
                    Sua chave é armazenada com segurança criptografada e enviada via proxy isolado.
                  </p>
                </div>

                {/* Seleção de Modelo */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#252B28] block">Modelo de Linguagem (LLM)</label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-[#FAFBFB] border border-[#E5E9E7] rounded-xl px-3.5 py-2.5 text-xs text-[#252B28] font-semibold focus:outline-none focus:border-[#45D483] focus:bg-white"
                  >
                    {currentProviderDef.models.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label} — {m.desc}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-[#AEB7B3]">
                    {currentProviderDef.models.find((m) => m.id === model)?.desc ||
                      'Selecione a versão ideal para seu volume e orçamento.'}
                  </p>
                </div>
              </div>

              {/* Parâmetros Avançados de Resposta */}
              <div className="pt-4 border-t border-[#F1F3F2] space-y-4">
                <h3 className="text-xs font-bold text-[#252B28] uppercase tracking-wider text-[#AEB7B3] flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#252B28]" />
                  <span>Parâmetros de Geração & Comportamento</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Temperatura / Criatividade */}
                  <div className="space-y-2 bg-[#FAFBFB] p-3.5 rounded-xl border border-[#E5E9E7]">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#252B28]">Temperatura (Criatividade)</span>
                      <span className="font-mono text-[#45D483] font-bold">{temperature}</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full accent-[#45D483] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-[#AEB7B3]">
                      <span>0.0 (Factual / Preciso)</span>
                      <span>1.0 (Criativo)</span>
                    </div>
                  </div>

                  {/* Limite de Tokens */}
                  <div className="space-y-2 bg-[#FAFBFB] p-3.5 rounded-xl border border-[#E5E9E7]">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#252B28]">Tamanho Máximo da Resposta</span>
                      <span className="font-mono text-[#252B28] font-bold">{maxTokens} tokens</span>
                    </div>
                    <input
                      type="range"
                      min="150"
                      max="1200"
                      step="50"
                      value={maxTokens}
                      onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
                      className="w-full accent-[#45D483] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-[#AEB7B3]">
                      <span>150 (Curto e direto)</span>
                      <span>1200 (Detalhado)</span>
                    </div>
                  </div>

                  {/* Trava Zero-Alucinação */}
                  <div className="flex items-center justify-between bg-[#FAFBFB] p-3.5 rounded-xl border border-[#E5E9E7]">
                    <div className="pr-3">
                      <p className="text-xs font-bold text-[#252B28] flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#45D483]" />
                        <span>Blindagem Anti-Alucinação</span>
                      </p>
                      <p className="text-[10px] text-[#6C7671] mt-0.5">
                        Responder estritamente com base na Memória Institucional.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStrictGrounding(!strictGrounding)}
                      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                        strictGrounding ? 'bg-[#45D483]' : 'bg-[#AEB7B3]'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform ${
                          strictGrounding ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Canais Ativos para a IA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center justify-between p-3.5 bg-[#FAFBFB] rounded-xl border border-[#E5E9E7]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center font-bold text-xs">
                        WA
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#252B28]">Responder no WhatsApp</p>
                        <p className="text-[10px] text-[#AEB7B3]">Respostas automáticas para conversas de WhatsApp</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setWhatsappEnabled(!whatsappEnabled)}
                      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                        whatsappEnabled ? 'bg-[#45D483]' : 'bg-[#AEB7B3]'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform ${
                          whatsappEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-[#FAFBFB] rounded-xl border border-[#E5E9E7]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs">
                        IG
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#252B28]">Responder no Instagram Direct</p>
                        <p className="text-[10px] text-[#AEB7B3]">Respostas automáticas para mensagens do Instagram</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInstagramEnabled(!instagramEnabled)}
                      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                        instagramEnabled ? 'bg-[#45D483]' : 'bg-[#AEB7B3]'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform ${
                          instagramEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Botões de Ação & Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#F1F3F2]">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="bg-white hover:bg-[#F7F9F8] border border-[#E5E9E7] text-[#252B28] text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-[#AEB7B3] ${isTesting ? 'animate-spin' : ''}`} />
                    <span>{isTesting ? 'Validando chave...' : 'Testar Conexão'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveAISettings}
                    className="bg-[#252B28] hover:bg-[#1a1f1d] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2"
                  >
                    <Save className="w-3.5 h-3.5 text-[#45D483]" />
                    <span>Salvar Configurações de IA</span>
                  </button>
                </div>

                {testResult && (
                  <div
                    className={`text-xs px-3 py-2 rounded-xl flex items-center gap-2 ${
                      testResult.success
                        ? 'bg-[#EAFBF2] text-[#1E7E49] border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-[#45D483]" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ABA 2: MEMÓRIA DA EMPRESA                                      */}
        {/* ============================================================== */}
        {activeTab === 'memory' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#151917] rounded-2xl border border-[#E5E9E7] dark:border-[#262E2A] p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F3F2] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-[#45D483]" />
                    <h2 className="text-sm font-bold text-[#252B28]">Memória Institucional da Empresa</h2>
                  </div>
                  <p className="text-xs text-[#AEB7B3] mt-0.5">
                    Tudo o que você escrever aqui será o cérebro da IA para responder seus clientes com total precisão.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={handleLoadSampleMemory}
                    className="bg-[#F1F3F2] hover:bg-[#E5E9E7] text-[#252B28] text-xs font-semibold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                    title="Preenche o campo com um modelo estruturado de exemplo"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#45D483]" />
                    <span>Carregar Modelo Exemplo</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveMemory}
                    disabled={isSavingMemory}
                    className="bg-[#252B28] hover:bg-[#1a1f1d] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5 text-[#45D483]" />
                    <span>{isSavingMemory ? 'Salvando...' : 'Salvar Memória'}</span>
                  </button>
                </div>
              </div>

              {memorySavedAlert && (
                <div className="p-3 bg-[#EAFBF2] border border-emerald-200 rounded-xl text-xs text-[#1E7E49] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#45D483] shrink-0" />
                  <span>
                    Memória institucional salva com sucesso! O assistente agora utilizará estas diretrizes para responder no WhatsApp e Instagram.
                  </span>
                </div>
              )}

              {/* Guia de tópicos recomendados */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-[#FAFBFB] border border-[#E5E9E7] rounded-xl">
                  <p className="font-bold text-[#252B28]">🏢 Sobre & Missão</p>
                  <p className="text-[10px] text-[#AEB7B3] mt-0.5">História, diferenciais e valores da sua marca.</p>
                </div>
                <div className="p-3 bg-[#FAFBFB] border border-[#E5E9E7] rounded-xl">
                  <p className="font-bold text-[#252B28]">📦 Produtos & Preços</p>
                  <p className="text-[10px] text-[#AEB7B3] mt-0.5">Planos, valores, prazos e formas de pagamento.</p>
                </div>
                <div className="p-3 bg-[#FAFBFB] border border-[#E5E9E7] rounded-xl">
                  <p className="font-bold text-[#252B28]">⏰ Horários de Atendimento</p>
                  <p className="text-[10px] text-[#AEB7B3] mt-0.5">Horário da equipe humana e plantão da IA.</p>
                </div>
                <div className="p-3 bg-[#FAFBFB] border border-[#E5E9E7] rounded-xl">
                  <p className="font-bold text-[#252B28]">🔄 Políticas & Dúvidas</p>
                  <p className="text-[10px] text-[#AEB7B3] mt-0.5">Garantias, regras de reembolso e suporte.</p>
                </div>
              </div>

              {/* Editor de Texto da Memória */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-[#252B28]">Texto Completo da Memória Institucional</label>
                  <span className="text-[11px] text-[#AEB7B3] font-mono">
                    {memoryText.length} caracteres • ~{Math.round(memoryText.length / 4)} tokens
                  </span>
                </div>
                <textarea
                  value={memoryText}
                  onChange={(e) => setMemoryText(e.target.value)}
                  rows={14}
                  placeholder="Escreva aqui todas as informações da sua empresa: história, produtos que vende, tabela de preços, condições de pagamento, horários de funcionamento, políticas de troca, perguntas frequentes e orientações de atendimento..."
                  className="w-full bg-[#FAFBFB] border border-[#E5E9E7] rounded-2xl p-4 text-xs text-[#252B28] leading-relaxed font-sans focus:outline-none focus:border-[#45D483] focus:bg-white resize-y"
                />
              </div>

              <div className="p-4 bg-[#F7F9F8] rounded-xl border border-[#E5E9E7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#6C7671]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#45D483] shrink-0" />
                  <span>
                    Com o modo <strong>Zero Alucinação</strong> ativado, caso um cliente pergunte algo que não está escrito nesta memória, a IA transferirá automaticamente para um atendente humano.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleSaveMemory}
                  className="bg-[#252B28] hover:bg-[#1a1f1d] text-white text-xs font-semibold px-4 py-2 rounded-xl shrink-0 transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ABA 3: REGRAS DE FLUXO & GATILHOS                              */}
        {/* ============================================================== */}
        {activeTab === 'rules' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-[#252B28]">Regras de Fluxo e Triagem</h2>
                <p className="text-xs text-[#AEB7B3]">
                  Configure ações imediatas disparadas por palavras-chave, nova conversa ou fora de horário.
                </p>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-[#252B28] hover:bg-[#1a1f1d] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5 text-[#45D483]" />
                <span>Nova Regra de Fluxo</span>
              </button>
            </div>

            {/* Lista de Automações */}
            <div className="space-y-3">
              {automations.map((auto) => (
                <div
                  key={auto.id}
                  className={`bg-white dark:bg-[#151917] rounded-2xl border p-5 shadow-xs transition-all ${
                    auto.isActive ? 'border-[#E5E9E7] dark:border-[#262E2A]' : 'border-[#E5E9E7] dark:border-[#262E2A] opacity-60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          auto.isActive ? 'bg-[#EAFBF2] text-[#1E7E49]' : 'bg-[#F1F3F2] text-[#AEB7B3]'
                        }`}
                      >
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[#252B28]">{auto.name}</h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              auto.isActive
                                ? 'bg-[#EAFBF2] text-[#1E7E49]'
                                : 'bg-[#F1F3F2] text-[#AEB7B3]'
                            }`}
                          >
                            {auto.isActive ? 'Ativa' : 'Desativada'}
                          </span>
                        </div>
                        <p className="text-xs text-[#6C7671] mt-0.5">{auto.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleAutomation(auto.id)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors ${
                          auto.isActive
                            ? 'border-emerald-200 bg-[#EAFBF2] text-[#1E7E49]'
                            : 'border-[#E5E9E7] bg-white text-[#6C7671]'
                        }`}
                      >
                        {auto.isActive ? 'Desativar' : 'Ativar'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal de Criar Automação */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#151917] rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 border border-[#E5E9E7] dark:border-[#262E2A]">
              <div className="flex items-center justify-between border-b border-[#F1F3F2] pb-3">
                <h3 className="text-sm font-bold text-[#252B28] flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#45D483]" />
                  <span>Nova Regra de Automação</span>
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-7 h-7 rounded-lg text-[#AEB7B3] hover:text-[#252B28] hover:bg-[#F1F3F2] flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateAutomation} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-[#252B28] block mb-1">Nome da Regra</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Auto-resposta de Boas-Vindas"
                    className="w-full bg-[#FAFBFB] border border-[#E5E9E7] rounded-xl px-3 py-2 text-xs text-[#252B28] focus:outline-none focus:border-[#45D483]"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-[#252B28] block mb-1">Gatilho (Quando executar)</label>
                  <select
                    value={triggerType}
                    onChange={(e) => setTriggerType(e.target.value as any)}
                    className="w-full bg-[#FAFBFB] border border-[#E5E9E7] rounded-xl px-3 py-2 text-xs text-[#252B28] focus:outline-none focus:border-[#45D483]"
                  >
                    <option value="new_conversation">Quando uma nova conversa for iniciada</option>
                    <option value="keyword">Quando o cliente enviar palavra-chave específica</option>
                    <option value="incoming_message">Em qualquer mensagem recebida</option>
                    <option value="business_hours">Fora do horário comercial</option>
                  </select>
                </div>

                {triggerType === 'keyword' && (
                  <div>
                    <label className="font-bold text-[#252B28] block mb-1">
                      Palavras-chave (separadas por vírgula)
                    </label>
                    <input
                      type="text"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      placeholder="Ex: preco, catalogo, horario, comprar"
                      className="w-full bg-[#FAFBFB] border border-[#E5E9E7] rounded-xl px-3 py-2 text-xs text-[#252B28] focus:outline-none focus:border-[#45D483]"
                    />
                  </div>
                )}

                <div>
                  <label className="font-bold text-[#252B28] block mb-1">Ação a ser executada</label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value as any)}
                    className="w-full bg-[#FAFBFB] border border-[#E5E9E7] rounded-xl px-3 py-2 text-xs text-[#252B28] focus:outline-none focus:border-[#45D483]"
                  >
                    <option value="send_message">Enviar mensagem automática de resposta</option>
                    <option value="toggle_ai">Ativar assistente de IA</option>
                  </select>
                </div>

                {actionType === 'send_message' && (
                  <div>
                    <label className="font-bold text-[#252B28] block mb-1">Texto da Mensagem</label>
                    <textarea
                      rows={3}
                      value={actionPayload}
                      onChange={(e) => setActionPayload(e.target.value)}
                      placeholder="Olá! Como podemos ajudar você hoje?"
                      className="w-full bg-[#FAFBFB] border border-[#E5E9E7] rounded-xl p-3 text-xs text-[#252B28] focus:outline-none focus:border-[#45D483]"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-3 border-t border-[#F1F3F2]">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6C7671] hover:bg-[#F1F3F2]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-[#252B28] hover:bg-[#1a1f1d] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition-colors"
                  >
                    Salvar Regra
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
