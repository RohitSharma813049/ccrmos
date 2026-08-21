'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { DataTable, ColumnDef } from '@/components/ui/DataTable';
import { Mail, Plus, Shield, UserPlus, MoreHorizontal } from 'lucide-react';
import { getTeamMembers, inviteTeamMember, toggleSuspendMember } from '@/app/(dashboard)/team/actions';
import { toast } from 'react-hot-toast';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Invited' | 'Suspended';
  lastActive: string;
}

export function TeamClient() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modal states
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Agent');
  const [isInviting, setIsInviting] = useState(false);

  const fetchTeam = async () => {
    try {
      const data = await getTeamMembers();
      setTeam(data as TeamMember[]);
    } catch (error) {
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleInvite = async () => {
    if (!inviteEmail) return toast.error("Please enter an email");
    setIsInviting(true);
    try {
      await inviteTeamMember({ email: inviteEmail, role: inviteRole });
      toast.success('Invitation sent');
      setIsInviteModalOpen(false);
      setInviteEmail('');
      fetchTeam();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send invite');
    } finally {
      setIsInviting(false);
    }
  };

  const handleSuspend = async (ids: string[]) => {
    try {
      // For simplicity, just handling the first selected for now or looping
      for (const id of ids) {
        await toggleSuspendMember(id);
      }
      toast.success('Status updated');
      fetchTeam();
      setSelectedIds([]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  // Filtering
  const filteredData = useMemo(() => {
    if (!search) return team;
    return team.filter(row => 
      Object.values(row).some(val => 
        String(val).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, team]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page]);

  const columns: ColumnDef<TeamMember>[] = [
    { 
      accessorKey: 'name', 
      header: 'Member',
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300">
            {item.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-zinc-100">{item.name}</span>
            <span className="text-xs text-zinc-500">{item.email}</span>
          </div>
        </div>
      )
    },
    { 
      accessorKey: 'role', 
      header: 'Role',
      cell: (item) => (
        <div className="flex items-center gap-1.5">
          {item.role === 'Owner' && <Shield className="w-3.5 h-3.5 text-amber-400" />}
          <span className={`font-medium ${item.role === 'Owner' ? 'text-amber-400' : 'text-zinc-300'}`}>
            {item.role}
          </span>
        </div>
      )
    },
    { 
      accessorKey: 'status', 
      header: 'Status',
      cell: (item) => {
        const statusColors = {
          'Active': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          'Invited': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          'Suspended': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        };
        const color = statusColors[item.status] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${color}`}>
            {item.status}
          </span>
        );
      }
    },
    { accessorKey: 'lastActive', header: 'Last Active' },
    {
      id: 'actions',
      header: '',
      className: 'w-10 text-right',
      cell: (item) => (
        <button 
          onClick={() => handleSuspend([item.id])}
          className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors rounded-lg hover:bg-zinc-800"
          title={item.status === 'Suspended' ? 'Unsuspend User' : 'Suspend User'}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const activeMembers = team.filter(t => t.status === 'Active').length;
  const pendingInvites = team.filter(t => t.status === 'Invited').length;

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-zinc-900/40 border border-zinc-800/60 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-400">Total Members</p>
            <p className="text-2xl font-bold text-zinc-100 mt-1">{team.length}</p>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400">
            <UserPlus className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800/60 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-400">Active Licenses</p>
            <p className="text-2xl font-bold text-zinc-100 mt-1">{activeMembers} <span className="text-sm text-zinc-500 font-normal">/ unlimited seats</span></p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
            <Shield className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800/60 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-400">Pending Invites</p>
            <p className="text-2xl font-bold text-zinc-100 mt-1">{pendingInvites}</p>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
            <Mail className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/60 shadow-sm">
        <DataTable 
          data={paginatedData} 
          columns={columns} 
          search={search}
          onSearchChange={(val) => { setSearch(val); setPage(1); }}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          selectable={true}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          itemIdAccessor={(item) => item.id}
          actions={
            <button 
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-sm font-semibold text-white rounded-xl shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <Plus className="w-4 h-4" />
              Invite Member
            </button>
          }
          bulkActions={[
            {
              label: 'Toggle Suspend Selected',
              variant: 'destructive',
              onClick: (ids) => handleSuspend(ids)
            }
          ]}
        />
      </div>

      {/* Invite Modal Placeholder */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-zinc-100 mb-4">Invite Team Member</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Email Address</label>
                <input 
                  type="email" 
                  placeholder="colleague@company.com" 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-indigo-500 transition-colors" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Role</label>
                <select 
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="Manager">Manager</option>
                  <option value="Agent">Agent</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setIsInviteModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleInvite}
                disabled={isInviting}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
              >
                {isInviting ? 'Sending...' : 'Send Invite'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
