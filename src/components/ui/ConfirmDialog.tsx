import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, Info, Trash2 } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  const icon = {
    danger: <Trash2 className="w-6 h-6 text-[#FF5B6B]" />,
    warning: <AlertTriangle className="w-6 h-6 text-[#E5A000]" />,
    info: <Info className="w-6 h-6 text-[#F73582]" />,
  }[variant];

  const confirmBtnVariant = variant === 'danger' ? 'coral' : variant === 'info' ? 'pink' : 'navy';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-2.5 rounded-full bg-gray-100 flex-shrink-0">{icon}</div>
        <p className="text-sm text-ticketit-navy/90 leading-relaxed mt-1">{message}</p>
      </div>

      <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-ticketit-border">
        <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button
          variant={confirmBtnVariant}
          size="sm"
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};
