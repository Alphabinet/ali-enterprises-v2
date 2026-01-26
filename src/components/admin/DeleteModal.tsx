"use client";

import React from "react";
import { AlertTriangle, X, Loader2, Trash2 } from "lucide-react";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isDeleting?: boolean;
}

export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isDeleting = false,
}: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Content */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden scale-100 animate-in zoom-in-95 duration-200 border border-slate-100">
        
        {/* Header */}
        <div className="bg-red-50 p-6 flex flex-col items-center text-center border-b border-red-100">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-3 ring-4 ring-white shadow-sm">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-xl font-bold text-red-900">{title}</h3>
        </div>

        {/* Body */}
        <div className="p-6 text-center">
          <p className="text-slate-600 text-sm leading-relaxed">
            {message}
          </p>
          <p className="text-xs text-slate-400 mt-3 font-medium uppercase tracking-wide">
            This action cannot be undone.
          </p>
        </div>

        {/* Footer / Actions */}
        <div className="p-4 bg-slate-50 flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-3 px-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isDeleting ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Deleting...
              </>
            ) : (
              <>
                <Trash2 size={18} /> Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}