'use client';

import React, { useState, useMemo } from 'react';
import { DataTable, ColumnDef } from '@/components/ui/DataTable';
import { Download } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  email: string;
  status: string;
  budget: string;
  lastContact: string;
}

const mockContacts: Contact[] = [
  { id: '1', name: 'Sarah Jenkins', email: 'sarah.j@example.com', status: 'Qualified', budget: '$1.2M', lastContact: '2 hours ago' },
  { id: '2', name: 'Michael Chen', email: 'mchen@company.com', status: 'Contacted', budget: '$850k', lastContact: 'Yesterday' },
  { id: '3', name: 'Emily Davis', email: 'edavis99@gmail.com', status: 'New', budget: '$600k', lastContact: 'Never' },
  { id: '4', name: 'Robert Taylor', email: 'robert.taylor@invest.co', status: 'Closed', budget: '$2.5M', lastContact: '3 days ago' },
  { id: '5', name: 'Amanda Lewis', email: 'alewis@startup.io', status: 'Qualified', budget: '$950k', lastContact: 'Today' },
  { id: '6', name: 'James Wilson', email: 'jwilson@example.com', status: 'Contacted', budget: '$725k', lastContact: '1 week ago' },
  { id: '7', name: 'Patricia Moore', email: 'pmoore@domain.com', status: 'New', budget: '$1.1M', lastContact: 'Never' },
  { id: '8', name: 'David Miller', email: 'dmiller@enterprise.com', status: 'Qualified', budget: '$3.4M', lastContact: '4 hours ago' },
  { id: '9', name: 'Jennifer Garcia', email: 'jgarcia@email.net', status: 'Closed', budget: '$550k', lastContact: '1 month ago' },
  { id: '10', name: 'William Martinez', email: 'wmartinez@biz.com', status: 'Contacted', budget: '$890k', lastContact: '2 days ago' },
  { id: '11', name: 'Elizabeth Robinson', email: 'erobinson@tech.io', status: 'New', budget: '$1.5M', lastContact: 'Never' },
  { id: '12', name: 'Richard Clark', email: 'rclark@domain.org', status: 'Qualified', budget: '$2.1M', lastContact: 'Yesterday' },
];

export default function ContactsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filtering
  const filteredData = useMemo(() => {
    if (!search) return mockContacts;
    return mockContacts.filter(row => 
      Object.values(row).some(val => 
        String(val).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page]);

  const exportCSV = () => {
    const headers = ['Name', 'Email Address', 'Pipeline Status', 'Budget', 'Last Contacted'].join(',');
    const csvRows = filteredData.map(row => 
      [row.name, row.email, row.status, row.budget, row.lastContact]
        .map(val => `"${val}"`)
        .join(',')
    );
    
    const csvContent = [headers, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `contacts-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: ColumnDef<Contact>[] = [
    { 
      accessorKey: 'name', 
      header: 'Name',
      cell: (item) => <span className="font-semibold text-zinc-100">{item.name}</span>
    },
    { accessorKey: 'email', header: 'Email Address' },
    { 
      accessorKey: 'status', 
      header: 'Pipeline Status',
      cell: (item) => {
        const statusColors: Record<string, string> = {
          'New': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          'Contacted': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          'Qualified': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
          'Closed': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        };
        const color = statusColors[item.status] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${color}`}>
            {item.status}
          </span>
        );
      }
    },
    { accessorKey: 'budget', header: 'Budget' },
    { accessorKey: 'lastContact', header: 'Last Contacted' },
  ];

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">All Contacts</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Manage your leads, clients, and partners in bulk.
        </p>
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
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-sm font-semibold text-white rounded-xl shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          }
          bulkActions={[
            {
              label: 'Delete Selected',
              variant: 'destructive',
              onClick: (ids) => alert(`Deleting ${ids.length} contacts`)
            }
          ]}
        />
      </div>

    </div>
  );
}
