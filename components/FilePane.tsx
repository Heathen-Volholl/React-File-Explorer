
import React, { useCallback } from 'react';
import { TabBar } from './TabBar';
import { AddressBar } from './AddressBar';
import { FileList } from './FileList';
import { PaneState, TabState, FileSystemItem } from '../types';

interface FilePaneProps {
    paneState: PaneState;
    setPaneState: (newState: PaneState) => void;
    isActive: boolean;
    onSelectionChange: (item: FileSystemItem, path: string) => void;
    onSearch: (query: string) => void;
    quickAccess?: { label: string; path: string }[];
    onAddQuickAccess?: (item: { label: string; path: string }) => void;
    onRemoveQuickAccess?: (path: string) => void;
}

export const FilePane: React.FC<FilePaneProps> = ({ paneState, setPaneState, isActive, onSelectionChange, onSearch, quickAccess, onAddQuickAccess, onRemoveQuickAccess }) => {
    const activeTab = paneState.tabs.find(t => t.id === paneState.activeTabId);

    const updateTab = useCallback((tabId: string, newTabState: Partial<TabState>) => {
        const newTabs = paneState.tabs.map(t =>
            t.id === tabId ? { ...t, ...newTabState } : t
        );
        setPaneState({ ...paneState, tabs: newTabs });
    }, [paneState, setPaneState]);

    const navigate = useCallback((path: string) => {
        if (!activeTab) return;
        const newHistory = activeTab.history.slice(0, activeTab.historyIndex + 1);
        newHistory.push(path);
        updateTab(activeTab.id, {
            path,
            history: newHistory,
            historyIndex: newHistory.length - 1,
            searchResults: undefined,
        });
    }, [activeTab, updateTab]);
    
    const navigateHistory = useCallback((direction: 'back' | 'forward') => {
        if (!activeTab) return;
        const newIndex = activeTab.historyIndex + (direction === 'back' ? -1 : 1);
        if (newIndex >= 0 && newIndex < activeTab.history.length) {
            updateTab(activeTab.id, {
                path: activeTab.history[newIndex],
                historyIndex: newIndex,
                searchResults: undefined,
            });
        }
    }, [activeTab, updateTab]);

    const navigateUp = useCallback(() => {
        if (!activeTab || activeTab.searchResults || activeTab.path.split('/').filter(p => p).length <= 1) return;
        const newPath = activeTab.path.substring(0, activeTab.path.lastIndexOf('/'));
        navigate(newPath || activeTab.path.split('/')[0]);
    }, [activeTab, navigate]);

    if (!activeTab) {
        return <div className="flex-1 flex items-center justify-center">No active tab</div>;
    }
    
    return (
        <div className="flex flex-col h-full">
            <TabBar
                tabs={paneState.tabs}
                activeTabId={paneState.activeTabId}
                onTabChange={(id) => {
                    setPaneState({ ...paneState, activeTabId: id });
                }}
                onTabClose={(id) => {
                    const newTabs = paneState.tabs.filter(t => t.id !== id);
                    if (newTabs.length > 0) {
                         setPaneState({ ...paneState, tabs: newTabs, activeTabId: newTabs[0].id });
                    } else {
                        // Handle closing last tab if necessary
                    }
                }}
                onNewTab={() => {
                    const newTabId = `tab-${Date.now()}`;
                    const newTab: TabState = { id: newTabId, path: 'C:/', history: ['C:/'], historyIndex: 0 };
                    setPaneState({ ...paneState, tabs: [...paneState.tabs, newTab], activeTabId: newTabId });
                }}
            />
             <AddressBar
                path={activeTab.path}
                onNavigate={navigate}
                onHistoryNav={navigateHistory}
                onNavigateUp={navigateUp}
                canGoBack={activeTab.historyIndex > 0}
                canGoForward={activeTab.historyIndex < activeTab.history.length - 1}
                onSearch={onSearch}
                isSearching={!!activeTab.searchResults}
            />
            <FileList
                key={activeTab.id}
                path={activeTab.path}
                searchResults={activeTab.searchResults}
                onNavigate={navigate}
                isActive={isActive}
                onSelectionChange={onSelectionChange}
                quickAccess={quickAccess}
                onAddQuickAccess={onAddQuickAccess}
                onRemoveQuickAccess={onRemoveQuickAccess}
            />
        </div>
    );
};
