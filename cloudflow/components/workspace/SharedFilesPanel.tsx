'use client';

import React, { useState, useRef } from 'react';
import { SharedFile } from '@/types/workspace';
import {
  UploadCloud,
  File,
  FileText,
  FileCode,
  Trash2,
  Download,
  AlertTriangle,
  ShieldAlert,
  HardDrive,
  CheckCircle2,
} from 'lucide-react';

interface SharedFilesPanelProps {
  files: SharedFile[];
  onUploadFile: (file: SharedFile) => void;
  onDeleteFile: (fileId: string) => void;
}

export function SharedFilesPanel({ files, onUploadFile, onDeleteFile }: SharedFilesPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    const newSharedFile: SharedFile = {
      id: 'file-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: file.name,
      sizeBytes: file.size,
      uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      uploadedBy: 'Public User #' + Math.floor(100 + Math.random() * 900),
      type: file.type || 'application/octet-stream',
    };
    onUploadFile(newSharedFile);
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 2500);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
      e.target.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (name: string) => {
    if (name.endsWith('.py') || name.endsWith('.js') || name.endsWith('.ts') || name.endsWith('.sh')) {
      return <FileCode className="w-5 h-5 text-blue-400 shrink-0" />;
    }
    if (name.endsWith('.txt') || name.endsWith('.md') || name.endsWith('.log')) {
      return <FileText className="w-5 h-5 text-amber-400 shrink-0" />;
    }
    return <File className="w-5 h-5 text-zinc-400 shrink-0" />;
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white text-sm">Ephemeral Shared Files</h3>
        </div>
        <span className="text-[11px] font-mono text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-full border border-zinc-700">
          {files.length} items
        </span>
      </div>

      {/* ========================================================================= */}
      {/* MANDATORY PROMINENT DISCLAIMER FOR FILE STORAGE */}
      {/* ========================================================================= */}
      <div
        id="file-storage-disclaimer"
        className="p-3.5 rounded-xl bg-red-950/25 border-2 border-red-500/40 text-red-200 text-xs space-y-1.5 shadow-sm"
      >
        <div className="flex items-center gap-2 font-bold text-red-300 uppercase tracking-wider text-[11px]">
          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
          <span>Important File Storage Warning</span>
        </div>
        <p className="leading-relaxed text-zinc-300">
          The same rules apply to uploaded files stored on the system:{' '}
          <strong className="text-red-200">
            Files in this system are visible to the public, may be deleted by any user who uses the service,
            and we are not responsible for any data loss or data leaks.
          </strong>
        </p>
        <p className="text-red-300 font-semibold text-[11px] pt-1">
          ⛔ Users should not upload sensitive, private, or confidential information.
        </p>
      </div>

      {/* Drag and drop upload zone */}
      <div
        id="file-drop-zone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10 scale-[1.01]'
            : 'border-zinc-700/80 hover:border-zinc-500 bg-zinc-950/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="p-3 rounded-full bg-zinc-800 text-blue-400 border border-zinc-700">
          <UploadCloud className="w-6 h-6" />
        </div>

        <div>
          <p className="text-xs font-semibold text-zinc-200">
            Click to upload or drag files here
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Non-confidential scripts, bundles, or logs (Max 25 MB)
          </p>
        </div>

        {uploadSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>File uploaded to shared public storage</span>
          </div>
        )}
      </div>

      {/* Files List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[160px] max-h-[260px]">
        {files.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-xs">
            No files currently in shared storage.
          </div>
        ) : (
          files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 transition-all text-xs"
            >
              <div className="flex items-center gap-2.5 overflow-hidden pr-2">
                {getFileIcon(file.name)}
                <div className="truncate">
                  <div className="font-semibold text-zinc-200 truncate">{file.name}</div>
                  <div className="text-[10px] text-zinc-400 flex items-center gap-2">
                    <span>{formatFileSize(file.sizeBytes)}</span>
                    <span>•</span>
                    <span className="text-zinc-400">By {file.uploadedBy}</span>
                    <span>•</span>
                    <span>{file.uploadedAt}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => alert(`Downloading "${file.name}" (Public ephemeral storage)`)}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
                  title="Download file"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteFile(file.id)}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 border border-transparent hover:border-red-500/30 cursor-pointer"
                  title="Delete file (Any user can delete)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
