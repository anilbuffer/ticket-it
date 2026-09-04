'use client';

import React, { useState, useEffect } from 'react';
import {
  FileBarChart2,
  Calendar,
  Filter,
  Download,
  Printer,
  RotateCcw,
  CheckCircle2,
  Clock,
  Laptop,
  Search,
  Eye,
  Activity,
  Layers,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { UsageService, UsageFilterParams } from '@/services/usageService';
import { ClientService } from '@/services/clientService';
import { UserService } from '@/services/userService';
import { UsageSession } from '@/types';
import { useToast } from '@/components/ui/ToastContext';

export default function SessionUsageReportPage() {
  const { showToast } = useToast();

  const [clients, setClients] = useState<string[]>([]);
  const [users, setUsers] = useState<string[]>([]);

  // Filter form state
  const [formData, setFormData] = useState({
    clientName: 'All Clients',
    username: 'All Users',
    fromDate: '2026-09-01',
    toDate: '2026-09-04',
    status: 'All Statuses',
  });

  const [hasSubmitted, setHasSubmitted] = useState(true);
  const [results, setResults] = useState<UsageSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<UsageSession | null>(null);

  useEffect(() => {
    const clientList = ClientService.getClients().map((c) => c.name);
    setClients(['All Clients', ...clientList]);

    const userList = UserService.getUsers().map((u) => u.username);
    setUsers(['All Users', ...userList]);

    // Initial search
    setResults(UsageService.querySessions(formData));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queryResults = UsageService.querySessions(formData);
    setResults(queryResults);
    setHasSubmitted(true);
    showToast(
      'success',
      'Report Generated',
      `Found ${queryResults.length} session records matching query parameters.`
    );
  };

  const handleReset = () => {
    setFormData({
      clientName: 'All Clients',
      username: 'All Users',
      fromDate: '',
      toDate: '',
      status: 'All Statuses',
    });
    setResults([]);
    setHasSubmitted(false);
  };

  const handleExportCSV = () => {
    if (results.length === 0) {
      showToast('error', 'No Data', 'Run a report with data before exporting.');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,Session ID,Date Time,Client,Username,Role,IP Address,Device,Duration (min),Activity Count,Status\n';
    results.forEach((s) => {
      csvContent += `${s.id},"${s.sessionDate}","${s.clientName}","${s.username}","${s.userRole}","${s.ipAddress}","${s.device}",${s.durationMinutes},${s.activityCount},${s.status}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TicketIT_Session_Usage_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', 'CSV Exported', 'Session usage data downloaded successfully.');
  };

  const totalDurationMinutes = results.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalActivities = results.reduce((acc, s) => acc + s.activityCount, 0);

  const columns: Column<UsageSession>[] = [
    {
      key: 'sessionDate',
      header: 'Session Timestamp',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-bold text-ticketit-navy">{row.sessionDate}</div>
          <div className="text-[11px] text-ticketit-text-muted">{row.id}</div>
        </div>
      ),
    },
    {
      key: 'clientName',
      header: 'Client / Store Network',
      sortable: true,
      render: (row) => <span className="font-semibold text-ticketit-navy">{row.clientName}</span>,
    },
    {
      key: 'username',
      header: 'User Account',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-semibold text-ticketit-navy">{row.username}</div>
          <div className="text-[11px] text-ticketit-text-muted">{row.userRole}</div>
        </div>
      ),
    },
    {
      key: 'device',
      header: 'Client Terminal / IP',
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
        <span className="font-bold text-ticketit-navy">{row.durationMinutes} min</span>
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
      header: 'Session Status',
      sortable: true,
      align: 'center',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'action',
      header: 'Action',
      sortable: false,
      render: (row) => (
        <button
          type="button"
          onClick={() => setSelectedSession(row)}
          className="text-xs font-bold text-ticketit-pink hover:underline flex items-center gap-1"
        >
          <Eye className="w-3.5 h-3.5" /> Details
        </button>
      ),
    },
  ];

  return (
    <AppShell>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-ticketit-navy tracking-tight">
            Session Usage Report
          </h1>
          <p className="text-xs text-ticketit-text-muted mt-0.5">
            Audit in-store ticketing transactions, user session durations, and remote terminal activity.
          </p>
        </div>

        {hasSubmitted && results.length > 0 && (
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
              Print Report
            </Button>
          </div>
        )}
      </div>

      {/* Filter Form Card */}
      <div className="bg-white border border-ticketit-border rounded-lg p-5 shadow-sm mb-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-3 border-b border-ticketit-border">
            <Filter className="w-4 h-4 text-ticketit-pink" />
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-ticketit-navy">
              Report Parameters
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* Client / Store Selector */}
            <div>
              <label className="block text-xs font-bold text-ticketit-navy mb-1">
                Client / Store
              </label>
              <select
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs font-medium border border-ticketit-border rounded bg-white text-ticketit-navy focus:border-ticketit-pink focus:outline-none"
              >
                {clients.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* User Selector */}
            <div>
              <label className="block text-xs font-bold text-ticketit-navy mb-1">
                User Account
              </label>
              <select
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs font-medium border border-ticketit-border rounded bg-white text-ticketit-navy focus:border-ticketit-pink focus:outline-none"
              >
                {users.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            {/* From Date */}
            <div>
              <label className="block text-xs font-bold text-ticketit-navy mb-1">
                From Date
              </label>
              <input
                type="date"
                value={formData.fromDate}
                onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs font-medium border border-ticketit-border rounded bg-white text-ticketit-navy focus:border-ticketit-pink focus:outline-none"
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-xs font-bold text-ticketit-navy mb-1">
                To Date
              </label>
              <input
                type="date"
                value={formData.toDate}
                onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs font-medium border border-ticketit-border rounded bg-white text-ticketit-navy focus:border-ticketit-pink focus:outline-none"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-ticketit-navy mb-1">
                Session Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs font-medium border border-ticketit-border rounded bg-white text-ticketit-navy focus:border-ticketit-pink focus:outline-none"
              >
                <option value="All Statuses">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Timed Out">Timed Out</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-ticketit-border">
            <Button variant="outline" size="sm" type="button" onClick={handleReset} icon={<RotateCcw className="w-3.5 h-3.5" />}>
              Clear
            </Button>
            <Button variant="pink" size="sm" type="submit" icon={<Search className="w-3.5 h-3.5" />}>
              Submit Report Query
            </Button>
          </div>
        </form>
      </div>

      {/* KPI Overview Strip after submission */}
      {hasSubmitted && results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-ticketit-border rounded-lg p-4 shadow-sm flex items-center gap-3">
            <div className="p-3 rounded-lg bg-ticketit-pink/10 text-ticketit-pink">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-ticketit-navy">{results.length}</div>
              <div className="text-xs text-ticketit-text-muted">Total Sessions Found</div>
            </div>
          </div>

          <div className="bg-white border border-ticketit-border rounded-lg p-4 shadow-sm flex items-center gap-3">
            <div className="p-3 rounded-lg bg-[#EAF7F0] text-ticketit-green">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-ticketit-navy">
                {Math.round(totalDurationMinutes / 60)}h {totalDurationMinutes % 60}m
              </div>
              <div className="text-xs text-ticketit-text-muted">Cumulative Time Logged</div>
            </div>
          </div>

          <div className="bg-white border border-ticketit-border rounded-lg p-4 shadow-sm flex items-center gap-3">
            <div className="p-3 rounded-lg bg-[#FFF0F2] text-ticketit-coral">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-ticketit-navy">{totalActivities}</div>
              <div className="text-xs text-ticketit-text-muted">Ticketing & Pricing Events</div>
            </div>
          </div>
        </div>
      )}

      {/* Results Table or Empty State */}
      <div className="bg-white border border-ticketit-border rounded-lg p-4 sm:p-5 shadow-sm">
        {!hasSubmitted ? (
          <div className="py-16 text-center text-ticketit-text-muted flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <FileBarChart2 className="w-7 h-7" />
            </div>
            <div className="font-bold text-sm text-ticketit-navy">
              No Report Generated Yet
            </div>
            <p className="text-xs text-ticketit-text-muted max-w-sm leading-relaxed">
              Select your client partition, desired date range, and click <strong>Submit Report Query</strong> to inspect system usage sessions.
            </p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={results}
            keyField="id"
            emptyMessage="No session logs match the selected filters"
            initialRowsPerPage={10}
          />
        )}
      </div>

      {/* Session Details Modal */}
      {selectedSession && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedSession(null)}
          title={`Session Audit Log: ${selectedSession.id}`}
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
                <span className="font-bold text-ticketit-navy">{selectedSession.durationMinutes} minutes</span>
              </div>
            </div>

            <div>
              <div className="font-bold text-xs text-ticketit-navy mb-2">Event Breakdown:</div>
              <div className="border border-ticketit-border rounded divide-y divide-gray-100">
                {selectedSession.logDetails?.map((detail, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <span className="font-bold text-ticketit-navy mr-2">{detail.time}</span>
                      <span className="text-gray-700">{detail.action}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-ticketit-navy">
                      {detail.module}
                    </span>
                  </div>
                )) || (
                  <div className="p-3 text-center text-gray-400">No granular events recorded for this session</div>
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
    </AppShell>
  );
}
