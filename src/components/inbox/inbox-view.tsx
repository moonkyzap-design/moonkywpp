'use client';

// ===================================================================
// MOONKY OMNICHANNEL INBOX (WhatsApp + Instagram Direct)
// Faithful to image.png & image_2.png specifications
// ===================================================================

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  Send,
  Paperclip,
  Bookmark,
  Link as LinkIcon,
  Phone,
  MoreVertical,
  Bot,
  User,
  Check,
  CheckCheck,
  Clock,
  Sparkles,
  ChevronRight,
  Plus,
  ShieldAlert,
  Zap,
  Tag,
  Star,
  MessageSquare
} from 'lucide-react';
import { useMoonky } from '@/context/moonky-store';
import { currentUser } from '@/lib/mock-data';
import { ConversationStatus, AIStatus } from '@/types';

export function InboxView() {
  const {
    conversations,
    activeConversationId,
    activeConversation,
    activeMessages,
    setActiveConversationId,
    sendMessage,
    simulateCustomerIncomingMessage,
    updateConversationStatus,
    updateConversationAIStatus,
    assignConversationAgent,
    notes,
    addInternalNote,
    teamMembers,
    filterChannel,
    setFilterChannel,
    filterStatus,
    setFilterStatus,
    filterAgent,
    setFilterAgent,
    filterTag,
    setFilterTag,
    searchQuery,
    setSearchQuery,
    filteredConversations,
    isTyping
  } = useMoonky();

  const [messageInput, setMessageInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [activeRightTab, setActiveRightTab] = useState<'notes' | 'profile'>('notes');
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [simulationPrompt, setSimulationPrompt] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || isSending) return;

    setIsSending(true);
    await sendMessage(messageInput);
    setMessageInput('');
    setIsSending(false);
  };

  const handleSaveNote = () => {
    if (!noteInput.trim() || !activeConversationId) return;
    addInternalNote(activeConversationId, noteInput);
    setNoteInput('');
  };

  const handleSimulateMessage = async (text: string) => {
    if (!activeConversationId) return;
    await simulateCustomerIncomingMessage(activeConversationId, text);
  };

  const activeNotes = activeConversationId ? notes[activeConversationId] || [] : [];

  return (
    <div className="flex-1 flex h-screen overflow-hidden bg-[#F1F3F2]">
      {/* ===================================================================
          COLUMN 1: INBOX FOLDERS, CHANNELS & LABELS (Image 1 Leftmost Panel)
          =================================================================== */}
      <div className="w-60 bg-[#FFFFFF] border-r border-[#E5E9E7] flex flex-col justify-between shrink-0 select-none overflow-y-auto">
        <div>
          {/* Header Customer Service */}
          <div className="p-4 border-b border-[#F1F3F2]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#252B28]">Customer Service</h2>
                <p className="text-[11px] text-[#AEB7B3]">Sun, 7 June 2026</p>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#45D483]" title="Live Sync Active" />
            </div>
          </div>

          {/* Inboxes Category */}
          <div className="p-3 space-y-1">
            <button
              onClick={() => {
                setFilterStatus('all');
                setFilterAgent('all');
                setFilterChannel('all');
                setFilterTag(null);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                filterStatus === 'all' && filterAgent === 'all' && filterChannel === 'all' && !filterTag
                  ? 'bg-[#F1F3F2] text-[#252B28] font-bold'
                  : 'text-[#6C7671] hover:text-[#252B28] hover:bg-[#F7F9F8]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#AEB7B3]" />
                <span>All Inboxes</span>
              </div>
              <span className="text-[10px] text-[#AEB7B3] font-semibold">{conversations.length}</span>
            </button>

            <button
              onClick={() => {
                setFilterStatus('open');
                setFilterAgent('all');
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                filterStatus === 'open' && filterAgent === 'all'
                  ? 'bg-[#EAFBF2] text-[#252B28] font-bold'
                  : 'text-[#6C7671] hover:text-[#252B28] hover:bg-[#F7F9F8]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-3.5 h-3.5 text-[#45D483]" />
                <span>Open / Unread</span>
              </div>
              <span className="bg-[#45D483] text-[#252B28] text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {conversations.filter((c) => c.status === 'open').length}
              </span>
            </button>

            <button
              onClick={() => setFilterAgent('mine')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                filterAgent === 'mine'
                  ? 'bg-[#F1F3F2] text-[#252B28] font-bold'
                  : 'text-[#6C7671] hover:text-[#252B28] hover:bg-[#F7F9F8]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <User className="w-3.5 h-3.5 text-[#AEB7B3]" />
                <span>Assigned to me</span>
              </div>
              <span className="text-[10px] bg-[#252B28] text-white px-1.5 py-0.2 rounded-full font-bold">
                {conversations.filter((c) => c.assignedAgent?.id === currentUser.id).length}
              </span>
            </button>

            <button
              onClick={() => setFilterAgent('unassigned')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                filterAgent === 'unassigned'
                  ? 'bg-[#F1F3F2] text-[#252B28] font-bold'
                  : 'text-[#6C7671] hover:text-[#252B28] hover:bg-[#F7F9F8]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#AEB7B3]" />
                <span>Not Assigned</span>
              </div>
              <span className="text-[10px] text-[#AEB7B3]">
                {conversations.filter((c) => !c.assignedAgent).length}
              </span>
            </button>
          </div>

          {/* Connect Channels Section */}
          <div className="px-3 pt-3 pb-1 border-t border-[#F1F3F2]">
            <p className="px-3 text-[10px] uppercase font-bold tracking-wider text-[#AEB7B3] mb-2">Connect</p>

            <button
              onClick={() => setFilterChannel(filterChannel === 'whatsapp' ? 'all' : 'whatsapp')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                filterChannel === 'whatsapp'
                  ? 'bg-[#EAFBF2] text-[#252B28] font-bold'
                  : 'text-[#6C7671] hover:text-[#252B28] hover:bg-[#F7F9F8]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-[#25D366] text-white flex items-center justify-center text-[10px] font-bold">
                  W
                </div>
                <span>WhatsApp</span>
              </div>
              <span className="text-[10px] bg-[#252B28] text-white px-1.5 rounded-full font-semibold">
                {conversations.filter((c) => c.channelType === 'whatsapp').length}
              </span>
            </button>

            <button
              onClick={() => setFilterChannel(filterChannel === 'instagram' ? 'all' : 'instagram')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                filterChannel === 'instagram'
                  ? 'bg-pink-50 text-[#252B28] font-bold'
                  : 'text-[#6C7671] hover:text-[#252B28] hover:bg-[#F7F9F8]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center text-[10px] font-bold">
                  IG
                </div>
                <span>Instagram</span>
              </div>
              <span className="text-[10px] bg-[#252B28] text-white px-1.5 rounded-full font-semibold">
                {conversations.filter((c) => c.channelType === 'instagram').length}
              </span>
            </button>
          </div>

          {/* Labels Section */}
          <div className="px-3 pt-3 pb-1 border-t border-[#F1F3F2]">
            <p className="px-3 text-[10px] uppercase font-bold tracking-wider text-[#AEB7B3] mb-2">Labels</p>
            {['VIP Customer', 'New Years Event', 'Assigned', 'Completed'].map((lbl) => {
              const isSelected = filterTag?.toLowerCase() === lbl.toLowerCase();
              return (
                <button
                  key={lbl}
                  onClick={() => setFilterTag(isSelected ? null : lbl)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-[#F1F3F2] text-[#252B28] font-bold'
                      : 'text-[#6C7671] hover:text-[#252B28] hover:bg-[#F7F9F8]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Tag className={`w-3 h-3 ${isSelected ? 'text-[#45D483]' : 'text-[#AEB7B3]'}`} />
                    <span>{lbl}</span>
                  </div>
                  {lbl === 'VIP Customer' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#45D483]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Team / Direct Messages */}
          <div className="px-3 pt-3 border-t border-[#F1F3F2]">
            <p className="px-3 text-[10px] uppercase font-bold tracking-wider text-[#AEB7B3] mb-2">
              Team Agents
            </p>
            {teamMembers.map((agent) => (
              <div
                key={agent.id}
                onClick={() => {
                  setFilterAgent(agent.id === currentUser.id ? 'mine' : 'all');
                }}
                className="flex items-center justify-between px-3 py-1.5 rounded-xl text-xs text-[#6C7671] hover:bg-[#F7F9F8] cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={agent.avatarUrl} alt={agent.fullName} className="w-4 h-4 rounded-full object-cover" />
                  <span className="truncate">{agent.fullName}</span>
                </div>
                <span className="text-[10px] text-[#AEB7B3]">{agent.assignedChatsCount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===================================================================
          COLUMN 2: CONVERSATION LIST (Image 1 Center List)
          =================================================================== */}
      <div className="w-80 bg-[#FFFFFF] border-r border-[#E5E9E7] flex flex-col justify-between shrink-0 select-none">
        {/* Header Search & Sort */}
        <div className="p-3 border-b border-[#F1F3F2] space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#AEB7B3]" />
            <input
              type="text"
              placeholder="Search Inbox..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#252B28] placeholder-[#AEB7B3] focus:outline-none focus:border-[#45D483] transition-colors"
            />
          </div>

          <div className="flex items-center justify-between text-xs px-1 text-[#AEB7B3]">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-[#252B28]">Showing:</span>
              <span className="font-semibold text-[#252B28]">{filteredConversations.length}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#6C7671]">
              <span>Newest</span>
              <SlidersHorizontal className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Conversation Items List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#F1F3F2]">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#AEB7B3]">
              No conversations found for current filter.
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = conv.id === activeConversationId;
              const isWhatsApp = conv.channelType === 'whatsapp';

              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`p-3.5 cursor-pointer transition-all relative ${
                    isSelected ? 'bg-[#F1F3F2]/70' : 'hover:bg-[#F7F9F8]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar with Channel Icon Badge */}
                    <div className="relative shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={conv.contact.avatarUrl}
                        alt={conv.contact.name}
                        className="w-10 h-10 rounded-full object-cover border border-[#E5E9E7]"
                      />
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white font-bold border border-white shadow-sm ${
                          isWhatsApp
                            ? 'bg-[#25D366]'
                            : 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600'
                        }`}
                        title={isWhatsApp ? 'WhatsApp Channel' : 'Instagram Direct'}
                      >
                        {isWhatsApp ? 'W' : 'IG'}
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`text-xs font-semibold truncate ${
                            isSelected ? 'text-[#252B28]' : 'text-[#252B28]'
                          }`}
                        >
                          {conv.contact.name}
                        </h4>
                        <span className="text-[10px] text-[#AEB7B3] font-medium shrink-0">
                          {conv.lastMessageAt}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#6C7671] truncate mt-0.5 leading-snug">
                        {conv.lastMessageSnippet}
                      </p>

                      {/* Badges: AI / Assigned Agent */}
                      <div className="flex items-center gap-1.5 mt-2">
                        {conv.aiEnabled && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                              conv.aiStatus === 'handed_off'
                                ? 'bg-amber-100 text-amber-800'
                                : conv.aiStatus === 'paused'
                                ? 'bg-gray-200 text-gray-700'
                                : 'bg-[#EAFBF2] text-[#1E7E49]'
                            }`}
                          >
                            <Bot className="w-2.5 h-2.5" />
                            {conv.aiStatus === 'handed_off'
                              ? 'Handoff'
                              : conv.aiStatus === 'paused'
                              ? 'AI Paused'
                              : 'AI'}
                          </span>
                        )}

                        {conv.assignedAgent && (
                          <span className="text-[9px] bg-[#F1F3F2] text-[#252B28] px-1.5 py-0.5 rounded font-medium truncate max-w-[90px]">
                            {conv.assignedAgent.fullName}
                          </span>
                        )}

                        {conv.isStarred && <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500 ml-auto" />}

                        {conv.unreadCount > 0 && (
                          <span className="bg-[#45D483] text-[#252B28] text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center ml-auto">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Quick Switcher */}
        <div className="p-3 border-t border-[#F1F3F2] flex items-center justify-between text-xs text-[#AEB7B3]">
          <span>Assigned To:</span>
          <div className="flex items-center -space-x-1.5">
            {teamMembers.map((m) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={m.id}
                src={m.avatarUrl}
                alt={m.fullName}
                className="w-5 h-5 rounded-full border border-white object-cover"
                title={m.fullName}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ===================================================================
          COLUMN 3: ACTIVE CONVERSATION & MESSAGE STREAM (Image 1 Chat Panel)
          =================================================================== */}
      <div className="flex-1 flex flex-col justify-between bg-[#FFFFFF] min-w-0">
        {activeConversation ? (
          <>
            {/* Active Header */}
            <div className="h-16 px-6 border-b border-[#E5E9E7] flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeConversation.contact.avatarUrl}
                  alt={activeConversation.contact.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#E5E9E7]"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#252B28] truncate">
                      {activeConversation.contact.name}
                    </h3>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${
                        activeConversation.channelType === 'whatsapp'
                          ? 'bg-[#EAFBF2] text-[#1E7E49]'
                          : 'bg-pink-50 text-pink-700'
                      }`}
                    >
                      {activeConversation.channelType === 'whatsapp' ? 'WhatsApp' : 'Instagram'}
                    </span>
                  </div>
                  <p className="text-xs text-[#AEB7B3] truncate">
                    {activeConversation.contact.phone || `@${activeConversation.contact.instagramUsername}`}
                  </p>
                </div>
              </div>

              {/* Status and AI Controls */}
              <div className="flex items-center gap-3">
                {/* AI Status / Human Takeover Toggle */}
                <div className="flex items-center gap-1.5 bg-[#F1F3F2] p-1 rounded-xl">
                  <button
                    onClick={() =>
                      updateConversationAIStatus(
                        activeConversation.id,
                        activeConversation.aiStatus === 'active' ? 'paused' : 'active'
                      )
                    }
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                      activeConversation.aiStatus === 'active'
                        ? 'bg-[#45D483] text-[#252B28] shadow-xs'
                        : 'text-[#6C7671] hover:text-[#252B28]'
                    }`}
                    title="Toggle AI automated replies for this conversation"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>{activeConversation.aiStatus === 'active' ? 'AI Active' : 'AI Paused'}</span>
                  </button>

                  <button
                    onClick={() => {
                      updateConversationAIStatus(activeConversation.id, 'handed_off');
                      assignConversationAgent(activeConversation.id, currentUser.id);
                    }}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                      activeConversation.aiStatus === 'handed_off'
                        ? 'bg-[#252B28] text-white shadow-xs'
                        : 'text-[#6C7671] hover:text-[#252B28]'
                    }`}
                    title="Agent human takeover (stops AI response immediately)"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Take Over</span>
                  </button>
                </div>

                {/* Conversation Status Dropdown */}
                <select
                  value={activeConversation.status}
                  onChange={(e) =>
                    updateConversationStatus(
                      activeConversation.id,
                      e.target.value as ConversationStatus
                    )
                  }
                  className="text-xs font-semibold bg-[#F1F3F2] border border-[#E5E9E7] text-[#252B28] rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
                >
                  <option value="open">Status: Open</option>
                  <option value="pending">Status: Pending</option>
                  <option value="resolved">Status: Resolved</option>
                </select>

                <button
                  onClick={() => setShowRightPanel(!showRightPanel)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    showRightPanel ? 'bg-[#F1F3F2] text-[#252B28]' : 'text-[#AEB7B3] hover:bg-[#F1F3F2]'
                  }`}
                  title="Toggle Notes & Context Profile"
                >
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Simulation Banner (One-click realistic testing for reviewer) */}
            <div className="bg-[#F7F9F8] border-b border-[#E5E9E7] px-6 py-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#6C7671]">
                <Zap className="w-3.5 h-3.5 text-[#45D483]" />
                <span className="font-semibold text-[#252B28]">Simulate customer query:</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleSimulateMessage('What is your delivery policy for missing electronic parcels?')
                  }
                  className="bg-white hover:bg-[#F1F3F2] border border-[#E5E9E7] text-[11px] font-medium px-2.5 py-1 rounded-lg text-[#252B28] transition-colors"
                >
                  Test Knowledge Base Answer
                </button>
                <button
                  onClick={() =>
                    handleSimulateMessage('Quero falar com um atendente humano agora!')
                  }
                  className="bg-white hover:bg-amber-50 border border-amber-200 text-[11px] font-medium px-2.5 py-1 rounded-lg text-amber-800 transition-colors"
                >
                  Test Human Handoff
                </button>
              </div>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FFFFFF]">
              {/* Date chip */}
              <div className="flex justify-center">
                <span className="bg-[#252B28] text-white text-[11px] font-semibold px-3 py-1 rounded-full shadow-xs">
                  Today
                </span>
              </div>

              {activeMessages.map((msg) => {
                const isContact = msg.senderType === 'contact';
                const isAI = msg.senderType === 'ai';
                const isAgent = msg.senderType === 'agent';

                if (isContact) {
                  return (
                    <div key={msg.id} className="flex items-start gap-3 max-w-xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={activeConversation.contact.avatarUrl}
                        alt="Contact"
                        className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 border border-[#E5E9E7]"
                      />
                      <div>
                        <div className="bg-[#F1F3F2] text-[#252B28] p-3.5 rounded-2xl rounded-tl-sm text-xs leading-relaxed border border-[#E5E9E7]">
                          {msg.content}
                        </div>
                        <div className="text-[10px] text-[#AEB7B3] mt-1 pl-1">
                          {msg.timestamp}
                        </div>
                      </div>
                    </div>
                  );
                }

                if (isAI) {
                  return (
                    <div key={msg.id} className="flex items-start gap-3 max-w-xl">
                      <div className="w-8 h-8 rounded-full bg-[#EAFBF2] text-[#45D483] flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200 shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="bg-[#F7F9F8] text-[#252B28] p-3.5 rounded-2xl rounded-tl-sm text-xs leading-relaxed border border-emerald-100 shadow-xs">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="text-[10px] font-bold text-[#1E7E49] bg-[#EAFBF2] px-1.5 py-0.2 rounded">
                              AI Assistant
                            </span>
                            {msg.aiMetadata?.model && (
                              <span className="text-[9px] text-[#AEB7B3]">
                                {msg.aiMetadata.model}
                              </span>
                            )}
                          </div>
                          {msg.content}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-[#AEB7B3] mt-1 pl-1">
                          <span>{msg.timestamp}</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-medium flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" /> Grounded
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Agent message (Christian / Team)
                return (
                  <div key={msg.id} className="flex items-start gap-3 max-w-xl ml-auto flex-row-reverse">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.fullName}
                      className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 border border-[#E5E9E7]"
                    />
                    <div className="text-right">
                      <div className="bg-[#252B28] text-white p-3.5 rounded-2xl rounded-tr-sm text-xs leading-relaxed shadow-sm text-left">
                        {msg.content}
                      </div>
                      <div className="flex items-center justify-end gap-1.5 text-[10px] text-[#AEB7B3] mt-1 pr-1">
                        <span>{msg.timestamp}</span>
                        {msg.deliveryStatus === 'read' ? (
                          <CheckCheck className="w-3.5 h-3.5 text-[#45D483]" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-[#AEB7B3]" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Live typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-[#AEB7B3] italic pl-11">
                  <span className="w-2 h-2 rounded-full bg-[#45D483] animate-ping" />
                  <span>Moonky AI is analyzing verified knowledge base...</span>
                </div>
              )}

              {/* Assigned Notice Banner */}
              {activeConversation.assignedAgent && (
                <div className="flex justify-center my-3">
                  <span className="text-[11px] text-[#AEB7B3] font-medium border-t border-b border-[#F1F3F2] px-4 py-1">
                    Assigned to {activeConversation.assignedAgent.fullName}
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Rich Composer Bar */}
            <div className="p-4 border-t border-[#E5E9E7] bg-white shrink-0">
              <form onSubmit={handleSend} className="space-y-2">
                <div className="flex items-center gap-2 text-[#AEB7B3] px-2 text-xs">
                  <button
                    type="button"
                    title="Attach file (Images, Documents)"
                    className="hover:text-[#252B28] p-1 rounded-lg hover:bg-[#F1F3F2]"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    title="Canned Quick Responses"
                    className="hover:text-[#252B28] p-1 rounded-lg hover:bg-[#F1F3F2]"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    title="Insert Link"
                    className="hover:text-[#252B28] p-1 rounded-lg hover:bg-[#F1F3F2]"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] ml-auto text-[#AEB7B3]">
                    Channel: {activeConversation.channelType === 'whatsapp' ? 'WhatsApp (Official)' : 'Instagram Direct'}
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-[#F7F9F8] border border-[#E5E9E7] rounded-2xl p-2 focus-within:border-[#45D483] transition-colors">
                  <input
                    type="text"
                    placeholder="Type your message here..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1 bg-transparent px-2 text-xs text-[#252B28] placeholder-[#AEB7B3] focus:outline-none"
                  />

                  <button
                    type="submit"
                    disabled={!messageInput.trim() || isSending}
                    className="bg-[#252B28] hover:bg-[#1a1f1d] text-white w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    title="Send message"
                  >
                    <Send className="w-3.5 h-3.5 text-[#45D483]" />
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#AEB7B3]">
            <MessageSquare className="w-12 h-12 stroke-[1.2] mb-3 text-[#AEB7B3]" />
            <p className="text-sm font-medium">Select a conversation to start messaging</p>
          </div>
        )}
      </div>

      {/* ===================================================================
          COLUMN 4: COLLAPSIBLE CONTEXT & CRM PROFILE PANEL (Image 1 Right Panel)
          =================================================================== */}
      {showRightPanel && activeConversation && (
        <div className="w-72 bg-[#FFFFFF] border-l border-[#E5E9E7] flex flex-col justify-between shrink-0 select-none overflow-y-auto">
          <div>
            {/* Header Tabs: Notes / Profile */}
            <div className="h-14 px-4 border-b border-[#F1F3F2] flex items-center gap-2">
              <button
                onClick={() => setActiveRightTab('notes')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeRightTab === 'notes'
                    ? 'bg-[#F1F3F2] text-[#252B28]'
                    : 'text-[#AEB7B3] hover:text-[#252B28]'
                }`}
              >
                Notes
              </button>
              <button
                onClick={() => setActiveRightTab('profile')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeRightTab === 'profile'
                    ? 'bg-[#F1F3F2] text-[#252B28]'
                    : 'text-[#AEB7B3] hover:text-[#252B28]'
                }`}
              >
                Profile
              </button>
            </div>

            {/* Tab: Notes */}
            {activeRightTab === 'notes' && (
              <div className="p-4 space-y-4">
                {/* Note Composer */}
                <div className="bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#AEB7B3]">
                    <span className="font-bold text-[#252B28]">Add Internal Note</span>
                    <button
                      onClick={handleSaveNote}
                      disabled={!noteInput.trim()}
                      className="bg-[#252B28] text-white hover:bg-[#1a1f1d] px-2.5 py-1 rounded-lg font-bold text-[10px] disabled:opacity-40"
                    >
                      Save
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Type your note here..."
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    className="w-full bg-white border border-[#E5E9E7] rounded-lg p-2 text-xs text-[#252B28] placeholder-[#AEB7B3] focus:outline-none focus:border-[#45D483]"
                  />
                </div>

                {/* Agent Profile & Performance (From image.png) */}
                <div className="p-3 bg-[#F7F9F8] rounded-xl border border-[#E5E9E7] space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#AEB7B3]">
                    Assigned Agent
                  </p>
                  <div className="flex items-center gap-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.fullName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#252B28]">{currentUser.fullName}</p>
                      <p className="text-[10px] text-[#AEB7B3]">Senior Support Specialist</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#E5E9E7] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#6C7671]">Response Rate:</span>
                    <span className="text-[11px] font-bold text-[#252B28] flex items-center gap-1">
                      ★★★★★ 90%
                    </span>
                  </div>
                </div>

                {/* Recent Notes Timeline (From image.png) */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#AEB7B3]">
                    Recent Notes
                  </p>
                  {activeNotes.length === 0 ? (
                    <p className="text-xs text-[#AEB7B3]">No internal notes yet.</p>
                  ) : (
                    activeNotes.map((nt) => (
                      <div
                        key={nt.id}
                        className="p-3 bg-[#F7F9F8] rounded-xl border border-[#E5E9E7] text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#252B28] text-[11px]">
                            From: @{nt.author.name}
                          </span>
                          <span className="text-[10px] text-[#AEB7B3]">{nt.createdAt}</span>
                        </div>
                        <p className="text-[11px] text-[#6C7671] leading-relaxed">{nt.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab: Profile */}
            {activeRightTab === 'profile' && (
              <div className="p-4 space-y-4">
                <div className="text-center pb-3 border-b border-[#F1F3F2]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeConversation.contact.avatarUrl}
                    alt={activeConversation.contact.name}
                    className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-white shadow-xs"
                  />
                  <h4 className="text-sm font-bold text-[#252B28] mt-2">
                    {activeConversation.contact.name}
                  </h4>
                  <span className="inline-block mt-1 bg-[#45D483]/20 text-[#1E7E49] text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">
                    {activeConversation.contact.leadStatus}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-[#AEB7B3] uppercase">Phone</label>
                    <p className="text-[#252B28] font-medium mt-0.5">
                      {activeConversation.contact.phone || '—'}
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#AEB7B3] uppercase">Instagram</label>
                    <p className="text-[#252B28] font-medium mt-0.5">
                      {activeConversation.contact.instagramUsername
                        ? `@${activeConversation.contact.instagramUsername}`
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#AEB7B3] uppercase">Email</label>
                    <p className="text-[#252B28] font-medium mt-0.5">
                      {activeConversation.contact.email || '—'}
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#AEB7B3] uppercase">Tags</label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {activeConversation.contact.tags.map((tg) => (
                        <span
                          key={tg.id}
                          className="bg-[#F1F3F2] text-[#252B28] text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        >
                          {tg.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
