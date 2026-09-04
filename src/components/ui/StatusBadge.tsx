import React from 'react';

export type BadgeType =
  | 'Offline'
  | 'Online'
  | 'Syncing'
  | 'Low Battery'
  | 'Active'
  | 'Inactive'
  | 'Pending'
  | 'Suspended'
  | 'Trial'
  | 'Success'
  | 'Failed'
  | 'Partial'
  | 'Invoiced'
  | 'NotInvoiced'
  | 'Completed'
  | 'Timed Out';

interface StatusBadgeProps {
  status: BadgeType | string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5';

  let badgeStyles = 'bg-[#E7EBF0] text-[#5A6474] border border-[#D0D6E0]'; // default offline-like

  switch (status) {
    case 'Offline':
      badgeStyles = 'bg-[#E5E9EF] text-[#5D6778] border border-[#D2D8E2] rounded-full font-medium';
      break;
    case 'Online':
    case 'Active':
    case 'Success':
    case 'Invoiced':
    case 'Completed':
      badgeStyles = 'bg-[#EBF7F0] text-[#29834E] border border-[#BDE7CE] rounded-full font-semibold';
      break;
    case 'Syncing':
    case 'Pending':
    case 'Partial':
      badgeStyles = 'bg-[#FFF8E6] text-[#A67300] border border-[#FFE39F] rounded-full font-semibold';
      break;
    case 'Suspended':
    case 'Failed':
    case 'Low Battery':
    case 'Timed Out':
      badgeStyles = 'bg-[#FFF0F2] text-[#D92D48] border border-[#FFCDD5] rounded-full font-semibold';
      break;
    case 'Trial':
      badgeStyles = 'bg-[#F2EDFD] text-[#5B3EAD] border border-[#D9CAFC] rounded-full font-semibold';
      break;
    case 'Inactive':
    case 'NotInvoiced':
      badgeStyles = 'bg-[#F1F3F5] text-[#717B8A] border border-[#DDE1E6] rounded-full font-medium';
      break;
    default:
      badgeStyles = 'bg-[#E7EBF0] text-[#5A6474] border border-[#D0D6E0] rounded-full';
  }

  return (
    <span
      className={`inline-flex items-center justify-center tracking-tight select-none ${sizeClasses} ${badgeStyles} ${className}`}
    >
      {status === 'Invoiced' ? 'Invoiced' : status === 'NotInvoiced' ? 'No' : status}
    </span>
  );
};
