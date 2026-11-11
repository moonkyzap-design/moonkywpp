'use client';

// ===================================================================
// MOONKY TEAM & RBAC MANAGEMENT
// Owner, Admin, Supervisor, Agent roles, invitations, permissions matrix
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
    alert(`Invitation dispatched to ${inviteEmail} with role: ${inviteRole}`);
    setInviteEmail('');
    setShowInviteModal(false);
  };

  const roleBadgeStyles: Record<UserRole, string> = {
    owner: 'bg-purple-50 text-purple-800 border-purple-200',
    admin: 'bg-[#252B28] text-white',
    supervisor: 'bg-blue-50 text-blue-800 border-blue-200',
    agent: 'bg-[#EAFBF2] text-[#1E7E49] border-emerald-200'
  };

  const permissionsMatrix = [
    { permission: 'View and respond to Inbox conversations', owner: true, admin: true, supervisor: true, agent: true },
    { permission: 'Assign & transfer conversations to team members', owner: true, admin: true, supervisor: true, agent: true },
    { permission: 'Add internal notes & CRM customer tags', owner: true, admin: true, supervisor: true, agent: true },
    { permission: 'Manage AI Knowledge Base & prompt instructions', owner: true, admin: true, supervisor: true, agent: false },
    { permission: 'Create & activate automated workflow rules', owner: true, admin: true, supervisor: true, agent: false },
    { permission: 'Configure WAME WhatsApp & Instagram instance keys', owner: true, admin: true, supervisor: false, agent: false },
    { permission: 'Manage billing, subscriptions & invite team users', owner: true, admin: true, supervisor: false, agent: false }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#F1F3F2] p-8 space-y-6 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#252B28] tracking-tight">Team & Permissions</h1>
          <p className="text-xs text-[#6C7671] mt-1">
            Manage agents, role-based access control (RBAC), and team assignments.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-[#252B28] hover:bg-[#1a1f1d] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start"
        >
          <UserPlus className="w-3.5 h-3.5 text-[#45D483]" />
          <span>Invite Team Member</span>
        </button>
      </div>

      {/* Team Members Table */}
      <div className="bg-white rounded-2xl border border-[#E5E9E7] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#F1F3F2] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#252B28]">Active Team Members</h2>
            <p className="text-xs text-[#AEB7B3]">
              {teamMembers.length} seats utilized in current Growth Plan
            </p>
          </div>
          <span className="text-[11px] font-bold text-[#1E7E49] bg-[#EAFBF2] px-2.5 py-1 rounded-full">
            4 / 5 Seats Used
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-[#F7F9F8] border-b border-[#E5E9E7] text-[#AEB7B3] uppercase text-[10px] font-bold tracking-wider">
            <tr>
              <th className="py-3 px-6">Member</th>
              <th className="py-3 px-6">Role</th>
              <th className="py-3 px-6">Active Chats</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6">Last Active</th>
              <th className="py-3 px-6 text-right">Actions</th>
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
                    {member.role}
                  </span>
                </td>

                <td className="py-3.5 px-6 font-bold text-[#252B28]">
                  {member.assignedChatsCount} assigned
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
                    Edit Role
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role-Based Permissions Matrix */}
      <div className="bg-white rounded-2xl border border-[#E5E9E7] p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-[#252B28]">Role-Based Access Control (RBAC) Matrix</h2>
          <p className="text-xs text-[#AEB7B3] mt-0.5">
            Strict permissions enforced server-side via Supabase Row-Level Security.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9F8] border-b border-[#E5E9E7] text-[#AEB7B3] uppercase text-[10px] font-bold">
              <tr>
                <th className="py-2.5 px-4">Permission Module</th>
                <th className="py-2.5 px-4 text-center">Owner</th>
                <th className="py-2.5 px-4 text-center">Admin</th>
                <th className="py-2.5 px-4 text-center">Supervisor</th>
                <th className="py-2.5 px-4 text-center">Agent</th>
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

      {/* Modal: Invite Team Member */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#E5E9E7]">
            <h3 className="text-base font-bold text-[#252B28]">Invite New Team Member</h3>
            <form onSubmit={handleInvite} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#252B28] block mb-1">Corporate Email</label>
                <input
                  type="email"
                  placeholder="agent@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl px-3 py-2 text-xs text-[#252B28] focus:outline-none focus:border-[#45D483]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-[#252B28] block mb-1">Role Assignment</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl px-3 py-2 text-xs text-[#252B28] focus:outline-none"
                >
                  <option value="agent">Support Agent</option>
                  <option value="supervisor">Team Supervisor</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F1F3F2]">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6C7671] hover:bg-[#F1F3F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#252B28] text-white hover:bg-[#1a1f1d] px-4 py-2 rounded-xl text-xs font-semibold shadow-xs"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
