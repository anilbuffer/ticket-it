'use client';

import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  FileDown,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  Download,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Dropzone } from '@/components/ui/Dropzone';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { ClientService } from '@/services/clientService';
import { ImportService } from '@/services/importService';
import { Client, ImportRecord, ImportErrorDetail } from '@/types';
import { useToast } from '@/components/ui/ToastContext';

export default function ImportClientDataPage() {
  const { showToast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importHistory, setImportHistory] = useState<ImportRecord[]>([]);

  // Workflow states
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [validationResult, setValidationResult] = useState<{
    validCount: number;
    errorCount: number;
    errors: ImportErrorDetail[];
  } | null>(null);

  // Error inspector modal
  const [inspectingRecord, setInspectingRecord] = useState<ImportRecord | null>(null);

  useEffect(() => {
    const list = ClientService.getClients();
    setClients(list);
    if (list.length > 0) setSelectedClientId(list[0].id);
    setImportHistory(ImportService.getHistory());
  }, []);

  const refreshHistory = () => {
    setImportHistory(ImportService.getHistory());
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setValidationResult(null);
  };

  const handleStartImport = () => {
    if (!selectedFile) {
      showToast('error', 'File Required', 'Please select a catalog or price feed file to import.');
      return;
    }

    const client = clients.find((c) => c.id === selectedClientId);
    const clientName = client ? client.name : 'SuperValu Stores NZ';

    setIsProcessing(true);
    setProgressPercent(15);

    const step1 = setTimeout(() => setProgressPercent(45), 400);
    const step2 = setTimeout(() => setProgressPercent(80), 800);
    const step3 = setTimeout(() => {
      setProgressPercent(100);

      // Evaluate validation
      const rowCount = Math.floor(Math.random() * 3000) + 1200;
      const result = ImportService.generateMockValidation(selectedFile.name, clientName, rowCount);
      setValidationResult(result);

      // Save to history
      const newRecord = ImportService.addRecord({
        fileName: selectedFile.name,
        fileType: selectedFile.name.endsWith('.csv')
          ? 'CSV Document'
          : selectedFile.name.endsWith('.xlsx')
          ? 'Excel Spreadsheet'
          : 'XML Data Feed',
        fileSize: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
        clientName,
        uploadedBy: 'Alexander Cross',
        recordCount: rowCount,
        validCount: result.validCount,
        errorCount: result.errorCount,
        status: result.errorCount === 0 ? 'Success' : result.validCount === 0 ? 'Failed' : 'Partial',
        errors: result.errors,
      });

      refreshHistory();
      setIsProcessing(false);

      if (result.errorCount === 0) {
        showToast('success', 'Import Completed', `Ingested ${result.validCount} valid records for ${clientName}.`);
      } else {
        showToast(
          'warning',
          'Import Completed with Warnings',
          `Processed ${result.validCount} items. ${result.errorCount} records flagged for review.`
        );
      }
    }, 1200);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
    };
  };

  const handleDownloadSampleSchema = (type: string) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Barcode,Model,ProductSKU,ProductName,ProductPrice,StoreCode,IsPromo,TaxCategory\n' +
      '885126981,ZKC26B-NA,4710015105633,GG CORN SNACK 120G,3.50,STR-001,FALSE,GST_STANDARD\n' +
      '818775015,ZKC26B-NAE4,4710015115779,KUAIKUAI STRAWBERRY MILK CORN 90G,4.20,STR-001,FALSE,GST_STANDARD\n' +
      '849201994,ZKC42B-WRG,9310055102948,SAN REMO ORGANIC SPIRALS 500G,3.89,STR-002,TRUE,GST_STANDARD\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TicketIT_Sample_${type}_Schema.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('info', 'Template Downloaded', `Sample ${type} schema downloaded.`);
  };

  const handleDownloadErrorReport = (record: ImportRecord) => {
    if (!record.errors || record.errors.length === 0) {
      showToast('info', 'Clean Dataset', 'No errors were logged for this batch.');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,Row,Field,Error Description,Sample Value\n';
    record.errors.forEach((err) => {
      csvContent += `${err.row},${err.field},"${err.message}","${err.sampleValue}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Error_Report_${record.fileName.replace(/\.[^/.]+$/, '')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', 'Error Report Generated', `Exported error log for ${record.fileName}`);
  };

  const historyColumns: Column<ImportRecord>[] = [
    {
      key: 'fileName',
      header: 'File Name',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-bold text-ticketit-navy">{row.fileName}</div>
          <div className="text-[11px] text-ticketit-text-muted">
            {row.fileType} • {row.fileSize}
          </div>
        </div>
      ),
    },
    {
      key: 'clientName',
      header: 'Target Retail Client',
      sortable: true,
      render: (row) => <span className="font-semibold text-ticketit-navy">{row.clientName}</span>,
    },
    {
      key: 'uploadedAt',
      header: 'Uploaded Date',
      sortable: true,
      render: (row) => (
        <div>
          <div className="text-ticketit-navy">{row.uploadedAt}</div>
          <div className="text-[11px] text-ticketit-text-muted">By {row.uploadedBy}</div>
        </div>
      ),
    },
    {
      key: 'recordCount',
      header: 'Records',
      sortable: true,
      align: 'right',
      render: (row) => (
        <div className="text-right">
          <div className="font-bold text-ticketit-navy">{row.recordCount.toLocaleString()}</div>
          <div className="text-[11px] text-ticketit-green font-semibold">
            {row.validCount.toLocaleString()} valid
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      align: 'center',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'action',
      header: 'Actions',
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.errorCount > 0 ? (
            <button
              type="button"
              onClick={() => setInspectingRecord(row)}
              className="text-xs font-bold text-ticketit-coral hover:underline flex items-center gap-1"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              {row.errorCount} Errors
            </button>
          ) : (
            <span className="text-xs text-ticketit-green font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Clean
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <AppShell>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-ticketit-navy tracking-tight">
            Import Client Data
          </h1>
          <p className="text-xs text-ticketit-text-muted mt-0.5">
            Ingest master product catalogs, pricing updates, and store inventory feeds with automated schema validation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownloadSampleSchema('Product_Catalog')}
            icon={<FileDown className="w-3.5 h-3.5 text-ticketit-pink" />}
          >
            Sample Catalog CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownloadSampleSchema('Store_Hierarchy')}
            icon={<FileSpreadsheet className="w-3.5 h-3.5 text-ticketit-navy" />}
          >
            Store Mapping XLSX
          </Button>
        </div>
      </div>

      {/* Main Upload Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left 2 Cols: Target client & Dropzone */}
        <div className="lg:col-span-2 bg-white border border-ticketit-border rounded-lg p-5 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-ticketit-border">
            <div>
              <label className="block text-xs font-bold text-ticketit-navy mb-1">
                Target Retail Client <span className="text-ticketit-coral">*</span>
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full sm:w-72 px-3 py-1.5 text-xs font-semibold border border-ticketit-border rounded bg-white text-ticketit-navy focus:border-ticketit-pink focus:outline-none"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-ticketit-text-muted block">Supported formats</span>
              <span className="text-xs font-bold text-ticketit-navy">.CSV, .XLSX, .XML, .JSON</span>
            </div>
          </div>

          {/* Drag and Drop Zone */}
          <Dropzone
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            onClearFile={() => {
              setSelectedFile(null);
              setValidationResult(null);
            }}
            label="Drag and drop store catalog or price feed here"
            sublabel="Maximum file size 25MB • Automated checksum and SKU verification"
          />

          {/* Progress Bar if processing */}
          {isProcessing && (
            <div className="p-4 bg-gray-50 rounded border border-ticketit-border">
              <div className="flex items-center justify-between text-xs font-bold text-ticketit-navy mb-2">
                <span className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-ticketit-pink animate-spin" />
                  Parsing and validating records...
                </span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-ticketit-pink transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Validation Summary Card */}
          {validationResult && !isProcessing && (
            <div className="p-4 bg-[#F8FAFD] border border-ticketit-border rounded-lg">
              <div className="text-xs font-extrabold uppercase tracking-wider text-ticketit-navy mb-3">
                Validation Summary
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-white border border-ticketit-border rounded text-center">
                  <div className="text-lg font-black text-ticketit-navy">
                    {(validationResult.validCount + validationResult.errorCount).toLocaleString()}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-ticketit-text-muted">Total Rows</div>
                </div>
                <div className="p-3 bg-white border border-[#BDE7CE] rounded text-center bg-[#EBF7F0]/40">
                  <div className="text-lg font-black text-ticketit-green">
                    {validationResult.validCount.toLocaleString()}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-ticketit-green">Valid Records</div>
                </div>
                <div className="p-3 bg-white border border-[#FFCDD5] rounded text-center bg-[#FFF0F2]/40">
                  <div className="text-lg font-black text-ticketit-coral">
                    {validationResult.errorCount.toLocaleString()}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-ticketit-coral">Exceptions</div>
                </div>
              </div>

              {validationResult.errorCount > 0 && (
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-ticketit-coral font-medium">
                    Review flagged rows before committing to live shelf devices.
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleDownloadErrorReport({
                        id: 'current',
                        fileName: selectedFile?.name || 'catalog',
                        fileType: 'CSV',
                        fileSize: '1MB',
                        clientName: 'Target',
                        uploadedBy: 'Admin',
                        uploadedAt: 'Now',
                        recordCount: validationResult.validCount + validationResult.errorCount,
                        validCount: validationResult.validCount,
                        errorCount: validationResult.errorCount,
                        status: 'Partial',
                        errors: validationResult.errors,
                      })
                    }
                    className="text-xs font-bold text-ticketit-pink hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Error CSV
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {selectedFile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedFile(null);
                  setValidationResult(null);
                }}
                disabled={isProcessing}
              >
                Reset
              </Button>
            )}
            <Button
              variant="green"
              size="md"
              onClick={handleStartImport}
              disabled={!selectedFile || isProcessing}
              isLoading={isProcessing}
              icon={<UploadCloud className="w-4 h-4" />}
            >
              Start Ingestion & Validation
            </Button>
          </div>
        </div>

        {/* Right 1 Col: Instructions & System Rules */}
        <div className="bg-white border border-ticketit-border rounded-lg p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-ticketit-border mb-3">
              <FileCheck className="w-4 h-4 text-ticketit-pink" />
              <h3 className="text-sm font-extrabold text-ticketit-navy uppercase tracking-wider">
                Ingestion Rules
              </h3>
            </div>

            <ul className="text-xs text-ticketit-navy/90 space-y-2.5 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-ticketit-pink mt-1.5 flex-shrink-0" />
                <span>
                  <strong>Unique Barcode Key:</strong> Each EAN/UPC barcode must map to a single SKU per client partition.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-ticketit-pink mt-1.5 flex-shrink-0" />
                <span>
                  <strong>Price Formatting:</strong> Decimal numbers with up to 2 places (e.g. <code>4.99</code>). Currency symbols are parsed automatically.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-ticketit-pink mt-1.5 flex-shrink-0" />
                <span>
                  <strong>Promotion Flags:</strong> Set <code>IsPromo</code> to <code>true</code> or <code>1</code> to trigger promotional display templates on ESL hardware.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-ticketit-pink mt-1.5 flex-shrink-0" />
                <span>
                  <strong>Automated Rollback:</strong> Batches with &gt; 50% catastrophic errors will halt without updating in-store shelf tags.
                </span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-ticketit-border bg-gray-50 p-3 rounded">
            <div className="text-[11px] font-bold text-ticketit-navy">Live Gateway Connection</div>
            <div className="text-[11px] text-ticketit-text-muted mt-0.5">
              StandardStoreSetup Sub-GHz RF Base Station active on Channel 4.
            </div>
          </div>
        </div>
      </div>

      {/* Import History Table */}
      <div className="bg-white border border-ticketit-border rounded-lg p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-ticketit-navy" />
            <h2 className="text-sm font-extrabold text-ticketit-navy uppercase tracking-wider">
              Recent Import Audit History
            </h2>
          </div>
          <button
            type="button"
            onClick={refreshHistory}
            className="text-xs font-semibold text-ticketit-pink hover:underline"
          >
            Refresh Log
          </button>
        </div>

        <DataTable columns={historyColumns} data={importHistory} keyField="id" initialRowsPerPage={10} />
      </div>

      {/* Error Details Modal */}
      {inspectingRecord && (
        <Modal
          isOpen={true}
          onClose={() => setInspectingRecord(null)}
          title={`Import Error Log: ${inspectingRecord.fileName}`}
          subtitle={`Client: ${inspectingRecord.clientName} • ${inspectingRecord.errorCount} exceptions`}
          maxWidth="xl"
          headerColor="pink"
        >
          <div className="flex flex-col gap-4">
            <div className="max-h-72 overflow-y-auto border border-ticketit-border rounded">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-ticketit-table-header border-b border-ticketit-border">
                    <th className="ticketit-th">Row</th>
                    <th className="ticketit-th">Field</th>
                    <th className="ticketit-th">Error Message</th>
                    <th className="ticketit-th">Sample Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAEFF5]">
                  {inspectingRecord.errors?.map((err, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="ticketit-td font-bold">{err.row}</td>
                      <td className="ticketit-td font-semibold text-ticketit-coral">{err.field}</td>
                      <td className="ticketit-td text-ticketit-navy">{err.message}</td>
                      <td className="ticketit-td font-mono text-[11px] text-gray-600 bg-gray-50">
                        {err.sampleValue}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-ticketit-border">
              <Button
                variant="coral"
                size="sm"
                onClick={() => handleDownloadErrorReport(inspectingRecord)}
                icon={<Download className="w-3.5 h-3.5" />}
              >
                Download Error Report (.CSV)
              </Button>
              <Button variant="outline" size="sm" onClick={() => setInspectingRecord(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AppShell>
  );
}
