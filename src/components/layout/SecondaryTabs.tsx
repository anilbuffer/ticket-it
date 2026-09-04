import React, { ReactNode } from 'react';

export interface TabItem {
  id: string;
  label: string;
  badge?: number | string;
}

interface SecondaryTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  rightActions?: ReactNode;
}

export const SecondaryTabs: React.FC<SecondaryTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  rightActions,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-1">
      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2 rounded text-xs font-bold transition-all whitespace-nowrap shadow-sm select-none ${
                isActive
                  ? 'bg-ticketit-pink text-white border border-ticketit-pink'
                  : 'bg-white text-ticketit-navy border border-ticketit-border hover:border-gray-400 hover:bg-[#F9FAFC]'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-ticketit-navy'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right Action buttons */}
      {rightActions && <div className="flex items-center gap-2.5 flex-shrink-0 self-end sm:self-auto">{rightActions}</div>}
    </div>
  );
};
