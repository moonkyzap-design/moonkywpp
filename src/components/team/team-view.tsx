'use client';

// ===================================================================
// MOONKY GESTÃO DE EQUIPE & MATRIZ RBAC
// Papéis de Proprietário, Admin, Supervisor, Agente, convites e permissões
// 100% em Português Brasil
// ===================================================================

import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Mail,
  CheckCircle2,
  Lock,
  MoreVertical,
  Activity
} from 'lucide-react';
import { useMoonky } from '@/context/moonky-store';
import { UserRole } from '@/types';

export function TeamView() {
  const { teamMembers } = useMoonky();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('agent');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    alert(`Convite enviado para ${inviteEmail} com o perfil: ${inviteRole}`);
    setInviteEmail('');
    setShowInviteModal(false);
  };

  const roleBadgeStyles: Record<UserRole, string> = {
    owner: 'bg-purple-50 text-purple-800 border-purple-200',
    admin: 'bg-[#252B28] text-white',
    supervisor: 'bg-blue-50 text-blue-800 border-blue-200',
    agent: 'bg-[#EAFBF2] text-[#1E7E49] border-emerald-200'
  };

  const roleLabels: Record<UserRole, string> = {
    owner: 'Proprietário',
    admin: 'Administrador',
    supervisor: 'Supervisor',
    agent: 'Agente de Suporte'
  };

  const permissionsMatrix = [
    { permission: 'Visualizar e responder conversas no Inbox unificado', owner: true, admin: true, supervisor: true, agent: true },
    { permission: 'Atribuir e transferir conversas entre membros da equipe', owner: true, admin: true, supervisor: true, agent: true },
    { permission: 'Adicionar notas internas & tags do CRM aos contatos', owner: true, admin: true, supervisor: true, agent: true },
    { permission: 'Gerenciar Base de Conhecimento e instruções de prompt da IA', owner: true, admin: true, supervisor: true, agent: false },
    { permission: 'Criar e ativar regras de fluxos de automação', owner: true, admin: true, supervisor: true, agent: false },
    { permission: 'Configurar chaves de instâncias WAME de WhatsApp e Instagram', owner: true, admin: true, supervisor: false, agent: false },
    { permission: 'Gerenciar cobrança, planos e convidar membros para a equipe', owner: true, admin: true, supervisor: false, agent: false }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#F1F3F2] p-8 space-y-6 select-none">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#252B28] tracking-tight">Equipe & Permissões</h1>
          <p className="text-xs text-[#6C7671] mt-1">
            Gerencie operadores, controle de acesso baseado em funções (RBAC) e distribuição de tickets.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-[#252B28] hover:bg-[#1a1f1d] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start"
        >
          <UserPlus className="w-3.5 h-3.5 text-[#45D483]" />
          <span>Convidar Membro da Equipe</span>
        </button>
      </div>

      {/* Tabela de Membros */}
      <div className="bg-white dark:bg-[#151917] rounded-2xl border border-[#E5E9E7] dark:border-[#262E2A] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#F1F3F2] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#252B28]">Membros Ativos da Equipe</h2>
            <p className="text-xs text-[#AEB7B3]">
              {teamMembers.length} licenças utilizadas no Plano Growth
            </p>
          </div>
          <span className="text-[11px] font-bold text-[#1E7E49] bg-[#EAFBF2] px-2.5 py-1 rounded-full">
            4 / 5 Licenças Ocupadas
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-[#F7F9F8] border-b border-[#E5E9E7] text-[#AEB7B3] uppercase text-[10px] font-bold tracking-wider">
            <tr>
              <th className="py-3 px-6">Membro</th>
              <th className="py-3 px-6">Função</th>
              <th className="py-3 px-6">Conversas Ativas</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6">Última Atividade</th>
              <th className="py-3 px-6 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F3F2]">
            {teamMembers.map((member) => (
              <tr key={member.id} className="hover:bg-[#F7F9F8] transition-colors">
                <td className="py-3.5 px-6">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={member.avatarUrl}
                      alt={member.fullName}
                      className="w-8 h-8 rounded-full object-cover border border-[#E5E9E7]"
                    />
                    <div>
                      <p className="font-bold text-[#252B28]">{member.fullName}</p>
                      <p className="text-[10px] text-[#AEB7B3]">{member.email}</p>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-6">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      roleBadgeStyles[member.role]
                    }`}
                  >
                    {roleLabels[member.role] || member.role}
                  </span>
                </td>

                <td className="py-3.5 px-6 font-bold text-[#252B28]">
                  {member.assignedChatsCount} atribuídas
                </td>

                <td className="py-3.5 px-6">
                  <span className="inline-flex items-center gap-1.5 text-[#1E7E49] font-semibold text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#45D483]" />
                    Online
                  </span>
                </td>

                <td className="py-3.5 px-6 text-[#6C7671]">{member.lastActiveAt}</td>

                <td className="py-3.5 px-6 text-right">
                  <button className="text-xs font-semibold text-[#252B28] hover:underline">
                    Editar Função
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Matriz RBAC */}
      <div className="bg-white dark:bg-[#151917] rounded-2xl border border-[#E5E9E7] dark:border-[#262E2A] p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-[#252B28]">Matriz de Controle de Acesso por Função (RBAC)</h2>
          <p className="text-xs text-[#AEB7B3] mt-0.5">
            Permissões estritas validadas no servidor via Supabase Row-Level Security (RLS).
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9F8] border-b border-[#E5E9E7] text-[#AEB7B3] uppercase text-[10px] font-bold">
              <tr>
                <th className="py-2.5 px-4">Módulo de Permissão</th>
                <th className="py-2.5 px-4 text-center">Proprietário</th>
                <th className="py-2.5 px-4 text-center">Administrador</th>
                <th className="py-2.5 px-4 text-center">Supervisor</th>
                <th className="py-2.5 px-4 text-center">Agente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F3F2]">
              {permissionsMatrix.map((row, i) => (
                <tr key={i} className="hover:bg-[#F7F9F8]">
                  <td className="py-2.5 px-4 font-medium text-[#252B28]">{row.permission}</td>
                  <td className="py-2.5 px-4 text-center">
                    {row.owner ? (
                      <CheckCircle2 className="w-4 h-4 text-[#45D483] mx-auto" />
                    ) : (
                      <span className="text-[#AEB7B3]">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {row.admin ? (
                      <CheckCircle2 className="w-4 h-4 text-[#45D483] mx-auto" />
                    ) : (
                      <span className="text-[#AEB7B3]">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {row.supervisor ? (
                      <CheckCircle2 className="w-4 h-4 text-[#45D483] mx-auto" />
                    ) : (
                      <span className="text-[#AEB7B3]">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {row.agent ? (
                      <CheckCircle2 className="w-4 h-4 text-[#45D483] mx-auto" />
                    ) : (
                      <span className="text-[#AEB7B3]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Convidar Membro */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#151917] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#E5E9E7] dark:border-[#262E2A]">
            <h3 className="text-base font-bold text-[#252B28]">Convidar Novo Membro da Equipe</h3>
            <form onSubmit={handleInvite} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#252B28] block mb-1">E-mail Corporativo</label>
                <input
                  type="email"
                  placeholder="atendente@empresa.com.br"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl px-3 py-2 text-xs text-[#252B28] focus:outline-none focus:border-[#45D483]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-[#252B28] block mb-1">Função Atribuída</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl px-3 py-2 text-xs text-[#252B28] focus:outline-none"
                >
                  <option value="agent">Agente de Suporte</option>
                  <option value="supervisor">Supervisor de Equipe</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F1F3F2]">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6C7671] hover:bg-[#F1F3F2]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#252B28] text-white hover:bg-[#1a1f1d] px-4 py-2 rounded-xl text-xs font-semibold shadow-xs"
                >
                  Enviar Convite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
