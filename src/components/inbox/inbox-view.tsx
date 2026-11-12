'use client';

// ===================================================================
// MOONKY OMNICHANNEL INBOX — 100% PORTUGUÊS BRASIL
// Chat em tempo real: Envio de texto, áudio gravado, foto e anexo
// Chamadas de voz e vídeo interativas integradas ao WhatsApp e Instagram
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
  Image as ImageIcon,
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
  MicOff,
  Square,
  AtSign,
  PhoneCall,
  PhoneOff,
  Download,
  ExternalLink,
  Volume2,
  VideoOff,
  Pin,
  PinOff,
  Archive,
  Trash2,
  Maximize2,
  Eye,
  Film,
  QrCode,
  Radio,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useMoonky } from '@/context/moonky-store';
import { currentUser } from '@/lib/mock-data';
import { Message, MessageType, Contact, ChannelType, Conversation } from '@/types';

interface InboxViewProps {
  onOpenConnectModal?: () => void;
}

export function InboxView({ onOpenConnectModal }: InboxViewProps = {}) {
  const {
    conversations,
    channels,
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
    isTyping,
    pinMessage,
    unpinMessage,
    archiveMessage,
    deleteMessage,
    pinConversation,
    unpinConversation,
    archiveConversation,
    deleteConversation
  } = useMoonky();

  // Estados de entrada e abas
  const [messageInput, setMessageInput] = useState('');
  const [activeSegment, setActiveSegment] = useState<'all' | 'whatsapp' | 'instagram'>('all');
  const [rightDrawerOpen, setRightDrawerOpen] = useState(true);
  const [rightTab, setRightTab] = useState<'media' | 'files' | 'voice' | 'links' | 'notes'>('media');
  const [noteInput, setNoteInput] = useState('');
  const [notificationsMuted, setNotificationsMuted] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  // Estados de Menu de Contexto Minimalista de Mensagens
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    message: Message | null;
  }>({
    isOpen: false,
    x: 0,
    y: 0,
    message: null
  });

  // Estados de Menu de Contexto Minimalista de Conversas
  const [convContextMenu, setConvContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    conversation: Conversation | null;
  }>({
    isOpen: false,
    x: 0,
    y: 0,
    conversation: null
  });
  const [showArchivedConversations, setShowArchivedConversations] = useState<boolean>(false);
  const [pinToast, setPinToast] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [copiedWebhook, setCopiedWebhook] = useState<boolean>(false);

  const waChannel = channels.find((c) => c.type === 'whatsapp');
  const igChannel = channels.find((c) => c.type === 'instagram');
  const isWaConnected = waChannel?.status === 'connected';
  const isIgConnected = igChannel?.status === 'connected';
  const isAnyChannelConnected = isWaConnected || isIgConnected;

  const handleCopyWebhookUrl = () => {
    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}/api/webhooks/wame`
        : 'https://moonkywpp-e9w2.vercel.app/api/webhooks/wame';
    navigator.clipboard.writeText(url);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  // Estados e referências de Gravação de Áudio Real
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Estados e referências de Reprodução de Áudio Real
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);

  // Estados de Chamada de Voz / Vídeo
  const [activeCall, setActiveCall] = useState<{
    type: 'voice' | 'video';
    contact: Contact;
    channelType: ChannelType;
  } | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isCallMuted, setIsCallMuted] = useState(false);
  const [isCallVideoOff, setIsCallVideoOff] = useState(false);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Referências para upload de arquivos
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Estado de Visualização em Tela Cheia (Fullscreen Lightbox para Foto, Vídeo e Documento)
  const [fullscreenMedia, setFullscreenMedia] = useState<{
    isOpen: boolean;
    type: 'image' | 'video' | 'document';
    url: string;
    title: string;
    size?: string;
  }>({
    isOpen: false,
    type: 'image',
    url: '',
    title: ''
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages, isTyping]);

  // Timer de gravação de áudio
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  // Timer de chamada ativa
  useEffect(() => {
    if (activeCall) {
      setCallDuration(0);
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [activeCall]);

  // Envio de Texto
  const handleSendText = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim()) return;
    const text = messageInput.trim();
    setMessageInput('');
    await sendMessage(text, 'text');
  };

  // Envio de Foto
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      await sendMessage(file.name || 'Foto enviada', 'image', dataUrl, {
        fileName: file.name,
        fileSize: sizeStr,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
    setShowAttachMenu(false);
  };

  // Envio de Vídeo
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      await sendMessage(file.name || 'Vídeo gravado/enviado', 'video', dataUrl, {
        fileName: file.name,
        fileSize: sizeStr,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
    setShowAttachMenu(false);
  };

  // Envio de Documento / Anexo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      await sendMessage(`${file.name}`, 'document', dataUrl, {
        fileName: file.name,
        fileSize: sizeStr,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
    setShowAttachMenu(false);
  };

  // Gravação de Áudio Real via Microfone do Navegador
  const handleStartRecording = async () => {
    try {
      if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Seu navegador não suporta gravação de áudio pelo microfone.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      let mimeType = '';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        }
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordingSeconds(0);
    } catch (err: unknown) {
      console.error('Erro ao acessar o microfone:', err);
      alert('Permissão de microfone negada. Por favor, autorize o microfone no navegador para gravar áudio.');
    }
  };

  // Gravação de Áudio: Cancelar
  const handleCancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    audioChunksRef.current = [];
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  // Gravação de Áudio: Concluir e Enviar com Áudio Real Base64
  const handleFinishRecording = async () => {
    if (!mediaRecorderRef.current) {
      setIsRecording(false);
      return;
    }

    const recorder = mediaRecorderRef.current;
    const finalSeconds = Math.max(recordingSeconds, 1);

    recorder.onstop = () => {
      const mimeType = recorder.mimeType || 'audio/webm';
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        await sendMessage(`Mensagem de voz ${finalSeconds}"`, 'audio', base64Audio);
      };
      reader.readAsDataURL(audioBlob);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      audioChunksRef.current = [];
      setRecordingSeconds(0);
    };

    if (recorder.state !== 'inactive') {
      recorder.stop();
    }
    setIsRecording(false);
  };

  // Reprodução de Áudio Real (Reproduz o som gravado no microfone)
  const togglePlayAudio = (msgId: string, mediaUrl?: string) => {
    // Se o mesmo áudio já estiver tocando, pausa
    if (playingAudioId === msgId) {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }
      setPlayingAudioId(null);
      return;
    }

    // Se outro áudio estiver tocando, interrompe
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }

    // Reproduzir mídia real (Base64 ou URL de áudio)
    if (
      mediaUrl &&
      (mediaUrl.startsWith('data:audio') ||
        mediaUrl.startsWith('blob:') ||
        mediaUrl.startsWith('http'))
    ) {
      const audio = new Audio(mediaUrl);
      activeAudioRef.current = audio;
      setPlayingAudioId(msgId);
      setAudioCurrentTime(0);

      audio.ontimeupdate = () => {
        setAudioCurrentTime(audio.currentTime);
      };

      audio.onended = () => {
        setPlayingAudioId(null);
        setAudioCurrentTime(0);
      };

      audio.onerror = () => {
        setPlayingAudioId(null);
      };

      audio.play().catch((err) => {
        console.warn('Erro ao reproduzir áudio real:', err);
        setPlayingAudioId(null);
      });
    } else {
      // Mensagem de voz de demonstração (efeito acústico suave)
      setPlayingAudioId(msgId);
      try {
        if (typeof window !== 'undefined' && 'AudioContext' in window) {
          const ctx = new (window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(340, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(560, ctx.currentTime + 0.4);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 1.2);
        }
      } catch {}

      setTimeout(() => {
        setPlayingAudioId((curr) => (curr === msgId ? null : curr));
      }, 1500);
    }
  };

  // Iniciar Ligação de Voz ou Vídeo
  const handleStartCall = (type: 'voice' | 'video') => {
    if (!activeConversation) return;
    setActiveCall({
      type,
      contact: activeConversation.contact,
      channelType: activeConversation.channelType
    });
  };

  // Encerrar Chamada
  const handleEndCall = () => {
    setActiveCall(null);
  };

  // Redirecionamento Direto para o Canal Oficial (WhatsApp / Instagram)
  const handleOpenChannelDirectCall = () => {
    if (!activeCall) return;
    if (activeCall.channelType === 'whatsapp') {
      const cleanPhone = (activeCall.contact.phone || '5511988771122').replace(/\D/g, '');
      window.open(`https://wa.me/${cleanPhone}?text=Olá,%20ligação%20iniciada%20via%20Moonky`, '_blank');
    } else {
      const igUser = activeCall.contact.instagramUsername || 'moonky.enterprise';
      window.open(`https://instagram.com/direct/t/${igUser}`, '_blank');
    }
  };

  const handleSaveNote = () => {
    if (!noteInput.trim() || !activeConversationId) return;
    addInternalNote(activeConversationId, noteInput);
    setNoteInput('');
  };

  // Fechar menus de contexto ao clicar fora ou pressionar Escape
  useEffect(() => {
    const handleClose = () => {
      if (contextMenu.isOpen) {
        setContextMenu({ isOpen: false, x: 0, y: 0, message: null });
      }
      if (convContextMenu.isOpen) {
        setConvContextMenu({ isOpen: false, x: 0, y: 0, conversation: null });
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (fullscreenMedia.isOpen) setFullscreenMedia({ isOpen: false, type: 'image', url: '', title: '' });
        if (contextMenu.isOpen) setContextMenu({ isOpen: false, x: 0, y: 0, message: null });
        if (convContextMenu.isOpen) setConvContextMenu({ isOpen: false, x: 0, y: 0, conversation: null });
      }
    };
    window.addEventListener('click', handleClose);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleClose);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu.isOpen, convContextMenu.isOpen, fullscreenMedia.isOpen]);

  // Abertura de menu de Mensagem via botão direito
  const handleContextMenu = (e: React.MouseEvent, msg: Message) => {
    e.preventDefault();
    e.stopPropagation();
    const menuWidth = 190;
    const menuHeight = 150;
    const posX = Math.min(e.clientX, window.innerWidth - menuWidth - 10);
    const posY = Math.min(e.clientY, window.innerHeight - menuHeight - 10);
    setContextMenu({
      isOpen: true,
      x: Math.max(10, posX),
      y: Math.max(10, posY),
      message: msg
    });
  };

  // Abertura de menu de Mensagem via 3 pontinhos minimalistas
  const handleDotsClick = (e: React.MouseEvent, msg: Message) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const menuWidth = 190;
    const menuHeight = 150;
    const posX = Math.min(rect.left, window.innerWidth - menuWidth - 10);
    const posY = Math.min(rect.bottom + 6, window.innerHeight - menuHeight - 10);
    setContextMenu({
      isOpen: true,
      x: Math.max(10, posX),
      y: Math.max(10, posY),
      message: msg
    });
  };

  // Abertura de menu da Conversa via botão direito
  const handleConvContextMenu = (e: React.MouseEvent, conv: Conversation) => {
    e.preventDefault();
    e.stopPropagation();
    const menuWidth = 210;
    const menuHeight = 160;
    const posX = Math.min(e.clientX, window.innerWidth - menuWidth - 10);
    const posY = Math.min(e.clientY, window.innerHeight - menuHeight - 10);
    setConvContextMenu({
      isOpen: true,
      x: Math.max(10, posX),
      y: Math.max(10, posY),
      conversation: conv
    });
  };

  // Abertura de menu da Conversa via 3 pontinhos minimalistas
  const handleConvDotsClick = (e: React.MouseEvent, conv: Conversation) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const menuWidth = 210;
    const menuHeight = 160;
    const posX = Math.min(rect.right + 6, window.innerWidth - menuWidth - 10);
    const posY = Math.min(rect.top, window.innerHeight - menuHeight - 10);
    setConvContextMenu({
      isOpen: true,
      x: Math.max(10, posX),
      y: Math.max(10, posY),
      conversation: conv
    });
  };

  // Ações de Conversa: Fixar / Desafixar (até 5 conversas no topo)
  const handleTogglePinConv = (conv: Conversation) => {
    if (conv.isPinned) {
      unpinConversation(conv.id);
    } else {
      const ok = pinConversation(conv.id);
      if (!ok) {
        setPinToast('Limite de 5 conversas fixadas atingido. Desafixe uma conversa para fixar outra.');
        setTimeout(() => setPinToast(null), 3500);
      }
    }
    setConvContextMenu({ isOpen: false, x: 0, y: 0, conversation: null });
  };

  // Ações de Conversa: Arquivar / Desarquivar
  const handleToggleArchiveConv = (conv: Conversation) => {
    archiveConversation(conv.id);
    setConvContextMenu({ isOpen: false, x: 0, y: 0, conversation: null });
  };

  // Ações de Conversa: Excluir
  const handleDeleteConv = (conv: Conversation) => {
    if (confirm(`Deseja realmente excluir a conversa com ${conv.contact.name}?`)) {
      deleteConversation(conv.id);
    }
    setConvContextMenu({ isOpen: false, x: 0, y: 0, conversation: null });
  };

  // Ações de Mensagem: Fixar / Desafixar (até 5 mensagens)
  const handleTogglePin = (msg: Message) => {
    if (!activeConversation) return;
    if (msg.isPinned) {
      unpinMessage(activeConversation.id, msg.id);
    } else {
      const success = pinMessage(activeConversation.id, msg.id);
      if (!success) {
        setPinToast('Limite de 5 mensagens fixadas atingido. Desafixe uma para fixar outra.');
        setTimeout(() => setPinToast(null), 3500);
      }
    }
    setContextMenu({ isOpen: false, x: 0, y: 0, message: null });
  };

  // Ações de Mensagem: Arquivar / Desarquivar
  const handleToggleArchive = (msg: Message) => {
    if (!activeConversation) return;
    archiveMessage(activeConversation.id, msg.id);
    setContextMenu({ isOpen: false, x: 0, y: 0, message: null });
  };

  // Ações de Mensagem: Excluir
  const handleDelete = (msg: Message) => {
    if (!activeConversation) return;
    deleteMessage(activeConversation.id, msg.id);
    setContextMenu({ isOpen: false, x: 0, y: 0, message: null });
  };

  // Ordenação de conversas pela última mensagem enviada ou recebida (com fixadas no topo)
  const getConversationTimeValue = (conv: Conversation): number => {
    if (conv.lastMessageTimestamp) return conv.lastMessageTimestamp;
    if (conv.lastMessageAt) {
      const parts = conv.lastMessageAt.split(':');
      if (parts.length === 2) {
        const d = new Date();
        d.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
        return d.getTime();
      }
    }
    return 0;
  };

  const filteredList = conversations
    .filter((c) => {
      if (!showArchivedConversations && c.isArchived) return false;
      if (showArchivedConversations && !c.isArchived) return false;
      if (activeSegment !== 'all' && c.channelType !== activeSegment) return false;
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        return (
          c.contact.name.toLowerCase().includes(q) ||
          c.lastMessageSnippet.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      // Conversas fixadas têm prioridade no topo da lista
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return getConversationTimeValue(b) - getConversationTimeValue(a);
    });

  const pinnedConversationsCount = conversations.filter((c) => c.isPinned && !c.isArchived).length;
  const archivedConversationsCount = conversations.filter((c) => c.isArchived).length;

  const pinnedMessages = activeMessages.filter((m) => m.isPinned && !m.isArchived);
  const archivedCount = activeMessages.filter((m) => m.isArchived).length;

  const activeNotes = activeConversationId ? notes[activeConversationId] || [] : [];

  const mediaGallery = [
    { id: 'm1', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300' },
    { id: 'm2', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300' },
    { id: 'm3', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300' },
    { id: 'm4', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300' },
    { id: 'm5', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300' },
    { id: 'm6', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300' },
    { id: 'm7', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300' },
    { id: 'm8', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300' }
  ];

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex overflow-hidden min-w-0 bg-white dark:bg-[#151917]">
      {/* Uploads Ocultos */}
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      <input
        type="file"
        ref={videoInputRef}
        accept="video/*"
        onChange={handleVideoUpload}
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.zip,*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* ===================================================================
          COLUNA 1: LISTA DE CONVERSAS (Somente Mensagens / Conversas)
          =================================================================== */}
      <div className="w-[300px] md:w-[320px] bg-white dark:bg-[#151917] border-r border-[#E5E9E7]/80 dark:border-[#262E2A] flex flex-col justify-between shrink-0 select-none">
        <div className="flex-1 flex flex-col min-h-0">
          {/* Campo de Busca em Pílula */}
          <div className="p-4 pb-2">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Buscar conversas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F1F3F2] dark:bg-[#1D2320] text-xs text-[#252B28] dark:text-[#F3F6F4] placeholder-[#AEB7B3] rounded-full pl-4 pr-11 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#45D483] transition-all"
              />
              <button className="absolute right-1.5 w-7 h-7 rounded-full bg-[#45D483] hover:bg-[#3bc275] text-[#252B28] flex items-center justify-center transition-all shadow-xs">
                <Search className="w-3.5 h-3.5 text-[#252B28]" />
              </button>
            </div>
          </div>

          {/* Abas Pílula: Todas, WhatsApp, Instagram */}
          <div className="px-4 py-2">
            <div className="flex items-center gap-1 p-1 bg-[#F1F3F2] dark:bg-[#1D2320] rounded-full text-xs">
              <button
                onClick={() => setActiveSegment('all')}
                className={`flex-1 py-1 px-2.5 rounded-full text-[11px] font-semibold transition-all ${
                  activeSegment === 'all'
                    ? 'bg-white dark:bg-[#151917] text-[#252B28] dark:text-[#F3F6F4] shadow-xs'
                    : 'text-[#6C7671] dark:text-[#AEB7B3] hover:text-[#252B28] dark:hover:text-white'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setActiveSegment('whatsapp')}
                className={`flex-1 py-1 px-2.5 rounded-full text-[11px] font-semibold transition-all flex items-center justify-center gap-1 ${
                  activeSegment === 'whatsapp'
                    ? 'bg-white dark:bg-[#151917] text-[#1E7E49] dark:text-[#45D483] shadow-xs'
                    : 'text-[#6C7671] dark:text-[#AEB7B3] hover:text-[#252B28] dark:hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]"></span>
                WhatsApp
              </button>
              <button
                onClick={() => setActiveSegment('instagram')}
                className={`flex-1 py-1 px-2.5 rounded-full text-[11px] font-semibold transition-all flex items-center justify-center gap-1 ${
                  activeSegment === 'instagram'
                    ? 'bg-white dark:bg-[#151917] text-[#252B28] dark:text-[#F3F6F4] shadow-xs'
                    : 'text-[#6C7671] dark:text-[#AEB7B3] hover:text-[#252B28] dark:hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-amber-500 to-purple-600"></span>
                Instagram
              </button>
            </div>
          </div>

          {/* Lista de Contatos / Mensagens — Ocupa toda a coluna */}
          <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
            {/* Banner/Botão para Alternar Conversas Arquivadas */}
            {archivedConversationsCount > 0 && (
              <div className="px-1 pt-1 pb-1">
                <button
                  type="button"
                  onClick={() => setShowArchivedConversations(!showArchivedConversations)}
                  className={`w-full py-1.5 px-3 rounded-xl text-[11px] font-semibold flex items-center justify-between transition-all ${
                    showArchivedConversations
                      ? 'bg-[#EAFBF2] dark:bg-[#1E3328] text-[#1E7E49] dark:text-[#45D483] border border-emerald-200 dark:border-emerald-800/40'
                      : 'bg-[#F1F3F2] dark:bg-[#1D2320] text-[#6C7671] dark:text-[#AEB7B3] hover:text-[#252B28] dark:hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Archive className="w-3.5 h-3.5" />
                    <span>{showArchivedConversations ? 'Ver conversas ativas' : 'Conversas arquivadas'}</span>
                  </span>
                  <span className="text-[10px] bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded-full font-bold">
                    {archivedConversationsCount}
                  </span>
                </button>
              </div>
            )}

            {filteredList.length === 0 && (
              <div className="p-4 text-center">
                {!isAnyChannelConnected ? (
                  <div className="bg-[#F7F9F8] dark:bg-[#19201C] border border-[#E5E9E7] dark:border-[#262E2A] rounded-2xl p-4 text-center space-y-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#EAFBF2] dark:bg-[#45D483]/15 text-[#45D483] flex items-center justify-center mx-auto">
                      <Radio className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#252B28] dark:text-[#F3F6F4]">
                        Canais desconectados
                      </p>
                      <p className="text-[11px] text-[#6C7671] dark:text-[#AEB7B3] mt-0.5 leading-relaxed">
                        Conecte o WhatsApp ou Instagram para receber conversas em tempo real.
                      </p>
                    </div>
                    {onOpenConnectModal && (
                      <button
                        type="button"
                        onClick={onOpenConnectModal}
                        className="w-full bg-[#45D483] hover:bg-[#3bc275] text-[#252B28] text-xs font-bold py-2 px-3 rounded-xl transition-all shadow-xs"
                      >
                        Conectar via WAME
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-xs text-[#AEB7B3] dark:text-[#6C7671] space-y-1">
                    <p className="font-semibold text-[#252B28] dark:text-gray-300">
                      {showArchivedConversations ? 'Nenhuma conversa arquivada' : 'Aguardando mensagens...'}
                    </p>
                    <p className="text-[11px]">
                      {showArchivedConversations
                        ? 'Você não possui conversas no arquivo.'
                        : 'Envie ou receba uma mensagem via WhatsApp ou Instagram.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {filteredList.map((conv) => {
              const isSelected = conv.id === activeConversationId;
              const isWhatsApp = conv.channelType === 'whatsapp';

              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  onContextMenu={(e) => handleConvContextMenu(e, conv)}
                  className={`group relative p-3 rounded-2xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-[#F1F3F2] dark:bg-[#1D2320] border-[#E5E9E7]/60 dark:border-[#2C3530]'
                      : 'border-transparent hover:bg-[#F7F9F8] dark:hover:bg-[#19201C]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={conv.contact.avatarUrl}
                        alt={conv.contact.name}
                        className="w-11 h-11 rounded-full object-cover"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-[#151917] ${
                          isWhatsApp ? 'bg-[#45D483]' : 'bg-gradient-to-tr from-amber-500 to-purple-600'
                        }`}
                        title={isWhatsApp ? 'WhatsApp Oficial' : 'Instagram Direct Oficial'}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h4 className="text-xs font-bold text-[#252B28] dark:text-[#F3F6F4] truncate">
                            {conv.contact.name}
                          </h4>
                          {conv.isPinned && (
                            <span title="Conversa fixada no topo (até 5)">
                              <Pin className="w-3 h-3 text-[#45D483] fill-[#45D483] shrink-0" />
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#AEB7B3] font-medium shrink-0 ml-1">
                          {conv.lastMessageAt}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-[11px] text-[#6C7671] dark:text-[#AEB7B3] truncate flex-1 pr-1">
                          {conv.lastMessageSnippet}
                        </p>

                        <div className="flex items-center gap-1 shrink-0">
                          {conv.unreadCount > 0 ? (
                            <span className="w-4 h-4 rounded-full bg-[#45D483] text-[#252B28] text-[9px] font-extrabold flex items-center justify-center">
                              {conv.unreadCount}
                            </span>
                          ) : (
                            <CheckCheck className="w-3.5 h-3.5 text-[#45D483]" />
                          )}

                          {/* Botão Minimalista de 3 Pontinhos da Conversa */}
                          <button
                            type="button"
                            onClick={(e) => handleConvDotsClick(e, conv)}
                            title="Opções da conversa (Fixar, Arquivar, Excluir)"
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[#AEB7B3] hover:text-[#252B28] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all opacity-80 group-hover:opacity-100"
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===================================================================
          COLUNA 2: CHAT CENTRAL (Mensagens Reais Dinâmicas)
          =================================================================== */}
      <div className="flex-1 flex flex-col justify-between bg-[#FAFBFB] dark:bg-[#111413] min-w-0 relative">
        {activeConversation ? (
          <>
            {/* Cabeçalho do Chat */}
            <div className="h-16 px-6 bg-white dark:bg-[#151917] border-b border-[#E5E9E7]/80 dark:border-[#262E2A] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeConversation.contact.avatarUrl}
                    alt={activeConversation.contact.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#45D483] border-2 border-white dark:border-[#151917]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-[#252B28] truncate">
                    {activeConversation.contact.name}
                  </h3>
                  <p className="text-[11px] text-[#AEB7B3] truncate flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#45D483]"></span>
                    {activeConversation.channelType === 'whatsapp'
                      ? `WhatsApp (${activeConversation.contact.phone || '+55 11 98877-1122'})`
                      : `Instagram Direct (@${activeConversation.contact.instagramUsername || 'contato'})`}
                  </p>
                </div>
              </div>

              {/* Ações do Cabeçalho: Vídeo, Voz, IA, Gaveta */}
              <div className="flex items-center gap-2">
                {/* Botão de Chamada de Vídeo */}
                <button
                  onClick={() => handleStartCall('video')}
                  title={
                    activeConversation.channelType === 'whatsapp'
                      ? 'Ligar por Vídeo no WhatsApp'
                      : 'Ligar por Vídeo no Instagram Direct'
                  }
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[#252B28] bg-[#F1F3F2] hover:bg-[#45D483] hover:text-[#252B28] transition-all shadow-xs"
                >
                  <Video className="w-4 h-4" />
                </button>

                {/* Botão de Chamada de Voz */}
                <button
                  onClick={() => handleStartCall('voice')}
                  title={
                    activeConversation.channelType === 'whatsapp'
                      ? 'Ligar por Voz no WhatsApp'
                      : 'Ligar por Voz no Instagram Direct'
                  }
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[#252B28] bg-[#F1F3F2] hover:bg-[#45D483] hover:text-[#252B28] transition-all shadow-xs"
                >
                  <Phone className="w-4 h-4" />
                </button>

                <div className="h-5 w-[1px] bg-[#E5E9E7] mx-1" />

                {/* Alternador de Status da IA */}
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
                  <span>{activeConversation.aiStatus === 'active' ? 'IA Ativa' : 'IA Pausada'}</span>
                </button>

                {/* Alternar Gaveta de Detalhes */}
                <button
                  onClick={() => setRightDrawerOpen(!rightDrawerOpen)}
                  className={`p-2 rounded-xl transition-colors ${
                    rightDrawerOpen
                      ? 'bg-[#F1F3F2] text-[#252B28]'
                      : 'text-[#AEB7B3] hover:text-[#252B28] hover:bg-[#F1F3F2]'
                  }`}
                  title="Detalhes do Contato"
                >
                  <SidebarIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* BARRA MINIMALISTA DE MENSAGENS FIXADAS NO TOPO DO CHAT (ATÉ 5) */}
            {pinnedMessages.length > 0 && (
              <div className="bg-[#FAFBFB] dark:bg-[#181D1A] border-b border-[#E5E9E7] dark:border-[#262E2A] px-6 py-2 flex items-center justify-between text-xs transition-colors shrink-0">
                <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                  <div className="w-6 h-6 rounded-lg bg-[#EAFBF2] dark:bg-[#45D483]/15 text-[#45D483] flex items-center justify-center shrink-0">
                    <Pin className="w-3.5 h-3.5 fill-[#45D483]" />
                  </div>
                  <span className="text-[11px] font-bold text-[#252B28] dark:text-white shrink-0">
                    Fixadas ({pinnedMessages.length}/5):
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar flex-1">
                    {pinnedMessages.map((pMsg, idx) => (
                      <div
                        key={pMsg.id}
                        onClick={() => {
                          const el = document.getElementById(`msg-${pMsg.id}`);
                          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                        className="group flex items-center gap-1.5 bg-white dark:bg-[#222926] border border-[#E5E9E7] dark:border-[#2C3530] px-2.5 py-1 rounded-full cursor-pointer hover:border-[#45D483] transition-all shrink-0 max-w-[200px]"
                        title="Clique para ir até a mensagem"
                      >
                        <span className="text-[10px] font-bold text-[#45D483]">#{idx + 1}</span>
                        <span className="text-[11px] text-[#252B28] dark:text-gray-200 truncate">
                          {pMsg.messageType === 'audio'
                            ? '🎙 Mensagem de voz'
                            : pMsg.messageType === 'image'
                            ? '📷 Foto'
                            : pMsg.messageType === 'document'
                            ? '📄 Documento'
                            : pMsg.content}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (activeConversation) unpinMessage(activeConversation.id, pMsg.id);
                          }}
                          title="Desafixar do topo"
                          className="w-3.5 h-3.5 rounded-full hover:bg-rose-100 dark:hover:bg-rose-950 text-[#AEB7B3] hover:text-rose-500 flex items-center justify-center transition-colors ml-0.5"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Feed de Mensagens Dinâmico */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex justify-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#AEB7B3] bg-[#F1F3F2] dark:bg-[#1D2320] px-3 py-1 rounded-full">
                  CONVERSA INDIVIDUAL · {activeConversation.channelType === 'whatsapp' ? 'WHATSAPP OFICIAL' : 'INSTAGRAM DIRECT'}
                </span>
              </div>

              {/* Banner de Mensagens Arquivadas (se houver) */}
              {archivedCount > 0 && (
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowArchived(!showArchived)}
                    className="text-[10px] font-semibold text-[#6C7671] bg-[#F1F3F2] dark:bg-[#1D2320] px-3 py-1 rounded-full hover:text-[#252B28] dark:hover:text-white transition-colors"
                  >
                    {showArchived
                      ? `Ocultar ${archivedCount} mensagem(ns) arquivada(s)`
                      : `Ver ${archivedCount} mensagem(ns) arquivada(s)`}
                  </button>
                </div>
              )}

              {activeMessages
                .filter((m) => showArchived || !m.isArchived)
                .map((msg) => {
                  const isAgent = msg.senderType === 'agent';
                  const isAI = msg.senderType === 'ai';
                  const isCustomer = msg.senderType === 'contact';
                  const isAudioPlaying = playingAudioId === msg.id;

                  return (
                    <div
                      key={msg.id}
                      id={`msg-${msg.id}`}
                      className={`group relative flex items-start gap-2.5 max-w-xl transition-all ${
                        isAgent ? 'ml-auto flex-row-reverse text-right' : 'mr-auto text-left'
                      }`}
                    >
                      {/* Avatar do Emissor */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          isAgent
                            ? currentUser.avatarUrl
                            : isAI
                            ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100'
                            : activeConversation.contact.avatarUrl
                        }
                        alt={msg.senderName || 'Avatar'}
                        className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
                      />

                      <div className={`space-y-1 flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}>
                        {/* Nome, Horário e Badges */}
                        <div
                          className={`text-[11px] font-semibold text-[#252B28] flex items-center gap-1.5 ${
                            isAgent ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {isAI && (
                            <span className="bg-[#EAFBF2] text-[#1E7E49] text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                              IA Moonky
                            </span>
                          )}
                          <span>{isAgent ? currentUser.fullName : msg.senderName || activeConversation.contact.name}</span>
                          <span className="text-[#AEB7B3] font-normal">{msg.timestamp}</span>

                          {/* Badge de Mensagem Fixada */}
                          {msg.isPinned && (
                            <span
                              className="flex items-center gap-0.5 text-[9px] font-bold text-[#45D483] bg-[#EAFBF2] dark:bg-[#45D483]/15 px-1.5 py-0.2 rounded-full"
                              title="Mensagem fixada no topo do chat"
                            >
                              <Pin className="w-2.5 h-2.5 fill-[#45D483]" />
                              <span>Fixada</span>
                            </span>
                          )}

                          {/* Badge de Mensagem Arquivada */}
                          {msg.isArchived && (
                            <span className="text-[9px] font-semibold text-[#6C7671] bg-[#F1F3F2] dark:bg-[#252B28] px-1.5 py-0.2 rounded-full">
                              Arquivada
                            </span>
                          )}
                        </div>

                        {/* Linha com Bolha + 3 Pontinhos Minimalistas */}
                        <div
                          className={`flex items-center gap-1.5 ${
                            isAgent ? 'flex-row-reverse' : 'flex-row'
                          }`}
                        >
                          {/* Conteúdo com clique de botão direito */}
                          <div
                            onContextMenu={(e) => handleContextMenu(e, msg)}
                            className="cursor-context-menu"
                          >
                            {/* Tipo: TEXTO */}
                            {msg.messageType === 'text' && (
                              <div
                                className={`px-4 py-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                                  isAgent
                                    ? 'bg-[#252B28] dark:bg-[#222926] text-white rounded-tr-xs text-left'
                                    : isAI
                                    ? 'bg-[#EAFBF2] dark:bg-[#1E3328] text-[#1E7E49] dark:text-[#45D483] border border-emerald-200 dark:border-emerald-800/40 rounded-tl-xs'
                                    : 'bg-white dark:bg-[#1D2320] border border-[#E5E9E7] dark:border-[#2C3530] text-[#252B28] dark:text-[#F3F6F4] rounded-tl-xs'
                                }`}
                              >
                                {msg.content}
                              </div>
                            )}

                            {/* Tipo: FOTO / IMAGEM */}
                            {msg.messageType === 'image' && (
                              <div
                                onClick={() =>
                                  setFullscreenMedia({
                                    isOpen: true,
                                    type: 'image',
                                    url: msg.mediaUrl || msg.content,
                                    title: msg.content || 'Foto em alta resolução',
                                    size: (msg.metadata?.fileSize as string) || undefined
                                  })
                                }
                                className="group/media relative bg-white dark:bg-[#1D2320] p-2 rounded-2xl border border-[#E5E9E7] dark:border-[#2C3530] shadow-xs space-y-1.5 max-w-sm cursor-pointer hover:border-[#45D483]/60 transition-all overflow-hidden"
                                title="Clique para abrir em tela cheia (Full Screen)"
                              >
                                <div className="relative overflow-hidden rounded-xl">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={msg.mediaUrl || msg.content}
                                    alt="Foto enviada"
                                    className="rounded-xl object-cover max-h-64 w-full group-hover/media:scale-102 transition-transform duration-200"
                                  />
                                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-semibold">
                                    <Maximize2 className="w-5 h-5 text-white drop-shadow-md" />
                                    <span className="drop-shadow-md">Tela Cheia</span>
                                  </div>
                                </div>
                                {msg.content && !msg.content.startsWith('data:') && (
                                  <p className="text-xs text-[#252B28] dark:text-[#F3F6F4] px-1 font-medium">{msg.content}</p>
                                )}
                              </div>
                            )}

                            {/* Tipo: VÍDEO */}
                            {msg.messageType === 'video' && (
                              <div
                                onClick={() =>
                                  setFullscreenMedia({
                                    isOpen: true,
                                    type: 'video',
                                    url: msg.mediaUrl || msg.content,
                                    title: msg.content || 'Vídeo',
                                    size: (msg.metadata?.fileSize as string) || undefined
                                  })
                                }
                                className="group/media relative bg-white dark:bg-[#1D2320] p-2 rounded-2xl border border-[#E5E9E7] dark:border-[#2C3530] shadow-xs space-y-1.5 max-w-sm cursor-pointer hover:border-purple-500/60 transition-all overflow-hidden"
                                title="Clique para reproduzir em tela cheia (Full Screen)"
                              >
                                <div className="relative rounded-xl overflow-hidden bg-black flex items-center justify-center">
                                  <video
                                    src={msg.mediaUrl || msg.content}
                                    className="rounded-xl max-h-64 w-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover/media:bg-black/20 transition-all">
                                    <div className="w-12 h-12 rounded-full bg-white/90 text-[#252B28] flex items-center justify-center shadow-lg transform group-hover/media:scale-110 transition-transform">
                                      <Play className="w-6 h-6 fill-[#252B28] ml-0.5" />
                                    </div>
                                  </div>
                                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Film className="w-3 h-3 text-purple-400" /> Fullscreen
                                  </span>
                                </div>
                                {msg.content && !msg.content.startsWith('data:') && (
                                  <p className="text-xs text-[#252B28] dark:text-[#F3F6F4] px-1 font-medium">{msg.content}</p>
                                )}
                              </div>
                            )}

                            {/* Tipo: ÁUDIO */}
                            {msg.messageType === 'audio' && (
                              <div
                                className={`p-2.5 px-4 rounded-full shadow-xs flex items-center gap-3 border ${
                                  isAgent
                                    ? 'bg-[#252B28] dark:bg-[#222926] text-white border-[#333E38]'
                                    : 'bg-white dark:bg-[#1D2320] border-[#E5E9E7] dark:border-[#2C3530] text-[#252B28] dark:text-[#F3F6F4]'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => togglePlayAudio(msg.id, msg.mediaUrl)}
                                  className="w-8 h-8 rounded-full bg-[#45D483] text-[#252B28] flex items-center justify-center shrink-0 hover:scale-105 transition-all shadow-xs"
                                  title={isAudioPlaying ? 'Pausar áudio' : 'Ouvir áudio gravado'}
                                >
                                  {isAudioPlaying ? (
                                    <Pause className="w-4 h-4 fill-[#252B28] text-[#252B28]" />
                                  ) : (
                                    <Play className="w-4 h-4 fill-[#252B28] text-[#252B28] ml-0.5" />
                                  )}
                                </button>

                                {/* Barras de Onda Sonora com Animação */}
                                <div className="flex items-center gap-0.5 h-6">
                                  {[6, 14, 22, 12, 18, 24, 16, 20, 10, 15, 22, 18, 14, 8, 16, 22, 12, 6].map(
                                    (h, i) => (
                                      <div
                                        key={i}
                                        style={{ height: `${h}px` }}
                                        className={`w-1 rounded-full transition-all ${
                                          isAudioPlaying
                                            ? 'bg-[#45D483] animate-pulse'
                                            : isAgent
                                            ? 'bg-white/40'
                                            : 'bg-[#AEB7B3]'
                                        }`}
                                      />
                                    )
                                  )}
                                </div>

                                <span className="text-xs font-mono font-bold text-[#45D483] shrink-0">
                                  {isAudioPlaying && audioCurrentTime > 0
                                    ? `${Math.floor(audioCurrentTime / 60)}:${Math.floor(audioCurrentTime % 60)
                                        .toString()
                                        .padStart(2, '0')}`
                                    : msg.content.includes('"')
                                    ? msg.content.replace('Mensagem de voz ', '')
                                    : '0:12'}
                                </span>
                              </div>
                            )}

                            {/* Tipo: DOCUMENTO / ARQUIVO */}
                            {msg.messageType === 'document' && (
                              <div
                                onClick={() =>
                                  setFullscreenMedia({
                                    isOpen: true,
                                    type: 'document',
                                    url: msg.mediaUrl || '',
                                    title: msg.content,
                                    size: (msg.metadata?.fileSize as string) || undefined
                                  })
                                }
                                className="group/doc bg-white dark:bg-[#1D2320] p-3 rounded-2xl border border-[#E5E9E7] dark:border-[#2C3530] shadow-xs flex items-center gap-3 max-w-sm cursor-pointer hover:border-[#3B82F6]/60 transition-all"
                                title="Clique para abrir o documento em tela cheia (Full Screen)"
                              >
                                <div className="w-11 h-11 rounded-xl bg-[#EAFBF2] dark:bg-[#1E3328] text-[#1E7E49] dark:text-[#45D483] flex items-center justify-center shrink-0 group-hover/doc:scale-105 transition-transform">
                                  <FileText className="w-5 h-5 text-[#3B82F6]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-[#252B28] dark:text-[#F3F6F4] truncate">{msg.content}</p>
                                  <p className="text-[10px] text-[#AEB7B3] flex items-center gap-1.5 mt-0.5">
                                    <span>Documento</span>
                                    {Boolean(msg.metadata?.fileSize) && (
                                      <>
                                        <span>•</span>
                                        <span className="font-mono">{String(msg.metadata?.fileSize)}</span>
                                      </>
                                    )}
                                    <span>•</span>
                                    <span className="text-[#3B82F6] font-semibold flex items-center gap-0.5">
                                      <Maximize2 className="w-2.5 h-2.5" /> Full Screen
                                    </span>
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setFullscreenMedia({
                                        isOpen: true,
                                        type: 'document',
                                        url: msg.mediaUrl || '',
                                        title: msg.content,
                                        size: (msg.metadata?.fileSize as string) || undefined
                                      });
                                    }}
                                    className="w-8 h-8 rounded-full bg-[#F1F3F2] dark:bg-[#252B28] hover:bg-[#3B82F6] hover:text-white text-[#252B28] dark:text-[#F3F6F4] flex items-center justify-center transition-colors"
                                    title="Visualizar em Tela Cheia"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (msg.mediaUrl) {
                                        const a = document.createElement('a');
                                        a.href = msg.mediaUrl;
                                        a.download = msg.content;
                                        a.click();
                                      } else {
                                        alert(`Baixando documento seguro: ${msg.content}`);
                                      }
                                    }}
                                    className="w-8 h-8 rounded-full bg-[#F1F3F2] dark:bg-[#252B28] hover:bg-[#E5E9E7] dark:hover:bg-[#303834] text-[#252B28] dark:text-[#F3F6F4] flex items-center justify-center transition-colors"
                                    title="Baixar Arquivo"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Botão minimalista de 3 pontinhos */}
                          <button
                            type="button"
                            onClick={(e) => handleDotsClick(e, msg)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full text-[#AEB7B3] hover:text-[#252B28] dark:hover:text-white hover:bg-[#F1F3F2] dark:hover:bg-[#252B28] transition-all self-center shrink-0 shadow-xs"
                            title="Opções (Fixar, Arquivar, Excluir)"
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Confirmação de Leitura para mensagens do Agente */}
                        {isAgent && (
                          <div className="flex items-center justify-end gap-1 text-[10px] text-[#AEB7B3]">
                            <span>Entregue</span>
                            <CheckCheck className="w-3 h-3 text-[#45D483]" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

              {/* Indicador de Digitação da IA */}
              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-[#AEB7B3] italic pl-11">
                  <span className="w-2 h-2 rounded-full bg-[#45D483] animate-ping" />
                  <span>A IA da Moonky está gerando resposta com base no conhecimento oficial...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Composer Flutuante Multifuncional */}
            <div className="p-4 bg-transparent shrink-0">
              {isRecording ? (
                // Modo Gravador de Áudio Ativo
                <div className="max-w-2xl mx-auto bg-white rounded-full border border-rose-300 p-2 px-5 shadow-lg flex items-center justify-between animate-in fade-in duration-200">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-xs font-bold text-rose-600">Gravando áudio...</span>
                    <span className="font-mono text-xs font-bold text-[#252B28] bg-rose-50 px-2 py-0.5 rounded-full">
                      {formatTimer(recordingSeconds)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCancelRecording}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold text-[#6C7671] hover:bg-[#F1F3F2] transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleFinishRecording}
                      className="bg-[#45D483] hover:bg-[#3bc275] text-[#252B28] font-bold text-xs px-4 py-2 rounded-full flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" /> Enviar Áudio
                    </button>
                  </div>
                </div>
              ) : (
                // Modo Composer Padrão
                <form
                  onSubmit={handleSendText}
                  className="max-w-2xl mx-auto bg-white dark:bg-[#181E1B] rounded-full border border-[#E5E9E7] dark:border-[#2A342E] p-1.5 pl-3 shadow-lg shadow-black/[0.04] flex items-center gap-2 focus-within:border-[#45D483] transition-colors relative"
                >
                  {/* Menu Popover de Anexos */}
                  {showAttachMenu && (
                    <div className="absolute bottom-14 left-4 bg-white dark:bg-[#1D2320] border border-[#E5E9E7] dark:border-[#2A342E] rounded-2xl p-2 shadow-xl flex flex-col gap-1 z-30 text-xs font-semibold animate-in slide-in-from-bottom-2 duration-150">
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#F1F3F2] dark:hover:bg-[#252B28] text-[#252B28] dark:text-[#F3F6F4] transition-colors text-left"
                      >
                        <ImageIcon className="w-4 h-4 text-[#45D483]" />
                        <span>Enviar Foto</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#F1F3F2] dark:hover:bg-[#252B28] text-[#252B28] dark:text-[#F3F6F4] transition-colors text-left"
                      >
                        <Film className="w-4 h-4 text-purple-400" />
                        <span>Enviar Vídeo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#F1F3F2] dark:hover:bg-[#252B28] text-[#252B28] dark:text-[#F3F6F4] transition-colors text-left"
                      >
                        <FileText className="w-4 h-4 text-[#3B82F6]" />
                        <span>Enviar Documento / PDF</span>
                      </button>
                    </div>
                  )}

                  {/* Botão de Anexo (+) */}
                  <button
                    type="button"
                    onClick={() => setShowAttachMenu(!showAttachMenu)}
                    className="w-8 h-8 rounded-full bg-[#F1F3F2] hover:bg-[#E5E9E7] text-[#252B28] flex items-center justify-center transition-colors shrink-0"
                    title="Anexar foto ou documento"
                  >
                    <Plus className="w-4 h-4 text-[#252B28]" />
                  </button>

                  {/* Botão de Envio de Imagem Rápido */}
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="w-8 h-8 rounded-full text-[#AEB7B3] hover:text-[#252B28] hover:bg-[#F1F3F2] flex items-center justify-center transition-colors shrink-0"
                    title="Enviar Foto"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>

                  {/* Campo de Texto */}
                  <input
                    type="text"
                    placeholder="Digite uma mensagem..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1 bg-transparent text-xs text-[#252B28] placeholder-[#AEB7B3] focus:outline-none px-2"
                  />

                  {/* Botão de Gravação de Áudio */}
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="w-8 h-8 rounded-full text-[#AEB7B3] hover:text-[#252B28] hover:bg-[#F1F3F2] flex items-center justify-center transition-colors shrink-0"
                    title="Gravar mensagem de áudio"
                  >
                    <Mic className="w-4 h-4 text-[#45D483]" />
                  </button>

                  {/* Botão Enviar Texto */}
                  <button
                    type="submit"
                    disabled={!messageInput.trim()}
                    className="w-9 h-9 rounded-full bg-[#45D483] hover:bg-[#3bc275] text-[#252B28] flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-xs"
                    title="Enviar mensagem"
                  >
                    <Send className="w-4 h-4 text-[#252B28]" />
                  </button>
                </form>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
            {!isAnyChannelConnected ? (
              <div className="max-w-lg w-full bg-white dark:bg-[#151917] border border-[#E5E9E7] dark:border-[#262E2A] rounded-3xl p-8 shadow-xs text-center space-y-6 animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-3xl bg-[#F7F9F8] dark:bg-[#1D2320] border border-[#E5E9E7] dark:border-[#2A342E] text-[#45D483] flex items-center justify-center mx-auto shadow-xs">
                  <Radio className="w-8 h-8 animate-pulse" />
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    <span>Canais Desconectados</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#252B28] dark:text-[#F3F6F4]">
                    Conecte o WhatsApp ou Instagram
                  </h3>
                  <p className="text-xs text-[#6C7671] dark:text-[#AEB7B3] leading-relaxed max-w-md mx-auto">
                    Suas conversas só aparecerão aqui em tempo real após conectar os canais oficiais via API WAME.
                  </p>
                </div>

                {/* Status dos Canais */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  <div className="p-3.5 bg-[#FAFBFB] dark:bg-[#19201C] border border-[#E5E9E7] dark:border-[#262E2A] rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#45D483]/15 text-[#45D483] flex items-center justify-center font-bold text-xs">
                        WA
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#252B28] dark:text-[#F3F6F4]">WhatsApp</p>
                        <p className="text-[10px] text-[#AEB7B3]">QR Code WAME</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      Desconectado
                    </span>
                  </div>

                  <div className="p-3.5 bg-[#FAFBFB] dark:bg-[#19201C] border border-[#E5E9E7] dark:border-[#262E2A] rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold text-xs">
                        IG
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#252B28] dark:text-[#F3F6F4]">Instagram</p>
                        <p className="text-[10px] text-[#AEB7B3]">Meta OAuth</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      Desconectado
                    </span>
                  </div>
                </div>

                {/* Webhook WAME Box */}
                <div className="p-4 bg-[#F7F9F8] dark:bg-[#1A211D] border border-[#E5E9E7] dark:border-[#2A342E] rounded-2xl text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#252B28] dark:text-[#F3F6F4] flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5 text-[#45D483]" />
                      <span>URL do Webhook Oficial WAME:</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyWebhookUrl}
                      className="text-[11px] font-bold text-[#1E7E49] dark:text-[#45D483] hover:underline flex items-center gap-1"
                    >
                      {copiedWebhook ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedWebhook ? 'Copiado!' : 'Copiar URL'}</span>
                    </button>
                  </div>
                  <div className="bg-white dark:bg-[#121614] border border-[#E5E9E7] dark:border-[#262E2A] rounded-xl px-3 py-2 text-[11px] font-mono text-[#252B28] dark:text-gray-200 truncate select-all">
                    https://moonkywpp-e9w2.vercel.app/api/webhooks/wame
                  </div>
                  <p className="text-[10px] text-[#6C7671] dark:text-[#AEB7B3]">
                    Cadastre este endpoint no painel da WAME após assinar para receber mensagens, fotos, vídeos, áudios e documentos reais diretamente aqui.
                  </p>
                </div>

                {/* Botão de Conectar */}
                {onOpenConnectModal && (
                  <button
                    type="button"
                    onClick={onOpenConnectModal}
                    className="w-full py-3 px-5 rounded-2xl bg-[#45D483] hover:bg-[#3bc275] text-[#252B28] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Conectar WhatsApp / Instagram agora</span>
                  </button>
                )}
              </div>
            ) : conversations.length === 0 ? (
              <div className="max-w-md w-full text-center space-y-4 p-8 bg-white dark:bg-[#151917] border border-[#E5E9E7] dark:border-[#262E2A] rounded-3xl">
                <div className="w-12 h-12 rounded-full bg-[#EAFBF2] dark:bg-[#45D483]/15 text-[#45D483] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#252B28] dark:text-[#F3F6F4]">
                    Canal Conectado com Sucesso!
                  </h3>
                  <p className="text-xs text-[#6C7671] dark:text-[#AEB7B3] mt-1 leading-relaxed">
                    Aguardando as primeiras mensagens de clientes no WhatsApp ou Instagram Direct. Assim que alguém enviar uma mensagem, ela aparecerá aqui instantaneamente.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center text-[#AEB7B3] space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#F1F3F2] dark:bg-[#1D2320] flex items-center justify-center mx-auto">
                  <Radio className="w-5 h-5 text-[#AEB7B3]" />
                </div>
                <p className="text-sm font-semibold text-[#252B28] dark:text-gray-300">
                  Selecione uma conversa
                </p>
                <p className="text-xs text-[#AEB7B3]">
                  Escolha um contato na lista à esquerda para iniciar o atendimento
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===================================================================
          COLUNA 3: GAVETA LATERAL DIREITA (Detalhes do Contato & Mídias)
          =================================================================== */}
      {rightDrawerOpen && activeConversation && (
        <div className="w-[280px] md:w-[300px] bg-white dark:bg-[#151917] border-l border-[#E5E9E7]/80 dark:border-[#262E2A] flex flex-col justify-between shrink-0 select-none overflow-y-auto">
          <div>
            <div className="h-16 px-5 border-b border-[#F1F3F2] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#252B28]">Detalhes do Contato</h3>
              <button
                onClick={() => setRightDrawerOpen(false)}
                className="w-7 h-7 rounded-full text-[#AEB7B3] hover:text-[#252B28] hover:bg-[#F1F3F2] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Perfil */}
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
              <p className="text-xs text-[#AEB7B3]">
                {activeConversation.channelType === 'whatsapp'
                  ? activeConversation.contact.phone || '+55 11 98877-1122'
                  : `@${activeConversation.contact.instagramUsername || 'contato'}`}
              </p>

              <div className="flex items-center justify-center gap-1.5 pt-1">
                <span className="bg-[#EAFBF2] text-[#1E7E49] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {activeConversation.channelType === 'whatsapp' ? 'WhatsApp Oficial' : 'Instagram Direct'}
                </span>
              </div>
            </div>

            {/* Abas: Mídia / Arquivos / Áudios / Links / Notas */}
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-1 p-1 bg-[#F1F3F2] rounded-full text-xs font-semibold">
                {[
                  { id: 'media', label: 'Mídia' },
                  { id: 'files', label: 'Arquivos' },
                  { id: 'voice', label: 'Áudios' },
                  { id: 'links', label: 'Links' },
                  { id: 'notes', label: 'Notas' }
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

              {/* Aba Mídia: Grid 4 Colunas */}
              {rightTab === 'media' && (
                <div className="grid grid-cols-4 gap-1.5">
                  {mediaGallery.map((m) => (
                    <div
                      key={m.id}
                      onClick={() =>
                        setFullscreenMedia({
                          isOpen: true,
                          type: 'image',
                          url: m.url,
                          title: 'Foto Compartilhada'
                        })
                      }
                      className="group/thumb relative aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-all ring-1 ring-black/5 dark:ring-white/10"
                      title="Clique para abrir em tela cheia (Full Screen)"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.url} alt="Mídia compartilhada" className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-200" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Aba Arquivos */}
              {rightTab === 'files' && (
                <div className="space-y-2 text-xs">
                  <div
                    onClick={() =>
                      setFullscreenMedia({
                        isOpen: true,
                        type: 'document',
                        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                        title: 'Tabela_Precos_2026.pdf',
                        size: '2.4 MB'
                      })
                    }
                    className="p-2.5 bg-[#F7F9F8] dark:bg-[#1D2320] rounded-xl border border-[#E5E9E7] dark:border-[#2C3530] flex items-center justify-between cursor-pointer hover:border-[#3B82F6]/50 transition-all group/file"
                    title="Clique para abrir em tela cheia (Full Screen)"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-[#3B82F6] shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-[#252B28] dark:text-[#F3F6F4] truncate">Tabela_Precos_2026.pdf</p>
                        <p className="text-[10px] text-[#AEB7B3]">2.4 MB • Clique p/ Tela Cheia</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Maximize2 className="w-3.5 h-3.5 text-[#AEB7B3] group-hover/file:text-[#3B82F6] transition-colors" />
                    </div>
                  </div>
                </div>
              )}

              {/* Aba Áudios */}
              {rightTab === 'voice' && (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-[#F7F9F8] rounded-xl border border-[#E5E9E7] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-[#45D483]" />
                      <div>
                        <p className="font-semibold text-[#252B28]">Mensagem de voz (12s)</p>
                        <p className="text-[10px] text-[#AEB7B3]">Enviada hoje às 14:30</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Aba Notas */}
              {rightTab === 'notes' && (
                <div className="space-y-3 text-xs">
                  <div className="space-y-1.5">
                    <textarea
                      rows={2}
                      placeholder="Adicionar nota interna privada..."
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      className="w-full bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl p-2.5 text-xs text-[#252B28] focus:outline-none focus:border-[#45D483]"
                    />
                    <button
                      onClick={handleSaveNote}
                      className="w-full bg-[#252B28] text-white py-1.5 rounded-xl font-semibold text-xs hover:bg-black transition-colors"
                    >
                      Salvar Nota Interna
                    </button>
                  </div>

                  <div className="space-y-2 pt-2">
                    {activeNotes.map((n) => (
                      <div key={n.id} className="p-2.5 bg-[#F7F9F8] rounded-xl border border-[#E5E9E7]">
                        <p className="text-[#252B28]">{n.content}</p>
                        <p className="text-[10px] text-[#AEB7B3] mt-1">Por {n.author.name} • {n.createdAt}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL DE CHAMADA AO VIVO (Voz / Vídeo para WhatsApp ou Instagram)
          =================================================================== */}
      {activeCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none animate-in fade-in duration-200">
          <div className="bg-[#181D1A] text-white rounded-[32px] w-full max-w-md border border-[#2D3832] shadow-2xl overflow-hidden p-6 text-center space-y-6">
            {/* Header da Chamada */}
            <div className="flex items-center justify-between text-xs text-[#AEB7B3]">
              <span className="flex items-center gap-1.5 font-semibold text-[#45D483]">
                <span className="w-2 h-2 rounded-full bg-[#45D483] animate-ping" />
                {activeCall.type === 'video' ? 'Chamada de Vídeo' : 'Chamada de Voz'}
              </span>
              <span className="bg-white/10 px-2.5 py-0.5 rounded-full font-mono text-white">
                {formatTimer(callDuration)}
              </span>
            </div>

            {/* Avatar / Câmera */}
            <div className="relative py-4">
              <div className="w-28 h-28 rounded-full mx-auto relative flex items-center justify-center ring-4 ring-[#45D483]/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeCall.contact.avatarUrl}
                  alt={activeCall.contact.name}
                  className="w-24 h-24 rounded-full object-cover shadow-xl"
                />
                <span className="absolute -bottom-1 right-2 w-7 h-7 rounded-full bg-[#25D366] text-white flex items-center justify-center text-xs font-bold ring-2 ring-[#181D1A]">
                  {activeCall.channelType === 'whatsapp' ? 'WA' : 'IG'}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mt-4">{activeCall.contact.name}</h3>
              <p className="text-xs text-[#AEB7B3] mt-0.5">
                {activeCall.channelType === 'whatsapp'
                  ? `Ligando via WhatsApp (${activeCall.contact.phone || '+55 11 98877-1122'})`
                  : `Ligando via Instagram (@${activeCall.contact.instagramUsername || 'contato'})`}
              </p>
            </div>

            {/* Ação de Abrir Diretamente no App Oficial */}
            <button
              onClick={handleOpenChannelDirectCall}
              className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold py-2.5 rounded-full flex items-center justify-center gap-2 transition-all border border-white/10"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#45D483]" />
              <span>
                {activeCall.channelType === 'whatsapp'
                  ? 'Abrir Chamada no WhatsApp'
                  : 'Abrir no Instagram Direct'}
              </span>
            </button>

            {/* Controles da Chamada */}
            <div className="flex items-center justify-center gap-4 pt-2">
              {/* Mute */}
              <button
                onClick={() => setIsCallMuted(!isCallMuted)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isCallMuted ? 'bg-rose-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title={isCallMuted ? 'Desativar Mudo' : 'Ativar Mudo'}
              >
                {isCallMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Desligar */}
              <button
                onClick={handleEndCall}
                className="w-14 h-14 rounded-full bg-[#FF453A] hover:bg-rose-600 text-white flex items-center justify-center transition-transform hover:scale-105 shadow-lg shadow-rose-600/30"
                title="Encerrar Ligação"
              >
                <PhoneOff className="w-6 h-6" />
              </button>

              {/* Vídeo On/Off */}
              {activeCall.type === 'video' && (
                <button
                  onClick={() => setIsCallVideoOff(!isCallVideoOff)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    isCallVideoOff ? 'bg-rose-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title={isCallVideoOff ? 'Ligar Câmera' : 'Desligar Câmera'}
                >
                  {isCallVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MENU DE CONTEXTO MINIMALISTA DE MENSAGENS (FIXAR, ARQUIVAR, EXCLUIR)
          =================================================================== */}
      {contextMenu.isOpen && contextMenu.message && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-50 bg-white dark:bg-[#1D2320] border border-[#E5E9E7] dark:border-[#2C3530] rounded-2xl shadow-xl shadow-black/10 py-1.5 w-48 animate-in fade-in zoom-in-95 duration-100 select-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Opção Fixar / Desafixar */}
          <button
            type="button"
            onClick={() => handleTogglePin(contextMenu.message!)}
            className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-[#252B28] dark:text-gray-200 hover:bg-[#F1F3F2] dark:hover:bg-[#262E2A] transition-colors text-left"
          >
            <span className="flex items-center gap-2.5">
              {contextMenu.message.isPinned ? (
                <PinOff className="w-4 h-4 text-[#AEB7B3]" />
              ) : (
                <Pin className="w-4 h-4 text-[#45D483]" />
              )}
              <span>{contextMenu.message.isPinned ? 'Desafixar do topo' : 'Fixar no topo'}</span>
            </span>
            {!contextMenu.message.isPinned && (
              <span className="text-[10px] text-[#AEB7B3] font-mono">
                {pinnedMessages.length}/5
              </span>
            )}
          </button>

          {/* Opção Arquivar / Desarquivar */}
          <button
            type="button"
            onClick={() => handleToggleArchive(contextMenu.message!)}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#252B28] dark:text-gray-200 hover:bg-[#F1F3F2] dark:hover:bg-[#262E2A] transition-colors text-left"
          >
            <Archive className="w-4 h-4 text-[#6C7671]" />
            <span>{contextMenu.message.isArchived ? 'Desarquivar' : 'Arquivar'}</span>
          </button>

          <div className="h-[1px] bg-[#E5E9E7] dark:bg-[#2C3530] my-1" />

          {/* Opção Excluir */}
          <button
            type="button"
            onClick={() => handleDelete(contextMenu.message!)}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left"
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
            <span>Excluir</span>
          </button>
        </div>
      )}

      {/* ===================================================================
          MENU DE CONTEXTO MINIMALISTA DA CONVERSA (FIXAR, ARQUIVAR, EXCLUIR)
          =================================================================== */}
      {convContextMenu.isOpen && convContextMenu.conversation && (
        <div
          style={{ top: `${convContextMenu.y}px`, left: `${convContextMenu.x}px` }}
          className="fixed z-50 bg-white dark:bg-[#1D2320] border border-[#E5E9E7] dark:border-[#2C3530] rounded-2xl shadow-xl shadow-black/15 py-1.5 w-52 animate-in fade-in zoom-in-95 duration-100 select-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Opção Fixar / Desafixar Conversa (até 5) */}
          <button
            type="button"
            onClick={() => handleTogglePinConv(convContextMenu.conversation!)}
            className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-[#252B28] dark:text-gray-200 hover:bg-[#F1F3F2] dark:hover:bg-[#262E2A] transition-colors text-left"
          >
            <span className="flex items-center gap-2.5">
              {convContextMenu.conversation.isPinned ? (
                <PinOff className="w-4 h-4 text-[#AEB7B3]" />
              ) : (
                <Pin className="w-4 h-4 text-[#45D483]" />
              )}
              <span>
                {convContextMenu.conversation.isPinned ? 'Desafixar do topo' : 'Fixar conversa no topo'}
              </span>
            </span>
            {!convContextMenu.conversation.isPinned && (
              <span className="text-[10px] text-[#AEB7B3] font-mono">
                {pinnedConversationsCount}/5
              </span>
            )}
          </button>

          {/* Opção Arquivar / Desarquivar Conversa */}
          <button
            type="button"
            onClick={() => handleToggleArchiveConv(convContextMenu.conversation!)}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#252B28] dark:text-gray-200 hover:bg-[#F1F3F2] dark:hover:bg-[#262E2A] transition-colors text-left"
          >
            <Archive className="w-4 h-4 text-[#6C7671]" />
            <span>
              {convContextMenu.conversation.isArchived ? 'Desarquivar conversa' : 'Arquivar conversa'}
            </span>
          </button>

          <div className="h-[1px] bg-[#E5E9E7] dark:bg-[#2C3530] my-1" />

          {/* Opção Excluir Conversa */}
          <button
            type="button"
            onClick={() => handleDeleteConv(convContextMenu.conversation!)}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left"
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
            <span>Excluir conversa</span>
          </button>
        </div>
      )}

      {/* ===================================================================
          TOAST DE ALERTA: LIMITE DE FIXAÇÃO
          =================================================================== */}
      {pinToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#252B28] text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top-3">
          <span className="w-2 h-2 rounded-full bg-[#45D483]" />
          <span>{pinToast}</span>
        </div>
      )}

      {/* ===================================================================
          MODAL FULL SCREEN / LIGHTBOX (FOTO, VÍDEO E DOCUMENTO)
          =================================================================== */}
      {fullscreenMedia.isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between animate-in fade-in duration-200 select-none"
          onClick={() => setFullscreenMedia({ isOpen: false, type: 'image', url: '', title: '' })}
        >
          {/* Barra Superior do Fullscreen */}
          <div
            className="h-16 px-6 bg-black/40 border-b border-white/10 flex items-center justify-between shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                {fullscreenMedia.type === 'image' && <ImageIcon className="w-5 h-5 text-[#45D483]" />}
                {fullscreenMedia.type === 'video' && <Film className="w-5 h-5 text-purple-400" />}
                {fullscreenMedia.type === 'document' && <FileText className="w-5 h-5 text-[#3B82F6]" />}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white truncate max-w-md">
                  {fullscreenMedia.title}
                </h3>
                <p className="text-[11px] text-[#AEB7B3] flex items-center gap-2">
                  <span className="capitalize">
                    {fullscreenMedia.type === 'image'
                      ? 'Imagem em alta resolução'
                      : fullscreenMedia.type === 'video'
                      ? 'Vídeo Full HD'
                      : 'Documento Anexo'}
                  </span>
                  {fullscreenMedia.size && (
                    <>
                      <span>•</span>
                      <span className="font-mono">{fullscreenMedia.size}</span>
                    </>
                  )}
                  <span>•</span>
                  <span className="text-[#45D483]">Armazenado no Banco Supabase</span>
                </p>
              </div>
            </div>

            {/* Ações da Barra Superior */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Botão Baixar */}
              {fullscreenMedia.url && (
                <a
                  href={fullscreenMedia.url}
                  download={fullscreenMedia.title || 'arquivo'}
                  onClick={(e) => e.stopPropagation()}
                  className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10"
                  title="Baixar arquivo"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Baixar</span>
                </a>
              )}

              {/* Botão Abrir em Nova Aba */}
              {fullscreenMedia.url && !fullscreenMedia.url.startsWith('data:') && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(fullscreenMedia.url, '_blank');
                  }}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
                  title="Abrir em Nova Aba"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}

              {/* Botão Fechar */}
              <button
                type="button"
                onClick={() => setFullscreenMedia({ isOpen: false, type: 'image', url: '', title: '' })}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-rose-500 text-white flex items-center justify-center transition-colors ml-2"
                title="Fechar (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Área Central de Visualização Fullscreen */}
          <div
            className="flex-1 flex items-center justify-center p-4 md:p-8 min-h-0 overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Visualização de FOTO */}
            {fullscreenMedia.type === 'image' && (
              <div className="relative max-h-full max-w-full flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={fullscreenMedia.url}
                  alt={fullscreenMedia.title}
                  className="max-h-[82vh] max-w-[92vw] object-contain rounded-2xl shadow-2xl shadow-black ring-1 ring-white/10"
                />
              </div>
            )}

            {/* Visualização de VÍDEO */}
            {fullscreenMedia.type === 'video' && (
              <div className="relative max-h-full max-w-full flex items-center justify-center">
                <video
                  src={fullscreenMedia.url}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[82vh] max-w-[92vw] rounded-2xl shadow-2xl shadow-black ring-1 ring-white/10 bg-black"
                />
              </div>
            )}

            {/* Visualização de DOCUMENTO */}
            {fullscreenMedia.type === 'document' && (
              <div className="w-full max-w-4xl h-[80vh] flex flex-col bg-[#1D2320] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                {fullscreenMedia.url && (fullscreenMedia.url.includes('pdf') || fullscreenMedia.url.startsWith('data:application/pdf')) ? (
                  <iframe
                    src={fullscreenMedia.url}
                    className="w-full h-full border-0 rounded-2xl bg-white"
                    title={fullscreenMedia.title}
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                    <div className="w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-[#3B82F6] flex items-center justify-center">
                      <FileText className="w-10 h-10" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">{fullscreenMedia.title}</h4>
                      <p className="text-xs text-[#AEB7B3] mt-1">
                        Documento salvo com integridade no banco de dados Supabase
                      </p>
                      {fullscreenMedia.size && (
                        <span className="inline-block mt-2 font-mono text-xs font-semibold bg-white/10 text-white px-3 py-1 rounded-full">
                          Tamanho: {fullscreenMedia.size}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                      {fullscreenMedia.url ? (
                        <a
                          href={fullscreenMedia.url}
                          download={fullscreenMedia.title}
                          className="px-5 py-2.5 rounded-full bg-[#45D483] hover:bg-[#3bc275] text-[#252B28] font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
                        >
                          <Download className="w-4 h-4" /> Baixar Documento
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => alert(`Iniciando download seguro de: ${fullscreenMedia.title}`)}
                          className="px-5 py-2.5 rounded-full bg-[#45D483] hover:bg-[#3bc275] text-[#252B28] font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
                        >
                          <Download className="w-4 h-4" /> Baixar Documento
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Barra Inferior com Informações e Atalho */}
          <div
            className="h-12 px-6 bg-black/40 border-t border-white/10 flex items-center justify-between text-xs text-[#AEB7B3] shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <span>Pressione <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">ESC</kbd> ou clique no X para fechar a tela cheia</span>
            <span className="hidden sm:inline font-mono">Visualizador Oficial Moonkyzap Omnichannel</span>
          </div>
        </div>
      )}
    </div>
  );
}
