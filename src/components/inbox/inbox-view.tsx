'use client';

// ===================================================================
// MOONKY OMNICHANNEL INBOX — PIXEL-PERFECT IMPLEMENTATION
// Replicating image.png reference with Moonky Brand Identity
// Palette: #FFFFFF, #F1F3F2, #AEB7B3, #252B28, #45D483
// ===================================================================

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Phone,
  Video,
  Sidebar as SidebarIcon,
  MoreHorizontal,
  Send,
  Smile,
  Paperclip,
  Play,
  Pause,
  Bell,
  BellOff,
  X,
  CheckCheck,
  Bot,
  User,
  Plus,
  FileText,
  Mic,
  AtSign,
  PhoneCall
} from 'lucide-react';
import { useMoonky } from '@/context/moonky-store';
import { currentUser } from '@/lib/mock-data';

interface InboxViewProps {
  onOpenConnectModal?: () => void;
}

export function InboxView({ onOpenConnectModal }: InboxViewProps = {}) {
  const {
    conversations,
    activeConversationId,
    activeConversation,
    activeMessages,
    setActiveConversationId,
    sendMessage,
    simulateCustomerIncomingMessage,
    updateConversationAIStatus,
    notes,
    addInternalNote,
    teamMembers,
    searchQuery,
    setSearchQuery,
    isTyping
  } = useMoonky();

  const [messageInput, setMessageInput] = useState('Good bye ✌️');
  const [activeSegment, setActiveSegment] = useState<'all' | 'whatsapp' | 'instagram'>('all');
  const [rightDrawerOpen, setRightDrawerOpen] = useState(true);
  const [rightTab, setRightTab] = useState<'media' | 'files' | 'voice' | 'links' | 'notes'>('media');
  const [isPlayingAudio, setIsPlayingAudio] = useState(true);
  const [noteInput, setNoteInput] = useState('');
  const [notificationsMuted, setNotificationsMuted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim()) return;
    const text = messageInput;
    setMessageInput('');
    await sendMessage(text);
  };

  const handleSaveNote = () => {
    if (!noteInput.trim() || !activeConversationId) return;
    addInternalNote(activeConversationId, noteInput);
    setNoteInput('');
  };

  const filteredList = conversations.filter((c) => {
    if (activeSegment !== 'all' && c.channelType !== activeSegment) return false;
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      return (
        c.contact.name.toLowerCase().includes(q) ||
        c.lastMessageSnippet.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeNotes = activeConversationId ? notes[activeConversationId] || [] : [];

  // Media samples for the 4-column right drawer grid matching image.png
  const mediaGallery = [
    { id: 1, gradient: 'from-blue-600 via-indigo-600 to-purple-600' },
    { id: 2, gradient: 'from-purple-600 via-pink-600 to-rose-600' },
    { id: 3, gradient: 'from-amber-600 via-orange-600 to-red-600' },
    { id: 4, gradient: 'from-teal-500 via-cyan-600 to-blue-600' },
    { id: 5, gradient: 'from-yellow-400 via-amber-500 to-orange-600' },
    { id: 6, gradient: 'from-indigo-400 via-purple-500 to-pink-500' },
    { id: 7, gradient: 'from-slate-400 via-cyan-500 to-blue-500' },
    { id: 8, gradient: 'from-rose-400 via-pink-500 to-purple-500' },
    { id: 9, gradient: 'from-emerald-400 via-teal-500 to-cyan-500' },
    { id: 10, gradient: 'from-amber-400 via-orange-500 to-rose-500' },
    { id: 11, gradient: 'from-sky-400 via-blue-500 to-indigo-500' },
    { id: 12, gradient: 'from-emerald-500 via-green-600 to-teal-700' },
    { id: 13, gradient: 'from-pink-400 via-rose-500 to-purple-600' },
    { id: 14, gradient: 'from-stone-300 via-slate-400 to-gray-500' },
    { id: 15, gradient: 'from-indigo-500 via-purple-600 to-pink-600' },
    { id: 16, gradient: 'from-cyan-500 via-blue-600 to-indigo-700' }
  ];

  return (
    <div className="flex-1 flex overflow-hidden bg-white">
      {/* ===================================================================
          COLUMN 1: CONVERSATION LIST & CALLS (Matching image.png Column 2)
          =================================================================== */}
      <div className="w-[310px] md:w-[330px] bg-white border-r border-[#E5E9E7]/80 flex flex-col justify-between shrink-0 select-none">
        <div className="flex-1 flex flex-col min-h-0">
          {/* Search Pill Bar (from image.png) */}
          <div className="p-4 pb-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-[#AEB7B3]" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F1F3F2] hover:bg-[#EBEFED] text-xs text-[#252B28] placeholder-[#AEB7B3] rounded-full pl-9 pr-4 py-2 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Section Heading: Messages */}
          <div className="px-5 pt-2 pb-2 flex items-center justify-between">
            <h2 className="text-base font-bold text-[#252B28] tracking-tight">Messages</h2>
            <span className="text-[11px] font-semibold text-[#45D483] bg-[#EAFBF2] px-2 py-0.5 rounded-full">
              {filteredList.length} Active
            </span>
          </div>

          {/* Filter Pills (All Chats, WhatsApp, Instagram) */}
          <div className="px-4 pb-3">
            <div className="flex items-center gap-1 p-1 bg-[#F1F3F2] rounded-full text-xs">
              <button
                onClick={() => setActiveSegment('all')}
                className={`flex-1 py-1 px-2.5 rounded-full text-[11px] font-semibold transition-all ${
                  activeSegment === 'all'
                    ? 'bg-white text-[#252B28] shadow-xs'
                    : 'text-[#6C7671] hover:text-[#252B28]'
                }`}
              >
                All Chats
              </button>
              <button
                onClick={() => setActiveSegment('whatsapp')}
                className={`flex-1 py-1 px-2.5 rounded-full text-[11px] font-semibold transition-all flex items-center justify-center gap-1 ${
                  activeSegment === 'whatsapp'
                    ? 'bg-white text-[#1E7E49] shadow-xs'
                    : 'text-[#6C7671] hover:text-[#252B28]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]"></span>
                WhatsApp
              </button>
              <button
                onClick={() => setActiveSegment('instagram')}
                className={`flex-1 py-1 px-2.5 rounded-full text-[11px] font-semibold transition-all flex items-center justify-center gap-1 ${
                  activeSegment === 'instagram'
                    ? 'bg-white text-[#252B28] shadow-xs'
                    : 'text-[#6C7671] hover:text-[#252B28]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-amber-500 to-purple-600"></span>
                Instagram
              </button>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto px-3 space-y-1">
            {filteredList.map((conv) => {
              const isSelected = conv.id === activeConversationId;
              const isWhatsApp = conv.channelType === 'whatsapp';

              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`p-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#F1F3F2]'
                      : 'hover:bg-[#F7F9F8]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar with Status indicator */}
                    <div className="relative shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={conv.contact.avatarUrl}
                        alt={conv.contact.name}
                        className="w-11 h-11 rounded-full object-cover"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          isWhatsApp ? 'bg-[#45D483]' : 'bg-gradient-to-tr from-amber-500 to-purple-600'
                        }`}
                        title={isWhatsApp ? 'WhatsApp' : 'Instagram Direct'}
                      />
                    </div>

                    {/* Contact Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#252B28] truncate">
                          {conv.contact.name}
                        </h4>
                        <span className="text-[10px] text-[#AEB7B3] font-medium shrink-0 ml-1">
                          {conv.lastMessageAt}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#6C7671] truncate mt-0.5">
                        {conv.lastMessageSnippet}
                      </p>
                    </div>

                    {/* Unread badge or checkmarks */}
                    {conv.unreadCount > 0 ? (
                      <span className="w-4 h-4 rounded-full bg-[#45D483] text-[#252B28] text-[9px] font-extrabold flex items-center justify-center shrink-0">
                        {conv.unreadCount}
                      </span>
                    ) : (
                      <CheckCheck className="w-3.5 h-3.5 text-[#45D483] shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Lower Section: Calls / Live Channels (from image.png) */}
          <div className="p-3.5 border-t border-[#F1F3F2] space-y-2 shrink-0 bg-[#FAFBFB]">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-[#252B28]">Calls</span>
              <button
                onClick={onOpenConnectModal || (() => {})}
                className="text-[11px] font-bold text-[#45D483] hover:text-[#38b76e] flex items-center gap-1 transition-colors"
                title="Conectar WhatsApp QR Code / Instagram"
              >
                <Plus className="w-3 h-3" /> Conectar Canal
              </button>
            </div>

            {/* Prominent Active Call Card (matching Blue/Dark card in image.png) */}
            <div className="p-3 bg-[#252B28] text-white rounded-2xl flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs">
                  📞
                </div>
                <div>
                  <p className="text-xs font-bold">Friendly</p>
                  <p className="text-[10px] text-[#AEB7B3] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#45D483] animate-pulse"></span>
                    Sara is talking...
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    simulateCustomerIncomingMessage(
                      activeConversationId || 'conv-hanaya-01',
                      'Preciso de atendimento humano urgente!'
                    )
                  }
                  className="w-7 h-7 rounded-full bg-[#FF453A] hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-xs"
                  title="Disconnect / End"
                >
                  <PhoneCall className="w-3.5 h-3.5 rotate-135" />
                </button>
                <button
                  className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
                  title="Participants"
                >
                  <User className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Other Channel Queues with Join Pill */}
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F1F3F2] transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#EAFBF2] text-[#1E7E49] flex items-center justify-center text-xs font-bold">
                  PD
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#252B28]">Product designers</p>
                  <p className="text-[10px] text-[#AEB7B3]">Raya is talking...</p>
                </div>
              </div>
              <button className="text-[11px] font-bold text-[#252B28] bg-white border border-[#E5E9E7] hover:border-[#45D483] px-2.5 py-1 rounded-full flex items-center gap-1 transition-all">
                <User className="w-3 h-3 text-[#45D483]" /> Join
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================
          COLUMN 2: MAIN CHAT CANVAS (Matching image.png Center)
          =================================================================== */}
      <div className="flex-1 flex flex-col justify-between bg-[#FAFBFB] min-w-0 relative">
        {activeConversation ? (
          <>
            {/* Header with Title, Avatar Stack & Call Controls (from image.png) */}
            <div className="h-16 px-6 bg-white border-b border-[#E5E9E7]/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeConversation.contact.avatarUrl}
                    alt={activeConversation.contact.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#45D483] border-2 border-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-[#252B28] truncate">
                    {activeConversation.contact.name}
                  </h3>
                  <p className="text-[11px] text-[#AEB7B3] truncate">
                    Arshia is typing...
                  </p>
                </div>
              </div>

              {/* Header Right Controls */}
              <div className="flex items-center gap-3">
                {/* Team member avatars stack (from image.png) */}
                <div className="flex items-center -space-x-1.5">
                  {teamMembers.slice(0, 3).map((m) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={m.id}
                      src={m.avatarUrl}
                      alt={m.fullName}
                      className="w-6 h-6 rounded-full border-2 border-white object-cover"
                      title={m.fullName}
                    />
                  ))}
                  <span className="w-6 h-6 rounded-full bg-[#F1F3F2] border-2 border-white text-[9px] font-bold text-[#252B28] flex items-center justify-center">
                    +32
                  </span>
                </div>

                <div className="h-5 w-[1px] bg-[#E5E9E7] mx-1" />

                <button
                  title="Start video call"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#AEB7B3] hover:text-[#252B28] hover:bg-[#F1F3F2] transition-colors"
                >
                  <Video className="w-4 h-4" />
                </button>

                <button
                  title="Start voice call"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#AEB7B3] hover:text-[#252B28] hover:bg-[#F1F3F2] transition-colors"
                >
                  <Phone className="w-4 h-4" />
                </button>

                {/* AI / Human status toggle */}
                <button
                  onClick={() =>
                    updateConversationAIStatus(
                      activeConversation.id,
                      activeConversation.aiStatus === 'active' ? 'paused' : 'active'
                    )
                  }
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${
                    activeConversation.aiStatus === 'active'
                      ? 'bg-[#EAFBF2] text-[#1E7E49] border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>{activeConversation.aiStatus === 'active' ? 'AI Auto' : 'AI Paused'}</span>
                </button>

                <button
                  onClick={() => setRightDrawerOpen(!rightDrawerOpen)}
                  className={`p-2 rounded-xl transition-colors ${
                    rightDrawerOpen
                      ? 'bg-[#F1F3F2] text-[#252B28]'
                      : 'text-[#AEB7B3] hover:text-[#252B28] hover:bg-[#F1F3F2]'
                  }`}
                  title="Toggle Contact Details"
                >
                  <SidebarIcon className="w-4 h-4" />
                </button>

                <button
                  title="More options"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#AEB7B3] hover:text-[#252B28] hover:bg-[#F1F3F2] transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Centered Date Badge (from image.png) */}
              <div className="flex justify-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#AEB7B3]">
                  TODAY, 13 SEPTEMBER
                </span>
              </div>

              {/* 1. Left Incoming Message from Mobin */}
              <div className="flex items-start gap-3 max-w-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Mobin"
                  className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
                />
                <div>
                  <div className="text-[11px] font-semibold text-[#252B28] mb-1">
                    Mobin • <span className="text-[#AEB7B3] font-normal">14:23</span>
                  </div>
                  <div className="bg-[#F1F3F2] text-[#252B28] px-4 py-3 rounded-2xl rounded-tl-xs text-xs leading-relaxed">
                    Hi guys, have you completed your Design&apos;s?
                  </div>
                </div>
              </div>

              {/* 2. Left Incoming Message from Arshia */}
              <div className="flex items-start gap-3 max-w-xl">
                <div className="w-8 h-8 rounded-full bg-[#252B28] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  ▲
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-[#252B28] mb-1">
                    Arshia • <span className="text-[#AEB7B3] font-normal">14:23</span>
                  </div>
                  <div className="bg-[#F1F3F2] text-[#252B28] px-4 py-3 rounded-2xl rounded-tl-xs text-xs leading-relaxed">
                    Hey Mahdi, Send your designs.
                  </div>
                </div>
              </div>

              {/* 3. Left Incoming Message with Rich Media Card & Reactions (from image.png) */}
              <div className="flex items-start gap-3 max-w-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeConversation.contact.avatarUrl}
                  alt="Mahdi"
                  className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
                />
                <div>
                  <div className="text-[11px] font-semibold text-[#252B28] mb-1">
                    Mahdi • <span className="text-[#AEB7B3] font-normal">22:10</span>
                  </div>

                  {/* Dual Image Gallery Card */}
                  <div className="bg-white p-2 rounded-3xl rounded-tl-xs border border-[#E5E9E7] shadow-xs max-w-md space-y-2">
                    <div className="grid grid-cols-2 gap-1 rounded-2xl overflow-hidden">
                      <div className="h-44 bg-gradient-to-tr from-rose-500 via-pink-600 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-inner">
                        <span className="bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-lg">Preview #1</span>
                      </div>
                      <div className="h-44 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-800 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-inner">
                        <span className="bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-lg">Preview #2</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#252B28] px-2 py-1 leading-relaxed">
                      Are my new designs attractive? I would love to know your opinion about it 😎✌️
                    </p>

                    {/* Reactions Pill (from image.png) */}
                    <div className="flex items-center gap-2 px-2 pb-1">
                      <div className="bg-[#F1F3F2] px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[11px] font-semibold text-[#252B28]">
                        <span className="text-xs">🔥</span>
                        <span>2</span>
                      </div>
                      <div className="bg-[#F1F3F2] px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[11px] font-semibold text-[#252B28]">
                        <span className="text-xs">🙌</span>
                        <span>6</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Right Outgoing Message from Hana (matching Blue/Dark bubble in image.png) */}
              <div className="flex items-start gap-3 max-w-xl ml-auto flex-row-reverse">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
                />
                <div className="text-right">
                  <div className="text-[11px] font-semibold text-[#252B28] mb-1">
                    <span className="text-[#AEB7B3] font-normal mr-1">22:10</span>
                    {currentUser.fullName}
                  </div>
                  <div className="bg-[#252B28] text-white px-5 py-3 rounded-2xl rounded-tr-xs text-xs leading-relaxed shadow-sm text-left">
                    Hi Mahdi, your work is really amazing 😍
                  </div>
                </div>
              </div>

              {/* 5. Right Outgoing Voice Memo Waveform Pill (from image.png) */}
              <div className="flex items-start gap-3 max-w-xl ml-auto flex-row-reverse">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
                />
                <div className="text-right">
                  <div className="text-[11px] font-semibold text-[#252B28] mb-1">
                    <span className="text-[#AEB7B3] font-normal mr-1">22:11</span>
                    {currentUser.fullName}
                  </div>

                  {/* Audio Waveform Pill Bar */}
                  <div className="bg-white border border-[#E5E9E7] p-2.5 px-4 rounded-full shadow-xs flex items-center gap-3">
                    <button
                      onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      className="w-8 h-8 rounded-full bg-[#252B28] text-white flex items-center justify-center shrink-0 hover:scale-105 transition-all shadow-xs"
                    >
                      {isPlayingAudio ? (
                        <Pause className="w-3.5 h-3.5 fill-white text-white" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
                      )}
                    </button>

                    {/* Animated Audio Bars */}
                    <div className="flex items-center gap-1 h-6">
                      {[6, 12, 18, 22, 14, 20, 24, 12, 18, 10, 14, 20, 22, 16, 12, 8, 14, 18, 22, 12, 6].map(
                        (h, i) => (
                          <div
                            key={i}
                            style={{ height: `${h}px` }}
                            className={`w-1 rounded-full transition-all ${
                              isPlayingAudio ? 'bg-[#45D483]' : 'bg-[#AEB7B3]'
                            }`}
                          />
                        )
                      )}
                    </div>

                    <span className="text-xs font-bold text-[#252B28] shrink-0 ml-1">12&quot;</span>

                    <div className="w-6 h-6 rounded-full bg-[#F1F3F2] flex items-center justify-center text-[#AEB7B3]">
                      <AtSign className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-[#AEB7B3] italic pl-11">
                  <span className="w-2 h-2 rounded-full bg-[#45D483] animate-ping" />
                  <span>Moonky AI is analyzing verified company knowledge...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Floating Rounded-Full Pill Composer (from image.png) */}
            <div className="p-4 bg-transparent shrink-0">
              <form
                onSubmit={handleSend}
                className="max-w-2xl mx-auto bg-white rounded-full border border-[#E5E9E7] p-1.5 pl-4 shadow-lg shadow-black/[0.04] flex items-center gap-3 focus-within:border-[#45D483] transition-colors"
              >
                <button
                  type="button"
                  className="w-8 h-8 rounded-full bg-[#F1F3F2] hover:bg-[#E5E9E7] text-[#6C7671] flex items-center justify-center transition-colors"
                  title="Emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  placeholder="Type a message or response..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-[#252B28] placeholder-[#AEB7B3] focus:outline-none"
                />

                <button
                  type="button"
                  className="text-[#AEB7B3] hover:text-[#252B28] p-1 transition-colors"
                  title="Attach file"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="w-9 h-9 rounded-full bg-[#45D483] hover:bg-[#3bc275] text-[#252B28] flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-xs"
                  title="Send message"
                >
                  <Send className="w-4 h-4 text-[#252B28]" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#AEB7B3]">
            <p className="text-sm">Select a conversation to view</p>
          </div>
        )}
      </div>

      {/* ===================================================================
          COLUMN 3: RIGHT DRAWER (Group / Contact Info & Media) (Image 1 Right)
          =================================================================== */}
      {rightDrawerOpen && activeConversation && (
        <div className="w-[280px] md:w-[300px] bg-white border-l border-[#E5E9E7]/80 flex flex-col justify-between shrink-0 select-none overflow-y-auto">
          <div>
            {/* Header with Title & Close button */}
            <div className="h-16 px-5 border-b border-[#F1F3F2] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#252B28]">Group info</h3>
              <button
                onClick={() => setRightDrawerOpen(false)}
                className="w-7 h-7 rounded-full text-[#AEB7B3] hover:text-[#252B28] hover:bg-[#F1F3F2] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Overview Card (from image.png) */}
            <div className="p-6 text-center border-b border-[#F1F3F2] space-y-2">
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeConversation.contact.avatarUrl}
                  alt={activeConversation.contact.name}
                  className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-white shadow-md"
                />
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#45D483] border-2 border-white" />
              </div>

              <h4 className="text-sm font-bold text-[#252B28] tracking-tight">
                {activeConversation.contact.name}
              </h4>
              <p className="text-xs text-[#AEB7B3] flex items-center justify-center gap-1">
                <span>37 Members</span>
                <span>•</span>
                <span className="text-[#45D483] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#45D483]" /> 12 Online
                </span>
              </p>

              <p className="text-[11px] text-[#6C7671] leading-relaxed pt-2">
                In this group, we answer each other&apos;s questions and help and support each other in the path of growth.
              </p>

              <p className="text-xs font-semibold text-[#1E7E49] hover:underline cursor-pointer">
                @uiux_designers
              </p>
            </div>

            {/* Notifications Row with Bell Toggle (from image.png) */}
            <div className="px-5 py-3 border-b border-[#F1F3F2] flex items-center justify-between text-xs">
              <span className="text-[#6C7671] font-medium">Notifications</span>
              <button
                onClick={() => setNotificationsMuted(!notificationsMuted)}
                className={`p-1.5 rounded-full transition-colors ${
                  notificationsMuted
                    ? 'text-rose-500 bg-rose-50'
                    : 'text-[#45D483] bg-[#EAFBF2]'
                }`}
              >
                {notificationsMuted ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
              </button>
            </div>

            {/* Members Row with Avatar Stack (from image.png) */}
            <div className="px-5 py-3 border-b border-[#F1F3F2] flex items-center justify-between">
              <span className="text-xs font-bold text-[#252B28]">Members</span>
              <div className="flex items-center -space-x-1.5">
                {teamMembers.map((m) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={m.id}
                    src={m.avatarUrl}
                    alt={m.fullName}
                    className="w-6 h-6 rounded-full border-2 border-white object-cover"
                    title={m.fullName}
                  />
                ))}
                <span className="w-6 h-6 rounded-full bg-[#F1F3F2] border-2 border-white text-[9px] font-bold text-[#252B28] flex items-center justify-center">
                  +32
                </span>
              </div>
            </div>

            {/* Segmented Tabs: Media / Files / Voice / Links / Notes (from image.png) */}
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-1 p-1 bg-[#F1F3F2] rounded-full text-xs font-semibold">
                {[
                  { id: 'media', label: 'Media' },
                  { id: 'files', label: 'Files' },
                  { id: 'voice', label: 'Voice' },
                  { id: 'links', label: 'Links' },
                  { id: 'notes', label: 'Notes' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setRightTab(t.id as typeof rightTab)}
                    className={`flex-1 py-1 rounded-full text-[11px] transition-all ${
                      rightTab === t.id
                        ? 'bg-white text-[#252B28] shadow-xs'
                        : 'text-[#6C7671] hover:text-[#252B28]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab Content: Media Grid (4-column rounded squares from image.png) */}
              {rightTab === 'media' && (
                <div className="grid grid-cols-4 gap-1.5">
                  {mediaGallery.map((m) => (
                    <div
                      key={m.id}
                      className={`h-14 rounded-xl bg-gradient-to-tr ${m.gradient} hover:opacity-90 cursor-pointer transition-transform hover:scale-105 shadow-xs`}
                    />
                  ))}
                </div>
              )}

              {/* Tab Content: Files */}
              {rightTab === 'files' && (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-[#F7F9F8] rounded-xl border border-[#E5E9E7] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#45D483]" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#252B28] truncate">Courier_Receipt_LNC.pdf</p>
                      <p className="text-[10px] text-[#AEB7B3]">245 KB • Yesterday</p>
                    </div>
                  </div>
                  <div className="p-2.5 bg-[#F7F9F8] rounded-xl border border-[#E5E9E7] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#45D483]" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#252B28] truncate">Invoice_VIP_2026.pdf</p>
                      <p className="text-[10px] text-[#AEB7B3]">1.2 MB • 5 days ago</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content: Voice Notes */}
              {rightTab === 'voice' && (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-[#F7F9F8] rounded-xl border border-[#E5E9E7] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mic className="w-4 h-4 text-[#45D483]" />
                      <span className="font-bold text-[#252B28]">Voice Memo 12&quot;</span>
                    </div>
                    <span className="text-[10px] text-[#AEB7B3]">14:12</span>
                  </div>
                </div>
              )}

              {/* Tab Content: Links */}
              {rightTab === 'links' && (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-[#F7F9F8] rounded-xl border border-[#E5E9E7] space-y-1">
                    <p className="font-bold text-[#252B28] truncate">https://moonky.io/track/LNC-9988</p>
                    <p className="text-[10px] text-[#AEB7B3]">Realtime logistics webhook</p>
                  </div>
                </div>
              )}

              {/* Tab Content: Notes */}
              {rightTab === 'notes' && (
                <div className="space-y-3">
                  <div className="bg-[#F7F9F8] border border-[#E5E9E7] rounded-2xl p-3 space-y-2">
                    <textarea
                      rows={2}
                      placeholder="Add an internal note..."
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      className="w-full bg-white border border-[#E5E9E7] rounded-xl p-2.5 text-xs text-[#252B28] focus:outline-none focus:border-[#45D483]"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveNote}
                        disabled={!noteInput.trim()}
                        className="bg-[#252B28] hover:bg-black text-white text-[10px] font-bold px-3 py-1 rounded-lg transition-colors disabled:opacity-40"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {activeNotes.map((n) => (
                      <div
                        key={n.id}
                        className="p-3 bg-[#F7F9F8] rounded-xl border border-[#E5E9E7] text-xs space-y-1"
                      >
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-[#252B28]">From: @{n.author.name}</span>
                          <span className="text-[#AEB7B3]">{n.createdAt}</span>
                        </div>
                        <p className="text-[11px] text-[#6C7671] leading-relaxed">{n.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
