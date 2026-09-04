'use client';

import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  FileDown,
  CheckCircle2,
  Clock,
  Download,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Dropzone } from '@/components/ui/Dropzone';
import { ClientService } from '@/services/clientService';
import { ImportService } from '@/services/importService';
import { Client, ImportErrorDetail } from '@/types';
import { useToast } from '@/components/ui/ToastContext';

export default function ImportClientDataPage() {
  const { showToast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Workflow states
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [validationResult, setValidationResult] = useState<{
    validCount: number;
    errorCount: number;
    errors: ImportErrorDetail[];
  } | null>(null);

  useEffect(() => {
    const list = ClientService.getClients();
    setClients(list);
    if (list.length > 0) setSelectedClientId(list[0].id);
  }, []);

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

  const handleDownloadErrorReport = (report: {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: string;
    clientName: string;
    uploadedBy: string;
    uploadedAt: string;
    recordCount: number;
    validCount: number;
    errorCount: number;
    status: string;
    errors: ImportErrorDetail[];
  }) => {
    const headers = ['Row', 'Field', 'SampleValue', 'Message'];
    const rows = report.errors.map((e) =>
      [e.row, e.field, e.sampleValue, e.message].map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${report.clientName}_Error_Report_${report.fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('info', 'Error Report Downloaded', `${report.errorCount} flagged rows exported.`);
  };

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
      <div className="mb-8">
        {/* Left 2 Cols: Target client & Dropzone */}
        <div className="bg-white border border-ticketit-border rounded-lg p-5 shadow-sm flex flex-col gap-4">
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
              variant="pink"
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
      </div>
    </AppShell>
  );
}
