'use client';

// ===================================================================
// MOONKY CONTACTS & CRM VIEW
// Centralized contact directory, lead staging, tags, and custom fields
// ===================================================================

import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Tag,
  Mail,
  Phone,
  MessageSquare,
  ChevronRight,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { useMoonky } from '@/context/moonky-store';
import { Contact, LeadStatus } from '@/types';
import { NavigationTab } from '@/components/layout/sidebar';

interface ContactsViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export function ContactsView({ onNavigate }: ContactsViewProps) {
  const { contacts, addContact, setActiveConversationId, conversations } = useMoonky();
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New contact form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [email, setEmail] = useState('');
  const [leadStatus, setLeadStatus] = useState<LeadStatus>('lead');

  const filteredContacts = contacts.filter((c) => {
    if (selectedStatus !== 'all' && c.leadStatus !== selectedStatus) return false;
    if (search.trim().length > 0) {
      const q = search.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchPhone = c.phone?.toLowerCase().includes(q);
      const matchEmail = c.email?.toLowerCase().includes(q);
      const matchIg = c.instagramUsername?.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchEmail && !matchIg) return false;
    }
    return true;
  });

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addContact({
      name: name.trim(),
      phone: phone.trim() || undefined,
      instagramUsername: instagram.trim() || undefined,
      email: email.trim() || undefined,
      leadStatus
    });

    setName('');
    setPhone('');
    setInstagram('');
    setEmail('');
    setShowAddModal(false);
  };

  const handleOpenChat = (contact: Contact) => {
    const existingConv = conversations.find((c) => c.contact.id === contact.id);
    if (existingConv) {
      setActiveConversationId(existingConv.id);
    }
    onNavigate('inbox');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F1F3F2] p-8 space-y-6 select-none">
      {/* Header & New Contact Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#252B28] tracking-tight">Customer CRM</h1>
          <p className="text-xs text-[#6C7671] mt-1">
            Manage unified profiles across WhatsApp and Instagram Direct.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#252B28] hover:bg-[#1a1f1d] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start"
        >
          <Plus className="w-3.5 h-3.5 text-[#45D483]" />
          <span>New Contact</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E5E9E7] p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#AEB7B3]" />
          <input
            type="text"
            placeholder="Search by name, phone, email, @instagram..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#252B28] focus:outline-none focus:border-[#45D483]"
          />
        </div>

        {/* Lead Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'customer', 'lead', 'qualified', 'churned'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all shrink-0 ${
                selectedStatus === status
                  ? 'bg-[#252B28] text-white shadow-xs'
                  : 'bg-[#F7F9F8] text-[#6C7671] hover:text-[#252B28]'
              }`}
            >
              {status === 'all' ? 'All Leads' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Contacts Table Card */}
      <div className="bg-white rounded-2xl border border-[#E5E9E7] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9F8] border-b border-[#E5E9E7] text-[#AEB7B3] uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-6">Contact Name</th>
                <th className="py-3 px-6">Phone / WhatsApp</th>
                <th className="py-3 px-6">Instagram Direct</th>
                <th className="py-3 px-6">Lead Stage</th>
                <th className="py-3 px-6">Tags</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F3F2]">
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-[#F7F9F8] transition-colors">
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={contact.avatarUrl}
                        alt={contact.name}
                        className="w-8 h-8 rounded-full object-cover border border-[#E5E9E7]"
                      />
                      <div>
                        <p className="font-bold text-[#252B28]">{contact.name}</p>
                        <p className="text-[10px] text-[#AEB7B3]">{contact.email || 'No email registered'}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-6 font-medium text-[#252B28]">
                    {contact.phone || <span className="text-[#AEB7B3]">—</span>}
                  </td>

                  <td className="py-3.5 px-6 font-medium text-[#252B28]">
                    {contact.instagramUsername ? (
                      `@${contact.instagramUsername}`
                    ) : (
                      <span className="text-[#AEB7B3]">—</span>
                    )}
                  </td>

                  <td className="py-3.5 px-6">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                        contact.leadStatus === 'customer'
                          ? 'bg-[#EAFBF2] text-[#1E7E49]'
                          : contact.leadStatus === 'qualified'
                          ? 'bg-blue-50 text-blue-700'
                          : contact.leadStatus === 'churned'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-[#F1F3F2] text-[#252B28]'
                      }`}
                    >
                      {contact.leadStatus}
                    </span>
                  </td>

                  <td className="py-3.5 px-6">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.map((t) => (
                        <span
                          key={t.id}
                          className="bg-[#F1F3F2] text-[#252B28] text-[9px] font-semibold px-2 py-0.5 rounded-full"
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3.5 px-6 text-right">
                    <button
                      onClick={() => handleOpenChat(contact)}
                      className="bg-[#F1F3F2] hover:bg-[#252B28] hover:text-white text-[#252B28] font-bold px-3 py-1.5 rounded-xl transition-all inline-flex items-center gap-1.5 text-[11px]"
                    >
                      <MessageSquare className="w-3 h-3 text-[#45D483]" />
                      <span>Chat</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Contact */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#E5E9E7]">
            <h3 className="text-base font-bold text-[#252B28]">Add New Customer Contact</h3>
            <form onSubmit={handleCreateContact} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#252B28] block mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Maria Oliveira"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl px-3 py-2 text-xs text-[#252B28] focus:outline-none focus:border-[#45D483]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-[#252B28] block mb-1">WhatsApp Number</label>
                <input
                  type="text"
                  placeholder="+55 11 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl px-3 py-2 text-xs text-[#252B28] focus:outline-none focus:border-[#45D483]"
                />
              </div>

              <div>
                <label className="font-bold text-[#252B28] block mb-1">Instagram Handle</label>
                <input
                  type="text"
                  placeholder="username (without @)"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="w-full bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl px-3 py-2 text-xs text-[#252B28] focus:outline-none focus:border-[#45D483]"
                />
              </div>

              <div>
                <label className="font-bold text-[#252B28] block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="client@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl px-3 py-2 text-xs text-[#252B28] focus:outline-none focus:border-[#45D483]"
                />
              </div>

              <div>
                <label className="font-bold text-[#252B28] block mb-1">Lead Stage</label>
                <select
                  value={leadStatus}
                  onChange={(e) => setLeadStatus(e.target.value as LeadStatus)}
                  className="w-full bg-[#F7F9F8] border border-[#E5E9E7] rounded-xl px-3 py-2 text-xs text-[#252B28] focus:outline-none"
                >
                  <option value="new">New Inquiry</option>
                  <option value="qualified">Qualified</option>
                  <option value="lead">Lead</option>
                  <option value="customer">Customer</option>
                </select>
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
                  Create Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
