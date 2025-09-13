
import React from 'react';
import { TabState } from '../types';

interface TabBarProps {
    tabs: TabState[];
    activeTabId: string;
    onTabChange: (id: string) => void;
    onTabClose: (id: string) => void;
    onNewTab: () => void;
}

const Tab: React.FC<{
    tab: TabState;
    isActive: boolean;
    onSelect: () => void;
    onClose: () => void;
}> = ({ tab, isActive, onSelect, onClose }) => {
    const pathParts = tab.path.split('/').filter(Boolean);
    const displayName = pathParts.length > 0 ? pathParts[pathParts.length - 1] : tab.path;

    return (
        <div
            onClick={onSelect}
            className={`flex items-center justify-between pl-3 pr-1 py-1.5 text-sm cursor-pointer border-b-2 max-w-xs ${
                isActive
                    ? 'bg-explorer-bg-secondary border-explorer-accent text-explorer-text'
                    : 'border-transparent text-explorer-text-secondary hover:bg-explorer-hover'
            }`}
        >
            <span className="truncate mr-2">{displayName}</span>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                className="p-1 rounded-full hover:bg-explorer-border"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

export const TabBar: React.FC<TabBarProps> = ({ tabs, activeTabId, onTabChange, onTabClose, onNewTab }) => {
    return (
        <div className="flex items-center bg-explorer-bg border-b border-explorer-border select-none">
            {tabs.map(tab => (
                <Tab
                    key={tab.id}
                    tab={tab}
                    isActive={tab.id === activeTabId}
                    onSelect={() => onTabChange(tab.id)}
                    onClose={() => onTabClose(tab.id)}
                />
            ))}
            <button onClick={onNewTab} className="p-2 text-explorer-text-secondary hover:bg-explorer-hover">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </button>
        </div>
    );
};
