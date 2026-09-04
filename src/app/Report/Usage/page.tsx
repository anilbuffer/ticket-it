'use client';

import React, { useState, useEffect } from 'react';
import {
  Download,
  Printer,
  ChevronDown,
  Eye,
  FileBarChart2,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { UsageService } from '@/services/usageService';
import { ClientService } from '@/services/clientService';
import { UsageSession } from '@/types';
import { useToast } from '@/components/ui/ToastContext';

export default function SessionUsageReportPage() {
  const { showToast } = useToast();

  const [clients, setClients] = useState<string[]>([]);
  const [selectedClient, setSelectedClient] = useState('ALL');
  const [fromDate, setFromDate] = useState('29/08/26');
  const [toDate, setToDate] = useState('05/09/26');

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [results, setResults] = useState<UsageSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<UsageSession | null>(null);

  useEffect(() => {
    // Get unique list of client names sorted alphabetically
    const clientList = ClientService.getClients().map((c) => c.name);
    const uniqueSorted = Array.from(new Set(clientList)).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );
    setClients(['ALL', ...uniqueSorted]);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queryResults = UsageService.querySessions({
      clientName: selectedClient,
      fromDate: fromDate,
      toDate: toDate,
    });
    setResults(queryResults);
    setHasSubmitted(true);
    showToast(
      'success',
      'Report Generated',
      `Found ${queryResults.length} session records matching query.`
    );
  };

  const handleExportCSV = () => {
    if (results.length === 0) {
      showToast('error', 'No Data', 'Run a report with data before exporting.');
      return;
    }

    let csvContent =
      'data:text/csv;charset=utf-8,Session ID,Date Time,Client,Username,Role,IP Address,Device,Duration (min),Activity Count,Status\n';
    results.forEach((s) => {
      csvContent += `${s.id},"${s.sessionDate}","${s.clientName}","${s.username}","${s.userRole}","${s.ipAddress}","${s.device}",${s.durationMinutes},${s.activityCount},${s.status}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `TicketIT_Session_Usage_Report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', 'CSV Exported', 'Session usage data downloaded successfully.');
  };

  const columns: Column<UsageSession>[] = [
    {
      key: 'sessionDate',
      header: 'Session Timestamp',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-bold text-ticketit-navy text-xs">{row.sessionDate}</div>
          <div className="text-[11px] text-ticketit-text-muted">{row.id}</div>
        </div>
      ),
    },
    {
      key: 'clientName',
      header: 'Client',
      sortable: true,
      render: (row) => <span className="font-semibold text-ticketit-navy text-xs">{row.clientName}</span>,
    },
    {
      key: 'username',
      header: 'User Account',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-semibold text-ticketit-navy text-xs">{row.username}</div>
          <div className="text-[11px] text-ticketit-text-muted">{row.userRole}</div>
        </div>
      ),
    },
    {
      key: 'device',
      header: 'Terminal / IP',
      sortable: true,
      render: (row) => (
        <div className="text-xs">
          <div className="text-ticketit-navy">{row.device}</div>
          <div className="text-[11px] font-mono text-gray-500">{row.ipAddress}</div>
        </div>
      ),
    },
    {
      key: 'durationMinutes',
      header: 'Duration',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="font-bold text-ticketit-navy text-xs">{row.durationMinutes} min</span>
      ),
    },
    {
      key: 'activityCount',
      header: 'Events Logged',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 font-semibold text-ticketit-navy">
          {row.activityCount}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      align: 'center',
      render: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      key: 'action',
      header: 'Details',
      sortable: false,
      render: (row) => (
        <button
          type="button"
          onClick={() => setSelectedSession(row)}
          className="text-xs font-bold text-ticketit-pink hover:text-ticketit-pink-hover hover:underline flex items-center gap-1 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" /> View
        </button>
      ),
    },
  ];

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto pb-12">
        {/* Page Title matching screenshot */}
        <h1 className="text-2xl font-bold text-[#002B49] tracking-tight mb-4">
          Session Usage Report
        </h1>

        {/* Form Container matching reference screenshot */}
        <div className="bg-white border border-[#D5DFE8] rounded p-5 sm:p-6 shadow-xs mb-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {/* 1. Client Select Dropdown (Starts with ALL) */}
            <div className="relative">
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                aria-label="Select Client"
                className="w-full px-3 py-2 text-xs font-medium border border-[#CCD7E2] rounded bg-white text-ticketit-navy focus:border-ticketit-pink focus:outline-none appearance-none cursor-pointer"
              >
                {clients.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-2.5 pointer-events-none" />
            </div>

            {/* 2. From Label and Input */}
            <div>
              <label className="block text-xs font-semibold text-[#334D66] mb-1">
                From
              </label>
              <input
                type="text"
                placeholder="DD/MM/YY"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium border border-[#CCD7E2] rounded bg-white text-ticketit-navy focus:border-ticketit-pink focus:outline-none"
              />
            </div>

            {/* 3. To Label and Input */}
            <div>
              <label className="block text-xs font-semibold text-[#334D66] mb-1">
                To
              </label>
              <input
                type="text"
                placeholder="DD/MM/YY"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium border border-[#CCD7E2] rounded bg-white text-ticketit-navy focus:border-ticketit-pink focus:outline-none"
              />
            </div>

            {/* 4. SUBMIT Button matching brand theme */}
            <div className="pt-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center px-6 py-2.5 rounded bg-ticketit-pink hover:bg-ticketit-pink-hover text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all duration-150 cursor-pointer active:scale-[0.98]"
              >
                SUBMIT
              </button>
            </div>
          </form>
        </div>

        {/* Results Section (Displayed upon submit or search) */}
        {hasSubmitted && (
          <div className="bg-white border border-[#CCD7E2] rounded p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-[#E6EEF5]">
              <div>
                <h2 className="text-sm font-bold text-ticketit-navy">
                  Query Results: {results.length} Session{results.length === 1 ? '' : 's'} Found
                </h2>
                <p className="text-[11px] text-ticketit-text-muted">
                  Client: <strong>{selectedClient}</strong> • Period: {fromDate} to {toDate}
                </p>
              </div>

              {results.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportCSV}
                    icon={<Download className="w-3.5 h-3.5 text-ticketit-pink" />}
                  >
                    Export CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.print()}
                    icon={<Printer className="w-3.5 h-3.5 text-ticketit-navy" />}
                  >
                    Print
                  </Button>
                </div>
              )}
            </div>

            <DataTable
              columns={columns}
              data={results}
              keyField="id"
              emptyMessage="No session usage logs found for this client and date range"
              initialRowsPerPage={10}
            />
          </div>
        )}

        {/* Session Details Modal */}
        {selectedSession && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedSession(null)}
            title={`Session Details: ${selectedSession.id}`}
            subtitle={`${selectedSession.clientName} • ${selectedSession.username} (${selectedSession.sessionDate})`}
            maxWidth="lg"
            headerColor="navy"
          >
            <div className="flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded border border-ticketit-border">
                <div>
                  <span className="text-gray-500 block">User Role:</span>
                  <span className="font-bold text-ticketit-navy">{selectedSession.userRole}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Session Status:</span>
                  <StatusBadge status={selectedSession.status} size="sm" />
                </div>
                <div>
                  <span className="text-gray-500 block">IP Address:</span>
                  <span className="font-mono text-ticketit-navy">{selectedSession.ipAddress}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Duration:</span>
                  <span className="font-bold text-ticketit-navy">
                    {selectedSession.durationMinutes} minutes
                  </span>
                </div>
              </div>

              <div>
                <div className="font-bold text-xs text-ticketit-navy mb-2">Event Breakdown:</div>
                <div className="border border-ticketit-border rounded divide-y divide-gray-100">
                  {selectedSession.logDetails?.map((detail, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 flex items-center justify-between hover:bg-gray-50"
                    >
                      <div>
                        <span className="font-bold text-ticketit-navy mr-2">{detail.time}</span>
                        <span className="text-gray-700">{detail.action}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-ticketit-navy">
                        {detail.module}
                      </span>
                    </div>
                  )) || (
                    <div className="p-3 text-center text-gray-400">
                      No granular events recorded for this session
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-ticketit-border">
                <Button variant="outline" size="sm" onClick={() => setSelectedSession(null)}>
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}
