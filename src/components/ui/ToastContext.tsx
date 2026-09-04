'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string, duration = 4000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const newToast: ToastItem = { id, type, title, message, duration };
      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => {
            const icons = {
              success: <CheckCircle2 className="w-5 h-5 text-[#58B97D] flex-shrink-0" />,
              error: <AlertCircle className="w-5 h-5 text-[#FF5E74] flex-shrink-0" />,
              warning: <AlertTriangle className="w-5 h-5 text-[#E5A000] flex-shrink-0" />,
              info: <Info className="w-5 h-5 text-[#F73582] flex-shrink-0" />,
            };

            const borderColors = {
              success: 'border-[#58B97D]/30 bg-white',
              error: 'border-[#FF5E74]/30 bg-white',
              warning: 'border-[#E5A000]/30 bg-white',
              info: 'border-[#F73582]/30 bg-white',
            };

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-dropdown border ${borderColors[toast.type]}`}
                role="alert"
              >
                {icons[toast.type]}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-ticketit-navy">{toast.title}</div>
                  {toast.message && (
                    <div className="text-xs text-ticketit-text-muted mt-0.5 leading-relaxed">
                      {toast.message}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-gray-400 hover:text-ticketit-navy transition-colors p-1"
                  aria-label="Close notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
