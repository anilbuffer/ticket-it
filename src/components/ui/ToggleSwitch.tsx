import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  activeColor?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'md',
  activeColor = 'bg-ticketit-green',
}) => {
  const isSmall = size === 'sm';

  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <div className="relative inline-block">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={`${
            isSmall ? 'w-8 h-4.5' : 'w-10 h-5'
          } bg-[#CBD5E1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full ${
            isSmall ? 'after:h-3.5 after:w-3.5' : 'after:h-4 after:w-4'
          } after:transition-all peer-checked:${activeColor} transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          style={{ backgroundColor: checked ? '#58B97D' : '#CBD5E1' }}
        />
      </div>
      {label && <span className="text-xs font-medium text-ticketit-navy">{label}</span>}
    </label>
  );
};
