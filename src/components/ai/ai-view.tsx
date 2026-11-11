'use client';

// ===================================================================
// MOONKY AI ASSISTANT CONFIGURATION & KNOWLEDGE STUDIO
// Strict knowledge grounding, human handoff trigger rules & token telemetry
// ===================================================================

import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  BookOpen,
  HelpCircle,
  ShieldAlert,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Play,
  RotateCcw,
  Zap
} from 'lucide-react';
import { useMoonky } from '@/context/moonky-store';
import { moonkyAI } from '@/lib/ai/service';

export function AIAssistantView() {
  const {
    aiSettings,
    updateAISettings,
    knowledgeBase,
    addKnowledgeItem,
    updateKnowledgeItem
  } = useMoonky();

  const [activeTab, setActiveTab] = useState<'settings' | 'knowledge' | 'handoff' | 'playground'>('settings');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Logistics');
  const [newContent, setNewContent] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Playground state
  const [playgroundInput, setPlaygroundInput] = useState('');
  const [playgroundLoading, setPlaygroundLoading] = useState(false);
  const [playgroundResult, setPlaygroundResult] = useState<{
    reply: string;
    isHandoff: boolean;
    confidence: number;
    tokens: number;
    latency: number;
    reasoning?: string;
  } | null>(null);

  const handleAddArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    addKnowledgeItem({
      title: newTitle.trim(),
      category: newCategory,
      content: newContent.trim(),
      isActive: true
    });

    setNewTitle('');
    setNewContent('');
    setShowAddModal(false);
  };

  const handleTestPlayground = async () => {
    if (!playgroundInput.trim() || playgroundLoading) return;
    setPlaygroundLoading(true);

    const result = await moonkyAI.generateResponse({
      conversationId: 'playground-test',
      contactName: 'Playground User',
      lastCustomerMessage: playgroundInput,
      conversationHistory: [],
      knowledgeBase,
      customInstructions: aiSettings.instructions,
      personality: aiSettings.personality
    });

    setPlaygroundResult({
      reply: result.replyText,
      isHandoff: result.isHandoffRequired,
      confidence: result.confidenceScore,
      tokens: result.tokensUsed.total,
      latency: result.latencyMs,
      reasoning: result.reasoningNote
    });

    setPlaygroundLoading(false);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F1F3F2] p-8 space-y-6 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#252B28] tracking-tight">AI Assistant Studio</h1>
            <span className="bg-[#EAFBF2] text-[#1E7E49] text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
              <Sparkles className="w-3 h-3 text-[#45D483]" /> Zero-Hallucination Grounding
            </span>
          </div>
          <p className="text-xs text-[#6C7671] mt-1">
            Configure enterprise personality, verified business knowledge, and automatic human handoff.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E5E9E7] shadow-xs text-xs font-semibold">
          {[
            { id: 'settings', label: 'Personality & Rules' },
            { id: 'knowledge', label: `Knowledge Base (${knowledgeBase.length})` },
            { id: 'handoff', label: 'Human Handoff' },
            { id: 'playground', label: 'Live Playground' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as typeof activeTab)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === t.id
                  ? 'bg-[#252B28] text-white shadow-xs'
                  : 'text-[#6C7671] hover:text-[#252B28]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: SETTINGS & PERSONALITY */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E9E7] p-6 shadow-xs space-y-5">
            <h2 className="text-sm font-bold text-[#252B28]">Assistant Identity & Scope</h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#252B28] block mb-1">Assistant Display Name</label>
                <input
                  type="text"
                  value={aiSettings.name}
                  onChange={(e) => updateAISettings({ name: e.target.value })}
                  className="w-full bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl px-3 py-2 text-xs text-[#252B28] focus:outline-none focus:border-[#45D483]"
                />
              </div>

              <div>
                <label className="font-bold text-[#252B28] block mb-1">Personality & Tone</label>
                <textarea
                  rows={2}
                  value={aiSettings.personality}
                  onChange={(e) => updateAISettings({ personality: e.target.value })}
                  className="w-full bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl p-3 text-xs text-[#252B28] focus:outline-none focus:border-[#45D483]"
                />
              </div>

              <div>
                <label className="font-bold text-[#252B28] block mb-1">
                  Custom System Instructions (Strict Prompt Guardrails)
                </label>
                <textarea
                  rows={4}
                  value={aiSettings.instructions}
                  onChange={(e) => updateAISettings({ instructions: e.target.value })}
                  className="w-full bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl p-3 text-xs text-[#252B28] focus:outline-none focus:border-[#45D483]"
                />
              </div>

              {/* Per-Channel Activation */}
              <div className="pt-3 border-t border-[#F1F3F2] space-y-3">
                <p className="font-bold text-[#252B28]">Channel Activation</p>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={aiSettings.whatsappEnabled}
                      onChange={(e) => updateAISettings({ whatsappEnabled: e.target.checked })}
                      className="w-4 h-4 accent-[#45D483] rounded"
                    />
                    <span className="font-medium text-[#252B28]">Enable on WhatsApp</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={aiSettings.instagramEnabled}
                      onChange={(e) => updateAISettings({ instagramEnabled: e.target.checked })}
                      className="w-4 h-4 accent-[#45D483] rounded"
                    />
                    <span className="font-medium text-[#252B28]">Enable on Instagram Direct</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Model & Operational Limits */}
          <div className="bg-white rounded-2xl border border-[#E5E9E7] p-6 shadow-xs space-y-5">
            <h2 className="text-sm font-bold text-[#252B28]">Operational Engine</h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-[#AEB7B3] block mb-1">
                  Server Provider
                </label>
                <div className="p-3 bg-[#F7F9F8] rounded-xl border border-[#E5E9E7] font-semibold text-[#252B28]">
                  {aiSettings.provider.toUpperCase()} (Configurable via env)
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-[#AEB7B3] block mb-1">
                  Active Model
                </label>
                <div className="p-3 bg-[#F7F9F8] rounded-xl border border-[#E5E9E7] font-semibold text-[#252B28]">
                  {aiSettings.model}
                </div>
              </div>

              <div className="p-4 bg-[#EAFBF2] border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-[#1E7E49]">
                  <CheckCircle2 className="w-4 h-4 text-[#45D483]" />
                  <span>Strict Moonky AI Rules Active</span>
                </div>
                <p className="text-[11px] text-[#1E7E49]/80 leading-relaxed">
                  The model never fabricates information. If an inquiry is not covered by verified knowledge articles, it triggers instant human handoff.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KNOWLEDGE BASE ARTICLES */}
      {activeTab === 'knowledge' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#252B28]">Verified Company Knowledge Base</h2>
              <p className="text-xs text-[#AEB7B3]">
                AI only uses information contained in these verified company articles.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#252B28] hover:bg-[#1a1f1d] text-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-[#45D483]" />
              <span>Add Knowledge Article</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {knowledgeBase.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#E5E9E7] p-5 shadow-xs space-y-3 relative group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F1F3F2] text-[#252B28] px-2 py-0.5 rounded-full">
                      {item.category}
                    </span>
                    <h3 className="text-sm font-bold text-[#252B28] mt-2">{item.title}</h3>
                  </div>

                  <label className="flex items-center gap-1.5 text-xs text-[#6C7671] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.isActive}
                      onChange={(e) => updateKnowledgeItem(item.id, { isActive: e.target.checked })}
                      className="w-3.5 h-3.5 accent-[#45D483]"
                    />
                    <span className="text-[11px] font-semibold">Active</span>
                  </label>
                </div>

                <p className="text-xs text-[#6C7671] leading-relaxed bg-[#F7F9F8] p-3 rounded-xl border border-[#E5E9E7]">
                  {item.content}
                </p>

                <div className="flex items-center justify-between text-[11px] text-[#AEB7B3] pt-1">
                  <span>Updated: {item.updatedAt}</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#45D483]" /> Verified Grounding
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: HUMAN HANDOFF PROTOCOL */}
      {activeTab === 'handoff' && (
        <div className="bg-white rounded-2xl border border-[#E5E9E7] p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-sm font-bold text-[#252B28]">Human Agent Takeover & Handoff Rules</h2>
            <p className="text-xs text-[#AEB7B3] mt-0.5">
              Defines conditions where the AI stops answering and immediately transfers the chat to human agents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-4 bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl space-y-3">
              <h3 className="font-bold text-[#252B28] flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <span>Automatic Escalation Keywords</span>
              </h3>
              <p className="text-[#6C7671] text-[11px]">
                When any of these keywords are sent by the customer, AI pauses instantly and transfers to an agent:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {aiSettings.handoffKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="bg-white border border-[#E5E9E7] text-[#252B28] px-2.5 py-1 rounded-lg font-semibold text-[11px]"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl space-y-3">
              <h3 className="font-bold text-[#252B28] flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-[#45D483]" />
                <span>Uncertainty & Fallback Rule</span>
              </h3>
              <p className="text-[#6C7671] text-[11px] leading-relaxed">
                If the question cannot be answered with 100% certainty from the verified company knowledge base, the AI is forbidden from guessing and is programmed to trigger the handoff protocol immediately.
              </p>
              <div className="p-2.5 bg-white border border-[#E5E9E7] rounded-lg text-[11px] text-[#252B28] font-mono">
                [HANDOFF_REQUESTED] → Pause AI → Notify assigned agent
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LIVE PLAYGROUND */}
      {activeTab === 'playground' && (
        <div className="bg-white rounded-2xl border border-[#E5E9E7] p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-sm font-bold text-[#252B28]">Interactive AI Grounding Simulator</h2>
            <p className="text-xs text-[#AEB7B3] mt-0.5">
              Test queries against your company knowledge base and observe real-time handoff behavior.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask something (e.g., 'What is your shipping policy for missing parcels?' or 'Quero falar com um humano')"
                value={playgroundInput}
                onChange={(e) => setPlaygroundInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTestPlayground()}
                className="flex-1 bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl px-4 py-2.5 text-xs text-[#252B28] focus:outline-none focus:border-[#45D483]"
              />
              <button
                onClick={handleTestPlayground}
                disabled={playgroundLoading || !playgroundInput.trim()}
                className="bg-[#252B28] hover:bg-[#1a1f1d] text-white text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-40"
              >
                <Play className="w-3.5 h-3.5 text-[#45D483]" />
                <span>{playgroundLoading ? 'Evaluating...' : 'Simulate'}</span>
              </button>
            </div>

            {/* Quick Prompts */}
            <div className="flex items-center gap-2 text-xs text-[#6C7671]">
              <span className="text-[11px] font-bold">Quick test prompts:</span>
              <button
                onClick={() => {
                  setPlaygroundInput('What is your delivery policy for missing electronic parcels?');
                }}
                className="text-[11px] bg-[#F1F3F2] px-2 py-0.5 rounded hover:bg-[#E5E9E7]"
              >
                Delivery Policy
              </button>
              <button
                onClick={() => {
                  setPlaygroundInput('Quero falar com um atendente agora!');
                }}
                className="text-[11px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded hover:bg-amber-100"
              >
                Handoff Trigger
              </button>
              <button
                onClick={() => {
                  setPlaygroundInput('Can you fly a rocket to Mars tomorrow?');
                }}
                className="text-[11px] bg-[#F1F3F2] px-2 py-0.5 rounded hover:bg-[#E5E9E7]"
              >
                Unknown Question (Escalation)
              </button>
            </div>
          </div>

          {playgroundResult && (
            <div className="p-5 bg-[#F7F9F8] border border-[#E5E9E7] rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E9E7] pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-[#252B28]">Simulated AI Response</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      playgroundResult.isHandoff
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-[#EAFBF2] text-[#1E7E49]'
                    }`}
                  >
                    {playgroundResult.isHandoff ? 'Handoff Triggered' : 'Grounded Reply'}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-[#AEB7B3]">
                  <span>Latency: {playgroundResult.latency}ms</span>
                  <span>Tokens: {playgroundResult.tokens}</span>
                  <span>Confidence: {(playgroundResult.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#E5E9E7] text-xs text-[#252B28] leading-relaxed whitespace-pre-line font-sans">
                {playgroundResult.reply}
              </div>

              {playgroundResult.reasoning && (
                <div className="text-[11px] text-[#6C7671] bg-white/70 p-2.5 rounded-lg border border-[#E5E9E7] italic">
                  Grounding Trace: {playgroundResult.reasoning}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal: Add Knowledge Item */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#E5E9E7]">
            <h3 className="text-base font-bold text-[#252B28]">Add Verified Knowledge Article</h3>
            <form onSubmit={handleAddArticle} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#252B28] block mb-1">Article Title</label>
                <input
                  type="text"
                  placeholder="e.g. Return & Refund Policy"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl px-3 py-2 text-xs text-[#252B28] focus:outline-none focus:border-[#45D483]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-[#252B28] block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl px-3 py-2 text-xs text-[#252B28] focus:outline-none"
                >
                  <option value="Logistics">Logistics & Shipping</option>
                  <option value="Billing">Billing & Insurance</option>
                  <option value="Pricing">Plans & Pricing</option>
                  <option value="General">General FAQ</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#252B28] block mb-1">
                  Article Content (Exact company truth)
                </label>
                <textarea
                  rows={4}
                  placeholder="Detail the exact policy, steps, or facts for the AI to follow..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl p-3 text-xs text-[#252B28] focus:outline-none focus:border-[#45D483]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F1F3F2]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6C7671] hover:bg-[#F1F3F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#252B28] text-white hover:bg-[#1a1f1d] px-4 py-2 rounded-xl text-xs font-semibold shadow-xs"
                >
                  Save Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
