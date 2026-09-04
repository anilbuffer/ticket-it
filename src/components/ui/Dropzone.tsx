'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, FileSpreadsheet, FileCheck, X } from 'lucide-react';
import { Button } from './Button';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  acceptedFormats?: string;
  maxSizeMB?: number;
  label?: string;
  sublabel?: string;
  selectedFile?: File | null;
  onClearFile?: () => void;
  buttonLabel?: string;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFileSelect,
  acceptedFormats = '.csv, .xlsx, .xls, .xml, .json',
  maxSizeMB = 25,
  label = 'Drag and drop your spreadsheet here',
  sublabel = 'Supports CSV, XLSX, XML formats (Up to 25MB)',
  selectedFile,
  onClearFile,
  buttonLabel = 'Select File',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors ${
        isDragOver
          ? 'border-ticketit-pink bg-[#FFF4F8]'
          : selectedFile
          ? 'border-ticketit-green bg-[#F3FAF5]'
          : 'border-ticketit-border bg-white hover:border-gray-400'
      }`}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={handleChange}
        accept={acceptedFormats}
        className="hidden"
        aria-label="Upload file"
      />

      {selectedFile ? (
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-ticketit-green/10 flex items-center justify-center text-ticketit-green">
            <FileCheck className="w-6 h-6" />
          </div>
          <div className="font-bold text-sm text-ticketit-navy">{selectedFile.name}</div>
          <div className="text-xs text-ticketit-text-muted">
            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for validation
          </div>
          {onClearFile && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClearFile();
              }}
              className="mt-2 text-xs font-semibold text-ticketit-coral hover:underline inline-flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Remove file
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-ticketit-navy/70 mb-1">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div className="font-bold text-sm text-ticketit-navy">{label}</div>
          <div className="text-xs text-ticketit-text-muted max-w-sm mb-3">{sublabel}</div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            icon={<FileSpreadsheet className="w-4 h-4 text-ticketit-pink" />}
          >
            {buttonLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
