import React from 'react';
import { Zap, Plug, Eye, RefreshCw, Pencil, Trash2, LogIn, Key, MoreHorizontal } from 'lucide-react';

interface ESLActionIconsProps {
  onFlash?: () => void;
  onConnect?: () => void;
  onView?: () => void;
  onSync?: () => void;
  isSyncing?: boolean;
}

export const ESLActionIcons: React.FC<ESLActionIconsProps> = ({
  onFlash,
  onConnect,
  onView,
  onSync,
  isSyncing = false,
}) => {
  return (
    <div className="flex items-center gap-1.5 justify-start">
      {/* Red/Coral Flash Zap */}
      <button
        type="button"
        onClick={onFlash}
        title="Flash / Identify ESL"
        aria-label="Flash / Identify ESL"
        className="w-7 h-7 rounded flex items-center justify-center bg-[#FF5B6B] hover:bg-[#F04354] text-white transition-transform active:scale-95 shadow-sm"
      >
        <Zap className="w-3.5 h-3.5 fill-white" />
      </button>

      {/* Pink Plug */}
      <button
        type="button"
        onClick={onConnect}
        title="Connect / Pair ESL"
        aria-label="Connect / Pair ESL"
        className="w-7 h-7 rounded flex items-center justify-center bg-[#E8317A] hover:bg-[#D41E66] text-white transition-transform active:scale-95 shadow-sm"
      >
        <Plug className="w-3.5 h-3.5" />
      </button>

      {/* Dark Navy Eye */}
      <button
        type="button"
        onClick={onView}
        title="View ESL Details"
        aria-label="View ESL Details"
        className="w-7 h-7 rounded flex items-center justify-center bg-[#2B253E] hover:bg-[#1E192D] text-white transition-transform active:scale-95 shadow-sm"
      >
        <Eye className="w-3.5 h-3.5" />
      </button>

      {/* Green Refresh Sync */}
      <button
        type="button"
        onClick={onSync}
        title="Synchronize ESL"
        aria-label="Synchronize ESL"
        className="w-7 h-7 rounded flex items-center justify-center bg-[#58B97D] hover:bg-[#469F68] text-white transition-transform active:scale-95 shadow-sm"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};

interface TableRowActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onLogIn?: () => void;
  onResetPassword?: () => void;
  onView?: () => void;
}

export const TableRowActions: React.FC<TableRowActionsProps> = ({
  onEdit,
  onDelete,
  onLogIn,
  onResetPassword,
  onView,
}) => {
  return (
    <div className="flex items-center gap-1.5 justify-start">
      {onLogIn && (
        <button
          type="button"
          onClick={onLogIn}
          title="Log in as user"
          aria-label="Log in as user"
          className="w-7 h-7 rounded flex items-center justify-center bg-[#58B97D] hover:bg-[#469F68] text-white transition-transform active:scale-95 shadow-sm"
        >
          <LogIn className="w-3.5 h-3.5" />
        </button>
      )}

      {onView && (
        <button
          type="button"
          onClick={onView}
          title="View Details"
          aria-label="View Details"
          className="w-7 h-7 rounded flex items-center justify-center bg-[#2B253E] hover:bg-[#1E192D] text-white transition-transform active:scale-95 shadow-sm"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      )}

      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          title="Edit"
          aria-label="Edit"
          className="w-7 h-7 rounded flex items-center justify-center bg-[#F73582] hover:bg-[#E02772] text-white transition-transform active:scale-95 shadow-sm"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      )}

      {onResetPassword && (
        <button
          type="button"
          onClick={onResetPassword}
          title="Reset Password"
          aria-label="Reset Password"
          className="w-7 h-7 rounded flex items-center justify-center bg-[#2B253E] hover:bg-[#3D3556] text-white transition-transform active:scale-95 shadow-sm"
        >
          <Key className="w-3.5 h-3.5" />
        </button>
      )}

      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          title="Delete"
          aria-label="Delete"
          className="w-7 h-7 rounded flex items-center justify-center bg-[#FF5B6B] hover:bg-[#E84353] text-white transition-transform active:scale-95 shadow-sm"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
