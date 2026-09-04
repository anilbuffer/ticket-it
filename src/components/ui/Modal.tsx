'use client';

import React, { useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  headerColor?: 'white' | 'pink' | 'navy';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
  headerColor = 'white',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  const headerStyles = {
    white: 'bg-white text-ticketit-navy border-b border-ticketit-border',
    pink: 'bg-ticketit-pink text-white border-none',
    navy: 'bg-ticketit-navy text-white border-none',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity"
            aria-hidden="true"
          />

          {/* Dialog surface */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            className={`relative w-full ${maxWidthClasses[maxWidth]} bg-white rounded-lg shadow-modal overflow-hidden z-10 my-8`}
          >
            {/* Header */}
            <div className={`px-6 py-4 flex items-center justify-between ${headerStyles[headerColor]}`}>
              <div>
                <h3 className="text-base font-bold leading-tight">{title}</h3>
                {subtitle && (
                  <p
                    className={`text-xs mt-0.5 ${
                      headerColor === 'white' ? 'text-ticketit-text-muted' : 'text-white/80'
                    }`}
                  >
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className={`p-1 rounded transition-colors ${
                  headerColor === 'white'
                    ? 'text-gray-400 hover:text-ticketit-navy hover:bg-gray-100'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 max-h-[calc(85vh-120px)] overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
